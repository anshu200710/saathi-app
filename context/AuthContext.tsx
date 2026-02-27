/**
 * context/AuthContext.tsx — Authentication State
 *
 * Fix log:
 *  - Replaced (async () => { ... })() IIFE with a named async function
 *    called inside useEffect — some Babel configs reject the IIFE pattern.
 *  - Switched from top-level `router` import to `useRouter()` hook —
 *    top-level router access can fail before Expo Router initialises.
 *  - Added refreshToken to state shape.
 *  - Uses utils/storage.ts (web-safe) instead of expo-secure-store directly.
 */

import { authService } from '@/services/authService';
import type { AuthTokens, User } from '@/types/auth.types';
import { storage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// ── Storage Keys ──────────────────────────────────────────────
const ACCESS_TOKEN_KEY  = 'bca_access_token';
const REFRESH_TOKEN_KEY = 'bca_refresh_token';
const USER_KEY          = 'bca_user';

// ── State ─────────────────────────────────────────────────────
interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  error:           string | null;
}

type AuthAction =
  | { type: 'RESTORE_SESSION'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_SUCCESS';   payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR';   payload: string | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_SESSION':
      return {
        ...state,
        user:            action.payload.user,
        accessToken:     action.payload.tokens.accessToken,
        refreshToken:    action.payload.tokens.refreshToken,
        isAuthenticated: true,
        isLoading:       false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user:            action.payload.user,
        accessToken:     action.payload.tokens.accessToken,
        refreshToken:    action.payload.tokens.refreshToken,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        isLoading:       false,
        error:           null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  sendOtp:         (mobile: string) => Promise<void>;
  verifyOtp:       (mobile: string, otp: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout:          () => Promise<void>;
  clearError:      () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [state, dispatch] = useReducer(authReducer, {
    user:            null,
    accessToken:     null,
    refreshToken:    null,
    isLoading:       true,
    isAuthenticated: false,
    error:           null,
  });

  // ── Session restore on mount ──────────────────────────────
  // NOTE: Named async function instead of IIFE — avoids Babel parse error:
  //   SyntaxError: Unexpected token "," — triggered by (async () => { })()
  //   in some Babel/Metro configurations.
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken  = await storage.getItem(ACCESS_TOKEN_KEY);
        const storedRefresh = await storage.getItem(REFRESH_TOKEN_KEY);
        const storedUser   = await storage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const user: User = JSON.parse(storedUser);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: {
              user,
              tokens: {
                accessToken:  storedToken,
                refreshToken: storedRefresh ?? '',
                expiresIn:    3600,
              },
            },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (e) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    restoreSession();
  }, []);

  // ── Persist tokens to storage ─────────────────────────────
  const persistSession = useCallback(
    async (user: User, tokens: AuthTokens) => {
      await Promise.all([
        storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
        storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
        storage.setItem(USER_KEY, JSON.stringify(user)),
      ]);
    },
    [],
  );

  // ── Auth actions ──────────────────────────────────────────
  const sendOtp = useCallback(
    async (mobile: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        await authService.sendOtp(mobile);
        dispatch({ type: 'SET_LOADING', payload: false });
        router.push(`/(auth)/verify-otp?mobile=${mobile}`);
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Failed to send OTP' });
      }
    },
    [router],
  );

  const verifyOtp = useCallback(
    async (mobile: string, otp: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const result = await authService.verifyOtp(mobile, otp);
        await persistSession(result.user as User, result.tokens);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.user as User, tokens: result.tokens } });
        if (result.user.isNewUser) {
          router.replace('/(auth)/business-profile');
        } else {
          router.replace('/(user)/home');
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Invalid OTP' });
      }
    },
    [persistSession, router],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const result = await authService.loginWithGoogle(idToken);
        await persistSession(result.user as User, result.tokens);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.user as User, tokens: result.tokens } });
        if (result.user.isNewUser) {
          router.replace('/(auth)/business-profile');
        } else {
          router.replace('/(user)/home');
        }
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: err.message ?? 'Google login failed' });
      }
    },
    [persistSession, router],
  );

  const logout = useCallback(
    async () => {
      await Promise.all([
        storage.deleteItem(ACCESS_TOKEN_KEY),
        storage.deleteItem(REFRESH_TOKEN_KEY),
        storage.deleteItem(USER_KEY),
      ]);
      dispatch({ type: 'LOGOUT' });
      router.replace('/(auth)/login');
    },
    [router],
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
      clearError,
    }),
    [state, sendOtp, verifyOtp, loginWithGoogle, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return ctx;
}