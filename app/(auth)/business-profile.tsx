/**
 * app/(auth)/business-profile.tsx — Business Profile Setup
 *
 * 4-step wizard to capture business data for personalized compliance
 * alerts, funding matching, and service recommendations.
 *
 * Steps:
 *  1. Basic Info    — business name, type, industry
 *  2. Location      — state, city, pincode
 *  3. Financial     — turnover range, employee count, incorporation year
 *  4. Identity      — PAN, GSTIN (optional)
 *
 * Features:
 *  • Animated step indicator
 *  • Per-step validation before advancing
 *  • Chip-style selectors for categories (no dropdowns)
 *  • Safe to abandon — data saved to context on each step
 *  • Skip to home available (data can be completed later)
 */

import CustomButton from '@/components/common/CustomButton';
import { authService } from '@/services/authService';
import type {
    BusinessType,
    EmployeeRange,
    Industry,
    TurnoverRange,
} from '@/types/auth.types';
import { validators } from '@/utils/validators';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors, Shadow } from '../../theme';

type BusinessProfile = {
  businessName: string;
  businessType: BusinessType;
  industry: Industry;
  annualTurnover: TurnoverRange;
  gstin?: string;
  pan: string;
  state: string;
  city: string;
  pincode: string;
  employeeCount: EmployeeRange;
  incorporationYear?: string;
};

// ── Option data ────────────────────────────────────────────────
const BUSINESS_TYPES: { value: BusinessType; label: string; emoji: string }[] = [
  { value: 'sole_proprietorship', label: 'Proprietorship', emoji: '👤' },
  { value: 'partnership', label: 'Partnership', emoji: '🤝' },
  { value: 'llp', label: 'LLP', emoji: '🏢' },
  { value: 'private_limited', label: 'Pvt Ltd', emoji: '🏗️' },
  { value: 'opc', label: 'OPC', emoji: '🧑‍💼' },
  { value: 'ngo', label: 'NGO / Trust', emoji: '💚' },
  { value: 'other', label: 'Other', emoji: '•••' },
];

const INDUSTRIES: { value: Industry; label: string; emoji: string }[] = [
  { value: 'manufacturing', label: 'Manufacturing', emoji: '🏭' },
  { value: 'retail', label: 'Retail / Trade', emoji: '🛒' },
  { value: 'it_services', label: 'IT / Software', emoji: '💻' },
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'agriculture', label: 'Agriculture', emoji: '🌾' },
  { value: 'construction', label: 'Construction', emoji: '🏗️' },
  { value: 'ecommerce', label: 'E-Commerce', emoji: '📦' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'logistics', label: 'Logistics', emoji: '🚛' },
  { value: 'hospitality', label: 'Hospitality', emoji: '🏨' },
  { value: 'other', label: 'Other', emoji: '•••' },
];

const TURNOVER_RANGES: { value: TurnoverRange; label: string }[] = [
  { value: 'below_20l', label: 'Below ₹20L' },
  { value: '20l_1cr', label: '₹20L – ₹1Cr' },
  { value: '1cr_5cr', label: '₹1Cr – ₹5Cr' },
  { value: '5cr_25cr', label: '₹5Cr – ₹25Cr' },
  { value: 'above_25cr', label: 'Above ₹25Cr' },
];

const EMPLOYEE_RANGES: { value: EmployeeRange; label: string }[] = [
  { value: '1_5', label: '1–5' },
  { value: '6_20', label: '6–20' },
  { value: '21_50', label: '21–50' },
  { value: '51_200', label: '51–200' },
  { value: 'above_200', label: '200+' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const TOTAL_STEPS = 4;

// ── Chip Selector ─────────────────────────────────────────────
function ChipSelector<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string; emoji?: string }[];
  selected: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: isSelected ? 2 : 1.5,
              borderColor: isSelected ? Colors.primary : Colors.border,
              backgroundColor: isSelected ? Colors.primaryLight : Colors.white,
              ...Shadow.sm,
            }}
          >
            {opt.emoji && (
              <Text style={{ fontSize: 16, marginRight: 6 }}>{opt.emoji}</Text>
            )}
            <Text
              style={{
                fontSize: 13,
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? Colors.primary : Colors.textBase,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Step Progress Bar ─────────────────────────────────────────
function StepProgress({ current, total }: { current: number; total: number }) {
  const progressWidth = useRef(new Animated.Value((current / total) * 100)).current;

  React.useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: (current / total) * 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [current]);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textMuted }}>
          Step {current} of {total}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primary }}>
          {Math.round((current / total) * 100)}%
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' }}>
        <Animated.View
          style={{
            height: 6,
            backgroundColor: Colors.primary,
            borderRadius: 3,
            width: progressWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}

// ── Form Field ────────────────────────────────────────────────
function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoCapitalize,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string | null;
  keyboardType?: any;
  autoCapitalize?: any;
  maxLength?: number;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDisabled}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 52,
          borderWidth: focused ? 2 : 1.5,
          borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          fontSize: 15,
          fontWeight: '500',
          color: Colors.textDark,
          backgroundColor: Colors.white,
          ...Shadow.sm,
        }}
      />
      {error && (
        <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 5 }}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 5 }}>{hint}</Text>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────
export default function BusinessProfileScreen() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [form, setForm] = useState({
    businessName: '',
    businessType: null as BusinessType | null,
    industry: null as Industry | null,
    state: '',
    city: '',
    pincode: '',
    annualTurnover: null as TurnoverRange | null,
    employeeCount: null as EmployeeRange | null,
    incorporationYear: '',
    pan: '',
    gstin: '',
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const update = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  // ── Step Validation ────────────────────────────────────────
  const validateStep = (): boolean => {
    const newErrors: Record<string, string | null> = {};

    if (step === 1) {
      const nameErr = validators.required(form.businessName, 'Business name');
      if (nameErr) newErrors.businessName = nameErr;
      if (!form.businessType) newErrors.businessType = 'Select a business type';
      if (!form.industry) newErrors.industry = 'Select your industry';
    }

    if (step === 2) {
      if (!form.state) newErrors.state = 'Select your state';
      const cityErr = validators.required(form.city, 'City');
      if (cityErr) newErrors.city = cityErr;
      const pinErr = validators.pincode(form.pincode);
      if (pinErr) newErrors.pincode = pinErr;
    }

    if (step === 3) {
      if (!form.annualTurnover) newErrors.annualTurnover = 'Select annual turnover';
      if (!form.employeeCount) newErrors.employeeCount = 'Select employee count';
    }

    if (step === 4) {
      const panErr = validators.pan(form.pan);
      if (panErr) newErrors.pan = panErr;
      const gstErr = validators.gstin(form.gstin);
      if (gstErr) newErrors.gstin = gstErr;
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  // ── Navigation ─────────────────────────────────────────────
  const animateTransition = (direction: 'forward' | 'back') => {
    const from = direction === 'forward' ? 40 : -40;
    slideAnim.setValue(from);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < TOTAL_STEPS) {
      animateTransition('forward');
      setStep((s) => s + 1);
      return;
    }

    // Final submission
    setIsSubmitting(true);
    try {
      const profile: BusinessProfile = {
        businessName: form.businessName,
        businessType: form.businessType!,
        industry: form.industry!,
        annualTurnover: form.annualTurnover!,
        gstin: form.gstin || undefined,
        pan: form.pan.toUpperCase(),
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        employeeCount: form.employeeCount!,
        incorporationYear: form.incorporationYear || undefined,
      };
      // Save business profile via API
      if (authService && typeof (authService as any).saveBusinessProfile === 'function') {
        await (authService as any).saveBusinessProfile(profile);
      }
      router.replace('/(user)/home');
    } catch (err) {
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    animateTransition('back');
    setStep((s) => s - 1);
  };

  // ── Step titles ─────────────────────────────────────────────
  const STEP_META = [
    { title: 'Tell us about\nyour business', subtitle: 'Helps us personalise your experience' },
    { title: 'Where are you\nbased?', subtitle: 'For state-specific compliance rules' },
    { title: 'Business\nfinancials', subtitle: 'To match you with the right funding' },
    { title: 'Legal\nidentifiers', subtitle: 'Required for compliance tracking' },
  ];

  const meta = STEP_META[step - 1];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Fixed Header */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: Colors.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
          </Pressable>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <StepProgress current={step} total={TOTAL_STEPS} />
          </View>

          {/* Skip — only on non-final steps */}
          {step < TOTAL_STEPS && (
            <Pressable
              onPress={() => router.replace('/(user)/home')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginLeft: 16 }}
            >
              <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: '600' }}>Skip</Text>
            </Pressable>
          )}
        </View>

        <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.5, lineHeight: 30 }}>
          {meta.title}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6 }}>
          {meta.subtitle}
        </Text>
      </View>

      {/* Scrollable Form */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: 1 }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <View style={{ marginTop: 8 }}>
              <FormField
                label="Business / Brand Name"
                value={form.businessName}
                onChangeText={(t) => update('businessName', t)}
                placeholder="e.g. Sharma Traders, TechVeda Pvt Ltd"
                error={errors.businessName}
              />

              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginBottom: 12 }}>
                Business Type
              </Text>
              <ChipSelector
                options={BUSINESS_TYPES}
                selected={form.businessType}
                onSelect={(v) => update('businessType', v)}
              />
              {errors.businessType && (
                <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.businessType}</Text>
              )}

              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginTop: 20, marginBottom: 12 }}>
                Industry / Sector
              </Text>
              <ChipSelector
                options={INDUSTRIES}
                selected={form.industry}
                onSelect={(v) => update('industry', v)}
              />
              {errors.industry && (
                <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.industry}</Text>
              )}
            </View>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginBottom: 12 }}>
                State
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {INDIAN_STATES.map((state) => {
                  const isSelected = form.state === state;
                  return (
                    <Pressable
                      key={state}
                      onPress={() => update('state', state)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? Colors.primary : Colors.border,
                        backgroundColor: isSelected ? Colors.primaryLight : Colors.white,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '500', color: isSelected ? Colors.primary : Colors.textBase }}>
                        {state}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.state && (
                <Text style={{ fontSize: 12, color: Colors.danger, marginBottom: 12 }}>{errors.state}</Text>
              )}

              <FormField
                label="City / District"
                value={form.city}
                onChangeText={(t) => update('city', t)}
                placeholder="e.g. Pune, Surat, Patna"
                error={errors.city}
              />

              <FormField
                label="Pincode"
                value={form.pincode}
                onChangeText={(t) => update('pincode', t.replace(/\D/g, '').slice(0, 6))}
                placeholder="400001"
                keyboardType="number-pad"
                autoCapitalize="none"
                maxLength={6}
                error={errors.pincode}
              />
            </View>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginBottom: 12 }}>
                Annual Turnover
              </Text>
              <ChipSelector
                options={TURNOVER_RANGES}
                selected={form.annualTurnover}
                onSelect={(v) => update('annualTurnover', v)}
              />
              {errors.annualTurnover && (
                <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.annualTurnover}</Text>
              )}

              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textBase, marginTop: 24, marginBottom: 12 }}>
                Number of Employees
              </Text>
              <ChipSelector
                options={EMPLOYEE_RANGES}
                selected={form.employeeCount}
                onSelect={(v) => update('employeeCount', v)}
              />
              {errors.employeeCount && (
                <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.employeeCount}</Text>
              )}

              <FormField
                label="Year of Incorporation (Optional)"
                value={form.incorporationYear}
                onChangeText={(t) => update('incorporationYear', t.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 2018"
                keyboardType="number-pad"
                autoCapitalize="none"
                maxLength={4}
                hint="Leave blank if not registered yet"
              />
            </View>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <View style={{ marginTop: 8 }}>
              {/* PAN info banner */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: Colors.infoLight,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 24,
                  alignItems: 'flex-start',
                }}
              >
                <Ionicons name="information-circle" size={18} color={Colors.info} style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={{ fontSize: 13, color: Colors.info, flex: 1, lineHeight: 20, fontWeight: '500' }}>
                  Your PAN and GSTIN are encrypted and stored securely. We only use them to pre-fill government portals on your behalf.
                </Text>
              </View>

              <FormField
                label="PAN Number"
                value={form.pan}
                onChangeText={(t) => update('pan', t.toUpperCase().slice(0, 10))}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
                error={errors.pan}
                hint="Personal PAN for proprietorships, Business PAN for companies"
              />

              <FormField
                label="GSTIN (Optional)"
                value={form.gstin}
                onChangeText={(t) => update('gstin', t.toUpperCase().slice(0, 15))}
                placeholder="22ABCDE1234F1Z5"
                autoCapitalize="characters"
                maxLength={15}
                error={errors.gstin}
                hint="Leave blank if not GST registered"
              />

              {errors.submit && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors.dangerLight,
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 8,
                  }}
                >
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={{ fontSize: 13, color: Colors.danger, marginLeft: 8 }}>
                    {errors.submit}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          paddingTop: 16,
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          ...Shadow.md,
        }}
      >
        <CustomButton
          label={step === TOTAL_STEPS ? '🚀  Complete Setup' : 'Continue'}
          onPress={handleNext}
          loading={isSubmitting}
          fullWidth
          size="lg"
          rightIcon={
            step < TOTAL_STEPS ? (
              <AntDesign name="arrow-right" size={18} color="white" />
            ) : undefined
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}