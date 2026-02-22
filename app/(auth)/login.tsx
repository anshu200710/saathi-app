/**
 * app/(auth)/login.tsx — Login Screen
 *
 * Design: Refined split layout. Top half = brand header with diagonal
 * cut geometric detail. Bottom half = white card with login form.
 * Feels trustworthy and premium — essential for a fintech product.
 *
 * Auth methods:
 *  1. Mobile OTP (primary) — navigates to verify-otp
 *  2. Google Sign-In (secondary)
 *
 * Validation: real-time inline, Bharat-aware (10-digit, 6-9 prefix).
 */

import CustomButton from '@/components/common/CustomButton';
import { useAuth } from '@/hooks/useAuth';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, Shadow } from '../../theme';

// ── Trust badges shown below CTA ──────────────────────────────
const TRUST_ITEMS = [
  { icon: 'shield-checkmark', label: '256-bit SSL' },
  { icon: 'lock-closed', label: 'Data Private' },
  { icon: 'star', label: '4.8★ Rating' },
];

export default function LoginScreen() {
  const { sendOtp, isLoading, error, clearError } = useAuth() as any;

  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Shake animation for errors
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
    if (mobileError) setMobileError(null);
    if (error) clearError();
  };

  const handleSendOtp = async () => {
    // Validate mobile: must be 10 digits and start with 6-9
    if (mobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      shake();
      return;
    }
    if (!/^[6-9]/.test(mobile)) {
      setMobileError('Mobile number must start with 6, 7, 8, or 9');
      shake();
      return;
    }
    await sendOtp(mobile);
  };

  const handleGoogleLogin = () => {
    // Google OAuth — integrate with @react-native-google-signin/google-signin
    // Placeholder navigation for Phase 2
    console.log('Google login — wire up Firebase in Phase 5');
  };

  const displayError = mobileError ?? error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: Colors.primary }}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Header / Brand Area ────────────────────────────── */}
        <View
          style={{ backgroundColor: Colors.primary, paddingTop: 64, paddingBottom: 48 }}
          className="px-6"
        >
          {/* Back to onboarding */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mb-8"
          >
            <AntDesign name="arrow-left" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>

          {/* Brand */}
          <View className="flex-row items-center mb-2">
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.white }}>B</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 }}>
              BizCare
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.white, marginTop: 20, letterSpacing: -0.5 }}>
            Welcome back 👋
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 20 }}>
            Enter your mobile number to continue growing your business
          </Text>

          {/* Stats strip */}
          <View className="flex-row mt-6 gap-4">
            {[
              { value: '2L+', label: 'Businesses' },
              { value: '₹200Cr+', label: 'Funding Linked' },
              { value: '99%', label: 'On-time Filing' },
            ].map((stat) => (
              <View key={stat.label}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>{stat.value}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Form Card ──────────────────────────────────────── */}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 40,
            ...Shadow.lg,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 24 }}>
            Login / Sign Up
          </Text>

          {/* Mobile Input */}
          <View className="mb-5">
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginBottom: 8 }}>
              Mobile Number
            </Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: isFocused ? 2 : 1.5,
                  borderColor: displayError
                    ? Colors.danger
                    : isFocused
                    ? Colors.primary
                    : Colors.border,
                  borderRadius: 12,
                  backgroundColor: Colors.white,
                  paddingHorizontal: 14,
                  height: 54,
                  ...Shadow.sm,
                }}
              >
                {/* Country prefix */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingRight: 12,
                    borderRightWidth: 1,
                    borderRightColor: Colors.border,
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 4 }}>🇮🇳</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark }}>+91</Text>
                </View>

                <TextInput
                  value={mobile}
                  onChangeText={handleMobileChange}
                  placeholder="98765 43210"
                  placeholderTextColor={Colors.textDisabled}
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    flex: 1,
                    fontSize: 17,
                    fontWeight: '600',
                    color: Colors.textDark,
                    letterSpacing: 1,
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                  accessibilityLabel="Mobile number"
                />

                {mobile.length === 10 && !mobileError && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                )}
              </View>
            </Animated.View>

            {/* Error text */}
            {displayError && (
              <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6, marginLeft: 2 }}>
                {displayError}
              </Text>
            )}
          </View>

          {/* OTP CTA */}
          <CustomButton
            label="Get OTP"
            onPress={handleSendOtp}
            loading={isLoading}
            fullWidth
            size="lg"
            rightIcon={<AntDesign name="arrow-right" size={18} color="white" />}
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginHorizontal: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          </View>

          {/* Google Login */}
          <Pressable
            onPress={handleGoogleLogin}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 52,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: Colors.border,
              backgroundColor: Colors.white,
              ...Shadow.sm,
            }}
          >
            <AntDesign name="google" size={20} color="#EA4335" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.textDark, marginLeft: 10 }}>
              Continue with Google
            </Text>
          </Pressable>

          {/* Trust badges */}
          <View className="flex-row justify-center mt-7 gap-5">
            {TRUST_ITEMS.map((item) => (
              <View key={item.label} className="items-center">
                <Ionicons name={item.icon as any} size={16} color={Colors.textMuted} />
                <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 3, fontWeight: '500' }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Terms */}
          <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 16 }}>
            By continuing, you agree to our{' '}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}