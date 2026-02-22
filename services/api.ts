/**
 * services/api.ts — Axios HTTP Client
 *
 * Provides:
 *  • Pre-configured Axios instance with base URL + timeout
 *  • Request interceptor: attaches Bearer token from SecureStore
 *  • Response interceptor: handles 401 token refresh & normalized errors
 *  • Typed API error class for consistent error handling across the app
 *
 * Architecture note:
 *   All domain-specific services (authService, fundingAPI, etc.) import
 *   this `api` instance — they never create their own Axios instances.
 *   This ensures one place to update base URL, timeout, and auth headers.
 *
 * Usage:
 *   import api from '@/services/api';
 *   const { data } = await api.get<FundingScheme[]>('/funding/schemes');
 */

import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Environment ───────────────────────────────────────────────
// In production replace with your actual API gateway URL.
// Use constants/config.ts to manage env-specific values.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.yourapp.in/v1';
const TIMEOUT_MS = 15_000; // 15 s — generous for Indian mobile networks

// ── Token Keys (must match AuthContext.tsx) ───────────────────
const ACCESS_TOKEN_KEY = 'bca_access_token';
const REFRESH_TOKEN_KEY = 'bca_refresh_token';

// ── Typed API Error ───────────────────────────────────────────
/**
 * APIError wraps all HTTP errors in a predictable shape.
 * Catch this in services: catch (err) { if (err instanceof APIError) ... }
 */
export class APIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly raw?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ── Axios Instance ────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Platform': 'mobile',
    'X-App-Version': '1.0.0',
  },
});

// ── Request Interceptor ───────────────────────────────────────
/**
 * Attaches the stored JWT Bearer token to every outgoing request.
 * Public endpoints (e.g. /auth/send-otp) don't need a token —
 * the server ignores the header if no session exists.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Token Refresh State ───────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Response Interceptor ──────────────────────────────────────
/**
 * Handles:
 *  • 401 → try to refresh access token, replay original request
 *  • All errors → normalize into `APIError` for consistent handling
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401 Unauthorized: attempt silent token refresh ────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests that arrive while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>)[
              'Authorization'
            ] = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.accessToken;
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);

        flushQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)[
            'Authorization'
          ] = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        flushQueue(refreshError, null);
        isRefreshing = false;
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        // Dispatch a logout event; AuthContext listens in useEffect
        // (avoids circular import between api.ts ↔ AuthContext.tsx)
        // The 401 APIError propagates; AuthContext catches it and calls logout()
      }
    }

    // ── Normalize all errors to APIError ──────────────────────
    const status = error.response?.status ?? 0;
    const code = error.response?.data?.code ?? 'UNKNOWN';
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong. Please try again.';

    return Promise.reject(new APIError(status, code, message, error));
  }
);

export default api;

// ── Convenience Helpers ───────────────────────────────────────
/**
 * Typed GET helper — infers response type from generic parameter.
 * Usage: const schemes = await apiGet<FundingScheme[]>('/funding/schemes')
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.post<T>(url, body, config);
  return data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.put<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.patch<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.delete<T>(url, config);
  return data;
}