/**
 * types/admin.types.ts
 * All Phase 5 TypeScript interfaces — admin, plans, payments,
 * notifications, and relationship-manager support.
 */

// ── Plans ─────────────────────────────────────────────────────
export type PlanId = 'free' | 'starter' | 'growth' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;   // bold / callout
  value?: string;        // e.g. "5 filings/year"
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  emoji: string;
  accentColor: string;
  monthlyPrice: number;
  annualPrice: number;   // per month when billed annually
  annualSavings: number; // % saved vs monthly
  isMostPopular: boolean;
  features: PlanFeature[];
  ctaLabel: string;
  badge?: string;        // "Best Value", "For Startups"
}

export interface UserSubscription {
  planId: PlanId;
  planName: string;
  billingCycle: BillingCycle;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  nextBillingDate: string;
  nextBillingAmount: number;
  startedAt: string;
  autoRenew: boolean;
}

// ── Payments ──────────────────────────────────────────────────
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  methodDetail: string;  // "HDFC Bank", "Google Pay", "Visa ••4242"
  createdAt: string;
  invoiceUrl?: string;
  serviceId?: string;
  planId?: PlanId;
}

export interface PaymentSummary {
  totalSpent: number;
  totalTransactions: number;
  pendingAmount: number;
  transactions: PaymentTransaction[];
}

// ── Notifications ─────────────────────────────────────────────
export type NotificationCategory =
  | 'compliance'
  | 'service_update'
  | 'payment'
  | 'funding'
  | 'document'
  | 'system'
  | 'promo';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  actionLabel?: string;
  actionRoute?: string;
  emoji?: string;
  metadata?: Record<string, string>;
}

export interface NotificationPreferences {
  compliance: boolean;
  service_update: boolean;
  payment: boolean;
  funding: boolean;
  document: boolean;
  promo: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

// ── RM / Support ──────────────────────────────────────────────
export interface RelationshipManager {
  id: string;
  name: string;
  designation: string;
  avatar: string;          // initials fallback
  avatarColor: string;
  phone: string;
  email: string;
  expertise: string[];
  rating: number;
  clientsHandled: number;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  availabilityText: string;
}

export type MessageSender = 'user' | 'rm' | 'system';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  lastMessage: string;
  unreadCount: number;
  assignedRM?: RelationshipManager;
  messages: ChatMessage[];
}

// ── Admin Dashboard ───────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  plan: PlanId;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  complianceScore: number;
  totalRevenue: number;
  activeServices: number;
  lastActive: string;
  state: string;
  businessType: string;
}

export interface AdminMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  color: string;
}

export interface AdminDashboard {
  metrics: AdminMetric[];
  recentUsers: AdminUser[];
  revenueByMonth: { month: string; revenue: number; users: number }[];
  serviceDistribution: { service: string; count: number; color: string }[];
  planDistribution: { plan: PlanId; count: number; color: string }[];
}