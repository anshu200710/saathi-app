import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DocumentFolderScreen() {
  const { folder } = useLocalSearchParams();
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Folder: {folder}</Text>
    </View>
  );
}
