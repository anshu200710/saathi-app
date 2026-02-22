import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export const ActiveServicesSection: React.FC<any> = ({ services }) => {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3">Active Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
        {services?.map((service: any) => (
          <View key={service.id} className="bg-gray-100 rounded-lg p-3 w-32">
            <Text className="font-semibold text-gray-800">{service.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
