/**
 * utils/storage.ts — Cross-platform secure storage
 *
 * expo-secure-store only works on iOS/Android.
 * On web it throws immediately, crashing AuthContext before the
 * AuthProvider tree is even mounted — which causes the
 * "useAuthContext must be within <AuthProvider>" error.
 *
 * This wrapper falls back to localStorage on web so the app
 * boots correctly in the Expo web preview and in browsers.
 *
 *   Native (iOS/Android) → expo-secure-store  (hardware-backed)
 *   Web                  → localStorage       (dev/preview only)
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {}
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {}
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};