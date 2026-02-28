/**
 * app/(auth)/login.tsx — Login Screen
 *
 * Clean email/password login design matching VyaaparSaathi branding.
 * Features:
 *  - Light background with centered form
 *  - Store icon in blue rounded square
 *  - Email and password fields with validation
 *  - Forgot password link
 *  - Sign up navigation
 */

import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme';

export default function LoginScreen() {
  const { isLoading } = useAuth() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      // Save user session to AsyncStorage
      const userData = {
        email,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      
      // Navigate to user dashboard
      router.replace('/(user)/home');
    } catch (error) {
      console.log('Login error:', error);
      setErrors({ ...errors, login: 'Login failed. Please try again.' });
    }
  };

  const inputStyle = (field: string) => ({
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 15,
    color: Colors.textDark ?? '#1a1a2e',
  });

  const containerStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F3F6FB',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor:
      errors[field]
        ? '#EF4444'
        : focusedField === field
        ? '#3B82F6'
        : 'transparent',
    marginBottom: errors[field] ? 4 : 16,
  });

  const displayError = '';

  return (
    <View style={{ flex: 1, backgroundColor: '#EEF3FA' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF3FA" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Store Icon */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            backgroundColor: '#DBEAFE',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Feather name="shopping-bag" size={32} color="#3B82F6" />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          Welcome Back
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#64748B',
            textAlign: 'center',
            marginBottom: 28,
            lineHeight: 20,
          }}
        >
          Manage your business with ease using VyaaparSaathi.
        </Text>

        {/* Email */}
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
            Email Address
          </Text>
          <View style={containerStyle('email')}>
            <Feather name="mail" size={18} color="#94A3B8" />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              style={inputStyle('email')}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: '' }));
              }}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? (
            <Text style={{ fontSize: 12, color: '#EF4444', marginBottom: 12, marginLeft: 2 }}>
              {errors.email}
            </Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={{ width: '100%' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
            Password
          </Text>
          <View style={containerStyle('password')}>
            <Feather name="lock" size={18} color="#94A3B8" />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              style={inputStyle('password')}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((e) => ({ ...e, password: '' }));
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Feather
                name={showPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#94A3B8"
              />
            </Pressable>
          </View>
          {errors.password ? (
            <Text style={{ fontSize: 12, color: '#EF4444', marginBottom: 12, marginLeft: 2 }}>
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Forgot Password Link */}
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={{ alignSelf: 'flex-end', marginBottom: 24 }}
        >
          <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '600' }}>
            Forgot Password?
          </Text>
        </Pressable>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            width: '100%',
            backgroundColor: '#3B82F6',
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            marginBottom: 20,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 }}>
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '700' }}>Sign up</Text>
            </Pressable>
          </Link>
        </View>

        {/* Navigation Links */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600' }}>
              ← Back to Navigation
            </Text>
          </Pressable>
          <Text style={{ color: '#CBD5E1' }}>|</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600' }}>
              Dashboard →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}