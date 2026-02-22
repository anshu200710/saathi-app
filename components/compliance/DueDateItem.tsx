import React from 'react';
import { View, Text } from 'react-native';
import { StatusBadge } from '../common/StatusBadge';

export const DueDateItem: React.FC<any> = ({ item }) => {
  return (
    <View className="bg-white rounded-lg p-3 mb-2 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-xs text-gray-600">{item.dueDate}</Text>
      </View>
      <StatusBadge status={item.status} />
    </View>
  );
};
