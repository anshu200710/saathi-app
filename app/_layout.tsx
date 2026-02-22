/**
 * app/_layout.tsx — Root Layout
 *
 * Responsibilities:
 *  1. Load custom fonts via expo-font
 *  2. Hide native splash screen once fonts are ready
 *  3. Wrap the entire app in global context providers
 *  4. Register NativeWind's CSS interop (cssInterop)
 *  5. Provide safe global error boundary via expo-router's ErrorBoundary
 *
 * Architecture note:
 *   All providers are stacked here in a single place so that every
 *   child route automatically has access to auth state, business data, etc.
 *   Adding a new context = one line here, no changes in screens.
 */

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import '../global.css'; // NativeWind global styles entry point

// Prevent auto-hiding splash until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    // Hide splash once fonts resolved (loaded or errored)
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render until fonts are ready to prevent FOUT
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    /**
     * Provider order matters — outer providers are available to inner ones.
     * AuthProvider wraps BusinessProvider because business data
     * fetching depends on auth tokens.
     */
    <AuthProvider>
      <BusinessProvider>
        {/*
         * <Slot /> renders the matched child route.
         * expo-router handles all navigation logic.
         */}
        <Slot />
      </BusinessProvider>
    </AuthProvider>
  );
}