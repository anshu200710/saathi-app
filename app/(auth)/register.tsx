import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) return;

    router.replace("/(user)/dashboard");
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <View className="bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </Text>

        <Text className="text-gray-500 text-center mt-2 mb-6">
          Start managing your business today
        </Text>

        {/* Name */}
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-4">
          <Feather name="user" size={20} color="#6b7280" />
          <TextInput
            placeholder="Full Name"
            className="flex-1 py-3 px-2"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-4">
          <Feather name="mail" size={20} color="#6b7280" />
          <TextInput
            placeholder="Email"
            className="flex-1 py-3 px-2"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-6">
          <Feather name="lock" size={20} color="#6b7280" />
          <TextInput
            placeholder="Password"
            secureTextEntry
            className="flex-1 py-3 px-2"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-primary py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Login */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">
            Already have an account?{" "}
          </Text>
          <Link
            href="/(auth)/login"
            className="text-primary font-semibold"
          >
            Login
          </Link>
        </View>
      </View>
    </View>
  );
}