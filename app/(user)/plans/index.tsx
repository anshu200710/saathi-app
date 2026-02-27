/**
 * app/(user)/plans/index.tsx — Plans & Pricing
 *
 * Design: Premium SaaS pricing aesthetic — dark header, white cards,
 * monthly/annual toggle with animated pill slider. The "Growth" plan
 * has a gold border treatment to draw the eye. Current plan is clearly
 * indicated. Annual savings shown as bold percentage badge.
 *
 * The one unforgettable thing: the billing toggle animates a pill
 * between Monthly and Annual, and all prices animate as it slides.
 */

import { CustomButton, LoadingSpinner } from '@/components/common';
import { usePlans } from '@/hooks/useAdmin';
import type { BillingCycle, Plan } from '@/types/admin.types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

// ── Billing Toggle ────────────────────────────────────────────
function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  const slideAnim = useRef(new Animated.Value(cycle === 'monthly' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cycle === 'monthly' ? 0 : 1,
      tension: 70, friction: 12, useNativeDriver: false,
    }).start();
  }, [cycle]);

  const pillLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 118],
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 28 }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.surfaceAlt,
        borderRadius: 30, padding: 2,
        borderWidth: 1, borderColor: Colors.border,
        width: 240, position: 'relative',
      }}>
        {/* Animated pill */}
        <Animated.View style={{
          position: 'absolute',
          left: pillLeft,
          width: 118,
          height: 38,
          backgroundColor: Colors.primary,
          borderRadius: 28,
          ...Shadow.sm,
        }} />
        {/* Labels */}
        {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            style={{ flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: cycle === c ? Colors.white : Colors.textMuted,
            }}>
              {c === 'monthly' ? 'Monthly' : 'Annual'}
            </Text>
          </Pressable>
        ))}
      </View>
      {cycle === 'annual' && (
        <Animated.View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.success }}>
            🎉 Save up to 23% with annual billing
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

// ── Feature Row ───────────────────────────────────────────────
function FeatureRow({ label, included, highlight }: { label: string; included: boolean; highlight?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View style={{
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: included ? Colors.successLight : Colors.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 10, flexShrink: 0,
      }}>
        <Ionicons
          name={included ? 'checkmark' : 'close'}
          size={11}
          color={included ? Colors.success : Colors.textMuted}
        />
      </View>
      <Text style={{
        fontSize: 13,
        color: included ? (highlight ? Colors.textDark : Colors.textBase) : Colors.textMuted,
        fontWeight: highlight ? '700' : '400',
        flex: 1,
        textDecorationLine: included ? 'none' : 'line-through',
      }}>
        {label}
      </Text>
    </View>
  );
}

// ── Plan Card ─────────────────────────────────────────────────
function PlanCard({
  plan,
  cycle,
  isCurrent,
  onUpgrade,
  isUpgrading,
  index,
}: {
  plan: Plan;
  cycle: BillingCycle;
  isCurrent: boolean;
  onUpgrade: (planId: string) => void;
  isUpgrading: boolean;
  index: number;
}) {
  const priceAnim = useRef(new Animated.Value(
    cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  )).current;
  const [displayPrice, setDisplayPrice] = useState(
    cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  );

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }, index * 80);
  }, []);

  useEffect(() => {
    const target = cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    priceAnim.addListener(({ value }) => setDisplayPrice(Math.round(value)));
    Animated.timing(priceAnim, { toValue: target, duration: 350, useNativeDriver: false }).start();
    return () => priceAnim.removeAllListeners();
  }, [cycle]);

  const isPopular = plan.isMostPopular;
  const isEnterprise = plan.id === 'enterprise';
  const isFree = plan.monthlyPrice === 0 && !isEnterprise;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View
        style={{
          borderRadius: 20,
          backgroundColor: Colors.white,
          borderWidth: isPopular ? 2 : 1,
          borderColor: isPopular ? Colors.secondary : isCurrent ? Colors.primary : Colors.border,
          marginBottom: 16,
          overflow: 'hidden',
          ...Shadow.md,
        }}
      >
        {/* Popular banner */}
        {isPopular && (
          <View style={{
            backgroundColor: Colors.secondary,
            paddingVertical: 6,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              ⭐ Most Popular
            </Text>
          </View>
        )}
        {isCurrent && !isPopular && (
          <View style={{
            backgroundColor: Colors.primary,
            paddingVertical: 6,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              ✓ Your Current Plan
            </Text>
          </View>
        )}

        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 22 }}>{plan.emoji}</Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
                  {plan.name}
                </Text>
                {plan.badge && (
                  <View style={{ backgroundColor: plan.accentColor + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: plan.accentColor }}>{plan.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 13, color: Colors.textMuted }}>{plan.tagline}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={{ marginBottom: 20 }}>
            {isEnterprise ? (
              <View>
                <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.textDark, letterSpacing: -1 }}>
                  Custom
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Contact our sales team</Text>
              </View>
            ) : isFree ? (
              <View>
                <Text style={{ fontSize: 32, fontWeight: '900', color: Colors.textDark, letterSpacing: -1 }}>
                  Free
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Forever, no credit card</Text>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                  <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: '600' }}>₹</Text>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: plan.accentColor, letterSpacing: -2 }}>
                    {displayPrice}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.textMuted, marginLeft: 2 }}>/mo</Text>
                </View>
                {cycle === 'annual' && plan.annualSavings > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through' }}>
                      ₹{plan.monthlyPrice}/mo
                    </Text>
                    <View style={{ backgroundColor: Colors.successLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.success }}>
                        Save {plan.annualSavings}%
                      </Text>
                    </View>
                  </View>
                )}
                {cycle === 'annual' && (
                  <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                    Billed ₹{plan.annualPrice * 12}/year
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Features */}
          <View style={{ marginBottom: 18 }}>
            {plan.features.map((f, i) => (
              <FeatureRow key={i} label={f.label} included={f.included} highlight={f.highlight} />
            ))}
          </View>

          {/* CTA */}
          <CustomButton
            label={isCurrent ? '✓ Current Plan' : plan.ctaLabel}
            onPress={() => !isCurrent && onUpgrade(plan.id)}
            disabled={isCurrent || isUpgrading}
            variant={isPopular ? 'secondary' : isCurrent ? 'outline' : 'primary'}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function PlansScreen() {
  const { plans, subscription, isLoading, isUpgrading, billingCycle, setBillingCycle, upgradePlan, refresh } = usePlans();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleUpgrade = async (planId: string) => {
    const url = await upgradePlan(planId);
    // In production: open Razorpay checkout or WebView
    console.log('Checkout URL:', url);
  };

  if (isLoading) return <LoadingSpinner mode="fullscreen" message="Loading plans…" />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Header */}
        <View style={{ backgroundColor: Colors.primary, paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20 }}>
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.05)', top: -80, right: -60 }} />
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginBottom: 16 }}>
            <AntDesign name="arrow-left" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            Plans & Pricing
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8, marginBottom: 6 }}>
            Grow with confidence
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 22 }}>
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </Text>
          {subscription && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
              <Text style={{ fontSize: 12, color: Colors.secondary, fontWeight: '700' }}>
                Currently on {subscription.planName} · {subscription.billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 28 }}>
          {/* Billing toggle */}
          <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />

          {/* Plan cards */}
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={billingCycle}
              isCurrent={plan.id === subscription?.planId}
              onUpgrade={handleUpgrade}
              isUpgrading={isUpgrading}
              index={index}
            />
          ))}

          {/* FAQ teaser */}
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.border, marginTop: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 12 }}>
              💬 Common Questions
            </Text>
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one tap — no questions asked.' },
              { q: 'Is GST charged on plans?', a: '18% GST applies on all paid plans. A GST invoice is issued.' },
              { q: 'What payment methods?', a: 'UPI, credit/debit cards, net banking, and wallets via Razorpay.' },
            ].map((item, i) => (
              <View key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 2 }}>{item.q}</Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted, lineHeight: 18 }}>{item.a}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}