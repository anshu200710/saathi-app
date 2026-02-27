/**
 * app/(user)/funding/[id].tsx — Scheme Detail Screen
 * Full scheme info: eligibility criteria, application steps, docs required, stats.
 */

import { CustomButton } from '@/components/common';
import { fundingAPI } from '@/services/fundingAPI';
import type { FundingScheme } from '@/types/funding.types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StatusBar, Text, View } from 'react-native';
import { Colors, Shadow } from '../../../theme';

function formatAmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(0)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(0)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export default function FundingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [scheme, setScheme] = useState<FundingScheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadScheme() {
      try {
        const data = await fundingAPI.getSchemeById(id);
        setScheme(data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      } catch (e) { router.back(); }
      finally { setIsLoading(false); }
    }
    loadScheme();
  }, [id]);

  if (isLoading || !scheme) return (
    <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  const matchColor = scheme.eligibilityScore >= 75 ? Colors.success :
    scheme.eligibilityScore >= 50 ? Colors.warning : Colors.danger;

  const backBg = scrollY.interpolate({ inputRange: [0, 80], outputRange: ['rgba(0,0,0,0.25)', Colors.white], extrapolate: 'clamp' });
  const backIconColor = scrollY.interpolate({ inputRange: [0, 80], outputRange: ['#ffffff', Colors.textDark], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar barStyle="light-content" />

      {/* Floating back */}
      <Animated.View style={{ position: 'absolute', top: 52, left: 16, zIndex: 20, backgroundColor: backBg, borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={() => router.back()}>
          <Animated.Text style={{ color: backIconColor }}>
            <AntDesign name="arrow-left" size={20} color={Colors.white} />
          </Animated.Text>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero */}
          <View style={{ backgroundColor: scheme.accentColor, paddingTop: 96, paddingBottom: 32, paddingHorizontal: 20 }}>
            <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -60 }} />
            <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Text style={{ fontSize: 34 }}>{scheme.emoji}</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, marginBottom: 6 }}>{scheme.title}</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16, fontWeight: '500' }}>{scheme.provider}</Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {scheme.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            {[
              { label: 'Loan Amount', value: `${formatAmt(scheme.minAmount)} – ${formatAmt(scheme.maxAmount)}` },
              { label: 'Interest', value: scheme.interestRate.split(' ')[0] + ' p.a.' },
              { label: 'Your Match', value: `${scheme.eligibilityScore}%`, color: matchColor },
            ].map((s, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: i < 2 ? 1 : 0, borderRightColor: Colors.border }}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: s.color ?? Colors.textDark, letterSpacing: -0.3 }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 3, fontWeight: '500' }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 10 }}>About This Scheme</Text>
            <Text style={{ fontSize: 14, color: Colors.textBase, lineHeight: 24 }}>{scheme.longDesc}</Text>
          </View>

          {/* Loan details */}
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 14 }}>💳 Loan Details</Text>
            <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border }}>
              {[
                { label: 'Maximum Loan Amount', value: formatAmt(scheme.maxAmount) },
                { label: 'Interest Rate', value: scheme.interestRate },
                { label: 'Maximum Tenure', value: scheme.maxTenure },
                { label: 'Processing Fee', value: scheme.processingFee },
                { label: 'Collateral Required', value: scheme.collateralRequired ? 'Yes' : 'No — Collateral Free!' },
                { label: 'Repayment', value: scheme.repaymentType.replace('_', ' ').toUpperCase() },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', padding: 13, backgroundColor: i % 2 === 0 ? Colors.white : Colors.surfaceAlt, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: Colors.border }}>
                  <Text style={{ flex: 1, fontSize: 13, color: Colors.textMuted }}>{row.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: row.label === 'Collateral Required' && !scheme.collateralRequired ? Colors.success : Colors.textDark }}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Eligibility */}
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 14 }}>✅ Eligibility Check</Text>
            {scheme.eligibilityCriteria.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.met ? Colors.successLight : Colors.dangerLight, alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}>
                  <Ionicons name={c.met ? 'checkmark' : 'close'} size={13} color={c.met ? Colors.success : Colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: c.met ? '600' : '500', color: c.met ? Colors.textDark : Colors.textMuted }}>{c.label}</Text>
                  {c.detail && <Text style={{ fontSize: 12, color: c.met ? Colors.success : Colors.danger, marginTop: 2, fontWeight: '500' }}>{c.detail}</Text>}
                </View>
              </View>
            ))}
          </View>

          {/* Application steps */}
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 16 }}>⚙️ How to Apply</Text>
            {scheme.applicationSteps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: i < scheme.applicationSteps.length - 1 ? 16 : 0 }}>
                <View style={{ alignItems: 'center', marginRight: 14, width: 28 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: scheme.accentColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.white }}>{step.step}</Text>
                  </View>
                  {i < scheme.applicationSteps.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: scheme.accentColor + '30', marginTop: 6, minHeight: 16 }} />}
                </View>
                <View style={{ flex: 1, paddingBottom: i < scheme.applicationSteps.length - 1 ? 0 : 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 4 }}>{step.title}</Text>
                  <Text style={{ fontSize: 13, color: Colors.textMuted, lineHeight: 20 }}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Docs required */}
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 14 }}>📁 Documents Required</Text>
            <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 14 }}>
              {scheme.documentsRequired.map((doc, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < scheme.documentsRequired.length - 1 ? 10 : 0 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: scheme.accentColor, marginRight: 12, flexShrink: 0 }} />
                  <Text style={{ fontSize: 13, color: Colors.textBase, fontWeight: '500' }}>{doc}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Sticky CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34, flexDirection: 'row', gap: 12, ...Shadow.lg }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '500' }}>Disbursal in</Text>
          <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.textDark }}>{scheme.disbursalDays ?? 15} days</Text>
        </View>
        <View style={{ flex: 2 }}>
          <CustomButton label="Apply Now →" onPress={() => router.push('/(user)/services')} fullWidth size="lg" />
        </View>
      </View>
    </View>
  );
}