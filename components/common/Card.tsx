import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 px-4 rounded-lg ${
        variant === 'primary' ? 'bg-blue-600' : variant === 'secondary' ? 'bg-gray-200' : 'border border-blue-600'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-center font-semibold ${variant === 'primary' || variant === 'outline' ? 'text-white' : 'text-gray-800'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
