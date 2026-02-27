/**
 * app/(user)/payments/index.tsx — Payment History
 *
 * Design: Ledger aesthetic — precise, structured, trustworthy.
 * Monospaced amount figures, status pills, filter tabs.
 * Summary stats at top; individual transaction rows below.
 * Method icons (UPI, card, netbanking) rendered as small chips.
 *
 * The one unforgettable thing: the filter tab underline slides
 * smoothly between status categories, like a native iOS segment.
 */

import { LoadingSpinner } from '@/components/common';
import { usePayments } from '@/hooks/useAdmin';
import type { PaymentTransaction } from '@/types/admin.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Pressable, RefreshControl, ScrollView,
    StatusBar, Text, View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

// ── Config ────────────────────────────────────────────────────
const FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'success',  label: 'Paid' },
  { value: 'pending',  label: 'Pending' },
  { value: 'failed',   label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const;

const STATUS_CFG = {
  success:  { label: 'Paid',     bg: Colors.successLight, text: Colors.success, icon: 'checkmark-circle' },
  pending:  { label: 'Pending',  bg: Colors.warningLight, text: Colors.warning, icon: 'time' },
  failed:   { label: 'Failed',   bg: Colors.dangerLight,  text: Colors.danger,  icon: 'close-circle' },
  refunded: { label: 'Refunded', bg: Colors.infoLight,    text: Colors.info,    icon: 'refresh-circle' },
} as const;

const METHOD_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  upi:        { icon: 'phone-portrait-outline', label: 'UPI',         color: '#5A0FC8' },
  card:       { icon: 'card-outline',           label: 'Card',        color: Colors.primary },
  netbanking: { icon: 'business-outline',       label: 'Net Banking', color: Colors.success },
  wallet:     { icon: 'wallet-outline',         label: 'Wallet',      color: Colors.secondary },
};

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── Sliding tab bar ───────────────────────────────────────────
function FilterTabs({
  filter, onChange,
}: {
  filter: string;
  onChange: (f: any) => void;
}) {
  const activeIdx  = FILTERS.findIndex(f => f.value === filter);
  const tabWidth   = 80;
  const slideAnim  = useRef(new Animated.Value(activeIdx * tabWidth)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIdx * tabWidth,
      tension: 70, friction: 12, useNativeDriver: true,
    }).start();
  }, [activeIdx]);

  return (
    <View style={{ backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={{ position: 'relative', flexDirection: 'row' }}>
          {/* Underline pill */}
          <Animated.View style={{
            position: 'absolute', bottom: 0,
            height: 3, width: tabWidth - 16,
            backgroundColor: Colors.primary,
            borderRadius: 2,
            transform: [{ translateX: Animated.add(slideAnim, new Animated.Value(8)) }],
          }} />

          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => onChange(f.value)}
                style={{ width: tabWidth, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: active ? '700' : '500',
                  color: active ? Colors.primary : Colors.textMuted,
                }}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Summary stat card ─────────────────────────────────────────
function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: Colors.white,
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: Colors.border,
      ...Shadow.sm,
    }}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.textDark, marginTop: 8, letterSpacing: -0.5 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
}

// ── Transaction row ───────────────────────────────────────────
function TxnRow({ txn }: { txn: PaymentTransaction }) {
  const cfg     = STATUS_CFG[txn.status];
  const method  = METHOD_ICONS[txn.method] ?? METHOD_ICONS.card;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        onPress={() => {}}
        style={{
          backgroundColor: Colors.white,
          borderRadius: 14, padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: txn.status === 'failed' ? Colors.dangerLight : Colors.border,
          ...Shadow.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Icon */}
          <View style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: txn.status === 'success' ? Colors.successLight :
                             txn.status === 'failed'  ? Colors.dangerLight  :
                             txn.status === 'refunded'? Colors.infoLight    : Colors.warningLight,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12, flexShrink: 0,
          }}>
            <Ionicons name={cfg.icon as any} size={22} color={cfg.text} />
          </View>

          {/* Details */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 3 }} numberOfLines={1}>
              {txn.description}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>
              {formatDate(txn.createdAt)} · {txn.orderId}
            </Text>

            {/* Method chip */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: Colors.surfaceAlt,
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 6,
              }}>
                <Ionicons name={method.icon as any} size={11} color={method.color} />
                <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textBase }}>
                  {txn.methodDetail}
                </Text>
              </View>

              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: cfg.bg }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.text }}>{cfg.label}</Text>
              </View>
            </View>
          </View>

          {/* Amount + actions */}
          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
            <Text style={{
              fontSize: 16, fontWeight: '900',
              letterSpacing: -0.5,
              color: txn.status === 'failed'   ? Colors.danger  :
                     txn.status === 'refunded' ? Colors.info    : Colors.textDark,
            }}>
              {txn.status === 'refunded' ? '-' : ''}{formatINR(txn.amount)}
            </Text>
            {txn.invoiceUrl && txn.status === 'success' && (
              <Pressable
                onPress={() => {}}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={{ marginTop: 6 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="download-outline" size={12} color={Colors.primary} />
                  <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '600' }}>Invoice</Text>
                </View>
              </Pressable>
            )}
            {txn.status === 'failed' && (
              <Pressable hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 11, color: Colors.danger, fontWeight: '600' }}>Retry</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function PaymentsScreen() {
  const { summary, filtered, isLoading, filter, setFilter, refresh } = usePayments();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={{
        backgroundColor: Colors.white,
        paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
              Payments
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
              All transactions & invoices
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(user)/plans')}
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 14, paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Manage Plan</Text>
          </Pressable>
        </View>

        {/* Summary stats */}
        {summary && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              label="Total Spent"
              value={formatINR(summary.totalSpent)}
              color={Colors.primary}
              icon="cash-outline"
            />
            <StatCard
              label="Transactions"
              value={`${summary.totalTransactions}`}
              color={Colors.success}
              icon="receipt-outline"
            />
            {summary.pendingAmount > 0 && (
              <StatCard
                label="Pending"
                value={formatINR(summary.pendingAmount)}
                color={Colors.warning}
                icon="time-outline"
              />
            )}
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <FilterTabs filter={filter} onChange={setFilter} />

      {/* Transactions */}
      {isLoading ? (
        <LoadingSpinner mode="inline" message="Loading transactions…" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }}
              tintColor={Colors.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ fontSize: 48 }}>🧾</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark, marginTop: 14 }}>
                No transactions
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6 }}>
                {filter === 'all' ? 'Your payment history will appear here.' : `No ${filter} transactions yet.`}
              </Text>
            </View>
          ) : (
            filtered.map((txn) => <TxnRow key={txn.id} txn={txn} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}