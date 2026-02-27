/**
 * app/(user)/support/index.tsx — RM Support Chat
 *
 * Design: iMessage-inspired. Warm, professional, personal.
 * RM card header shows avatar, live availability dot, expertise chips.
 * User bubbles: right / blue. RM bubbles: left / white with border.
 * System messages: centred, muted pill. Typing: three bouncing dots.
 */

import { LoadingSpinner } from '@/components/common';
import { useSupportChat } from '@/hooks/useAdmin';
import type { ChatMessage } from '@/types/admin.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StatusBar, Text, TextInput, View,
} from 'react-native';
import { Colors, Shadow } from '../../../theme';

function AvailDot({ status, text }: { status: string; text: string }) {
  const color = status === 'available' ? Colors.success : status === 'busy' ? Colors.warning : Colors.textMuted;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 11, color, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

function RMCard({ rm }: { rm: any }) {
  return (
    <View style={{
      backgroundColor: Colors.white, borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      paddingHorizontal: 16, paddingTop: 60, paddingBottom: 14,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: rm.avatarColor,
          alignItems: 'center', justifyContent: 'center',
          marginRight: 14, borderWidth: 2.5, borderColor: Colors.successLight,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.white }}>{rm.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 1 }}>{rm.name}</Text>
          <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 5 }}>{rm.designation}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AvailDot status={rm.availability} text={rm.availabilityText} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textDark }}>{rm.rating}</Text>
              <Text style={{ fontSize: 10, color: Colors.textMuted }}>({rm.clientsHandled})</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="call-outline" size={18} color={Colors.success} />
          </Pressable>
          <Pressable style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {rm.expertise.map((exp: string) => (
            <View key={exp} style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.primary }}>{exp}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function TypingIndicator({ rmAvatar, rmColor }: { rmAvatar: string; rmColor: string }) {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const a = Animated.parallel(anims.map((a, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.spring(a, { toValue: -6, useNativeDriver: true, speed: 28, bounciness: 8 }),
        Animated.spring(a, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 8 }),
        Animated.delay(500),
      ]))
    ));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 16 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: rmColor, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white }}>{rmAvatar}</Text>
      </View>
      <View style={{ backgroundColor: Colors.white, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 5, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
        {anims.map((a, i) => (
          <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textMuted, transform: [{ translateY: a }] }} />
        ))}
      </View>
    </View>
  );
}

function Bubble({ message, rmAvatar, rmColor }: { message: ChatMessage; rmAvatar: string; rmColor: string }) {
  const isUser   = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const time = new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isSystem) return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <View style={{ backgroundColor: Colors.surfaceAlt, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}>
        <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center' }}>{message.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 16 }}>
      {!isUser && (
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: rmColor, alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white }}>{rmAvatar}</Text>
        </View>
      )}
      <View style={{ maxWidth: '72%' }}>
        <View style={{
          backgroundColor: isUser ? Colors.primary : Colors.white,
          borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
          paddingHorizontal: 14, paddingVertical: 10,
          borderWidth: isUser ? 0 : 1, borderColor: Colors.border,
          ...Shadow.sm,
        }}>
          <Text style={{ fontSize: 14, color: isUser ? Colors.white : Colors.textDark, lineHeight: 20 }}>
            {message.text}
          </Text>
        </View>
        <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 3, textAlign: isUser ? 'right' : 'left', paddingHorizontal: 4 }}>
          {time}{isUser && <Text style={{ color: Colors.primary }}>{' '}✓✓</Text>}
        </Text>
      </View>
    </View>
  );
}

export default function SupportScreen() {
  const { rm, messages, isLoading, isSending, isRmTyping, sendMessage } = useSupportChat();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, [messages, isRmTyping]);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || isSending) return;
    setText('');
    await sendMessage(msg);
  }, [text, isSending, sendMessage]);

  if (isLoading) return <LoadingSpinner mode="fullscreen" message="Connecting to your RM…" />;

  const QUICK = ['File GSTR-3B for me', 'Check compliance status', 'Help with loan docs', 'ITR filing questions'];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#EEF3F7' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      {rm && <RMCard rm={rm} />}

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 8 }}>
        {messages.map((msg) => (
          <Bubble key={msg.id} message={msg} rmAvatar={rm?.avatar ?? 'RM'} rmColor={rm?.avatarColor ?? Colors.primary} />
        ))}
        {isRmTyping && <TypingIndicator rmAvatar={rm?.avatar ?? 'RM'} rmColor={rm?.avatarColor ?? Colors.primary} />}
      </ScrollView>

      {/* Quick replies — show only early in conversation */}
      {messages.filter(m => m.sender === 'user').length === 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
          {QUICK.map((r) => (
            <Pressable key={r} onPress={() => sendMessage(r)} style={{ backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>{r}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'flex-end',
        backgroundColor: Colors.white,
        paddingHorizontal: 12, paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        borderTopWidth: 1, borderTopColor: Colors.border, gap: 10,
      }}>
        <View style={{
          flex: 1, backgroundColor: Colors.surfaceAlt,
          borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
          borderWidth: 1, borderColor: Colors.border, minHeight: 44, justifyContent: 'center',
        }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message your RM…"
            placeholderTextColor={Colors.textDisabled}
            style={{ fontSize: 14, color: Colors.textDark, maxHeight: 100 }}
            multiline
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || isSending}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: text.trim() ? Colors.primary : Colors.border,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name={isSending ? 'hourglass-outline' : 'send'} size={18} color={Colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}