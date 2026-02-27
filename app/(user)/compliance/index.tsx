/**
 * app/(user)/compliance/index.tsx — Compliance Tracker
 * Animated score header + category grid + month-accordion task list.
 */

import { LoadingSpinner } from '@/components/common';
import { useCompliance } from '@/hooks/useFunding';
import type { CategoryScore, ComplianceTask } from '@/types/funding.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { Colors, Shadow } from '../../../theme';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  overdue:   { label: 'Overdue',  bg: Colors.dangerLight,  text: Colors.danger  },
  pending:   { label: 'Pending',  bg: Colors.warningLight, text: Colors.warning },
  completed: { label: 'Done ✓',  bg: Colors.successLight, text: Colors.success },
  upcoming:  { label: 'Upcoming', bg: Colors.infoLight,    text: Colors.info    },
  not_applicable: { label: 'N/A', bg: Colors.surfaceAlt,   text: Colors.textMuted },
};

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

function CategoryCard({ item }: { item: CategoryScore }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue: item.score, duration: 900, useNativeDriver: false }).start(); }, []);
  const color = item.score >= 80 ? Colors.success : item.score >= 60 ? Colors.warning : Colors.danger;
  return (
    <View style={{ backgroundColor: Colors.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
      <Text style={{ fontSize: 20, marginBottom: 6 }}>{item.emoji}</Text>
      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textDark, marginBottom: 8 }}>{item.label}</Text>
      <View style={{ height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <Animated.View style={{ height: 4, borderRadius: 2, backgroundColor: color, width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '900', color }}>{item.score}%</Text>
      {item.pendingCount > 0 && <Text style={{ fontSize: 10, color: Colors.danger, fontWeight: '600', marginTop: 1 }}>{item.pendingCount} pending</Text>}
    </View>
  );
}

function TaskRow({ task, onMarkComplete, isCompleting }: { task: ComplianceTask; onMarkComplete: (id: string) => void; isCompleting: boolean }) {
  const cfg = STATUS_CFG[task.status] ?? STATUS_CFG.pending;
  const days = daysUntil(task.dueDate);
  const isActionable = task.status === 'pending' || task.status === 'overdue';
  const borderColor = task.status === 'overdue' ? Colors.danger : task.status === 'pending' && task.priority === 'critical' ? Colors.warning : Colors.border;

  return (
    <View style={{ backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor, borderLeftWidth: 4, ...Shadow.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>{task.title}</Text>
            {task.form && (
              <View style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>{task.form}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginBottom: 8 }} numberOfLines={2}>{task.description}</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginLeft: 3 }}>{fmtDate(task.dueDate)}</Text>
            </View>
            {task.status !== 'completed' && (
              <Text style={{ fontSize: 11, fontWeight: '700', color: days < 0 ? Colors.danger : days <= 7 ? Colors.warning : Colors.textMuted }}>
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today!' : `${days}d left`}
              </Text>
            )}
            {task.completedAt && <Text style={{ fontSize: 11, color: Colors.success, fontWeight: '600' }}>Filed {fmtDate(task.completedAt)}</Text>}
          </View>
          {task.penalty && task.status !== 'completed' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Ionicons name="warning-outline" size={11} color={Colors.danger} />
              <Text style={{ fontSize: 11, color: Colors.danger, marginLeft: 4, fontWeight: '600' }}>Penalty: {task.penalty}</Text>
            </View>
          )}
        </View>
        <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, backgroundColor: cfg.bg }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.text }}>{cfg.label}</Text>
        </View>
      </View>

      {isActionable && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderMuted }}>
          {task.actionLabel && (
            <Pressable onPress={() => router.push('/(user)/services')} style={{ flex: 1, backgroundColor: Colors.primary, paddingVertical: 9, borderRadius: 9, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>{task.actionLabel}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => onMarkComplete(task.id)}
            disabled={isCompleting}
            style={{ flex: 1, backgroundColor: Colors.successLight, paddingVertical: 9, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Ionicons name="checkmark" size={13} color={Colors.success} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.success }}>{isCompleting ? 'Saving…' : 'Mark Done'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function MonthAccordion({ month, tasks, completedCount, totalCount, defaultOpen, markComplete, completingId }: any) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    setOpen((o: boolean) => !o);
    Animated.timing(rot, { toValue: open ? 0 : 1, duration: 200, useNativeDriver: true }).start();
  };

  const chevRot = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const pending = tasks.filter((t: ComplianceTask) => t.status === 'overdue' || t.status === 'pending').length;

  return (
    <View style={{ marginBottom: 14 }}>
      <Pressable onPress={toggle} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>{month}</Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>{completedCount}/{totalCount} completed{pending > 0 ? ` · ${pending} action needed` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {pending > 0 && (
            <View style={{ backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.danger }}>{pending} pending</Text>
            </View>
          )}
          <Animated.View style={{ transform: [{ rotate: chevRot }] }}>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </Animated.View>
        </View>
      </Pressable>
      {open && (
        <View style={{ marginTop: 8 }}>
          {tasks.map((t: ComplianceTask) => (
            <TaskRow key={t.id} task={t} onMarkComplete={markComplete} isCompleting={completingId === t.id} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function ComplianceScreen() {
  const { overview, isLoading, refresh, markComplete, completingId } = useCompliance();
  const [refreshing, setRefreshing] = useState(false);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [scoreDisplay, setScoreDisplay] = useState(0);

  useEffect(() => {
    if (overview) {
      scoreAnim.addListener(({ value }) => setScoreDisplay(Math.round(value)));
      Animated.timing(scoreAnim, { toValue: overview.score, duration: 1200, useNativeDriver: false }).start();
      return () => scoreAnim.removeAllListeners();
    }
  }, [overview?.score]);

  if (isLoading && !overview) return <LoadingSpinner mode="fullscreen" message="Loading compliance…" />;

  const gradeColor = !overview ? Colors.primary :
    overview.grade === 'A' ? Colors.success : overview.grade === 'B' ? Colors.primary :
    overview.grade === 'C' ? Colors.warning : Colors.danger;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ backgroundColor: Colors.white, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>Compliance</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>FY 2024–25 · Stay ahead of every deadline</Text>
            </View>
            <Pressable onPress={() => router.push('/(user)/services')} style={{ backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Get Help</Text>
            </Pressable>
          </View>

          {overview && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 14, padding: 14 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: gradeColor, alignItems: 'center', justifyContent: 'center', backgroundColor: gradeColor + '15', marginRight: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: gradeColor, letterSpacing: -1 }}>{scoreDisplay}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark }}>Grade {overview.grade}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
                  {overview.overdueCount > 0 && <Text style={{ fontSize: 12, color: Colors.danger, fontWeight: '700' }}>🔴 {overview.overdueCount} overdue</Text>}
                  <Text style={{ fontSize: 12, color: Colors.textMuted }}>🟡 {overview.pendingCount} pending</Text>
                  <Text style={{ fontSize: 12, color: Colors.success }}>🟢 {overview.completedCount} done</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {overview && (
          <>
            {/* Category grid */}
            <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>📂 By Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {overview.byCategory.map((cat) => (
                  <View key={cat.category} style={{ width: '30%', minWidth: 95 }}>
                    <CategoryCard item={cat} />
                  </View>
                ))}
              </View>
            </View>

            {/* Task months */}
            <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 14 }}>📅 Due Dates & Tasks</Text>
              {overview.months.map((m, i) => (
                <MonthAccordion key={m.month} month={m.month} tasks={m.tasks} completedCount={m.completedCount} totalCount={m.totalCount} defaultOpen={i === 0} markComplete={markComplete} completingId={completingId} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}