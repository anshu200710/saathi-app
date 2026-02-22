/**
 * components/common/StatusBadge.tsx
 *
 * Pill-shaped label for conveying state at a glance.
 *
 * Status types map to semantic colors from our design system:
 *   active / approved / completed → success green
 *   pending / in_progress         → warning amber
 *   rejected / overdue / failed   → danger red
 *   inactive / cancelled          → muted gray
 *   new / upcoming                → info blue
 *   premium                       → secondary orange
 *
 * Sizes: sm | md
 *
 * Architecture note:
 *   StatusBadge is purely presentational — it receives a `status` string
 *   and maps it internally. This decouples API string values from UI logic
 *   and lets us rename display labels without touching screens.
 */

import React from 'react';
import { Text, View } from 'react-native';

// ── Types ─────────────────────────────────────────────────────
export type StatusType =
  | 'active'
  | 'approved'
  | 'completed'
  | 'pending'
  | 'in_progress'
  | 'rejected'
  | 'overdue'
  | 'failed'
  | 'inactive'
  | 'cancelled'
  | 'new'
  | 'upcoming'
  | 'premium'
  | 'draft';

type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  status: StatusType;
  /** Override the auto-derived label */
  label?: string;
  size?: BadgeSize;
  /** Show a leading dot indicator */
  dot?: boolean;
}

// ── Config Maps ───────────────────────────────────────────────
const STATUS_CONFIG: Record<
  StatusType,
  { label: string; containerClass: string; textClass: string; dotClass: string }
> = {
  active: {
    label: 'Active',
    containerClass: 'bg-success-light',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  approved: {
    label: 'Approved',
    containerClass: 'bg-success-light',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  completed: {
    label: 'Completed',
    containerClass: 'bg-success-light',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  pending: {
    label: 'Pending',
    containerClass: 'bg-warning-light',
    textClass: 'text-warning',
    dotClass: 'bg-warning',
  },
  in_progress: {
    label: 'In Progress',
    containerClass: 'bg-warning-light',
    textClass: 'text-warning',
    dotClass: 'bg-warning',
  },
  rejected: {
    label: 'Rejected',
    containerClass: 'bg-danger-light',
    textClass: 'text-danger',
    dotClass: 'bg-danger',
  },
  overdue: {
    label: 'Overdue',
    containerClass: 'bg-danger-light',
    textClass: 'text-danger',
    dotClass: 'bg-danger',
  },
  failed: {
    label: 'Failed',
    containerClass: 'bg-danger-light',
    textClass: 'text-danger',
    dotClass: 'bg-danger',
  },
  inactive: {
    label: 'Inactive',
    containerClass: 'bg-surface-alt',
    textClass: 'text-muted',
    dotClass: 'bg-muted',
  },
  cancelled: {
    label: 'Cancelled',
    containerClass: 'bg-surface-alt',
    textClass: 'text-muted',
    dotClass: 'bg-muted',
  },
  new: {
    label: 'New',
    containerClass: 'bg-info-light',
    textClass: 'text-info',
    dotClass: 'bg-info',
  },
  upcoming: {
    label: 'Upcoming',
    containerClass: 'bg-info-light',
    textClass: 'text-info',
    dotClass: 'bg-info',
  },
  premium: {
    label: 'Premium',
    containerClass: 'bg-secondary-light',
    textClass: 'text-secondary-dark',
    dotClass: 'bg-secondary',
  },
  draft: {
    label: 'Draft',
    containerClass: 'bg-surface-alt',
    textClass: 'text-muted',
    dotClass: 'bg-muted',
  },
};

const SIZE_STYLES: Record<BadgeSize, { container: string; text: string; dot: string }> = {
  sm: {
    container: 'px-2 py-0.5 rounded-full',
    text: 'text-2xs font-semibold',
    dot: 'w-1.5 h-1.5 rounded-full mr-1',
  },
  md: {
    container: 'px-3 py-1 rounded-full',
    text: 'text-xs font-semibold',
    dot: 'w-2 h-2 rounded-full mr-1.5',
  },
};

// ── Component ─────────────────────────────────────────────────
export default function StatusBadge({
  status,
  label,
  size = 'md',
  dot = false,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeStyle = SIZE_STYLES[size];

  const displayLabel = label ?? config.label;

  return (
    <View
      className={['flex-row items-center self-start', config.containerClass, sizeStyle.container].join(' ')}
      accessibilityLabel={`Status: ${displayLabel}`}
    >
      {/* Leading dot */}
      {dot && (
        <View className={[config.dotClass, sizeStyle.dot].join(' ')} />
      )}

      <Text className={[config.textClass, sizeStyle.text].join(' ')}>
        {displayLabel}
      </Text>
    </View>
  );
}