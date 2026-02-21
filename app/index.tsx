import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login"); // go to login after 2 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Text className="text-white text-3xl font-bold">
        VyaaparSaathi
      </Text>
      <Text className="text-white mt-2">
        Your Business Companion
      </Text>
    </View>
  );
}