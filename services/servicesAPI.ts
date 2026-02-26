/**
 * services/servicesAPI.ts
 *
 * All service-listing and dashboard related API calls.
 * Falls back to rich mock data when EXPO_PUBLIC_USE_MOCK=true.
 */

import type { ActiveService, DashboardSummary, Service } from '@/types/service.types';
import api from './api';

// Static mock imports (bundled at build time)
import MOCK_DASHBOARD from '@/mock/dashboard.json';
import MOCK_SERVICES from '@/mock/services.json';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false'; // default mock ON

function delay(ms = 800) {
  return new Promise((r) => setTimeout(r, ms));
}

export const servicesAPI = {
  /** Fetch all available services (catalogue) */
  async getServices(): Promise<Service[]> {
    if (USE_MOCK) {
      await delay(600);
      return MOCK_SERVICES as Service[];
    }
    const { data } = await api.get<Service[]>('/services');
    return data;
  },

  /** Fetch single service detail by ID */
  async getServiceById(id: string): Promise<Service> {
    if (USE_MOCK) {
      await delay(400);
      const found = (MOCK_SERVICES as Service[]).find((s) => s.id === id);
      if (!found) throw new Error('Service not found');
      return found;
    }
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  /** Fetch dashboard summary for authenticated user */
  async getDashboard(): Promise<DashboardSummary> {
    if (USE_MOCK) {
      await delay(700);
      return MOCK_DASHBOARD as DashboardSummary;
    }
    const { data } = await api.get<DashboardSummary>('/dashboard');
    return data;
  },

  /** Purchase / initiate a service */
  async purchaseService(serviceId: string): Promise<ActiveService> {
    if (USE_MOCK) {
      await delay(1000);
      const svc = (MOCK_SERVICES as Service[]).find((s) => s.id === serviceId)!;
      return {
        id: `as_${Date.now()}`,
        serviceId,
        serviceTitle: svc.title,
        serviceEmoji: svc.emoji,
        accentColor: svc.accentColor,
        status: 'pending',
        progress: 0,
        currentStep: 'Order Placed — Expert Assigned Shortly',
        startedAt: new Date().toISOString(),
        expectedCompletion: new Date(Date.now() + svc.deliveryDays * 86400000).toISOString(),
      };
    }
    const { data } = await api.post<ActiveService>(`/services/${serviceId}/purchase`);
    return data;
  },
};