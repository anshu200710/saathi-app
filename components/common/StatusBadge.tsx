import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'overdue';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={{ backgroundColor: getStatusColor() }} className="px-3 py-1 rounded-full">
      <Text className="text-white text-xs font-semibold">{text || status.toUpperCase()}</Text>
    </View>
  );
};
