/**
 * app/(user)/notifications/preferences.tsx — Notification Preferences
 *
 * Design: Structured settings page — grouped toggles with icons,
 * section headers, and clear labels. No clutter.
 * Changes are saved optimistically on every toggle.
 */

import { LoadingSpinner } from '@/components/common';
import { notificationsAPI } from '@/services/adminApi';
import type { NotificationPreferences } from '@/types/admin.types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Pressable, ScrollView,
    StatusBar, Switch, Text, View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

interface PrefRow {
  key: keyof NotificationPreferences;
  icon: string;
  label: string;
  detail: string;
  color: string;
}

const CATEGORY_ROWS: PrefRow[] = [
  { key: 'compliance',     icon: 'shield-checkmark-outline', label: 'Compliance',       detail: 'Due dates, overdue tasks, penalty warnings', color: Colors.danger },
  { key: 'service_update', icon: 'construct-outline',        label: 'Service Updates',  detail: 'Order status, expert assignments, completions', color: Colors.primary },
  { key: 'payment',        icon: 'card-outline',             label: 'Payments',         detail: 'Successful charges, failed payments, invoices', color: Colors.success },
  { key: 'funding',        icon: 'cash-outline',             label: 'Funding',          detail: 'New scheme matches, eligibility changes', color: Colors.secondary },
  { key: 'document',       icon: 'document-outline',         label: 'Documents',        detail: 'Verification results, expiry reminders', color: '#7C3AED' },
  { key: 'promo',          icon: 'gift-outline',             label: 'Offers & Updates', detail: 'Deals, new features, webinars', color: Colors.textMuted },
];

const CHANNEL_ROWS: PrefRow[] = [
  { key: 'pushEnabled',  icon: 'phone-portrait-outline', label: 'Push Notifications', detail: 'Receive alerts on your device', color: Colors.primary },
  { key: 'emailEnabled', icon: 'mail-outline',           label: 'Email',              detail: 'Summaries and detailed reports', color: Colors.info },
  { key: 'smsEnabled',   icon: 'chatbubble-outline',     label: 'SMS',                detail: 'Critical alerts via text message', color: Colors.success },
];

function PrefToggle({
  row,
  value,
  onChange,
}: {
  row: PrefRow;
  value: boolean;
  onChange: (key: keyof NotificationPreferences, val: boolean) => void;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 13,
      backgroundColor: Colors.white,
      borderBottomWidth: 1, borderBottomColor: Colors.borderMuted,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: row.color + '18',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 13, flexShrink: 0,
      }}>
        <Ionicons name={row.icon as any} size={16} color={row.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark }}>{row.label}</Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 1 }}>{row.detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => onChange(row.key, v)}
        trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
        thumbColor={value ? Colors.primary : Colors.textDisabled}
      />
    </View>
  );
}

export default function NotificationPreferencesScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    notificationsAPI.getPreferences()
      .then(setPrefs)
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setIsSaving(true);
    try {
      await notificationsAPI.savePreferences(updated);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !prefs) return <LoadingSpinner mode="fullscreen" message="Loading preferences…" />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={{
        backgroundColor: Colors.white, paddingTop: 56,
        paddingHorizontal: 20, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
        flexDirection: 'row', alignItems: 'center', gap: 14,
      }}>
        <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark }}>Notification Settings</Text>
          <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 1 }}>Choose what you want to hear about</Text>
        </View>
        {isSaving && <ActivityIndicator size="small" color={Colors.primary} />}
        {!isSaving && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Categories */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, marginBottom: 7 }}>
          Notification Types
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16, ...Shadow.sm }}>
          {CATEGORY_ROWS.map((row, i) => (
            <View key={row.key} style={{ borderBottomWidth: i < CATEGORY_ROWS.length - 1 ? 0 : 0 }}>
              <PrefToggle row={row} value={prefs[row.key] as boolean} onChange={handleToggle} />
            </View>
          ))}
        </View>

        {/* Channels */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 24, marginBottom: 7 }}>
          Delivery Channels
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16, ...Shadow.sm }}>
          {CHANNEL_ROWS.map((row, i) => (
            <View key={row.key} style={{ borderBottomWidth: i < CHANNEL_ROWS.length - 1 ? 0 : 0 }}>
              <PrefToggle row={row} value={prefs[row.key] as boolean} onChange={handleToggle} />
            </View>
          ))}
        </View>

        {/* Info note */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginTop: 20, backgroundColor: Colors.infoLight, borderRadius: 12, padding: 14 }}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={{ fontSize: 12, color: Colors.info, lineHeight: 18, flex: 1, fontWeight: '500' }}>
            Critical compliance alerts (penalties, overdue tasks) are always sent regardless of your preferences to protect your business.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}