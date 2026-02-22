export interface FundingScheme {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate?: number;
  eligibilityCriteria: string[];
  provider: string;
}

export interface FundingEligibility {
  schemeId: string;
  eligible: boolean;
  score: number;
  reason: string;
}
