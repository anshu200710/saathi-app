/**
 * app/(user)/services/index.tsx — Services Catalogue
 *
 * Design direction: Clean marketplace grid. White cards, category
 * chip filter bar, live search. Confident, scannable, minimal friction.
 *
 * Features:
 *  • Sticky search + category filter
 *  • Animated card entrance (stagger)
 *  • Popular / Featured badges
 *  • Rating + review count
 *  • Price with govt fee callout
 *  • Empty state
 *  • Pull-to-refresh
 */



import { LoadingSpinner } from '@/components/common';
import { useServices } from '@/hooks/useServices';
import { Colors, Shadow } from '@/theme';
import type { Service, ServiceCategory } from '@/types/service.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

// ── Category Config ───────────────────────────────────────────
const CATEGORIES: { value: ServiceCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '✨' },
  { value: 'registration', label: 'Registration', emoji: '🏢' },
  { value: 'taxation', label: 'Taxation', emoji: '🧾' },
  { value: 'compliance', label: 'Compliance', emoji: '📋' },
  { value: 'trademark', label: 'Trademark', emoji: '™️' },
  { value: 'legal', label: 'Legal', emoji: '⚖️' },
  { value: 'accounting', label: 'Accounting', emoji: '📊' },
  { value: 'startup', label: 'Startup', emoji: '🚀' },
  { value: 'hr', label: 'HR & Payroll', emoji: '👥' },
  { value: 'import_export', label: 'Import/Export', emoji: '🌏' },
];

// ── Service Card ──────────────────────────────────────────────
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = Math.min(index * 80, 400);
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, [index, slideAnim, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable
        onPress={() => router.push(`/(user)/services/${service.id}`)}
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          ...Shadow.sm,
        }}
        android_ripple={{ color: Colors.primaryLight }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Emoji Icon */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: service.accentColor + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 26 }}>{service.emoji}</Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark, flexShrink: 1 }} numberOfLines={1}>
                {service.title}
              </Text>
              {service.isPopular && (
                <View style={{ backgroundColor: Colors.secondary + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.secondary }}>🔥 Popular</Text>
                </View>
              )}
              {service.isFeatured && !service.isPopular && (
                <View style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.primary }}>⭐ Featured</Text>
                </View>
              )}
            </View>

            <Text style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18 }} numberOfLines={2}>
              {service.shortDesc}
            </Text>

            {/* Rating + delivery */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textDark, marginLeft: 3 }}>
                  {service.rating}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textMuted, marginLeft: 2 }}>
                  ({service.reviewCount.toLocaleString('en-IN')})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                <Text style={{ fontSize: 11, color: Colors.textMuted, marginLeft: 3 }}>
                  {service.deliveryDays === 1 ? '1 day' : `${service.deliveryDays} days`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price + CTA row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: Colors.borderMuted,
          }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '500' }}>
                {service.pricingType === 'starting_from' ? 'From' : ''}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
                {formatCurrency(service.price || 0)}
              </Text>
            </View>
            {(service.governmentFee ?? 0) > 0 && (
              <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 1 }}>
                + ₹{(service.governmentFee ?? 0).toLocaleString('en-IN')} Govt. fee
              </Text>
            )}
            {(service.governmentFee ?? 0) === 0 && (
              <Text style={{ fontSize: 10, color: Colors.success, fontWeight: '600', marginTop: 1 }}>
                No Govt. fee
              </Text>
            )}
          </View>

          <View
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 18,
              paddingVertical: 9,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>
              View →
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textDark, textAlign: 'center' }}>
        No services found
      </Text>
      <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
        {query
          ? `No results for "${query}". Try different keywords.`
          : 'No services in this category yet.'}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function ServicesScreen() {
  const {
    filtered,
    isLoading,
    activeCategory,
    setCategory,
    searchQuery,
    setSearchQuery,
    refresh,
  } = useServices();

  const [refreshing, setRefreshing] = React.useState(false);
  const searchRef = useRef<TextInput>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Sticky Header ── */}
      <View
        style={{
          backgroundColor: Colors.white,
          paddingTop: 56,
          paddingBottom: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          ...Shadow.sm,
        }}
      >
        {/* Title row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
              Services
            </Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
              {filtered.length} services available
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(user)/support')}
            style={{
              width: 38, height: 38, borderRadius: 19,
              backgroundColor: Colors.primaryLight,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="headset" size={18} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.surfaceAlt,
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 44,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              ref={searchRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search GST, trademark, compliance…"
              placeholderTextColor={Colors.textDisabled}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 14,
                color: Colors.textDark,
                fontWeight: '500',
              }}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 14, gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? Colors.primary : Colors.white,
                  borderWidth: 1.5,
                  borderColor: isActive ? Colors.primary : Colors.border,
                }}
              >
                <Text style={{ fontSize: 13, marginRight: 4 }}>{cat.emoji}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? Colors.white : Colors.textBase,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <LoadingSpinner mode="inline" message="Loading services…" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ServiceCard service={item} index={index} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={<EmptyState query={searchQuery} />}
        />
      )}
    </View>
  );
}