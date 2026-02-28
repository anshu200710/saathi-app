/**
 * app/onboarding/index.tsx — 4-Slide Onboarding Carousel
 *
 * Design direction: clean, confident, Bharat-native fintech.
 * Each slide has a large illustrated icon area, bold headline,
 * and supporting text. Progress dots animate between slides.
 *
 * Features:
 *  • FlatList-based horizontal pager (performant, no deps)
 *  • Animated progress dots
 *  • Skip button → jumps to login
 *  • Slide-synced background tint transitions
 *  • AsyncStorage flag so onboarding never shows again
 */

import CustomButton from '@/components/common/CustomButton';
import { AntDesign, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Colors } from '../../theme';

const { width, height } = Dimensions.get('window');

// ── Slide Data ────────────────────────────────────────────────
interface Slide {
  id: string;
  icon: React.ReactNode;
  headline: string;
  subheadline: string;
  body: string;
  accent: string;
  bgTint: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: <MaterialCommunityIcons name="shield-check" size={80} color={Colors.primary} />,
    headline: 'Stay 100%\nCompliant',
    subheadline: 'Never miss a deadline again',
    body: 'GST, ROC, TDS, PF — we track every due date and alert you before penalties kick in.',
    accent: Colors.primary,
    bgTint: Colors.primaryLight,
  },
  {
    id: '2',
    icon: <MaterialCommunityIcons name="cash-multiple" size={80} color={Colors.success} />,
    headline: 'Unlock\nFunding',
    subheadline: '₹50L – ₹5Cr for your business',
    body: 'Government schemes, MSME loans, and startup grants — matched to your eligibility instantly.',
    accent: Colors.success,
    bgTint: '#DCFCE7',
  },
  {
    id: '3',
    icon: <FontAwesome5 name="tools" size={68} color={Colors.secondary} />,
    headline: 'Free Business\nTools',
    subheadline: 'Built for Indian SMEs',
    body: 'GST calculator, invoice generator, trademark search, agreement templates — all free.',
    accent: Colors.secondary,
    bgTint: Colors.secondaryLight,
  },
  {
    id: '4',
    icon: <Ionicons name="people" size={80} color="#7C3AED" />,
    headline: 'Expert CA/CS\nOn-Demand',
    subheadline: 'Real help, real fast',
    body: 'Book verified Chartered Accountants and Company Secretaries for filings, audits, and advice.',
    accent: '#7C3AED',
    bgTint: '#EDE9FE',
  },
];

// ── Progress Dot ──────────────────────────────────────────────
function ProgressDot({ active, color }: { active: boolean; color: string }) {
  const width = useRef(new Animated.Value(active ? 24 : 8)).current;

  React.useEffect(() => {
    Animated.spring(width, {
      toValue: active ? 24 : 8,
      useNativeDriver: false,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [active]);

  return (
    <Animated.View
      style={{
        height: 8,
        width,
        borderRadius: 4,
        backgroundColor: active ? color : '#D1D5DB',
        marginHorizontal: 3,
      }}
    />
  );
}

// ── Slide Item ────────────────────────────────────────────────
function SlideItem({ item, index }: { item: Slide; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]).start();
    }, index * 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* Illustration area */}
      <View
        style={{
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: item.bgTint,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 48,
        }}
      >
        {/* Outer ring */}
        <View
          style={{
            position: 'absolute',
            width: 210,
            height: 210,
            borderRadius: 105,
            borderWidth: 1.5,
            borderColor: item.accent + '30',
          }}
        />
        {item.icon}
      </View>

      {/* Text */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '800',
            color: Colors.textDark,
            textAlign: 'center',
            letterSpacing: -0.8,
            lineHeight: 36,
            marginBottom: 12,
          }}
        >
          {item.headline}
        </Text>

        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: item.accent,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: 0.2,
          }}
        >
          {item.subheadline}
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: Colors.textMuted,
            textAlign: 'center',
            lineHeight: 24,
            fontWeight: '400',
          }}
        >
          {item.body}
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const markOnboardingDone = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
  };

  const goToLogin = useCallback(async () => {
    await markOnboardingDone();
    router.replace('/(auth)/login');
  }, []);

  const handleNext = useCallback(async () => {
    if (isLastSlide) {
      goToLogin();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }, [activeIndex, isLastSlide, goToLogin]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const currentSlide = SLIDES[activeIndex];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Skip button */}
      {!isLastSlide && (
        <Pressable
          onPress={goToLogin}
          style={{ position: 'absolute', top: 56, right: 24, zIndex: 10 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: '600' }}>
            Skip
          </Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      {/* Bottom Controls */}
      <View className="px-6 pb-12">
        {/* Progress dots */}
        <View className="flex-row justify-center items-center mb-8">
          {SLIDES.map((_, i) => (
            <ProgressDot
              key={i}
              active={i === activeIndex}
              color={currentSlide.accent}
            />
          ))}
        </View>

        {/* CTA */}
        <CustomButton
          label={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
          rightIcon={
            !isLastSlide ? (
              <AntDesign name="arrow-right" size={18} color="white" />
            ) : undefined
          }
        />

        {/* Navigation links */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          <Pressable onPress={goToLogin} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>
              ← Back to Navigation
            </Text>
          </Pressable>
          <Text style={{ fontSize: 13, color: Colors.textDisabled }}>|</Text>
          <Pressable onPress={handleNext} style={{ marginLeft: 8 }}>
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>
              Next →
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}