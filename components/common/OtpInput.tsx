import React from 'react';
import { TextInput, View } from 'react-native';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(''));

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      // Move to next input
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  return (
    <View className="flex-row justify-between gap-3">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          maxLength={1}
          value={digit}
          onChangeText={(value) => handleChange(index, value)}
          keyboardType="number-pad"
          className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-lg font-bold"
        />
      ))}
    </View>
  );
};
