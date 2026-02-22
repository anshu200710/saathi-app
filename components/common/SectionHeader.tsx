/**
 * components/common/SectionHeader.tsx
 *
 * Consistent section title row used across all screens.
 *
 * Layout:
 *   [title]         [optional: actionLabel →]
 *
 * Features:
 *  • Optional subtitle below title
 *  • Optional right-side action (e.g. "See all →")
 *  • Optional left icon/badge
 *  • Size variants: sm | md | lg
 *
 * Usage:
 *   <SectionHeader title="Active Services" actionLabel="See all" onAction={() => router.push('/services')} />
 *   <SectionHeader title="Compliance Calendar" subtitle="Q1 FY 2025–26" />
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
type SectionHeaderSize = 'sm' | 'md' | 'lg';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Text for the right-aligned action button */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional node to render to the left of the title (e.g. icon) */
  leftElement?: React.ReactNode;
  size?: SectionHeaderSize;
  /** Additional className on the outer container */
  className?: string;
}

// ── Style Maps ────────────────────────────────────────────────
const titleSizes: Record<SectionHeaderSize, string> = {
  sm: 'text-sm font-semibold text-dark',
  md: 'text-base font-bold text-dark',
  lg: 'text-lg font-bold text-dark',
};

const subtitleSizes: Record<SectionHeaderSize, string> = {
  sm: 'text-2xs text-muted mt-0.5',
  md: 'text-xs text-muted mt-0.5',
  lg: 'text-sm text-muted mt-1',
};

// ── Component ─────────────────────────────────────────────────
export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  leftElement,
  size = 'md',
  className = '',
}: SectionHeaderProps) {
  return (
    <View
      className={['flex-row items-center justify-between', className].join(' ')}
    >
      {/* Left side: icon + title + subtitle */}
      <View className="flex-row items-center flex-1 mr-3">
        {leftElement && <View className="mr-2">{leftElement}</View>}

        <View className="flex-1">
          <Text className={titleSizes[size]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className={subtitleSizes[size]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right side: action */}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: Colors.primary }}
          >
            {actionLabel} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}