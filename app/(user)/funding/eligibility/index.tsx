/**
 * app/(user)/funding/eligibility/index.tsx — Eligibility Checker
 *
 * Design: Step-by-step wizard, one question per screen.
 * Clean white card with progress bar, animated slide transitions.
 * Feels fast and purposeful — not like a government form.
 *
 * 7 questions → loading screen → result screen
 */

import { CustomButton, ProgressBar } from '@/components/common';
import { useEligibility } from '@/hooks/useFunding';
import type { EligibilityInput } from '@/types/funding.types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native';
import { Colors, Shadow } from '../../../../theme';

// ── Questions ──────────────────────────────────────────────────
interface Question {
  id: keyof EligibilityInput;
  question: string;
  hint?: string;
  type: 'single_select' | 'number' | 'boolean';
  options?: { value: string; label: string; emoji?: string }[];
  inputPrefix?: string;
  inputSuffix?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'businessAge',
    question: 'How old is your business?',
    hint: 'Lenders prefer established businesses',
    type: 'single_select',
    options: [
      { value: 'less_1', label: 'Less than 1 year', emoji: '🌱' },
      { value: '1_3', label: '1 – 3 years', emoji: '🌿' },
      { value: '3_5', label: '3 – 5 years', emoji: '🌳' },
      { value: 'above_5', label: 'More than 5 years', emoji: '🏆' },
    ],
  },
  {
    id: 'annualTurnover',
    question: 'What is your annual turnover?',
    hint: 'Determines loan amount eligibility',
    type: 'single_select',
    options: [
      { value: 'below_20l', label: 'Below ₹20 Lakh', emoji: '💰' },
      { value: '20l_1cr', label: '₹20L – ₹1 Crore', emoji: '💰' },
      { value: '1cr_5cr', label: '₹1Cr – ₹5 Crore', emoji: '💰' },
      { value: 'above_5cr', label: 'Above ₹5 Crore', emoji: '💰' },
    ],
  },
  {
    id: 'businessType',
    question: 'What is your business structure?',
    type: 'single_select',
    options: [
      { value: 'sole_proprietorship', label: 'Proprietorship', emoji: '👤' },
      { value: 'partnership', label: 'Partnership', emoji: '🤝' },
      { value: 'llp', label: 'LLP', emoji: '🏢' },
      { value: 'private_limited', label: 'Pvt Ltd', emoji: '🏗️' },
      { value: 'other', label: 'Other', emoji: '•••' },
    ],
  },
  {
    id: 'hasGst',
    question: 'Do you have GST registration?',
    hint: 'Required for most bank loans above ₹20L',
    type: 'boolean',
    options: [
      { value: 'true', label: 'Yes, I have GSTIN', emoji: '✅' },
      { value: 'false', label: 'No, not yet', emoji: '❌' },
    ],
  },
  {
    id: 'hasMsme',
    question: 'Do you have Udyam / MSME registration?',
    hint: 'Unlocks exclusive government schemes',
    type: 'boolean',
    options: [
      { value: 'true', label: 'Yes, registered', emoji: '🏅' },
      { value: 'false', label: 'No, not yet', emoji: '❌' },
    ],
  },
  {
    id: 'loanPurpose',
    question: 'What do you need the funding for?',
    type: 'single_select',
    options: [
      { value: 'working_capital', label: 'Working Capital', emoji: '🔄' },
      { value: 'machinery', label: 'Machinery / Equipment', emoji: '⚙️' },
      { value: 'expansion', label: 'Business Expansion', emoji: '📈' },
      { value: 'property', label: 'Property / Premises', emoji: '🏢' },
      { value: 'export', label: 'Export Finance', emoji: '🌏' },
      { value: 'other', label: 'Other', emoji: '•••' },
    ],
  },
  {
    id: 'collateralAvailable',
    question: 'Can you provide collateral?',
    hint: 'Property, machinery, or FD as security',
    type: 'boolean',
    options: [
      { value: 'true', label: 'Yes, I have collateral', emoji: '🏠' },
      { value: 'false', label: 'No collateral available', emoji: '🆓' },
    ],
  },
];

// ── Option Chip ────────────────────────────────────────────────
function OptionChip({
  option,
  selected,
  onPress,
}: {
  option: NonNullable<Question['options']>[0];
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: selected ? 2 : 1.5,
          borderColor: selected ? Colors.primary : Colors.border,
          backgroundColor: selected ? Colors.primaryLight : Colors.white,
          marginBottom: 10,
          ...Shadow.sm,
        }}
      >
        {option.emoji && (
          <Text style={{ fontSize: 20, marginRight: 12 }}>{option.emoji}</Text>
        )}
        <Text style={{
          fontSize: 15,
          fontWeight: selected ? '700' : '500',
          color: selected ? Colors.primary : Colors.textBase,
          flex: 1,
        }}>
          {option.label}
        </Text>
        {selected && (
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="checkmark" size={13} color={Colors.white} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────
export default function EligibilityCheckerScreen() {
  const { checkEligibility, isChecking } = useEligibility();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<keyof EligibilityInput, string>>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = QUESTIONS.length;
  const question = QUESTIONS[currentStep];
  const selectedValue = answers[question.id];
  const progress = ((currentStep) / totalSteps) * 100;

  const animateNext = useCallback((direction: 'forward' | 'back') => {
    const from = direction === 'forward' ? 60 : -60;
    slideAnim.setValue(from);
    Animated.spring(slideAnim, {
      toValue: 0, tension: 80, friction: 12, useNativeDriver: true,
    }).start();
  }, []);

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }, [question.id]);

  const handleNext = useCallback(async () => {
    if (!selectedValue) return;

    if (currentStep < totalSteps - 1) {
      animateNext('forward');
      setCurrentStep((s) => s + 1);
      return;
    }

    // Final step — run eligibility check
    const input: EligibilityInput = {
      businessAge: answers.businessAge,
      annualTurnover: answers.annualTurnover,
      businessType: answers.businessType,
      hasGst: answers.hasGst === 'true',
      hasMsme: answers.hasMsme === 'true',
      loanPurpose: answers.loanPurpose,
      collateralAvailable: answers.collateralAvailable === 'true',
    };

    const result = await checkEligibility(input);
    if (result) {
      router.push({
        pathname: '/(user)/funding/eligibility/result',
        params: { result: JSON.stringify(result) },
      });
    }
  }, [selectedValue, currentStep, answers, animateNext, checkEligibility]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) { router.back(); return; }
    animateNext('back');
    setCurrentStep((s) => s - 1);
  }, [currentStep, animateNext]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <ProgressBar value={progress} height={6} showLabel duration={400} />
          </View>
          <Text style={{ marginLeft: 12, fontSize: 12, fontWeight: '600', color: Colors.textMuted }}>
            {currentStep + 1}/{totalSteps}
          </Text>
        </View>

        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Eligibility Check
        </Text>
      </View>

      {/* Question card */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
          paddingHorizontal: 20,
          paddingTop: 32,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.5, marginBottom: 8, lineHeight: 30 }}>
          {question.question}
        </Text>
        {question.hint && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={{ fontSize: 13, color: Colors.textMuted, marginLeft: 6, fontStyle: 'italic' }}>
              {question.hint}
            </Text>
          </View>
        )}
        {!question.hint && <View style={{ marginBottom: 28 }} />}

        {/* Options */}
        {question.options?.map((opt) => (
          <OptionChip
            key={opt.value}
            option={opt}
            selected={selectedValue === opt.value}
            onPress={() => handleSelect(opt.value)}
          />
        ))}
      </Animated.View>

      {/* Bottom CTA */}
      <View style={{
        paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 16, backgroundColor: Colors.white,
        borderTopWidth: 1, borderTopColor: Colors.border,
      }}>
        <CustomButton
          label={currentStep === totalSteps - 1 ? '🔍 Check My Eligibility' : 'Continue'}
          onPress={handleNext}
          disabled={!selectedValue}
          loading={isChecking}
          fullWidth
          size="lg"
          rightIcon={currentStep < totalSteps - 1 ? <AntDesign name="arrow-right" size={18} color="white" /> : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
}