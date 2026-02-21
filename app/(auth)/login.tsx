import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const handleLogin = () => {
    // Later connect API here
    if (!email || !password) return;

    router.replace("/(user)/dashboard");
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <View className="bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-2xl font-bold text-center text-gray-800">
          Welcome Back
        </Text>

        <Text className="text-gray-500 text-center mt-2 mb-6">
          Login to your VyaaparSaathi account
        </Text>

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
            secureTextEntry={secure}
            className="flex-1 py-3 px-2"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Feather
              name={secure ? "eye-off" : "eye"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-primary py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Login
          </Text>
        </TouchableOpacity>

        {/* Signup */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500">
            Don't have an account?{" "}
          </Text>
          <Link
            href="/(auth)/register"
            className="text-primary font-semibold"
          >
            Sign Up
          </Link>
        </View>
      </View>
    </View>
  );
}