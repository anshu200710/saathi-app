import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Min 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) newErrors.terms = "Please agree to Terms & Privacy Policy";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    try {
      // Save user session to AsyncStorage
      const userData = {
        name,
        email,
        isLoggedIn: true,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      
      // Navigate to user dashboard
      router.replace("/(user)/home");
    } catch (error) {
      console.log('Registration error:', error);
      setErrors({ ...errors, register: 'Registration failed. Please try again.' });
    }
  };

  const inputStyle = (field: string) => ({
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 15,
    color: Colors.textDark ?? "#1a1a2e",
  });

  const containerStyle = (field: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F3F6FB",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor:
      errors[field]
        ? "#EF4444"
        : focusedField === field
        ? "#3B82F6"
        : "transparent",
    marginBottom: errors[field] ? 4 : 16,
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#EEF3FA" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF3FA" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
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
            backgroundColor: "#DBEAFE",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Feather name="shopping-bag" size={32} color="#3B82F6" />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: "#1E293B",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          Join VyaaparSaathi
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#64748B",
            textAlign: "center",
            marginBottom: 28,
            lineHeight: 20,
          }}
        >
          Empowering your business journey, one step at a time.
        </Text>

        {/* Full Name */}
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
            Full Name
          </Text>
          <View style={containerStyle("name")}>
            <Feather name="user" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              style={inputStyle("name")}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name) setErrors((e) => ({ ...e, name: "" }));
              }}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
            />
          </View>
          {errors.name ? (
            <Text style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, marginLeft: 2 }}>
              {errors.name}
            </Text>
          ) : null}
        </View>

        {/* Email */}
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
            Email Address
          </Text>
          <View style={containerStyle("email")}>
            <Feather name="mail" size={18} color="#94A3B8" />
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor="#94A3B8"
              style={inputStyle("email")}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: "" }));
              }}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? (
            <Text style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, marginLeft: 2 }}>
              {errors.email}
            </Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
            Password
          </Text>
          <View style={containerStyle("password")}>
            <Feather name="lock" size={18} color="#94A3B8" />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              style={inputStyle("password")}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((e) => ({ ...e, password: "" }));
              }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={18}
                color="#94A3B8"
              />
            </Pressable>
          </View>
          {errors.password ? (
            <Text style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, marginLeft: 2 }}>
              {errors.password}
            </Text>
          ) : null}
        </View>

        {/* Confirm Password */}
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
            Confirm Password
          </Text>
          <View style={containerStyle("confirmPassword")}>
            <Feather name="lock" size={18} color="#94A3B8" />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              style={inputStyle("confirmPassword")}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: "" }));
              }}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
              <Feather
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={18}
                color="#94A3B8"
              />
            </Pressable>
          </View>
          {errors.confirmPassword ? (
            <Text style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, marginLeft: 2 }}>
              {errors.confirmPassword}
            </Text>
          ) : null}
        </View>

        {/* Terms Checkbox */}
        <Pressable
          onPress={() => {
            setAgreedToTerms((v) => !v);
            if (errors.terms) setErrors((e) => ({ ...e, terms: "" }));
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginBottom: errors.terms ? 4 : 20,
            marginTop: 4,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: agreedToTerms ? "#3B82F6" : "#CBD5E1",
              backgroundColor: agreedToTerms ? "#3B82F6" : "white",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            {agreedToTerms && <Feather name="check" size={12} color="white" />}
          </View>
          <Text style={{ fontSize: 13, color: "#64748B", flex: 1, lineHeight: 18 }}>
            I agree to the{" "}
            <Text style={{ color: "#3B82F6", fontWeight: "600" }}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={{ color: "#3B82F6", fontWeight: "600" }}>Privacy Policy</Text>.
          </Text>
        </Pressable>
        {errors.terms ? (
          <Text style={{ fontSize: 12, color: "#EF4444", marginBottom: 16, alignSelf: "flex-start", marginLeft: 2 }}>
            {errors.terms}
          </Text>
        ) : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleRegister}
          style={{
            width: "100%",
            backgroundColor: "#3B82F6",
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 20,
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: '#64748B' }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '700' }}>Login</Text>
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
          <Pressable onPress={() => router.navigate('/(admin)/dashboard')}>
            <Text style={{ fontSize: 13, color: '#3B82F6', fontWeight: '600' }}>
              Dashboard →
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}