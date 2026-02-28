/**
 * app/index.tsx — Entry / Splash Gate
 *
 * Beautiful splash screen shown on launch (2-3 seconds).
 * After animations complete, it:
 *   • Checks if user is first-time → navigate to onboarding
 *   • Checks user session → navigate to login or dashboard
 *
 * Routing logic:
 *   • First time user         → /onboarding
 *   • No active session       → /(auth)/login
 *   • Valid session + setup   → /(user)/home
 *   • Valid session, no setup → /(auth)/business-profile
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
  const containerOpacity = useRef(new Animated.Value(1)).current;

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

    // Navigate after 2.5 seconds
    const navigationTimer = setTimeout(() => {
      handleNavigation();
    }, 2500);

    return () => clearTimeout(navigationTimer);
  }, []);

  const handleNavigation = async () => {
    try {
      // Check if onboarding was already completed
      const onboardingDone = await AsyncStorage.getItem('onboarding_done');
      const userSession = await AsyncStorage.getItem('user_session');

      // Fade out splash screen
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (!onboardingDone) {
          // First-time user → show onboarding
          router.replace('/onboarding');
        } else if (userSession) {
          // Returning user with session → go to dashboard
          router.replace('/(user)/home');
        } else {
          // Returning user, no session → go to login
          router.replace('/(auth)/login');
        }
      });
    } catch (error) {
      console.log('Navigation error:', error);
      // Default to login on error
      router.replace('/(auth)/login');
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        opacity: containerOpacity,
      }}
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
        {/* Logo mark — store icon */}
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
            V
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
          Vyaapar
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Saathi</Text>
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
          Your Business Companion
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
    </Animated.View>
  );
}