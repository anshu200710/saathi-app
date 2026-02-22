/**
 * context/AuthContext.tsx — Authentication State
 *
 * Manages:
 *  • User session (JWT token in SecureStore)
 *  • OTP login + Google login flows
 *  • Auth state broadcasting to all screens
 *  • Automatic session restoration on app launch
 *
 * Architecture note:
 *   We use a separate `useAuth` hook (hooks/useAuth.ts) to consume
 *   this context — screens never import useContext directly.
 *   This makes mocking in tests trivial and avoids null-context errors.
 */

import { authService } from '@/services/authService';
import type { AuthTokens, User } from '@/types/auth.types';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// ── Storage Keys ──────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'bca_access_token';
const REFRESH_TOKEN_KEY = 'bca_refresh_token';
const USER_KEY = 'bca_user';

// ── State Shape ───────────────────────────────────────────────
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;      // true while restoring session / awaiting API
  isAuthenticated: boolean;
  error: string | null;
}

// ── Actions ───────────────────────────────────────────────────
type AuthAction =
  | { type: 'RESTORE_SESSION'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// ── Context Shape ─────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  sendOtp: (mobile: string) => Promise<void>;
  verifyOtp: (mobile: string, otp: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    accessToken: null,
    isLoading: true,   // starts true to restore session silently
    isAuthenticated: false,
    error: null,
  });

  /**
   * Attempt to restore session from secure storage on mount.
   * This runs once — if tokens are valid, the user skips login.
   */
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { user, accessToken: storedToken },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        // If SecureStore fails, treat as logged out
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  /** Persist tokens and user to SecureStore after login */
  const persistSession = useCallback(
    async (user: User, tokens: AuthTokens) => {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
      ]);
    },
    []
  );

  /** Step 1 of OTP flow — request OTP from backend */
  const sendOtp = useCallback(async (mobile: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await authService.sendOtp(mobile);
      dispatch({ type: 'SET_LOADING', payload: false });
      router.push(`/(auth)/verify-otp?mobile=${mobile}`);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Failed to send OTP' });
    }
  }, []);

  /** Step 2 of OTP flow — verify code and create session */
  const verifyOtp = useCallback(async (mobile: string, otp: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const { user, tokens } = await authService.verifyOtp(mobile, otp);
      await persistSession(user, tokens);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });

      // Route new users to business setup, returning users to home
      if (user.isNewUser) {
        router.replace('/(auth)/business-profile');
      } else {
        router.replace('/(user)/home');
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Invalid OTP' });
    }
  }, [persistSession]);

  /** Google OAuth — exchange Firebase idToken for app session */
  const loginWithGoogle = useCallback(async (idToken: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const { user, tokens } = await authService.loginWithGoogle(idToken);
      await persistSession(user, tokens);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });

      if (user.isNewUser) {
        router.replace('/(auth)/business-profile');
      } else {
        router.replace('/(user)/home');
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Google login failed' });
    }
  }, [persistSession]);

  /** Clear all stored credentials and redirect to login */
  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    dispatch({ type: 'LOGOUT' });
    router.replace('/(auth)/login');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Memoize value to prevent unnecessary re-renders across the tree
  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
      clearError,
    }),
    [state, sendOtp, verifyOtp, loginWithGoogle, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────
/**
 * useAuthContext — internal hook used by useAuth.ts
 * Screens should import from hooks/useAuth.ts, not here.
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}