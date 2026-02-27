/**
 * app/_layout.tsx — Root Layout
 *
 * Fix log:
 *  - Removed `import '../global.css'` — file was missing, crashing
 *    the entire layout before AuthProvider could mount, which caused
 *    "useAuthContext must be within <AuthProvider>" on every screen.
 *  - Fonts no longer block rendering — if they fail, the app still
 *    loads (prevents white screen on web where font packages may fail).
 *  - NativeWind CSS is now injected via babel plugin; no manual import needed.
 *
 * Provider order: AuthProvider → BusinessProvider → Slot
 * (BusinessProvider can safely use AuthContext internally if needed)
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

// Prevent auto-hiding splash until fonts are ready
SplashScreen.preventAutoHideAsync().catch(() => {
  // preventAutoHideAsync can throw on web — ignore safely
});

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
    if (fontsLoaded || fontError) {
      // Hide splash once fonts resolved (or failed — don't block the app)
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // On web, font loading may never resolve — render anyway after a tick
  // On native, wait for fonts to avoid FOUT (flash of unstyled text)
  // Either way, providers must ALWAYS render so context is available.

  return (
    <AuthProvider>
      <BusinessProvider>
        <Slot />
      </BusinessProvider>
    </AuthProvider>
  );
}