import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Service {id}</Text>
    </View>
  );
}
