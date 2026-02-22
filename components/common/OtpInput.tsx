/**
 * components/common/OtpInput.tsx
 *
 * 6-box OTP input with:
 *  • Auto-focus advance on digit entry
 *  • Backspace → previous box
 *  • Paste detection → fills all boxes
 *  • Animated border highlight on active box
 *  • Error state turns borders red
 *  • Full accessibility support
 */

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Animated,
    NativeSyntheticEvent,
    TextInput,
    TextInputKeyPressEventData,
    View,
} from 'react-native';
import { Colors, Shadow } from '../../theme';

const OTP_LENGTH = 6;

interface OtpInputProps {
  onComplete: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export interface OtpInputRef {
  clear: () => void;
  focus: () => void;
}

const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  ({ onComplete, error = false, disabled = false }, ref) => {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
    const scaleAnims = useRef(
      Array(OTP_LENGTH).fill(null).map(() => new Animated.Value(1))
    ).current;

    useImperativeHandle(ref, () => ({
      clear: () => {
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      },
      focus: () => inputRefs.current[0]?.focus(),
    }));

    const animateBox = (index: number, active: boolean) => {
      Animated.spring(scaleAnims[index], {
        toValue: active ? 1.06 : 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }).start();
    };

    const handleChange = (text: string, index: number) => {
      // Handle paste — if user pastes a full 6-digit OTP
      if (text.length > 1) {
        const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
        const newOtp = Array(OTP_LENGTH).fill('');
        digits.forEach((d, i) => { newOtp[i] = d; });
        setOtp(newOtp);
        const nextFocus = Math.min(digits.length, OTP_LENGTH - 1);
        inputRefs.current[nextFocus]?.focus();
        if (digits.length === OTP_LENGTH) {
          onComplete(digits.join(''));
        }
        return;
      }

      const digit = text.replace(/\D/g, '');
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newOtp.every(Boolean)) {
        onComplete(newOtp.join(''));
      }
    };

    const handleKeyPress = (
      e: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number
    ) => {
      if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {Array(OTP_LENGTH).fill(null).map((_, index) => {
          const isFocused = focusedIndex === index;
          const hasValue = !!otp[index];
          const borderColor = error
            ? Colors.danger
            : isFocused
            ? Colors.primary
            : hasValue
            ? Colors.primaryDark
            : Colors.border;

          return (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale: scaleAnims[index] }],
              }}
            >
              <TextInput
                ref={(r) => { inputRefs.current[index] = r; }}
                value={otp[index]}
                onChangeText={(t) => handleChange(t, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => {
                  setFocusedIndex(index);
                  animateBox(index, true);
                }}
                onBlur={() => {
                  setFocusedIndex(-1);
                  animateBox(index, false);
                }}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH} // allows paste
                editable={!disabled}
                textAlign="center"
                selectTextOnFocus
                style={{
                  width: 46,
                  height: 56,
                  borderWidth: isFocused ? 2 : 1.5,
                  borderColor,
                  borderRadius: 12,
                  backgroundColor: Colors.white,
                  fontSize: 22,
                  fontWeight: '700',
                  color: Colors.textDark,
                  ...Shadow.sm,
                }}
                accessibilityLabel={`OTP digit ${index + 1}`}
              />
            </Animated.View>
          );
        })}
      </View>
    );
  }
);

OtpInput.displayName = 'OtpInput';
export default OtpInput;