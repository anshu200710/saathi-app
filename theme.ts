/**
 * theme.ts — Global Design Tokens
 *
 * Single source of truth for all visual constants.
 * Used by both NativeWind (via tailwind.config) and
 * inline StyleSheet where Tailwind classes aren't sufficient.
 *
 * Architecture note:
 *   Import this file directly in StyleSheet.create() calls,
 *   or reference the matching Tailwind class names in JSX.
 *   Keeping both in sync prevents drift.
 */

export const Colors = {
  // ── Brand Palette ───────────────────────────────────────────
  primary: '#0066CC',       // Trust / action (CTA buttons, links)
  primaryLight: '#E8F1FB',  // Primary tint for backgrounds / chips
  primaryDark: '#004FA3',   // Pressed / active state

  secondary: '#FF9900',     // Energy / highlight (badges, accents)
  secondaryLight: '#FFF3E0',
  secondaryDark: '#CC7A00',

  // ── Semantic ─────────────────────────────────────────────────
  success: '#16A34A',
  successLight: '#DCFCE7',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  info: '#0EA5E9',
  infoLight: '#E0F2FE',

  // ── Neutral / Surface ────────────────────────────────────────
  background: '#F9FAFB',    // App background
  surface: '#FFFFFF',       // Cards, modals
  surfaceAlt: '#F3F4F6',    // Subtle alternate rows / tags

  border: '#E5E7EB',        // Default borders
  borderMuted: '#F3F4F6',   // Hairlines, dividers

  // ── Typography ───────────────────────────────────────────────
  textDark: '#111827',      // Headings
  textBase: '#374151',      // Body
  textMuted: '#6B7280',     // Captions, placeholders
  textDisabled: '#9CA3AF',

  white: '#FFFFFF',
  black: '#000000',

  // ── Misc ─────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.45)',
  shadow: 'rgba(0,0,0,0.08)',
} as const;

export type ColorKey = keyof typeof Colors;

// ── Typography Scale ──────────────────────────────────────────
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

// ── Spacing (8-pt grid) ───────────────────────────────────────
export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ── Border Radius ─────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

// ── Shadows (iOS + Android) ───────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ── Animation Durations ───────────────────────────────────────
export const Duration = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// ── Z-Index Ladder ────────────────────────────────────────────
export const ZIndex = {
  base: 0,
  card: 10,
  sticky: 20,
  modal: 40,
  toast: 50,
} as const;

// ── Bottom Tab Height (accounting for safe area) ──────────────
export const TAB_BAR_HEIGHT = 64;
export const HEADER_HEIGHT = 56;