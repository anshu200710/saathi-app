/**
 * components/common/Banner.tsx
 *
 * Horizontal strip for promotions, alerts, and informational messages.
 *
 * Variants:
 *   info      — blue (informational)
 *   success   — green (confirmation / achievement)
 *   warning   — amber (gentle alert)
 *   danger    — red (critical alert)
 *   promo     — orange gradient (marketing / upsell)
 *
 * Features:
 *  • Optional dismiss (×) button with callback
 *  • Optional CTA button inside banner
 *  • Optional left icon slot
 *  • Accessible via accessibilityRole="alert"
 *
 * Usage:
 *   <Banner
 *     variant="warning"
 *     title="GST Return Due"
 *     message="File GSTR-3B by 20th Jan to avoid penalties."
 *     ctaLabel="File Now"
 *     onCta={() => router.push('/compliance')}
 *     onDismiss={handleDismiss}
 *   />
 */

import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '../../theme';

// ── Types ─────────────────────────────────────────────────────
type BannerVariant = 'info' | 'success' | 'warning' | 'danger' | 'promo';

interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  message: string;
  /** Icon to render on the left (any React node) */
  icon?: React.ReactNode;
  /** Label for the right-side CTA button */
  ctaLabel?: string;
  onCta?: () => void;
  /** Show × dismiss button — fires onDismiss when tapped */
  onDismiss?: () => void;
  className?: string;
}

// ── Style Config ──────────────────────────────────────────────
const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    containerClass: string;
    titleClass: string;
    messageClass: string;
    ctaBg: string;
    ctaText: string;
    iconColor: string;
  }
> = {
  info: {
    containerClass: 'bg-info-light border-l-4 border-info',
    titleClass: 'text-info',
    messageClass: 'text-base',
    ctaBg: Colors.info,
    ctaText: Colors.white,
    iconColor: Colors.info,
  },
  success: {
    containerClass: 'bg-success-light border-l-4 border-success',
    titleClass: 'text-success',
    messageClass: 'text-base',
    ctaBg: Colors.success,
    ctaText: Colors.white,
    iconColor: Colors.success,
  },
  warning: {
    containerClass: 'bg-warning-light border-l-4 border-warning',
    titleClass: 'text-warning',
    messageClass: 'text-base',
    ctaBg: Colors.warning,
    ctaText: Colors.white,
    iconColor: Colors.warning,
  },
  danger: {
    containerClass: 'bg-danger-light border-l-4 border-danger',
    titleClass: 'text-danger',
    messageClass: 'text-base',
    ctaBg: Colors.danger,
    ctaText: Colors.white,
    iconColor: Colors.danger,
  },
  promo: {
    containerClass: 'bg-secondary-light border-l-4 border-secondary',
    titleClass: 'text-secondary-dark',
    messageClass: 'text-base',
    ctaBg: Colors.secondary,
    ctaText: Colors.white,
    iconColor: Colors.secondary,
  },
};

// ── Component ─────────────────────────────────────────────────
export default function Banner({
  variant = 'info',
  title,
  message,
  icon,
  ctaLabel,
  onCta,
  onDismiss,
  className = '',
}: BannerProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      className={['rounded-lg p-4', config.containerClass, className].join(' ')}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View className="flex-row items-start">
        {/* Left Icon */}
        {icon && (
          <View className="mr-3 mt-0.5">{icon}</View>
        )}

        {/* Content */}
        <View className="flex-1">
          {title && (
            <Text className={['text-sm font-bold mb-0.5', config.titleClass].join(' ')}>
              {title}
            </Text>
          )}
          <Text className="text-sm leading-5">{message}</Text>

          {/* CTA Button */}
          {ctaLabel && onCta && (
            <Pressable
              onPress={onCta}
              className="mt-2 self-start px-3 py-1.5 rounded-md"
              style={{ backgroundColor: config.ctaBg }}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: config.ctaText }}
              >
                {ctaLabel}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Dismiss Button */}
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="ml-2"
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <AntDesign name="close" size={14} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}