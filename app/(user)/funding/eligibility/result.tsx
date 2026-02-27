/**
 * app/(user)/funding/eligibility/result.tsx — Eligibility Result
 *
 * Design: Dark header with animated score counter. Celebration feel.
 * Then actionable: matched schemes, credit profile, and improvement tips.
 * Green/amber/red semantic scoring throughout.
 */

import { CustomButton } from '@/components/common';
import type { EligibilityResult, FundingScheme } from '@/types/funding.types';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { Colors, Shadow } from '../../../../theme';

function formatAmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(0)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(0)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

// ── Animated score counter ─────────────────────────────────────
function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [display, setDisplay] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(anim, { toValue: target, duration: 1400, useNativeDriver: false }).start();
    return () => anim.removeAllListeners();
  }, [target]);

  return (
    <Text style={{ fontSize: 72, fontWeight: '900', color, letterSpacing: -4, lineHeight: 76 }}>
      {display}
    </Text>
  );
}

// ── Mini scheme card (horizontal list) ────────────────────────
function MiniSchemeCard({ scheme }: { scheme: FundingScheme }) {
  const matchColor = scheme.eligibilityScore >= 75 ? Colors.success :
    scheme.eligibilityScore >= 50 ? Colors.warning : Colors.danger;

  return (
    <Pressable
      onPress={() => router.push(`/(user)/funding/${scheme.id}`)}
      style={{
        width: 200,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 14,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Text style={{ fontSize: 24 }}>{scheme.emoji}</Text>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: matchColor + '18' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: matchColor }}>{scheme.eligibilityScore}%</Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 4 }} numberOfLines={2}>
        {scheme.title}
      </Text>
      <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 10 }}>{scheme.provider}</Text>
      <Text style={{ fontSize: 13, fontWeight: '800', color: scheme.accentColor }}>
        {formatAmt(scheme.minAmount)} – {formatAmt(scheme.maxAmount)}
      </Text>
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────
export default function EligibilityResultScreen() {
  const params = useLocalSearchParams<{ result: string }>();
  const result: EligibilityResult = params.result ? JSON.parse(params.result) : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!result) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Text style={{ fontSize: 15, color: Colors.textMuted }}>No result data found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const scoreColor =
    result.overallScore >= 75 ? Colors.success :
    result.overallScore >= 50 ? Colors.warning : Colors.danger;

  const scoreLabel =
    result.overallScore >= 80 ? 'Excellent! 🎉' :
    result.overallScore >= 65 ? 'Good Match! 👍' :
    result.overallScore >= 50 ? 'Fair Match' : 'Needs Work';

  const PRIORITY_COLORS = { high: Colors.danger, medium: Colors.warning, low: Colors.success };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Hero score panel ── */}
        <View style={{ backgroundColor: '#0A1628', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24, alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 56, left: 20 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AntDesign name="arrow-left" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
            Eligibility Result
          </Text>

          {/* Score ring */}
          <View style={{
            width: 160, height: 160, borderRadius: 80,
            borderWidth: 6, borderColor: scoreColor,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: scoreColor + '15', marginBottom: 20,
          }}>
            <AnimatedScore target={result.overallScore} color={scoreColor} />
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 2 }}>out of 100</Text>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.white, marginBottom: 8, letterSpacing: -0.5 }}>
            {scoreLabel}
          </Text>

          {/* Stat pills */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.secondary }}>{result.eligibleCount}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' }}>Schemes Match</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.success }}>₹50L</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' }}>Max Eligible</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.primary }}>{result.totalSchemes}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' }}>Total Schemes</Text>
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* ── Top matched schemes ── */}
          <View style={{ paddingTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3 }}>
                🎯 Your Top Matches
              </Text>
              <Pressable onPress={() => router.push('/(user)/funding')}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>View all →</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 20 }}>
              {result.topSchemes.map((scheme) => <MiniSchemeCard key={scheme.id} scheme={scheme} />)}
            </ScrollView>
          </View>

          {/* ── Credit Profile ── */}
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3, marginBottom: 14 }}>
              📊 Credit Profile
            </Text>
            <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 40, fontWeight: '900', color: result.creditProfile.color, letterSpacing: -1 }}>
                    {result.creditProfile.score}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: result.creditProfile.color }}>{result.creditProfile.label}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 20 }}>
                  <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 4, marginBottom: 8 }}>
                    <View style={{
                      height: 8, borderRadius: 4,
                      backgroundColor: result.creditProfile.color,
                      width: `${(result.creditProfile.score / 900) * 100}%`,
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: Colors.textMuted }}>300</Text>
                    <Text style={{ fontSize: 10, color: Colors.textMuted }}>900</Text>
                  </View>
                </View>
              </View>

              {result.creditProfile.factors.map((factor, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, color: Colors.textBase, fontWeight: '500' }}>{factor.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: factor.status === 'good' ? Colors.success : factor.status === 'neutral' ? Colors.warning : Colors.danger,
                    }} />
                    <Text style={{
                      fontSize: 12, fontWeight: '700',
                      color: factor.status === 'good' ? Colors.success : factor.status === 'neutral' ? Colors.warning : Colors.danger,
                      textTransform: 'capitalize',
                    }}>
                      {factor.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── Improvement Tips ── */}
          {result.improvements.length > 0 && (
            <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.3, marginBottom: 14 }}>
                🚀 Improve Your Score
              </Text>
              {result.improvements.map((tip, i) => (
                <View key={i} style={{
                  backgroundColor: Colors.white,
                  borderRadius: 14, padding: 16,
                  marginBottom: 10,
                  flexDirection: 'row', alignItems: 'flex-start',
                  borderWidth: 1, borderColor: Colors.border,
                  ...Shadow.sm,
                }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: PRIORITY_COLORS[tip.priority] + '18',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12, flexShrink: 0,
                  }}>
                    <MaterialCommunityIcons
                      name={tip.priority === 'high' ? 'alert' : 'arrow-up-circle'}
                      size={18}
                      color={PRIORITY_COLORS[tip.priority]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 3 }}>
                      {tip.action}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 8 }}>
                      {tip.impact}
                    </Text>
                    <View style={{
                      alignSelf: 'flex-start',
                      backgroundColor: Colors.successLight,
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.success }}>
                        +{tip.scoreBoost} pts boost
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.white,
        borderTopWidth: 1, borderTopColor: Colors.border,
        paddingHorizontal: 20, paddingTop: 14,
        paddingBottom: 34, gap: 10,
        ...Shadow.lg,
      }}>
        <CustomButton label="Apply to Top Scheme" onPress={() => router.push('/(user)/funding')} fullWidth size="lg" />
        <Pressable onPress={() => router.push('/(user)/funding/eligibility')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: '600' }}>Retake with different answers</Text>
        </Pressable>
      </View>
    </View>
  );
}