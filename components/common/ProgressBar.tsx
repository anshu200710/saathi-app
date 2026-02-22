/**
 * components/common/ProgressBar.tsx
 *
 * Animated horizontal bar showing percentage completion.
 *
 * Features:
 *  • Smooth animated fill on mount and value change
 *  • Colour auto-derived from percentage (red → amber → green)
 *    unless an explicit `color` is passed
 *  • Optional label and percentage display
 *  • Accessible via progressViewOffset
 *
 * Used by: ComplianceScoreCard, EligibilityMeter, service progress
 *
 * Architecture note:
 *   Animation runs on the JS thread (Animated.Value width%) to stay
 *   compatible with all RN versions. Upgrade to Reanimated 3 if
 *   60fps requirement is added for this component.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
interface ProgressBarProps {
  /** Value 0–100 */
  value: number;
  /** Explicit hex color — overrides semantic auto-color */
  color?: string;
  /** Height of the track in px */
  height?: number;
  /** Show percentage label on the right */
  showLabel?: boolean;
  /** Custom label (overrides auto "xx%" label) */
  label?: string;
  /** Show text above bar: left = title, right = value */
  title?: string;
  /** Animation duration in ms */
  duration?: number;
  style?: ViewStyle;
}

// ── Helpers ───────────────────────────────────────────────────
function getSemanticColor(value: number): string {
  if (value >= 75) return Colors.success;
  if (value >= 45) return Colors.warning;
  return Colors.danger;
}

// ── Component ─────────────────────────────────────────────────
export default function ProgressBar({
  value,
  color,
  height = 8,
  showLabel = false,
  label,
  title,
  duration = 600,
  style,
}: ProgressBarProps) {
  // Clamp to 0–100
  const clampedValue = Math.min(100, Math.max(0, value));
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const fillColor = color ?? getSemanticColor(clampedValue);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedValue,
      duration,
      useNativeDriver: false, // width % is not supported by native driver
    }).start();
  }, [clampedValue, duration]);

  // Interpolate 0–100 numeric value → '0%'–'100%' string for width
  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const displayLabel = label ?? `${Math.round(clampedValue)}%`;

  return (
    <View style={style}>
      {/* Optional top row: title left, label right */}
      {(title || showLabel) && (
        <View className="flex-row justify-between items-center mb-1.5">
          {title ? (
            <Text className="text-xs text-muted font-medium">{title}</Text>
          ) : (
            <View /> // spacer
          )}
          {showLabel && (
            <Text
              className="text-xs font-semibold"
              style={{ color: fillColor }}
            >
              {displayLabel}
            </Text>
          )}
        </View>
      )}

      {/* Track */}
      <View
        className="w-full bg-border-muted overflow-hidden"
        style={{ height, borderRadius: height / 2 }}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
      >
        {/* Fill */}
        <Animated.View
          style={{
            width: widthInterpolated,
            height,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}