export interface Business {
  id: string;
  name: string;
  gstNumber?: string;
  panNumber?: string;
  businessType: string;
  industry: string;
  registrationDate?: string;
  revenue?: number;
}

export interface BusinessContextType {
  business: Business | null;
  isLoading: boolean;
  updateBusiness: (data: Partial<Business>) => Promise<void>;
  getBusiness: () => Promise<void>;
}
