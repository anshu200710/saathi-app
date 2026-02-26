/**
 * types/service.types.ts
 * All service & dashboard related TypeScript interfaces.
 */

export type ServiceCategory =
  | 'registration'
  | 'compliance'
  | 'taxation'
  | 'legal'
  | 'accounting'
  | 'funding'
  | 'hr'
  | 'trademark'
  | 'import_export'
  | 'startup';

export type ServiceStatus =
  | 'active'
  | 'pending'
  | 'completed'
  | 'in_progress'
  | 'cancelled';

export type PricingType = 'fixed' | 'starting_from' | 'custom';

export interface ServiceDeliverable {
  label: string;
  included: boolean;
}

export interface ServiceStep {
  step: number;
  title: string;
  description: string;
  duration: string; // e.g. "1–2 days"
}

export interface ServiceReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  businessType: string;
}

export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  category: ServiceCategory;
  emoji: string;
  accentColor: string;        // hex — used for card gradient
  price: number;
  pricingType: PricingType;
  currency: string;
  rating: number;
  reviewCount: number;
  deliveryDays: number;       // typical delivery in working days
  isFeatured: boolean;
  isPopular: boolean;
  isPremium: boolean;         // requires paid plan
  tags: string[];
  deliverables: ServiceDeliverable[];
  processSteps: ServiceStep[];
  reviews: ServiceReview[];
  documentsRequired: string[];
  governmentFee?: number;
  professionalFee: number;
}

// ── Active service (purchased / in-progress) ──────────────────
export interface ActiveService {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceEmoji: string;
  accentColor: string;
  status: ServiceStatus;
  progress: number;           // 0–100
  currentStep: string;
  startedAt: string;
  expectedCompletion: string;
  assignedExpert?: string;
  expertAvatar?: string;
}

// ── Dashboard summary types ───────────────────────────────────
export interface ComplianceScore {
  score: number;              // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  pendingTasks: number;
  overdueTasks: number;
  completedThisMonth: number;
}

export interface FundingEligibility {
  score: number;              // 0–100
  eligibleAmount: string;     // e.g. "₹15L – ₹50L"
  matchedSchemes: number;
  topScheme: string;
}

export interface DashboardSummary {
  greeting: string;
  businessName: string;
  complianceScore: ComplianceScore;
  fundingEligibility: FundingEligibility;
  activeServices: ActiveService[];
  upcomingDeadlines: UpcomingDeadline[];
  quickStats: QuickStat[];
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  type: 'gst' | 'tds' | 'roc' | 'pf' | 'pt' | 'income_tax' | 'other';
  penaltyAmount?: string;
}

export interface QuickStat {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: string;
}