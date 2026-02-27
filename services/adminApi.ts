/**
 * services/adminAPI.ts
 * All Phase 5 API calls: plans, payments, notifications, RM/support, admin.
 */

import MOCK_DATA from '@/mock/admin.json';
import type {
    AdminDashboard,
    AppNotification,
    ChatMessage,
    NotificationPreferences,
    PaymentSummary, PaymentTransaction,
    Plan,
    RelationshipManager,
    SupportTicket,
    UserSubscription,
} from '@/types/admin.types';
import api from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
const delay = (ms = 600) => new Promise<void>((r) => setTimeout(r, ms));

// ── Plans ─────────────────────────────────────────────────────
export const plansAPI = {
  async getPlans(): Promise<Plan[]> {
    if (USE_MOCK) { await delay(); return MOCK_DATA.plans as Plan[]; }
    const { data } = await api.get<Plan[]>('/plans');
    return data;
  },

  async getSubscription(): Promise<UserSubscription> {
    if (USE_MOCK) { await delay(300); return MOCK_DATA.subscription as UserSubscription; }
    const { data } = await api.get<UserSubscription>('/plans/subscription');
    return data;
  },

  async upgradePlan(planId: string, cycle: string): Promise<{ checkoutUrl: string }> {
    if (USE_MOCK) { await delay(800); return { checkoutUrl: 'https://checkout.razorpay.com/mock' }; }
    const { data } = await api.post<{ checkoutUrl: string }>('/plans/upgrade', { planId, cycle });
    return data;
  },

  async cancelSubscription(): Promise<void> {
    if (USE_MOCK) { await delay(700); return; }
    await api.post('/plans/cancel');
  },
};

// ── Payments ──────────────────────────────────────────────────
export const paymentsAPI = {
  async getSummary(): Promise<PaymentSummary> {
    if (USE_MOCK) { await delay(); return MOCK_DATA.paymentSummary as PaymentSummary; }
    const { data } = await api.get<PaymentSummary>('/payments');
    return data;
  },

  async getTransaction(id: string): Promise<PaymentTransaction> {
    if (USE_MOCK) {
      await delay(300);
      const txn = (MOCK_DATA.paymentSummary.transactions as PaymentTransaction[]).find(t => t.id === id);
      if (!txn) throw new Error('Transaction not found');
      return txn;
    }
    const { data } = await api.get<PaymentTransaction>(`/payments/${id}`);
    return data;
  },

  async downloadInvoice(id: string): Promise<{ url: string }> {
    if (USE_MOCK) { await delay(500); return { url: 'https://invoice.example.com/mock.pdf' }; }
    const { data } = await api.get<{ url: string }>(`/payments/${id}/invoice`);
    return data;
  },

  async initiateRefund(id: string, reason: string): Promise<void> {
    if (USE_MOCK) { await delay(800); return; }
    await api.post(`/payments/${id}/refund`, { reason });
  },
};

// ── Notifications ─────────────────────────────────────────────
export const notificationsAPI = {
  async getAll(): Promise<AppNotification[]> {
    if (USE_MOCK) { await delay(); return MOCK_DATA.notifications as AppNotification[]; }
    const { data } = await api.get<AppNotification[]>('/notifications');
    return data;
  },

  async markRead(id: string): Promise<void> {
    if (USE_MOCK) { await delay(200); return; }
    await api.post(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    if (USE_MOCK) { await delay(300); return; }
    await api.post('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    if (USE_MOCK) { await delay(200); return; }
    await api.delete(`/notifications/${id}`);
  },

  async getPreferences(): Promise<NotificationPreferences> {
    if (USE_MOCK) {
      await delay(300);
      return { compliance: true, service_update: true, payment: true, funding: true, document: true, promo: false, pushEnabled: true, emailEnabled: true, smsEnabled: true };
    }
    const { data } = await api.get<NotificationPreferences>('/notifications/preferences');
    return data;
  },

  async savePreferences(prefs: NotificationPreferences): Promise<void> {
    if (USE_MOCK) { await delay(400); return; }
    await api.put('/notifications/preferences', prefs);
  },
};

// ── RM / Support ──────────────────────────────────────────────
export const supportAPI = {
  async getRM(): Promise<RelationshipManager> {
    if (USE_MOCK) { await delay(); return MOCK_DATA.rm as RelationshipManager; }
    const { data } = await api.get<RelationshipManager>('/support/rm');
    return data;
  },

  async getMessages(): Promise<ChatMessage[]> {
    if (USE_MOCK) { await delay(400); return MOCK_DATA.supportMessages as ChatMessage[]; }
    const { data } = await api.get<ChatMessage[]>('/support/messages');
    return data;
  },

  async sendMessage(text: string): Promise<ChatMessage> {
    if (USE_MOCK) {
      await delay(600);
      const rmReplies = [
        "Got it! I'll look into that right away and get back to you shortly.",
        "Sure, I can help with that. Let me pull up your details.",
        "That's a great question. Here's what you need to know...",
        "I've noted your request. Expected resolution within 24 hours.",
      ];
      const userMsg: ChatMessage = { id: `msg_u_${Date.now()}`, sender: 'user', text, timestamp: new Date().toISOString(), isRead: true };
      // Simulate RM auto-reply after delay
      return userMsg;
    }
    const { data } = await api.post<ChatMessage>('/support/messages', { text });
    return data;
  },

  async getRMAutoReply(): Promise<ChatMessage> {
    await delay(2000); // simulate RM typing
    const replies = [
      "Got it! I'll look into that right away and get back to you shortly. 👍",
      "Sure, I can help with that. Let me pull up your account details.",
      "Noted! Expect resolution within 4 business hours.",
      "I've escalated this to our compliance team. They'll respond by EOD.",
    ];
    return {
      id: `msg_rm_${Date.now()}`,
      sender: 'rm',
      text: replies[Math.floor(Math.random() * replies.length)],
      timestamp: new Date().toISOString(),
      isRead: false,
    };
  },

  async getTickets(): Promise<SupportTicket[]> {
    if (USE_MOCK) { await delay(400); return []; }
    const { data } = await api.get<SupportTicket[]>('/support/tickets');
    return data;
  },
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  async getDashboard(): Promise<AdminDashboard> {
    if (USE_MOCK) { await delay(700); return MOCK_DATA.adminDashboard as AdminDashboard; }
    const { data } = await api.get<AdminDashboard>('/admin/dashboard');
    return data;
  },
};