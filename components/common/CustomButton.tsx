/**
 * components/common/CustomButton.tsx
 *
 * Primary interactive element across the app.
 *
 * Variants:
 *   primary   — filled blue (main CTA)
 *   secondary — filled orange (secondary action)
 *   outline   — bordered, transparent bg
 *   ghost     — text-only, no border
 *   danger    — filled red (destructive actions)
 *
 * Sizes:  sm | md | lg
 * States: loading (shows spinner + disables), disabled
 *
 * Architecture note:
 *   Uses Pressable (not TouchableOpacity) for predictable ripple
 *   support on Android and fine-grained pressed-state control.
 *   Animated.View provides haptic-like scale feedback cross-platform.
 */

import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  /** Optional icon rendered to the left of the label */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered to the right of the label */
  rightIcon?: React.ReactNode;
  /** Stretch to full width of parent */
  fullWidth?: boolean;
  /** Extra Tailwind classes for the container (use sparingly) */
  className?: string;
}

// ── Style Maps ────────────────────────────────────────────────
const containerStyles: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const textStyles: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-white',
};

const spinnerColors: Record<Variant, string> = {
  primary: Colors.white,
  secondary: Colors.white,
  outline: Colors.primary,
  ghost: Colors.primary,
  danger: Colors.white,
};

const sizeStyles: Record<Size, { container: string; text: string; px: number; py: number }> = {
  sm: { container: 'px-4 py-2 rounded-md', text: 'text-sm font-semibold', px: 16, py: 8 },
  md: { container: 'px-5 py-3 rounded-lg', text: 'text-base font-semibold', px: 20, py: 12 },
  lg: { container: 'px-6 py-4 rounded-lg', text: 'text-lg font-bold', px: 24, py: 16 },
};

// ── Component ─────────────────────────────────────────────────
export default function CustomButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
}: CustomButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  const opacityClass = isDisabled ? 'opacity-50' : 'opacity-100';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <Animated.View style={{ transform: [{ scale }] }} className={widthClass}>
      <Pressable
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        android_ripple={{
          color: variant === 'outline' || variant === 'ghost'
            ? Colors.primaryLight
            : 'rgba(255,255,255,0.2)',
          borderless: false,
        }}
        className={[
          'flex-row items-center justify-center',
          containerStyles[variant],
          sizeStyles[size].container,
          opacityClass,
          className,
        ].join(' ')}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {/* Left Icon */}
        {!loading && leftIcon && (
          <View className="mr-2">{leftIcon}</View>
        )}

        {/* Spinner or Label */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={spinnerColors[variant]}
            accessibilityLabel="Loading"
          />
        ) : (
          <Text
            className={[sizeStyles[size].text, textStyles[variant]].join(' ')}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}

        {/* Right Icon */}
        {!loading && rightIcon && (
          <View className="ml-2">{rightIcon}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}