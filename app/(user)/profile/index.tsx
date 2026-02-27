/**
 * app/(user)/profile/index.tsx — Profile & Account Hub
 *
 * Design: Warm, personal. Primary blue hero with floating avatar.
 * Subscription status card overlaps the hero (-18px) for depth.
 * Menu sections: Account / Business / App / Sign out.
 *
 * Every Phase 5 screen (Plans, Payments, Notifications, Support)
 * is reachable from here. Business profile details section below.
 */

import { useAuth } from '@/hooks/useAuth';
import { plansAPI } from '@/services/adminApi';
import type { UserSubscription } from '@/types/admin.types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Pressable, ScrollView,
  StatusBar, Text, View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

const PLAN_COLORS: Record<string, string> = {
  free: Colors.textMuted, starter: Colors.primary,
  growth: Colors.secondary, enterprise: '#7C3AED',
};
const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise',
};

interface MenuItem {
  icon: string; label: string; detail?: string;
  badge?: string; color?: string; route?: string;
  onPress?: () => void; isDestructive?: boolean;
}

function MenuRow({ item }: { item: MenuItem }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={item.onPress ?? (() => item.route && router.push(item.route as any))}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 13,
        backgroundColor: pressed ? Colors.surfaceAlt : Colors.white,
        borderBottomWidth: 1, borderBottomColor: Colors.borderMuted,
      }}
    >
      <View style={{
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: item.isDestructive ? Colors.dangerLight : (item.color ?? Colors.primary) + '18',
        alignItems: 'center', justifyContent: 'center', marginRight: 13, flexShrink: 0,
      }}>
        <Ionicons name={item.icon as any} size={17} color={item.isDestructive ? Colors.danger : (item.color ?? Colors.primary)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: item.isDestructive ? Colors.danger : Colors.textDark }}>
          {item.label}
        </Text>
        {item.detail && <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 1 }}>{item.detail}</Text>}
      </View>
      {item.badge && (
        <View style={{ backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 6 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.success }}>{item.badge}</Text>
        </View>
      )}
      {!item.isDestructive && <Ionicons name="chevron-forward" size={15} color={Colors.textMuted} />}
    </Pressable>
  );
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 11, fontWeight: '700', color: Colors.textMuted,
        letterSpacing: 1.2, textTransform: 'uppercase',
        paddingHorizontal: 20, marginBottom: 7,
      }}>
        {title}
      </Text>
      <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16, ...Shadow.sm }}>
        {items.map((item, i) => (
          <View key={i} style={{ overflow: 'hidden', borderBottomWidth: i < items.length - 1 ? 0 : 0 }}>
            <MenuRow item={item} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    plansAPI.getSubscription().then(setSubscription).catch(() => {});
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = () => Alert.alert(
    'Sign Out', 'Are you sure you want to sign out?',
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: logout }]
  );

  const planId    = subscription?.planId ?? 'free';
  const planColor = PLAN_COLORS[planId];
  const planLabel = PLAN_LABELS[planId];
  const initials  = (user?.name ?? 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('');
  const nextBilling = subscription?.nextBillingDate
    ? new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const ACCOUNT_ITEMS: MenuItem[] = [
    { icon: 'rocket-outline',    label: 'Plans & Pricing',     detail: `${planLabel} · ${subscription?.billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing`, color: planColor, route: '/(user)/plans' },
    { icon: 'card-outline',      label: 'Payments & Invoices', detail: 'Transaction history, download invoices', color: Colors.success, route: '/(user)/payments' },
    { icon: 'folder-outline',    label: 'Document Vault',      detail: 'Manage & upload business documents',    color: '#7C3AED',      route: '/(user)/documents' },
    { icon: 'notifications-outline', label: 'Notifications',   detail: 'Compliance alerts, service updates',   color: Colors.secondary, route: '/(user)/notifications' },
    { icon: 'headset-outline',   label: 'RM Support',          detail: 'Chat with your relationship manager',  color: Colors.primary, route: '/(user)/support' },
  ];

  const BUSINESS_ITEMS: MenuItem[] = [
    { icon: 'business-outline',      label: 'Business Profile',    detail: user?.businessName ?? 'Edit business details',  color: Colors.primary },
    { icon: 'receipt-outline',       label: 'GST & Tax Details',   detail: 'GSTIN, PAN, TAN management',                   color: Colors.success },
    { icon: 'people-outline',        label: 'Directors & Partners', detail: 'Manage directors, DIN, DSC',                  color: Colors.info },
    { icon: 'shield-checkmark-outline', label: 'Compliance Health',  detail: 'Overall compliance score & tasks',           color: Colors.warning, route: '/(user)/compliance' },
  ];

  const APP_ITEMS: MenuItem[] = [
    { icon: 'star-outline',           label: 'Rate BizCare',      detail: 'Your feedback helps us improve',       color: '#FBBF24' },
    { icon: 'share-social-outline',   label: 'Refer & Earn',      detail: 'Get ₹200 for every referral',          color: Colors.success, badge: 'New' },
    { icon: 'document-text-outline',  label: 'Terms & Privacy',                                                   color: Colors.textMuted },
    { icon: 'information-circle-outline', label: 'App Version',   detail: 'v2.1.0 (build 210)',                   color: Colors.textMuted },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero ── */}
        <View style={{ backgroundColor: Colors.primary, paddingTop: 60, paddingBottom: 36, paddingHorizontal: 20 }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)', top: -70, right: -50 }} />

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)', marginRight: 16 }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.white }}>{initials}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, marginBottom: 2 }}>
                {user?.name ?? 'Your Account'}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
                +91 {user?.mobile ?? '—'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.secondary }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>{planLabel} Plan</Text>
              </View>
            </View>

            <Pressable style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="pencil-outline" size={16} color={Colors.white} />
            </Pressable>
          </Animated.View>
        </View>

        {/* ── Subscription card ── */}
        {subscription && (
          <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginTop: -20 }}>
            <View style={{ backgroundColor: Colors.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: planColor + '35', ...Shadow.md, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: planColor + '18', alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 }}>
                <MaterialCommunityIcons name="crown-outline" size={22} color={planColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>{planLabel} Plan</Text>
                <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                  {subscription.status === 'active' ? '✓ Active' : subscription.status}
                  {nextBilling ? ` · Renews ${nextBilling}` : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(user)/plans')}
                style={{ backgroundColor: planId === 'growth' ? Colors.surfaceAlt : planColor, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: planId === 'growth' ? Colors.textDark : Colors.white }}>
                  {planId === 'free' ? 'Upgrade' : planId === 'growth' ? 'Manage' : 'View'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* ── Menu sections ── */}
        <Animated.View style={{ opacity: fadeAnim, paddingTop: 24 }}>
          <MenuSection title="Account" items={ACCOUNT_ITEMS} />
          <MenuSection title="Business" items={BUSINESS_ITEMS} />
          <MenuSection title="App" items={APP_ITEMS} />

          {/* Sign out */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Pressable
              onPress={handleLogout}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.danger + '45', gap: 8, ...Shadow.sm }}
            >
              <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.danger }}>Sign Out</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center', paddingBottom: 8 }}>
            BizCare © 2025 · Made in India 🇮🇳
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}