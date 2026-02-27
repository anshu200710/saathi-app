/**
 * types/funding.types.ts
 * All funding scheme, eligibility, and compliance TypeScript interfaces.
 */

// ── Funding ────────────────────────────────────────────────────
export type FundingCategory =
  | 'government_scheme'
  | 'bank_loan'
  | 'nbfc_loan'
  | 'subsidy'
  | 'equity'
  | 'grant'
  | 'credit_guarantee';

export type FundingStatus = 'open' | 'closing_soon' | 'closed' | 'coming_soon';
export type RepaymentType = 'monthly' | 'quarterly' | 'bullet' | 'na';

export interface FundingScheme {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  category: FundingCategory;
  emoji: string;
  accentColor: string;
  provider: string;               // "SBI", "SIDBI", "MoMSME"
  providerType: 'bank' | 'govt' | 'nbfc' | 'startup_india';
  minAmount: number;
  maxAmount: number;
  interestRate: string;           // "7.5% – 10.5% p.a."
  repaymentType: RepaymentType;
  maxTenure: string;              // "5 years"
  processingFee: string;          // "0.5% of loan amount"
  collateralRequired: boolean;
  status: FundingStatus;
  eligibilityScore: number;       // 0–100 match for this user
  matchReasons: string[];
  eligibilityCriteria: EligibilityCriterion[];
  documentsRequired: string[];
  applicationSteps: ApplicationStep[];
  tags: string[];
  isFeatured: boolean;
  totalApplicants?: number;
  approvalRate?: number;          // %
  disbursalDays?: number;
}

export interface EligibilityCriterion {
  label: string;
  met: boolean;
  detail?: string;
}

export interface ApplicationStep {
  step: number;
  title: string;
  description: string;
}

// ── Eligibility Checker ────────────────────────────────────────
export interface EligibilityQuestion {
  id: string;
  question: string;
  hint?: string;
  type: 'single_select' | 'multi_select' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
  field: string;                  // maps to EligibilityInput key
}

export interface EligibilityInput {
  businessAge?: string;           // years
  annualTurnover?: string;
  businessType?: string;
  industry?: string;
  hasGst?: boolean;
  hasMsme?: boolean;
  employeeCount?: string;
  creditScore?: string;
  loanPurpose?: string;
  collateralAvailable?: boolean;
  state?: string;
  existingLoans?: boolean;
}

export interface EligibilityResult {
  overallScore: number;
  eligibleCount: number;
  totalSchemes: number;
  topSchemes: FundingScheme[];
  improvements: ImprovementTip[];
  creditProfile: CreditProfile;
}

export interface ImprovementTip {
  action: string;
  impact: string;
  scoreBoost: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CreditProfile {
  score: number;
  label: string;
  color: string;
  factors: { label: string; status: 'good' | 'neutral' | 'poor' }[];
}

// ── Compliance ─────────────────────────────────────────────────
export type ComplianceCategory = 'gst' | 'tds' | 'roc' | 'pf' | 'pt' | 'income_tax' | 'fema' | 'labour';
export type ComplianceTaskStatus = 'pending' | 'completed' | 'overdue' | 'upcoming' | 'not_applicable';
export type ComplianceFrequency = 'monthly' | 'quarterly' | 'annual' | 'event_based' | 'one_time';

export interface ComplianceTask {
  id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  frequency: ComplianceFrequency;
  dueDate: string;
  status: ComplianceTaskStatus;
  penalty?: string;
  penaltyAmount?: number;
  form?: string;                  // e.g. "GSTR-3B", "ITR-3"
  applicableTo: string[];         // business types
  priority: 'critical' | 'high' | 'medium' | 'low';
  completedAt?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface ComplianceMonth {
  month: string;                  // "January 2025"
  tasks: ComplianceTask[];
  completedCount: number;
  totalCount: number;
}

export interface ComplianceOverview {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  overdueCount: number;
  pendingCount: number;
  completedCount: number;
  upcomingCount: number;
  byCategory: CategoryScore[];
  months: ComplianceMonth[];
}

export interface CategoryScore {
  category: ComplianceCategory;
  label: string;
  emoji: string;
  score: number;
  pendingCount: number;
}

// ── Documents ──────────────────────────────────────────────────
export type DocumentStatus = 'verified' | 'pending_review' | 'rejected' | 'expired' | 'uploaded';
export type DocumentCategory =
  | 'identity'
  | 'business_registration'
  | 'tax'
  | 'financial'
  | 'legal'
  | 'compliance'
  | 'other';

export interface DocumentFolder {
  id: string;
  title: string;
  category: DocumentCategory;
  emoji: string;
  accentColor: string;
  documentCount: number;
  lastUpdated: string;
  requiredCount: number;
  uploadedCount: number;
}

export interface Document {
  id: string;
  folderId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'excel';
  fileSize: string;
  status: DocumentStatus;
  uploadedAt: string;
  expiresAt?: string;
  isRequired: boolean;
  notes?: string;
}