import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const FolderCard: React.FC<any> = ({ folder, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-200 flex-row items-center">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{folder.name}</Text>
        <Text className="text-xs text-gray-600 mt-1">{folder.documents?.length || 0} documents</Text>
      </View>
      <Text className="text-2xl">📁</Text>
    </TouchableOpacity>
  );
};
