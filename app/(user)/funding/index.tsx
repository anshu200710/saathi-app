/**
 * app/(user)/funding/index.tsx — Funding Marketplace
 *
 * Design: Dark navy header with amber/gold accents. Each scheme card
 * shows a match-score ring so users instantly know their fit.
 */

import { LoadingSpinner } from '@/components/common';
import { useFunding } from '@/hooks/useFunding';
import type { FundingCategory, FundingScheme } from '@/types/funding.types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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
import { Colors, Shadow } from '../../../theme';

const CATEGORIES: { value: FundingCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Schemes', emoji: '✨' },
  { value: 'government_scheme', label: 'Govt Scheme', emoji: '🇮🇳' },
  { value: 'bank_loan', label: 'Bank Loan', emoji: '🏦' },
  { value: 'credit_guarantee', label: 'Credit Guarantee', emoji: '🛡️' },
  { value: 'grant', label: 'Grant', emoji: '🎁' },
  { value: 'subsidy', label: 'Subsidy', emoji: '⚙️' },
];

const STATUS_CONFIG = {
  open: { label: 'Open', bg: '#DCFCE7', text: '#16A34A' },
  closing_soon: { label: 'Closing Soon', bg: '#FEF3C7', text: '#F59E0B' },
  closed: { label: 'Closed', bg: '#F3F4F6', text: '#6B7280' },
  coming_soon: { label: 'Coming Soon', bg: '#E0F2FE', text: '#0EA5E9' },
};

function formatAmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(0)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(0)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

function MatchRing({ score }: { score: number }) {
  const color = score >= 75 ? Colors.success : score >= 50 ? Colors.warning : Colors.danger;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 3, borderColor: color,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: color + '15',
      }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color, letterSpacing: -0.5 }}>{score}</Text>
      </View>
      <Text style={{ fontSize: 9, color: Colors.textMuted, marginTop: 3, fontWeight: '600' }}>MATCH</Text>
    </View>
  );
}

function SchemeCard({ scheme, index }: { scheme: FundingScheme; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    }, Math.min(index * 75, 350));
  }, []);

  const statusCfg = STATUS_CONFIG[scheme.status];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <Pressable
        onPress={() => router.push(`/(user)/funding/${scheme.id}`)}
        style={{
          backgroundColor: Colors.white,
          borderRadius: 18,
          marginHorizontal: 16,
          marginBottom: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors.border,
          ...Shadow.md,
        }}
      >
        <View style={{ height: 4, backgroundColor: scheme.accentColor }} />
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{
              width: 50, height: 50, borderRadius: 14,
              backgroundColor: scheme.accentColor + '18',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 12, flexShrink: 0,
            }}>
              <Text style={{ fontSize: 24 }}>{scheme.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, flexShrink: 1 }} numberOfLines={1}>
                  {scheme.title}
                </Text>
                {scheme.isFeatured && (
                  <View style={{ backgroundColor: Colors.secondary + '25', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.secondary }}>⭐ Featured</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '600' }}>{scheme.provider}</Text>
            </View>
            <MatchRing score={scheme.eligibilityScore} />
          </View>

          <Text style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginBottom: 14 }} numberOfLines={2}>
            {scheme.shortDesc}
          </Text>

          {/* Stats row */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: Colors.surfaceAlt,
            borderRadius: 12, padding: 12, marginBottom: 14,
          }}>
            {[
              { label: 'Amount', value: `${formatAmt(scheme.minAmount)} – ${formatAmt(scheme.maxAmount)}` },
              { label: 'Interest', value: scheme.interestRate.split(' ')[0] },
              { label: 'Tenure', value: scheme.maxTenure },
            ].map((item, i) => (
              <View key={i} style={{ flex: 1, alignItems: i === 0 ? 'flex-start' : i === 2 ? 'flex-end' : 'center' }}>
                <Text style={{ fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginBottom: 3 }}>{item.label}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textDark }}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Tags + status */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {!scheme.collateralRequired && (
                <View style={{ backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.success }}>No Collateral</Text>
                </View>
              )}
              {scheme.processingFee === 'Nil' && (
                <View style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>Zero Fees</Text>
                </View>
              )}
              {scheme.disbursalDays && scheme.disbursalDays <= 7 && (
                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#92400E' }}>{scheme.disbursalDays}d Disbursal</Text>
                </View>
              )}
            </View>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: statusCfg.bg }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: statusCfg.text }}>{statusCfg.label}</Text>
            </View>
          </View>

          {/* Why you match */}
          {scheme.matchReasons.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderMuted }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Why you match
              </Text>
              {scheme.matchReasons.slice(0, 2).map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={{ fontSize: 11, color: Colors.textBase, marginLeft: 6 }}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function FundingScreen() {
  const { filtered, isLoading, activeCategory, setActiveCategory, searchQuery, setSearchQuery, refresh, schemes } = useFunding();
  const [refreshing, setRefreshing] = React.useState(false);
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const highMatchCount = schemes.filter(s => s.eligibilityScore >= 70).length;

  const ListHeader = () => (
    <>
      {/* Dark hero */}
      <Animated.View style={{ opacity: heroOpacity }}>
        <View style={{ backgroundColor: '#0A1628', paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20 }}>
          {/* Dot grid bg */}
          {Array(4).fill(null).map((_, row) =>
            Array(6).fill(null).map((__, col) => (
              <View key={`${row}-${col}`} style={{
                position: 'absolute', width: 2, height: 2, borderRadius: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                top: 24 + row * 36, left: 24 + col * 52,
              }} />
            ))
          )}

          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Funding Marketplace
          </Text>
          <Text style={{ fontSize: 30, fontWeight: '900', color: Colors.white, letterSpacing: -1, lineHeight: 36, marginBottom: 4 }}>
            ₹15L – ₹50L
          </Text>
          <Text style={{ fontSize: 13, color: Colors.secondary, fontWeight: '700', marginBottom: 12 }}>
            Estimated funding eligibility
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            {schemes.length} schemes · {highMatchCount} high-match for you
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => router.push('/(user)/funding/eligibility')}
              style={{
                flex: 1, backgroundColor: Colors.secondary,
                paddingVertical: 13, borderRadius: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={Colors.white} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.white }}>Check Eligibility</Text>
            </Pressable>
            <Pressable
              style={{
                paddingHorizontal: 18, paddingVertical: 13, borderRadius: 12,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="options-outline" size={18} color={Colors.white} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: Colors.surfaceAlt,
          borderRadius: 12, paddingHorizontal: 12, height: 44,
          borderWidth: 1, borderColor: Colors.border,
        }}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search MUDRA, CGTMSE, SBI…"
            placeholderTextColor={Colors.textDisabled}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: Colors.textDark, fontWeight: '500' }}
          />
        </View>
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        style={{ backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <Pressable key={cat.value} onPress={() => setActiveCategory(cat.value)} style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              backgroundColor: isActive ? Colors.primary : Colors.white,
              borderWidth: 1.5, borderColor: isActive ? Colors.primary : Colors.border,
            }}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>{cat.emoji}</Text>
              <Text style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: isActive ? Colors.white : Colors.textBase }}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ height: 16 }} />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      {isLoading ? (
        <><ListHeader /><LoadingSpinner mode="inline" message="Loading schemes…" /></>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <SchemeCard scheme={item} index={index} />}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} tintColor={Colors.secondary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40 }}>💰</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark, marginTop: 12 }}>No schemes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}