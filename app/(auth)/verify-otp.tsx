/**
 * app/(auth)/verify-otp.tsx
 */

import CustomButton from '@/components/common/CustomButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import OtpInput, { OtpInputRef } from '@/components/common/OtpInput';
import { useAuth } from '@/hooks/useAuth';
import { AntDesign } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { Colors } from '../../theme';

const RESEND_COOLDOWN = 30;

// Mask mobile: 9876543210 → 987** **210
function maskMobile(mobile: string): string {
  if (mobile.length !== 10) return mobile;
  return `${mobile.slice(0, 3)}** **${mobile.slice(7)}`;
}

export default function VerifyOtpScreen() {
  // ✅ All hooks must be at top
  const params = useLocalSearchParams<{ mobile: string }>();
  const mobile = params?.mobile || '';

  const { verifyOtp, clearError, isLoading, error } = useAuth();

  const [otp, setOtp] = useState('');
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const otpRef = useRef<OtpInputRef>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    setTimeout(() => otpRef.current?.focus(), 400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync auth error → local state
  useEffect(() => {
    if (error) {
      setHasError(true);
      shakeInput();
      otpRef.current?.clear();
    }
  }, [error]);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCountdown(RESEND_COOLDOWN);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpComplete = useCallback(
    async (code: string) => {
      setOtp(code);
      setHasError(false);
      clearError();

      if (code.length === 6) {
        await verifyOtp(mobile, code);
      }
    },
    [mobile, verifyOtp, clearError]
  );

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setHasError(true);
      shakeInput();
      return;
    }
    await verifyOtp(mobile, otp);
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setResendSuccess(false);
    clearError();
    setHasError(false);

    try {
      // TODO: implement resendOtp in authService
      setResendSuccess(true);
      otpRef.current?.clear();
      startCountdown();

      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(successScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setResendSuccess(false));
        }, 2000);
      });
    } finally {
      setIsResending(false);
    }
  };

  const displayError =
    error ?? (hasError ? 'Incorrect OTP. Please try again.' : null);

  // ✅ Safe conditional UI AFTER hooks
  if (!mobile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid phone number. Please try again.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {isLoading && (
        <LoadingSpinner mode="overlay" message="Verifying…" />
      )}

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Back Button */}
        <View style={{ paddingTop: 56, marginBottom: 40 }}>
          <Pressable
            onPress={() => {
              router.back();
              clearError();
            }}
          >
            <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
          </Pressable>
        </View>

        {/* Header */}
        <Text style={{ fontSize: 26, fontWeight: '800', color: Colors.textDark }}>
          Verify your number
        </Text>

        <Text style={{ marginTop: 10, color: Colors.textMuted }}>
          We've sent a 6-digit OTP to{" "}
          <Text style={{ fontWeight: '700', color: Colors.textDark }}>
            +91 {maskMobile(mobile)}
          </Text>
        </Text>

        {/* OTP */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }], marginVertical: 30 }}>
          <OtpInput
            ref={otpRef}
            onComplete={handleOtpComplete}
            error={!!displayError}
            disabled={isLoading}
          />
        </Animated.View>

        {/* Error */}
        {displayError && (
          <Text style={{ color: Colors.danger, marginBottom: 20 }}>
            {displayError}
          </Text>
        )}

        <CustomButton
          label="Verify OTP"
          onPress={handleVerify}
          loading={isLoading}
          disabled={otp.length !== 6}
          fullWidth
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}