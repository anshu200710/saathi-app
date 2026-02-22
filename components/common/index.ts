/**
 * components/common/index.ts — Barrel Export
 *
 * Import all common components from a single path:
 *   import { CustomButton, Card, StatusBadge } from '@/components/common';
 *
 * This keeps imports clean across 30+ screens and avoids
 * path-hunting when files move during refactoring.
 */

export { default as Banner } from './Banner';
export { default as Card } from './Card';
export { default as CustomButton } from './CustomButton';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ProgressBar } from './ProgressBar';
export { default as SectionHeader } from './SectionHeader';
export { default as StatusBadge } from './StatusBadge';

// Re-export types that screens may need
export type { StatusType } from './StatusBadge';
