/**
 * hooks/useAdmin.ts — All Phase 5 hooks
 */

import { adminAPI, notificationsAPI, paymentsAPI, plansAPI, supportAPI } from '@/services/adminApi';
import type {
    AdminDashboard,
    AppNotification,
    BillingCycle,
    ChatMessage,
    NotificationCategory,
    PaymentSummary,
    Plan,
    RelationshipManager,
    UserSubscription
} from '@/types/admin.types';
import { useCallback, useEffect, useState } from 'react';

// ── Plans ─────────────────────────────────────────────────────
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, s] = await Promise.all([plansAPI.getPlans(), plansAPI.getSubscription()]);
      setPlans(p);
      setSubscription(s);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const upgradePlan = useCallback(async (planId: string) => {
    setIsUpgrading(true);
    try {
      const { checkoutUrl } = await plansAPI.upgradePlan(planId, billingCycle);
      return checkoutUrl;
    } finally {
      setIsUpgrading(false);
    }
  }, [billingCycle]);

  const currentPlan = plans.find(p => p.id === subscription?.planId);

  return { plans, subscription, currentPlan, isLoading, isUpgrading, billingCycle, setBillingCycle, upgradePlan, refresh: fetch };
}

// ── Payments ──────────────────────────────────────────────────
export function usePayments() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed' | 'refunded'>('all');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await paymentsAPI.getSummary();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = (summary?.transactions ?? []).filter(t =>
    filter === 'all' || t.status === filter
  );

  return { summary, filtered, isLoading, filter, setFilter, refresh: fetch };
}

// ── Notifications ─────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = useCallback(async (id: string) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const remove = useCallback(async (id: string) => {
    await notificationsAPI.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const filtered = notifications.filter(n =>
    activeCategory === 'all' || n.category === activeCategory
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { notifications, filtered, isLoading, unreadCount, activeCategory, setActiveCategory, markRead, markAllRead, remove, refresh: fetch };
}

// ── Support / RM Chat ─────────────────────────────────────────
export function useSupportChat() {
  const [rm, setRm] = useState<RelationshipManager | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRmTyping, setIsRmTyping] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [r, m] = await Promise.all([supportAPI.getRM(), supportAPI.getMessages()]);
        setRm(r);
        setMessages(m);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsSending(true);

    const userMsg = await supportAPI.sendMessage(text);
    setMessages(prev => [...prev, userMsg]);
    setIsSending(false);

    // Simulate RM typing + auto-reply
    setIsRmTyping(true);
    try {
      const rmReply = await supportAPI.getRMAutoReply();
      setMessages(prev => [...prev, rmReply]);
    } finally {
      setIsRmTyping(false);
    }
  }, []);

  return { rm, messages, isLoading, isSending, isRmTyping, sendMessage };
}

// ── Admin Dashboard ───────────────────────────────────────────
export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminAPI.getDashboard();
      setDashboard(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { dashboard, isLoading, refresh: fetch };
}