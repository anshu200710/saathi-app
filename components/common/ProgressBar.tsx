import React from 'react';
import { Text, View } from 'react-native';

interface ProgressBarProps {
  progress: number;
  max?: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  max = 100,
  height = 8,
  color = '#3B82F6',
  showLabel = true,
}) => {
  const percentage = (progress / max) * 100;

  return (
    <View>
      <View style={{ height }} className="bg-gray-200 rounded-full overflow-hidden">
        <View
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: '100%',
          }}
        />
      </View>
      {showLabel && <Text className="text-xs text-gray-600 mt-1">{Math.round(percentage)}%</Text>}
    </View>
  );
};
