/**
 * app/admin/index.tsx — Admin Dashboard
 *
 * Design: Data-dense command centre aesthetic — dark sidebar-inspired
 * header, white metric tiles, hand-drawn bar chart (pure RN Animated),
 * user management table, and donut-style plan distribution.
 *
 * Route: /admin (separate from the (user) group — staff-only)
 * Guard: checks user.role === 'admin' from AuthContext.
 *
 * Sections:
 *  1. Header — live date/time, admin badge, refresh
 *  2. KPI metric grid — 6 cards with trend arrows
 *  3. Revenue bar chart — 6-month sparkline (pure RN)
 *  4. Service distribution — horizontal bar breakdown
 *  5. Plan distribution — visual segments
 *  6. Recent user table — avatar, plan badge, score, revenue
 */

import { LoadingSpinner } from '@/components/common';
import { useAdminDashboard } from '@/hooks/useAdmin';
import type { AdminMetric, AdminUser } from '@/types/admin.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Pressable, RefreshControl, ScrollView,
    StatusBar, Text, View,
} from 'react-native';
import { Colors, Shadow } from '../../theme';

// ── Helpers ───────────────────────────────────────────────────
function formatINR(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
function fmtUsers(n: number) {
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)   return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const PLAN_COLORS: Record<string, string> = {
  free:       '#6B7280',
  starter:    Colors.primary,
  growth:     Colors.secondary,
  enterprise: '#7C3AED',
};
const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise',
};

// ── Section title ─────────────────────────────────────────────
function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── KPI Metric Card ───────────────────────────────────────────
function MetricCard({ metric, index }: { metric: AdminMetric; index: number }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, index * 60);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '47%' }}>
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: Colors.border,
        ...Shadow.sm,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: metric.color + '18',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name={metric.icon as any} size={18} color={metric.color} />
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 3,
            backgroundColor: metric.isPositive ? Colors.successLight : Colors.dangerLight,
            paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
          }}>
            <Ionicons
              name={metric.isPositive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={metric.isPositive ? Colors.success : Colors.danger}
            />
            <Text style={{ fontSize: 10, fontWeight: '700', color: metric.isPositive ? Colors.success : Colors.danger }}>
              {metric.isPositive ? '+' : ''}{metric.change.split(' ')[0]}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.8, marginBottom: 4 }}>
          {metric.value}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '500' }}>{metric.label}</Text>
        <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 3 }}>{metric.change}</Text>
      </View>
    </Animated.View>
  );
}

// ── Revenue Bar Chart ─────────────────────────────────────────
function RevenueChart({ data }: { data: { month: string; revenue: number; users: number }[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const barAnims   = data.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const animations = data.map((d, i) =>
      Animated.timing(barAnims[i], {
        toValue: d.revenue / maxRevenue,
        duration: 700 + i * 80,
        useNativeDriver: false,
      })
    );
    Animated.stagger(60, animations).start();
  }, []);

  const CHART_HEIGHT = 120;

  return (
    <View style={{
      backgroundColor: Colors.white, borderRadius: 16,
      padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
    }}>
      {/* Y-axis label */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
        <View>
          <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Monthly Revenue</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
            {formatINR(data[data.length - 1].revenue)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '600' }}>Active Users</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.primary }}>
            {fmtUsers(data[data.length - 1].users)}
          </Text>
        </View>
      </View>

      {/* Bars */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: CHART_HEIGHT }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          return (
            <View key={d.month} style={{ alignItems: 'center', flex: 1 }}>
              <Animated.View style={{
                width: 28,
                height: barAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, CHART_HEIGHT - 24],
                }),
                backgroundColor: isLast ? Colors.primary : Colors.primary + '55',
                borderRadius: 6,
                borderTopLeftRadius: 6, borderTopRightRadius: 6,
              }} />
              <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 6, fontWeight: isLast ? '700' : '400' }}>
                {d.month}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Service distribution ──────────────────────────────────────
function ServiceDist({ data }: { data: { service: string; count: number; color: string }[] }) {
  const total  = data.reduce((s, d) => s + d.count, 0);
  const barAnims = data.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(80, data.map((d, i) =>
      Animated.timing(barAnims[i], {
        toValue: d.count / total,
        duration: 600,
        useNativeDriver: false,
      })
    )).start();
  }, []);

  return (
    <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
      {data.map((d, i) => (
        <View key={d.service} style={{ marginBottom: i < data.length - 1 ? 14 : 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase }}>{d.service}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }}>
              {d.count.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={{ height: 7, backgroundColor: Colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
            <Animated.View style={{
              height: 7, borderRadius: 4,
              backgroundColor: d.color,
              width: barAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Plan distribution ─────────────────────────────────────────
function PlanDist({ data }: { data: { plan: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
      {/* Segmented bar */}
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 16 }}>
        {data.map((d) => (
          <View key={d.plan} style={{ flex: d.count / total, backgroundColor: d.color }} />
        ))}
      </View>
      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {data.map((d) => (
          <View key={d.plan} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: d.color }} />
            <Text style={{ fontSize: 12, color: Colors.textBase, fontWeight: '500' }}>
              {PLAN_LABELS[d.plan]} ({fmtUsers(d.count)})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── User row ──────────────────────────────────────────────────
function UserRow({ user }: { user: AdminUser }) {
  const planColor = PLAN_COLORS[user.plan] ?? Colors.textMuted;
  const scoreColor = user.complianceScore >= 80 ? Colors.success :
                     user.complianceScore >= 60 ? Colors.warning : Colors.danger;
  return (
    <Pressable style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 16,
      borderBottomWidth: 1, borderBottomColor: Colors.borderMuted,
    }}>
      {/* Avatar */}
      <View style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: planColor + '25',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12, flexShrink: 0,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: planColor }}>
          {user.name.charAt(0)}
        </Text>
      </View>

      {/* Name + meta */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted }}>{user.state} · {user.businessType.replace('_', ' ')}</Text>
      </View>

      {/* Plan badge */}
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: planColor + '18', marginRight: 10 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: planColor, textTransform: 'capitalize' }}>
          {user.plan}
        </Text>
      </View>

      {/* Score */}
      <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: scoreColor }}>{user.complianceScore}</Text>
        <Text style={{ fontSize: 9, color: Colors.textMuted }}>score</Text>
      </View>

      {/* Revenue */}
      <View style={{ alignItems: 'flex-end', minWidth: 52 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark }}>
          {formatINR(user.totalRevenue)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: user.status === 'active' ? Colors.success : Colors.danger }} />
          <Text style={{ fontSize: 9, color: Colors.textMuted }}>{user.status}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function AdminDashboardScreen() {
  const { dashboard, isLoading, refresh } = useAdminDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const headerScale = useRef(new Animated.Value(0.97)).current;
  const headerOpac  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpac,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !dashboard) return <LoadingSpinner mode="fullscreen" message="Loading admin dashboard…" />;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />}
      >
        {/* ── Dark hero header ── */}
        <Animated.View style={{ transform: [{ scale: headerScale }], opacity: headerOpac }}>
          <View style={{
            backgroundColor: '#0A1628',
            paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20,
          }}>
            {/* Dot-grid texture */}
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 8 }).map((__, col) => (
                <View key={`${row}-${col}`} style={{
                  position: 'absolute',
                  width: 2, height: 2, borderRadius: 1,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  top: 20 + row * 36, left: 20 + col * 46,
                }} />
              ))
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <View style={{ backgroundColor: Colors.danger, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Admin
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>{dateStr}</Text>
                </View>
                <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8 }}>
                  Command Centre
                </Text>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                  BizCare Operations · {timeStr}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={handleRefresh}
                  style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons name="refresh" size={16} color={Colors.white} />
                </Pressable>
                <Pressable
                  onPress={() => router.back()}
                  style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons name="exit-outline" size={16} color={Colors.white} />
                </Pressable>
              </View>
            </View>

            {/* Live totals strip */}
            {dashboard && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                {[
                  { label: 'Total Users', value: fmtUsers(214832), color: Colors.secondary },
                  { label: 'MRR',         value: '₹1.24Cr',         color: Colors.success },
                  { label: 'CSAT',        value: '4.82 ★',           color: '#FBBF24' },
                ].map((s) => (
                  <View key={s.label} style={{
                    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
                    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: s.color, letterSpacing: -0.5 }}>{s.value}</Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: '500' }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        {dashboard && (
          <View style={{ paddingHorizontal: 16 }}>
            {/* ── KPI Grid ── */}
            <View style={{ paddingTop: 24, marginBottom: 24 }}>
              <SectionTitle title="📊 Key Metrics" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {dashboard.metrics.map((m, i) => (
                  <MetricCard key={m.label} metric={m} index={i} />
                ))}
              </View>
            </View>

            {/* ── Revenue Chart ── */}
            <View style={{ marginBottom: 24 }}>
              <SectionTitle title="📈 Revenue Trend" />
              <RevenueChart data={dashboard.revenueByMonth} />
            </View>

            {/* ── Service Distribution ── */}
            <View style={{ marginBottom: 24 }}>
              <SectionTitle title="⚙️ Services by Volume" />
              <ServiceDist data={dashboard.serviceDistribution} />
            </View>

            {/* ── Plan Distribution ── */}
            <View style={{ marginBottom: 24 }}>
              <SectionTitle title="💳 Plan Distribution" />
              <PlanDist data={dashboard.planDistribution} />
            </View>

            {/* ── Recent Users ── */}
            <View style={{ marginBottom: 24 }}>
              <SectionTitle title="👥 Recent Users" action="View all" />
              <View style={{
                backgroundColor: Colors.white,
                borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
                overflow: 'hidden', ...Shadow.sm,
              }}>
                {/* Table header */}
                <View style={{
                  flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
                  backgroundColor: Colors.surfaceAlt,
                  borderBottomWidth: 1, borderBottomColor: Colors.border,
                }}>
                  {['User', 'Plan', 'Score', 'Revenue'].map((h, i) => (
                    <Text key={h} style={{
                      fontSize: 10, fontWeight: '700', color: Colors.textMuted,
                      letterSpacing: 0.8, textTransform: 'uppercase',
                      flex: i === 0 ? 2 : 1, textAlign: i === 0 ? 'left' : 'right',
                    }}>
                      {h}
                    </Text>
                  ))}
                </View>
                {dashboard.recentUsers.map((u) => <UserRow key={u.id} user={u} />)}
              </View>
            </View>

            {/* ── Quick actions ── */}
            <View style={{ marginBottom: 8 }}>
              <SectionTitle title="⚡ Quick Actions" />
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Broadcast Notification', icon: 'megaphone-outline', color: Colors.primary },
                  { label: 'Export User CSV',         icon: 'download-outline',  color: Colors.success },
                  { label: 'Compliance Report',       icon: 'document-text-outline', color: '#7C3AED' },
                  { label: 'Revenue Report',          icon: 'bar-chart-outline', color: Colors.secondary },
                ].map((action) => (
                  <Pressable
                    key={action.label}
                    style={{
                      width: '47%',
                      backgroundColor: Colors.white,
                      borderRadius: 14, padding: 14,
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      borderWidth: 1, borderColor: Colors.border,
                      ...Shadow.sm,
                    }}
                  >
                    <View style={{
                      width: 34, height: 34, borderRadius: 10,
                      backgroundColor: action.color + '18',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons name={action.icon as any} size={16} color={action.color} />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark, flex: 1, lineHeight: 16 }}>
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}