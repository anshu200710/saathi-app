/**
 * components/common/Card.tsx
 *
 * Surface container used throughout the app for sections,
 * list items, summary panels, and dashboard widgets.
 *
 * Variants:
 *   default  — white card with shadow
 *   outlined — white card with border, no shadow
 *   filled   — primary-light background (used for highlights)
 *   flat     — no shadow, no border (for nested cards)
 *
 * Pressable mode: wrap content in a Pressable when `onPress` is provided.
 *
 * Architecture note:
 *   Card deliberately avoids padding so callers control inner spacing.
 *   This keeps the component flexible — some cards need edge-to-edge
 *   images, others need padded content.
 */

import React, { useCallback, useRef } from 'react';
import {
    Animated,
    Pressable,
    View,
    ViewStyle,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
type CardVariant = 'default' | 'outlined' | 'filled' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  /** Padding shorthand — passed as padding to inner view */
  padding?: number;
  /** Override border radius */
  radius?: number;
  style?: ViewStyle;
  className?: string;
  /** Disable press animation even when onPress is provided */
  noAnimation?: boolean;
  /** Used for accessibility */
  accessibilityLabel?: string;
}

// ── Style Maps ────────────────────────────────────────────────
const variantStyles: Record<
  CardVariant,
  { className: string; shadow?: ViewStyle }
> = {
  default: {
    className: 'bg-surface rounded-lg',
    shadow: Shadow.md,
  },
  outlined: {
    className: 'bg-surface rounded-lg border border-border',
  },
  filled: {
    className: 'bg-primary-light rounded-lg',
  },
  flat: {
    className: 'bg-surface rounded-lg',
  },
};

// ── Component ─────────────────────────────────────────────────
export default function Card({
  children,
  variant = 'default',
  onPress,
  padding = 16,
  radius,
  style,
  className = '',
  noAnimation = false,
  accessibilityLabel,
}: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (noAnimation) return;
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 50,
      bounciness: 3,
    }).start();
  }, [scale, noAnimation]);

  const handlePressOut = useCallback(() => {
    if (noAnimation) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 3,
    }).start();
  }, [scale, noAnimation]);

  const variantConfig = variantStyles[variant];

  const containerStyle: ViewStyle = {
    padding,
    ...(radius !== undefined ? { borderRadius: radius } : {}),
    ...(variantConfig.shadow ?? {}),
    ...style,
  };

  const content = (
    <View
      style={containerStyle}
      className={[variantConfig.className, className].join(' ')}
    >
      {children}
    </View>
  );

  // Render as plain View if no press handler
  if (!onPress) {
    return content;
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: Colors.primaryLight,
          borderless: false,
          radius: radius ?? Radius.lg,
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Re-render as View inside Pressable for proper layout */}
        <View
          style={containerStyle}
          className={[variantConfig.className, className].join(' ')}
        >
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
}