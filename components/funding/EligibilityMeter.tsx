import React from 'react';
import { Text, View } from 'react-native';
import { ProgressBar } from '../common/ProgressBar';

export const EligibilityMeter: React.FC<any> = ({ score, message }) => {
  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold mb-3">Your Eligibility Score</Text>
      <ProgressBar progress={score} max={100} showLabel={true} />
      <Text className="text-sm text-gray-600 mt-3">{message}</Text>
    </View>
  );
};
