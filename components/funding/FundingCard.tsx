import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const FundingCard: React.FC<any> = ({ scheme, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-lg p-4 mb-3 shadow border-l-4 border-green-500">
      <Text className="text-lg font-semibold">{scheme.name}</Text>
      <Text className="text-sm text-gray-600 mt-1">{scheme.description}</Text>
      <View className="flex-row justify-between mt-3">
        <Text className="text-gray-700">₹{scheme.minAmount / 100000}L - ₹{scheme.maxAmount / 100000}L</Text>
        <Text className="text-orange-600 font-semibold">{scheme.interestRate}% p.a.</Text>
      </View>
    </TouchableOpacity>
  );
};
