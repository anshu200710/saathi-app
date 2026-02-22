/**
 * types/auth.types.ts
 * All auth-related TypeScript interfaces used across the app.
 */

export interface User {
  id: string;
  mobile: string;
  email?: string;
  name?: string;
  avatar?: string;
  isNewUser: boolean;
  isBusinessSetup: boolean;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface BusinessProfile {
  businessName: string;
  businessType: BusinessType;
  industry: Industry;
  annualTurnover: TurnoverRange;
  gstin?: string;
  pan: string;
  state: string;
  city: string;
  pincode: string;
  employeeCount: EmployeeRange;
  incorporationYear?: string;
}

export type BusinessType =
  | 'sole_proprietorship'
  | 'partnership'
  | 'llp'
  | 'private_limited'
  | 'public_limited'
  | 'opc'
  | 'ngo'
  | 'other';

export type Industry =
  | 'manufacturing'
  | 'retail'
  | 'it_services'
  | 'healthcare'
  | 'education'
  | 'agriculture'
  | 'construction'
  | 'hospitality'
  | 'finance'
  | 'logistics'
  | 'ecommerce'
  | 'other';

export type TurnoverRange =
  | 'below_20l'
  | '20l_1cr'
  | '1cr_5cr'
  | '5cr_25cr'
  | 'above_25cr';

export type EmployeeRange =
  | '1_5'
  | '6_20'
  | '21_50'
  | '51_200'
  | 'above_200';