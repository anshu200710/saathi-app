/**
 * app/(user)/documents/index.tsx — Documents Vault
 *
 * Design: Clean, organised vault aesthetic. Completion ring per folder.
 * Feels secure and professional — like a digital filing cabinet.
 * Progress header shows overall vault completion.
 */

import { LoadingSpinner, ProgressBar } from '@/components/common';
import { useDocuments } from '@/hooks/useFunding';
import type { DocumentFolder } from '@/types/funding.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { Colors, Shadow } from '../../../theme';

function FolderCard({ folder, index }: { folder: DocumentFolder; index: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      ]).start();
    }, index * 60);
  }, []);

  const pct = folder.requiredCount > 0 ? Math.round((folder.uploadedCount / folder.requiredCount) * 100) : 100;
  const isComplete = folder.uploadedCount >= folder.requiredCount;
  const missing = folder.requiredCount - folder.uploadedCount;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], width: '47%' }}>
      <Pressable
        onPress={() => router.push(`/(user)/documents/${folder.id}`)}
        style={{
          backgroundColor: Colors.white,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: isComplete ? Colors.success + '40' : Colors.border,
          ...Shadow.sm,
        }}
      >
        {/* Emoji + completion check */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: folder.accentColor + '18',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 24 }}>{folder.emoji}</Text>
          </View>
          {isComplete ? (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={14} color={Colors.white} />
            </View>
          ) : (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.danger }}>{missing}</Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textDark, marginBottom: 4 }} numberOfLines={2}>
          {folder.title}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 10 }}>
          {folder.uploadedCount}/{folder.requiredCount} docs
        </Text>

        <ProgressBar value={pct} color={isComplete ? Colors.success : folder.accentColor} height={4} duration={700} />

        {!isComplete && (
          <Text style={{ fontSize: 10, color: Colors.danger, fontWeight: '600', marginTop: 6 }}>
            {missing} doc{missing > 1 ? 's' : ''} missing
          </Text>
        )}
        {isComplete && (
          <Text style={{ fontSize: 10, color: Colors.success, fontWeight: '600', marginTop: 6 }}>
            Complete ✓
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function DocumentsScreen() {
  const { folders, isLoading, refresh, totalDocs, totalRequired, completionPct } = useDocuments();
  const [refreshing, setRefreshing] = React.useState(false);
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading) Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Header ── */}
        <View style={{ backgroundColor: Colors.white, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5 }}>Document Vault</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Encrypted · Organised · Always ready</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(user)/documents/upload')}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="add" size={22} color={Colors.white} />
            </Pressable>
          </View>

          {/* Overall progress */}
          <Animated.View style={{ opacity: headerFade }}>
            <View style={{ backgroundColor: Colors.background, borderRadius: 14, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textMuted }}>Vault Completion</Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.textDark, marginTop: 2, letterSpacing: -0.5 }}>
                    {totalDocs} <Text style={{ fontSize: 14, color: Colors.textMuted }}>of {totalRequired} docs</Text>
                  </Text>
                </View>
                <View style={{
                  width: 56, height: 56, borderRadius: 28,
                  borderWidth: 4,
                  borderColor: completionPct === 100 ? Colors.success : completionPct >= 60 ? Colors.primary : Colors.warning,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: Colors.textDark }}>{completionPct}%</Text>
                </View>
              </View>
              <ProgressBar value={completionPct} color={completionPct === 100 ? Colors.success : Colors.primary} height={6} duration={900} />
              {completionPct < 100 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
                  <Text style={{ fontSize: 11, color: Colors.primary, marginLeft: 6, fontWeight: '600' }}>
                    Complete your vault to unlock faster loan approvals
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* ── Folder grid ── */}
        {isLoading ? (
          <LoadingSpinner mode="inline" message="Loading vault…" />
        ) : (
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.textDark }}>📁 Your Folders</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>{folders.length} categories</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {folders.map((folder, i) => (
                <FolderCard key={folder.id} folder={folder} index={i} />
              ))}
            </View>

            {/* Security badge */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: Colors.successLight,
              borderRadius: 12, padding: 14, marginTop: 20,
            }}>
              <Ionicons name="lock-closed" size={18} color={Colors.success} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.success }}>Bank-grade Encryption</Text>
                <Text style={{ fontSize: 11, color: Colors.success, marginTop: 2, opacity: 0.8 }}>
                  All documents are AES-256 encrypted. Only you and your assigned experts can access them.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}