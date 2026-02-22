import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const FreeToolsBanner: React.FC<any> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 mb-6">
      <Text className="text-white font-bold text-lg">Free Business Tools</Text>
      <Text className="text-white text-sm mt-1">Access calculators, generators & more</Text>
    </TouchableOpacity>
  );
};
