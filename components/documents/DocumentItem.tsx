import React from 'react';
import { View, Text } from 'react-native';

export const DocumentItem: React.FC<any> = ({ document }) => {
  return (
    <View className="bg-white rounded-lg p-3 mb-2 flex-row items-center">
      <Text className="text-xl mr-3">📄</Text>
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">{document.name}</Text>
        <Text className="text-xs text-gray-600">{document.uploadDate}</Text>
      </View>
      <Text className="text-xs text-gray-600">{(document.size / 1024).toFixed(2)} KB</Text>
    </View>
  );
};
