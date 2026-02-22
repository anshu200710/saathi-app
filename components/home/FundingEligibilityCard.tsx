import React from 'react';
import { View, Text } from 'react-native';

export const FundingEligibilityCard: React.FC<any> = ({ scheme, eligible }) => {
  return (
    <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
      <Text className="text-lg font-semibold text-gray-800">{scheme}</Text>
      <Text className={eligible ? 'text-green-600' : 'text-red-600'}>{eligible ? 'Eligible' : 'Not Eligible'}</Text>
    </View>
  );
};
