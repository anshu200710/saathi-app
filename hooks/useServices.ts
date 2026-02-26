/**
 * hooks/useServices.ts
 *
 * Data fetching hook for the service catalogue.
 * Manages loading, error, and category filter state.
 */

import { servicesAPI } from '@/services/servicesAPI';
import type { Service, ServiceCategory } from '@/types/service.types';
import { useCallback, useEffect, useState } from 'react';

interface UseServicesReturn {
  services: Service[];
  filtered: Service[];
  isLoading: boolean;
  error: string | null;
  activeCategory: ServiceCategory | 'all';
  setCategory: (c: ServiceCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refresh: () => Promise<void>;
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesAPI.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Derived: filtered by category + search
  const filtered = services.filter((svc) => {
    const matchesCategory = activeCategory === 'all' || svc.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      svc.title.toLowerCase().includes(q) ||
      svc.shortDesc.toLowerCase().includes(q) ||
      svc.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return {
    services,
    filtered,
    isLoading,
    error,
    activeCategory,
    setCategory: setActiveCategory,
    searchQuery,
    setSearchQuery,
    refresh: fetchServices,
  };
}

/**
 * useDashboard — fetches dashboard summary data
 */
import { DashboardSummary } from '@/types/service.types';

interface UseDashboardReturn {
  dashboard: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesAPI.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { dashboard, isLoading, error, refresh: fetch };
}