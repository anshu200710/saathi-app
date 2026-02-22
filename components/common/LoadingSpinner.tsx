/**
 * components/common/LoadingSpinner.tsx
 *
 * Centralized loading indicator used across the app.
 *
 * Modes:
 *   fullscreen — covers the entire screen with a semi-transparent overlay
 *   inline     — sits inside a container, inherits its layout
 *   overlay    — fixed overlay on top of content without navigation block
 *
 * Features:
 *  • Optional message below spinner
 *  • Branded color by default (primary blue)
 *  • Fade-in animation to avoid jarring flash on fast loads
 *
 * Architecture note:
 *   For skeleton loaders (list placeholders), create a separate
 *   SkeletonLoader.tsx component. LoadingSpinner is for
 *   non-skeleton blocking states only.
 *
 * Usage:
 *   // Full-screen gate (auth restore, page init)
 *   <LoadingSpinner mode="fullscreen" message="Loading your profile…" />
 *
 *   // Inside a card while data loads
 *   <LoadingSpinner mode="inline" size="small" />
 */

import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Colors } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
type SpinnerMode = 'fullscreen' | 'inline' | 'overlay';
type SpinnerSize = 'small' | 'large';

interface LoadingSpinnerProps {
  mode?: SpinnerMode;
  size?: SpinnerSize;
  color?: string;
  message?: string;
  /** Delay in ms before spinner appears — prevents flash on instant loads */
  delay?: number;
}

// ── Component ─────────────────────────────────────────────────
export default function LoadingSpinner({
  mode = 'inline',
  size = 'large',
  color = Colors.primary,
  message,
  delay = 200,
}: LoadingSpinnerProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, opacity]);

  const spinnerContent = (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-sm text-muted mt-3 text-center px-8">
          {message}
        </Text>
      )}
    </View>
  );

  // ── Fullscreen mode ────────────────────────────────────────
  if (mode === 'fullscreen') {
    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.fullscreen, { opacity }]}
        accessibilityRole="progressbar"
        accessibilityLabel={message ?? 'Loading'}
        accessibilityLiveRegion="polite"
      >
        {/* Branded loading panel */}
        <View className="bg-surface rounded-xl px-8 py-10 items-center mx-12">
          <ActivityIndicator size="large" color={color} />
          {message && (
            <Text className="text-sm text-muted mt-4 text-center">
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  }

  // ── Overlay mode ───────────────────────────────────────────
  if (mode === 'overlay') {
    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity }]}
        accessibilityRole="progressbar"
        accessibilityLabel={message ?? 'Loading'}
      >
        {spinnerContent}
      </Animated.View>
    );
  }

  // ── Inline mode ────────────────────────────────────────────
  return (
    <Animated.View
      className="items-center justify-center py-6"
      style={{ opacity }}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
    >
      {spinnerContent}
    </Animated.View>
  );
}

// ── Static Styles (can't be expressed cleanly in NativeWind) ──
const styles = StyleSheet.create({
  fullscreen: {
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});