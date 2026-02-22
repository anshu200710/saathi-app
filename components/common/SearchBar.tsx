import React from 'react';
import { TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
}) => {
  return (
    <View className="bg-gray-100 rounded-lg px-4 py-2">
      <TextInput
        placeholder={placeholder}
        onChangeText={onSearch}
        className="text-base"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};
