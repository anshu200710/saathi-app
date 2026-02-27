/**
 * app/(user)/services/[id].tsx — Service Detail Screen
 *
 * Design: Full-bleed hero header in the service's accent colour.
 * Tabbed sections: Overview · Process · Reviews · Documents.
 * Sticky bottom bar with price + "Get Started" CTA.
 *
 * Sections:
 *  • Hero — emoji, title, rating, delivery, tags
 *  • About — long description
 *  • What You Get — deliverables checklist
 *  • How It Works — numbered process steps
 *  • Documents Required — list
 *  • Pricing Breakdown — govt + professional fee table
 *  • Reviews — star ratings + comments
 *  • Sticky Bottom Bar — total price + CTA
 */

import { CustomButton } from '@/components/common';
import { servicesAPI } from '@/services/servicesAPI';
import type { Service } from '@/types/service.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

// ── Star Rating ───────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color="#FBBF24"
        />
      ))}
    </View>
  );
}

// ── Section Container ────────────────────────────────────────
function Section({
  title,
  children,
  noBorder = false,
}: {
  title?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: noBorder ? 0 : 1,
        borderBottomColor: Colors.border,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '800',
            color: Colors.textDark,
            marginBottom: 14,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

// ── Deliverable Row ───────────────────────────────────────────
function DeliverableRow({ label, included }: { label: string; included: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: included ? Colors.successLight : Colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <Ionicons
          name={included ? 'checkmark' : 'close'}
          size={12}
          color={included ? Colors.success : Colors.textMuted}
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          color: included ? Colors.textBase : Colors.textMuted,
          fontWeight: included ? '500' : '400',
          flex: 1,
          textDecorationLine: included ? 'none' : 'line-through',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Process Step ──────────────────────────────────────────────
function ProcessStep({
  step,
  title,
  description,
  duration,
  isLast,
  accentColor,
}: {
  step: number;
  title: string;
  description: string;
  duration: string;
  isLast: boolean;
  accentColor: string;
}) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {/* Left timeline */}
      <View style={{ alignItems: 'center', marginRight: 16, width: 32 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: accentColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>{step}</Text>
        </View>
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: accentColor + '30',
              marginTop: 6,
              minHeight: 24,
            }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, flex: 1 }}>
            {title}
          </Text>
          <View
            style={{
              backgroundColor: accentColor + '15',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: accentColor }}>{duration}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4, lineHeight: 20 }}>
          {description}
        </Text>
      </View>
    </View>
  );
}

// ── Review Card ───────────────────────────────────────────────
function ReviewCard({ review }: { review: Service['reviews'][0] }) {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceAlt,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>
              {review.userName[0]}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark }}>
              {review.userName}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>{review.businessType}</Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={12} />
      </View>
      <Text style={{ fontSize: 13, color: Colors.textBase, lineHeight: 20 }}>{review.comment}</Text>
      <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 6 }}>
        {new Date(review.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadService() {
      try {
        const data = await servicesAPI.getServiceById(id);
        setService(data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      } catch (e) {
        router.back();
      } finally {
        setIsLoading(false);
      }
    }
    loadService();
  }, [id]);

  const handlePurchase = async () => {
    if (!service) return;
    setIsPurchasing(true);
    try {
      await servicesAPI.purchaseService(service.id);
      setPurchased(true);
      setTimeout(() => router.replace('/(user)/home'), 1500);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading || !service) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const headerBg = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['transparent', Colors.white],
    extrapolate: 'clamp',
  });

  const totalPrice = (service.governmentFee ?? 0) + service.professionalFee;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <StatusBar barStyle="light-content" />

      {/* ── Floating Back Bar ── */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          backgroundColor: headerBg,
          paddingTop: 52,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AntDesign name="arrow-left" size={20} color={Colors.white} />
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Hero Header ── */}
          <View
            style={{
              backgroundColor: service.accentColor,
              paddingTop: 100,
              paddingBottom: 32,
              paddingHorizontal: 20,
            }}
          >
            {/* BG decoration */}
            <View style={{
              position: 'absolute', width: 240, height: 240, borderRadius: 120,
              backgroundColor: 'rgba(255,255,255,0.07)',
              top: -60, right: -40,
            }} />

            {/* Emoji */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Text style={{ fontSize: 36 }}>{service.emoji}</Text>
            </View>

            {/* Badges row */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {service.isPopular && (
                <View style={{ backgroundColor: Colors.secondary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white }}>🔥 Popular</Text>
                </View>
              )}
              {service.isFeatured && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>⭐ Featured</Text>
                </View>
              )}
            </View>

            <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, marginBottom: 8 }}>
              {service.title}
            </Text>

            {/* Rating + delivery row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <StarRating rating={service.rating} size={13} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white, marginLeft: 6 }}>
                  {service.rating}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                  ({service.reviewCount.toLocaleString('en-IN')})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginLeft: 4 }}>
                  {service.deliveryDays === 1 ? '1 working day' : `${service.deliveryDays} working days`}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {service.tags.map((tag) => (
                <View key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── About ── */}
          <Section title="About This Service">
            <Text style={{ fontSize: 14, color: Colors.textBase, lineHeight: 24 }}>
              {service.longDesc}
            </Text>
          </Section>

          {/* ── What You Get ── */}
          <Section title="✅ What You Get">
            {service.deliverables.map((d, i) => (
              <DeliverableRow key={i} label={d.label} included={d.included} />
            ))}
          </Section>

          {/* ── How It Works ── */}
          <Section title="⚙️ How It Works">
            {service.processSteps.map((step, i) => (
              <ProcessStep
                key={step.step}
                {...step}
                isLast={i === service.processSteps.length - 1}
                accentColor={service.accentColor}
              />
            ))}
          </Section>

          {/* ── Documents Required ── */}
          <Section title="📁 Documents Required">
            <View style={{ backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 14 }}>
              {service.documentsRequired.map((doc, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === service.documentsRequired.length - 1 ? 0 : 10 }}>
                  <View style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: service.accentColor,
                    marginRight: 12, flexShrink: 0,
                  }} />
                  <Text style={{ fontSize: 13, color: Colors.textBase, fontWeight: '500' }}>{doc}</Text>
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.infoLight,
                borderRadius: 10,
                padding: 12,
                marginTop: 12,
              }}
            >
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.info} />
              <Text style={{ fontSize: 12, color: Colors.info, marginLeft: 8, fontWeight: '500', flex: 1 }}>
                You can upload all documents securely via the app after ordering.
              </Text>
            </View>
          </Section>

          {/* ── Pricing Breakdown ── */}
          <Section title="💳 Pricing Breakdown">
            <View style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                <Text style={{ flex: 1, fontSize: 13, color: Colors.textMuted }}>Professional Fee</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark }}>
                  {formatCurrency(service.professionalFee)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', padding: 14, borderBottomWidth: totalPrice !== service.professionalFee ? 1 : 0, borderBottomColor: Colors.border }}>
                <Text style={{ flex: 1, fontSize: 13, color: Colors.textMuted }}>Government Fee</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: service.governmentFee === 0 ? Colors.success : Colors.textDark }}>
                  {service.governmentFee === 0 ? 'NIL' : formatCurrency(service.governmentFee ?? 0)}
                </Text>
              </View>
              {totalPrice !== service.professionalFee && (
                <View style={{ flexDirection: 'row', padding: 14, backgroundColor: Colors.primaryLight }}>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: Colors.primary }}>Total</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.primary }}>
                    {formatCurrency(totalPrice)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 8 }}>
              * GST at 18% applicable on professional fee. Government fees are pass-through costs.
            </Text>
          </Section>

          {/* ── Reviews ── */}
          {service.reviews.length > 0 && (
            <Section title={`⭐ Reviews (${service.reviewCount.toLocaleString('en-IN')})`} noBorder>
              {/* Summary */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surfaceAlt,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 40, fontWeight: '900', color: Colors.textDark, marginRight: 16 }}>
                  {service.rating}
                </Text>
                <View>
                  <StarRating rating={service.rating} size={18} />
                  <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 4 }}>
                    Based on {service.reviewCount.toLocaleString('en-IN')} reviews
                  </Text>
                </View>
              </View>
              {service.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </Section>
          )}
        </Animated.View>
      </Animated.ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 34,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          ...Shadow.lg,
        }}
      >
        {/* Price */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: '500' }}>
            {service.pricingType === 'starting_from' ? 'Starting from' : 'Total price'}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>
            {formatCurrency(service.price)}
          </Text>
          {service.pricingType === 'starting_from' && (
            <Text style={{ fontSize: 10, color: Colors.textMuted }}>incl. all taxes</Text>
          )}
        </View>

        {/* CTA */}
        <View style={{ flex: 1 }}>
          <CustomButton
            label={purchased ? '✓ Order Placed!' : 'Get Started'}
            onPress={handlePurchase}
            loading={isPurchasing}
            disabled={purchased}
            variant={purchased ? 'outline' : 'primary'}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}