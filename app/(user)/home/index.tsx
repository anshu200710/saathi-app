/**
 * app/(user)/home/index.tsx — Main Dashboard
 *
 * Design direction: Data-rich command centre. Confident, structured,
 * information-dense without feeling cluttered. Blue + white with
 * orange accents. Feels like a premium Indian fintech product.
 *
 * Sections (top to bottom):
 *  1. Header — greeting, business name, notification bell
 *  2. Compliance Score Hero Card — animated radial score
 *  3. Upcoming Deadlines Strip — horizontal scrollable pills
 *  4. Active Services — in-progress service cards
 *  5. Quick Stats — 2x2 stat grid
 *  6. Funding Eligibility Teaser
 *  7. Free Tools Banner
 *  8. Recommended Services (horizontal scroll)
 */

import { LoadingSpinner, ProgressBar, StatusBadge } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useServices';
import type { ActiveService, QuickStat, UpcomingDeadline } from '@/types/service.types';
import { deadlineColor, getGreeting } from '@/utils/formatCurrency';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

/** Animated compliance score donut-style card */
function ComplianceHeroCard({
  score,
  grade,
  pending,
  overdue,
}: {
  score: number;
  grade: string;
  pending: number;
  overdue: number;
}) {
  const animScore = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const gradeColor =
    grade === 'A' ? Colors.success :
    grade === 'B' ? Colors.primary :
    grade === 'C' ? Colors.warning : Colors.danger;

  return (
    <Pressable onPress={() => router.push('/(user)/compliance')}>
      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: Colors.primary,
          ...Shadow.lg,
        }}
      >
        {/* Decorative circles */}
        <View style={{
          position: 'absolute', width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -60,
        }} />
        <View style={{
          position: 'absolute', width: 140, height: 140, borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -30,
        }} />

        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Score circle */}
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Animated.Text
                  style={{
                    fontSize: 28,
                    fontWeight: '900',
                    color: Colors.white,
                    letterSpacing: -1,
                  }}
                >
                  {animScore.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0', '100'],
                  }) as any}
                </Animated.Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>/ 100</Text>
              </View>
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: gradeColor,
                  paddingHorizontal: 14,
                  paddingVertical: 3,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white }}>
                  Grade {grade}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flex: 1, marginLeft: 24 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4, fontWeight: '500' }}>
                Compliance Score
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 16, letterSpacing: -0.5 }}>
                {score >= 80 ? 'Excellent 🎉' : score >= 60 ? 'Good, keep going' : 'Needs attention'}
              </Text>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning, marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                    {pending} pending tasks
                  </Text>
                </View>
                {overdue > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                      {overdue} overdue — act now
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 16 }}>
            <ProgressBar
              value={score}
              color="rgba(255,255,255,0.9)"
              height={5}
              duration={1200}
            />
          </View>

          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 10, textAlign: 'right', fontWeight: '500' }}>
            Tap to view all compliance tasks →
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Single deadline pill */
function DeadlinePill({ item }: { item: UpcomingDeadline }) {
  const color = deadlineColor(item.daysLeft);
  const isUrgent = item.daysLeft <= 3;

  const TYPE_ICONS: Record<string, string> = {
    gst: '🧾', tds: '💸', pf: '👥', roc: '📋', income_tax: '📊', pt: '🏛️', other: '⏰',
  };

  return (
    <Pressable
      onPress={() => router.push('/(user)/compliance')}
      style={{
        width: 150,
        borderRadius: 14,
        backgroundColor: Colors.white,
        padding: 14,
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: isUrgent ? color + '40' : Colors.border,
        ...Shadow.sm,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 8 }}>{TYPE_ICONS[item.type] ?? '⏰'}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark, marginBottom: 4 }} numberOfLines={2}>
        {item.title}
      </Text>
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: color + '18',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color }}>
          {item.daysLeft === 0 ? 'Today!' : item.daysLeft === 1 ? 'Tomorrow' : `${item.daysLeft} days`}
        </Text>
      </View>
      {item.penaltyAmount && (
        <Text style={{ fontSize: 10, color: Colors.textMuted }}>Penalty: {item.penaltyAmount}</Text>
      )}
    </Pressable>
  );
}

/** Active service progress card */
function ActiveServiceCard({ item }: { item: ActiveService }) {
  return (
    <Pressable
      onPress={() => router.push(`/(user)/services/${item.serviceId}`)}
      style={{
        borderRadius: 16,
        backgroundColor: Colors.white,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Emoji badge */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: item.accentColor + '18',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>{item.serviceEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }} numberOfLines={1}>
              {item.serviceTitle}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }} numberOfLines={1}>
              {item.currentStep}
            </Text>
          </View>
        </View>
        <StatusBadge
          status={item.status as any}
          size="sm"
          dot
        />
      </View>

      {/* Progress */}
      <ProgressBar
        value={item.progress}
        color={item.accentColor}
        height={6}
        showLabel
        duration={800}
      />

      {/* Expert */}
      {item.assignedExpert && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: item.accentColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.white }}>
              {item.expertAvatar}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: Colors.textMuted, fontWeight: '500' }}>
            Handled by{' '}
            <Text style={{ fontWeight: '700', color: Colors.textBase }}>{item.assignedExpert}</Text>
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** 2×2 quick stat tile */
function StatTile({ stat }: { stat: QuickStat }) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        backgroundColor: Colors.white,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
      }}
    >
      <Ionicons name={stat.icon as any} size={18} color={Colors.primary} />
      <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.textDark, marginTop: 8, letterSpacing: -0.5 }}>
        {stat.value}
      </Text>
      <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' }}>
        {stat.label}
      </Text>
      {stat.change && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
            color: stat.isPositive ? Colors.success : Colors.danger,
          }}
        >
          {stat.change}
        </Text>
      )}
    </View>
  );
}

/** Section header inline */
function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>
        {title}
      </Text>
      {actionLabel && (
        <Pressable onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>{actionLabel} →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { dashboard, isLoading, error, refresh } = useDashboard();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && dashboard) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [isLoading, dashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !dashboard) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LoadingSpinner mode="fullscreen" message="Loading your dashboard…" />
      </View>
    );
  }

  const greeting = getGreeting();
  const businessName = dashboard?.businessName ?? user?.name ?? 'there';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header ── */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingTop: 56,
            paddingHorizontal: 16,
            paddingBottom: 60,
          }}
        >
          {/* Decorative rings */}
          <View style={{
            position: 'absolute', width: 300, height: 300, borderRadius: 150,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            top: -80, right: -60,
          }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>
                {greeting} 👋
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 4, letterSpacing: -0.5 }} numberOfLines={1}>
                {businessName}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Search */}
              <Pressable
                onPress={() => router.push('/(user)/services')}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="search" size={18} color={Colors.white} />
              </Pressable>
              {/* Notification */}
              <Pressable
                onPress={() => router.push('/(user)/notifications')}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="notifications" size={18} color={Colors.white} />
                {/* Red dot */}
                <View style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: Colors.danger,
                  borderWidth: 1.5, borderColor: Colors.primary,
                }} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Compliance Hero — overlaps header */}
        <View style={{ marginTop: -44 }}>
          {dashboard && (
            <ComplianceHeroCard
              score={dashboard.complianceScore.score}
              grade={dashboard.complianceScore.grade}
              pending={dashboard.complianceScore.pendingTasks}
              overdue={dashboard.complianceScore.overdueTasks}
            />
          )}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Upcoming Deadlines ── */}
          {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 && (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <SectionTitle
                title="⏰ Upcoming Deadlines"
                actionLabel="See all"
                onAction={() => router.push('/(user)/compliance')}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: -16 }}>
                <View style={{ flexDirection: 'row', paddingRight: 16 }}>
                  {dashboard.upcomingDeadlines.map((d: UpcomingDeadline) => (
                    <DeadlinePill key={d.id} item={d} />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* ── Active Services ── */}
          {dashboard?.activeServices && dashboard.activeServices.length > 0 && (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <SectionTitle
                title="📌 Active Services"
                actionLabel="View all"
                onAction={() => router.push('/(user)/services')}
              />
              {dashboard.activeServices.map((svc: ActiveService) => (
                <ActiveServiceCard key={svc.id} item={svc} />
              ))}
            </View>
          )}

          {/* ── Quick Stats ── */}
          {dashboard?.quickStats && (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <SectionTitle title="📈 Your Numbers" />
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <StatTile stat={dashboard.quickStats[0]} />
                <StatTile stat={dashboard.quickStats[1]} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <StatTile stat={dashboard.quickStats[2]} />
                <StatTile stat={dashboard.quickStats[3]} />
              </View>
            </View>
          )}

          {/* ── Funding Eligibility ── */}
          {dashboard?.fundingEligibility && (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <SectionTitle title="💰 Funding Match" />
              <Pressable
                onPress={() => router.push('/(user)/funding')}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  backgroundColor: '#0A1628',
                  ...Shadow.lg,
                }}
              >
                {/* Dark card with orange accent */}
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
                        You're eligible for
                      </Text>
                      <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.secondary, marginTop: 4, letterSpacing: -1 }}>
                        {dashboard.fundingEligibility.eligibleAmount}
                      </Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                        {dashboard.fundingEligibility.matchedSchemes} schemes matched · Top: {dashboard.fundingEligibility.topScheme}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 56, height: 56, borderRadius: 28,
                        backgroundColor: Colors.secondary + '22',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name="cash-multiple" size={26} color={Colors.secondary} />
                    </View>
                  </View>

                  <View style={{ marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Eligibility score</Text>
                      <Text style={{ fontSize: 12, color: Colors.secondary, fontWeight: '700' }}>
                        {dashboard.fundingEligibility.score}%
                      </Text>
                    </View>
                    <View style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                      <View
                        style={{
                          height: 5,
                          width: `${dashboard.fundingEligibility.score}%`,
                          backgroundColor: Colors.secondary,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      marginTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: Colors.secondary,
                      alignSelf: 'flex-start',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>
                      Check All Schemes →
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* ── Free Tools Banner ── */}
          <Pressable
            onPress={() => router.push('/(user)/tools')}
            style={{
              marginTop: 24,
              marginHorizontal: 16,
              borderRadius: 16,
              backgroundColor: Colors.primaryLight,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.primary + '30',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                🛠️ Free Business Tools
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4, lineHeight: 18 }}>
                GST Calculator · Invoice Generator · Trademark Search · Agreement Templates
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={Colors.primary} />
          </Pressable>

          {/* ── Recommended Services ── */}
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <SectionTitle
              title="🔥 Popular Services"
              actionLabel="All services"
              onAction={() => router.push('/(user)/services')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: -16 }}>
              <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
                {[
                  { emoji: '🧾', title: 'GST Registration', price: '₹999', color: Colors.primary },
                  { emoji: '🏅', title: 'MSME Registration', price: '₹499', color: Colors.warning },
                  { emoji: '🏢', title: 'Pvt Ltd Reg.', price: '₹6,999', color: '#7C3AED' },
                  { emoji: '📊', title: 'ITR Filing', price: '₹1,499', color: Colors.success },
                ].map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={() => router.push('/(user)/services')}
                    style={{
                      width: 130,
                      borderRadius: 14,
                      backgroundColor: Colors.white,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      ...Shadow.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: item.color + '15',
                        alignItems: 'center', justifyContent: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark, marginBottom: 6 }} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: item.color }}>
                      {item.price}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}