import React from 'react';
import { Text, View } from 'react-native';
import { StatusBadge } from '../common/StatusBadge';

export const ComplianceCalendar: React.FC<any> = ({ items }) => {
  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold mb-4">Compliance Calendar</Text>
      {items?.map((item: any) => (
        <View key={item.id} className="mb-3 pb-3 border-b border-gray-200">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{item.name}</Text>
              <Text className="text-xs text-gray-600 mt-1">{item.dueDate}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
        </View>
      ))}
    </View>
  );
};
