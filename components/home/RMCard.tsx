import React from 'react';
import { Text, View } from 'react-native';

export const RMCard: React.FC<any> = ({ name, phone }) => {
  return (
    <View className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-4 mb-6">
      <Text className="text-white font-bold text-lg">Your Business Manager</Text>
      <Text className="text-white text-sm mt-2">{name}</Text>
      <Text className="text-white text-xs mt-1">{phone}</Text>
    </View>
  );
};
