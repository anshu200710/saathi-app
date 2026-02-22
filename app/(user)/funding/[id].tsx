import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function FundingDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Funding {id}</Text>
    </View>
  );
}
