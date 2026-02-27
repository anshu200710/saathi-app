/**
 * app/(user)/notifications/index.tsx — Notifications Feed
 *
 * Design: Editorial feed. Unread cards carry a vivid left-border accent
 * keyed to their category. Critical items show a pulsing red dot.
 * Long-press any card to dismiss with scale-out animation.
 */

import { LoadingSpinner } from '@/components/common';
import { useNotifications } from '@/hooks/useAdmin';
import type { AppNotification, NotificationCategory } from '@/types/admin.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Pressable, RefreshControl, ScrollView,
  StatusBar, Text, View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

const CATEGORIES: { value: NotificationCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',            label: 'All',        emoji: '🔔' },
  { value: 'compliance',     label: 'Compliance', emoji: '📋' },
  { value: 'service_update', label: 'Services',   emoji: '⚙️' },
  { value: 'payment',        label: 'Payments',   emoji: '💳' },
  { value: 'funding',        label: 'Funding',    emoji: '💰' },
  { value: 'document',       label: 'Documents',  emoji: '📁' },
  { value: 'promo',          label: 'Offers',     emoji: '🎁' },
];

const CATEGORY_COLOR: Record<string, string> = {
  compliance:     Colors.danger,
  service_update: Colors.primary,
  payment:        Colors.success,
  funding:        Colors.secondary,
  document:       Colors.info,
  system:         Colors.textMuted,
  promo:          '#7C3AED',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: Colors.danger,
      transform: [{ scale }],
    }} />
  );
}

function NotifCard({
  item, onRead, onDelete,
}: {
  item: AppNotification;
  onRead:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacAnim  = useRef(new Animated.Value(1)).current;
  const accentColor = CATEGORY_COLOR[item.category] ?? Colors.primary;

  const handlePress = useCallback(() => {
    onRead(item.id);
    if (item.actionRoute) router.push(item.actionRoute as any);
  }, [item.id, item.actionRoute, onRead]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.timing(opacAnim,  { toValue: 0,    duration: 220, useNativeDriver: true }),
    ]).start(() => onDelete(item.id));
  }, [item.id, onDelete]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacAnim, marginBottom: 10 }}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleDelete}
        delayLongPress={500}
        style={{
          flexDirection: 'row',
          backgroundColor: item.isRead ? Colors.white : '#F5F9FF',
          borderRadius: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: item.isRead ? Colors.border : accentColor + '35',
          ...Shadow.sm,
        }}
      >
        {/* Left accent bar */}
        <View style={{ width: 4, backgroundColor: item.isRead ? Colors.borderMuted : accentColor }} />

        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Emoji icon */}
            <View style={{
              width: 40, height: 40, borderRadius: 11,
              backgroundColor: accentColor + '18',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 12, flexShrink: 0,
            }}>
              <Text style={{ fontSize: 19 }}>{item.emoji ?? '🔔'}</Text>
            </View>

            {/* Title + body */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 13,
                fontWeight: item.isRead ? '600' : '800',
                color: item.isRead ? Colors.textBase : Colors.textDark,
                lineHeight: 18, marginBottom: 4,
              }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 17 }} numberOfLines={2}>
                {item.body}
              </Text>
            </View>

            {/* Time + dot */}
            <View style={{ alignItems: 'flex-end', gap: 5, marginLeft: 8 }}>
              <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '500' }}>
                {timeAgo(item.createdAt)}
              </Text>
              {!item.isRead && (
                item.priority === 'critical'
                  ? <PulseDot />
                  : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor }} />
              )}
            </View>
          </View>

          {/* Action CTA */}
          {item.actionLabel && !item.isRead && (
            <View style={{ marginTop: 10 }}>
              <View style={{
                alignSelf: 'flex-start',
                backgroundColor: accentColor,
                paddingHorizontal: 12, paddingVertical: 5,
                borderRadius: 8,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.white }}>
                  {item.actionLabel} →
                </Text>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const {
    filtered, isLoading, unreadCount,
    activeCategory, setActiveCategory,
    markRead, markAllRead, remove, refresh,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={{
        backgroundColor: Colors.white,
        paddingTop: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20, marginBottom: 14,
        }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
              Notifications
            </Text>
            <Text style={{ fontSize: 12, marginTop: 2, color: unreadCount > 0 ? Colors.danger : Colors.textMuted, fontWeight: unreadCount > 0 ? '700' : '400' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {unreadCount > 0 && (
              <Pressable
                onPress={markAllRead}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  backgroundColor: Colors.primaryLight,
                  paddingHorizontal: 12, paddingVertical: 7,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="checkmark-done" size={14} color={Colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>
                  Mark all read
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push('/(user)/notifications/preferences' as any)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border }}
            >
              <Ionicons name="settings-outline" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.value;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setActiveCategory(cat.value)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 13, paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? Colors.primary : Colors.white,
                  borderWidth: 1.5,
                  borderColor: active ? Colors.primary : Colors.border,
                }}
              >
                <Text style={{ fontSize: 13, marginRight: 4 }}>{cat.emoji}</Text>
                <Text style={{
                  fontSize: 12, fontWeight: active ? '700' : '500',
                  color: active ? Colors.white : Colors.textBase,
                }}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Feed */}
      {isLoading ? (
        <LoadingSpinner mode="inline" message="Loading notifications…" />
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
          {filtered.length > 0 && (
            <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 12 }}>
              Long-press to dismiss
            </Text>
          )}

          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ fontSize: 52 }}>🔕</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textDark, marginTop: 14 }}>
                All clear!
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
                No notifications here yet.
              </Text>
            </View>
          ) : (
            filtered.map((item) => (
              <NotifCard key={item.id} item={item} onRead={markRead} onDelete={remove} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}