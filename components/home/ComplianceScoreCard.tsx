import React from 'react';
import { Text, View } from 'react-native';

export const DashboardCard: React.FC<any> = ({ title, value, color }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow">
      <Text className="text-sm text-gray-600">{title}</Text>
      <Text style={{ color }} className="text-2xl font-bold mt-2">
        {value}
      </Text>
    </View>
  );
};
