import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const ServiceCard: React.FC<any> = ({ service, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-lg p-4 mb-3 shadow">
      <Text className="text-lg font-semibold">{service.name}</Text>
      <Text className="text-sm text-gray-600 mt-1">{service.description}</Text>
      <Text className="text-blue-600 font-semibold mt-2">₹{service.price}</Text>
    </TouchableOpacity>
  );
};
