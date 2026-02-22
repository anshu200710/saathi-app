/**
 * app/index.tsx — Entry / Splash Gate
 *
 * Shown briefly on launch while AuthContext restores session from SecureStore.
 * Animates the brand mark in with a scale+fade sequence.
 *
 * Routing logic (handled in AuthContext after restore):
 *   • Has valid session + business setup → /(user)/home
 *   • Has valid session, no business     → /(auth)/business-profile
 *   • No session + first launch          → /onboarding
 *   • No session + returning user        → /(auth)/login
 *
 * This screen itself never navigates — AuthContext does it on restore.
 * It simply shows the brand during the async window.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Colors } from '../theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  // Animation refs
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(12)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stage 1: Logo reveal
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Stage 2: Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(taglineY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Stage 3: Loading dots stagger
      const dotDelay = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(dot, { toValue: 1.4, useNativeDriver: true, speed: 20, bounciness: 8 }),
            Animated.spring(dot, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
            Animated.delay(600 - delay),
          ])
        );

      dotDelay(dotScale1, 0).start();
      dotDelay(dotScale2, 150).start();
      dotDelay(dotScale3, 300).start();
    });
  }, []);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors.primary }}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Decorative background rings */}
      <View
        style={{
          position: 'absolute',
          width: width * 1.4,
          height: width * 1.4,
          borderRadius: width * 0.7,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          top: -width * 0.3,
          left: -width * 0.2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: width * 0.45,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          bottom: -width * 0.2,
          right: -width * 0.15,
        }}
      />

      {/* Logo Block */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          alignItems: 'center',
        }}
      >
        {/* Logo mark — geometric B */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
          }}
        >
          <Text
            style={{
              fontSize: 42,
              fontWeight: '800',
              color: Colors.white,
              letterSpacing: -2,
              lineHeight: 48,
            }}
          >
            B
          </Text>
        </View>

        {/* Brand name */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: Colors.white,
            letterSpacing: -0.5,
          }}
        >
          BizCare
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          India
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineY }],
          marginTop: 40,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '400',
            textAlign: 'center',
            letterSpacing: 0.3,
          }}
        >
          Grow smarter. Stay compliant.
        </Text>
      </Animated.View>

      {/* Animated dots */}
      <View
        style={{
          position: 'absolute',
          bottom: 64,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        {[dotScale1, dotScale2, dotScale3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.5)',
              transform: [{ scale: dot }],
            }}
          />
        ))}
      </View>
    </View>
  );
}