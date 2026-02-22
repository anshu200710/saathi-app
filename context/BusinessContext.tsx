/**
 * context/BusinessContext.tsx
 *
 * Stores and broadcasts the active business profile.
 * Phase 3 (Home) will fully flesh this out with API calls.
 * This stub satisfies the root layout's provider requirement.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { BusinessProfile } from '../types/auth.types';

interface BusinessContextValue {
  business: Partial<BusinessProfile> | null;
  setBusiness: (b: Partial<BusinessProfile>) => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Partial<BusinessProfile> | null>(null);

  const value = useMemo(() => ({ business, setBusiness }), [business]);

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusinessContext(): BusinessContextValue {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusinessContext must be inside <BusinessProvider>');
  return ctx;
}