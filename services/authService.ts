/**
 * services/authService.ts
 *
 * All authentication-related API calls.
 * Consumed exclusively by AuthContext — screens never call this directly.
 *
 * In development, mock responses are returned when EXPO_PUBLIC_USE_MOCK=true.
 */

import api from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// ── Types ─────────────────────────────────────────────────────
type AuthResponse = {
  user: {
    id: string;
    mobile: string;
    name: string;
    isNewUser: boolean;
    isBusinessSetup: boolean;
    plan: 'starter' | 'pro' | 'enterprise';
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};

type BusinessProfile = {
  businessName: string;
  businessType: string;
  businessAddress: string;
  [key: string]: any;
};

// ── Mock helpers ──────────────────────────────────────────────
function mockDelay(ms = 1200) {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_USER = {
  id: 'usr_mock_001',
  mobile: '',
  name: 'Arjun Sharma',
  isNewUser: false,
  isBusinessSetup: true,
  plan: 'starter' as const,
  createdAt: new Date().toISOString(),
};

const MOCK_TOKENS = {
  accessToken: 'mock_access_token_xyz',
  refreshToken: 'mock_refresh_token_xyz',
  expiresIn: 3600,
};

// ── Service ───────────────────────────────────────────────────
export const authService = {
  /** Step 1: Request OTP via SMS */
  async sendOtp(mobile: string): Promise<{ message: string }> {
    if (USE_MOCK) {
      await mockDelay(800);
      return { message: 'OTP sent successfully' };
    }
    const { data } = await api.post<{ message: string }>('/auth/send-otp', { mobile });
    return data;
  },

  /** Step 2: Verify OTP and receive session tokens */
  async verifyOtp(mobile: string, otp: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await mockDelay(1000);
      return {
        user: { ...MOCK_USER, mobile, isNewUser: otp === '999999' },
        tokens: MOCK_TOKENS,
      };
    }
    const { data } = await api.post<AuthResponse>('/auth/verify-otp', { mobile, otp });
    return data;
  },

  /** Google OAuth — exchange Firebase idToken for app session */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      await mockDelay(1000);
      return { user: MOCK_USER, tokens: MOCK_TOKENS };
    }
    const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
    return data;
  },

  /** Save business profile after onboarding */
  async saveBusinessProfile(profile: BusinessProfile): Promise<void> {
    if (USE_MOCK) {
      await mockDelay(1000);
      return;
    }
    await api.post('/business/profile', profile);
  },

  /** Resend OTP (rate-limited on backend) */
  async resendOtp(mobile: string): Promise<{ message: string; retryAfter: number }> {
    if (USE_MOCK) {
      await mockDelay(500);
      return { message: 'OTP resent', retryAfter: 30 };
    }
    const { data } = await api.post<{ message: string; retryAfter: number }>(
      '/auth/resend-otp',
      { mobile }
    );
    return data;
  },
};