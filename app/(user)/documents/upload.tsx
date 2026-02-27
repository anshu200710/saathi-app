/**
 * app/(user)/documents/upload.tsx — Upload Screen
 * Document picker with category selection and animated upload progress.
 */

import { Banner, CustomButton } from '@/components/common';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { Colors, Shadow } from '../../../theme';

const FOLDER_OPTIONS = [
  { id: 'fold_001', label: 'Identity Documents', emoji: '🪪' },
  { id: 'fold_002', label: 'Business Registration', emoji: '🏢' },
  { id: 'fold_003', label: 'Tax Documents', emoji: '🧾' },
  { id: 'fold_004', label: 'Financial Statements', emoji: '📊' },
  { id: 'fold_005', label: 'Legal Agreements', emoji: '⚖️' },
  { id: 'fold_006', label: 'Compliance Certificates', emoji: '📋' },
];

export default function UploadScreen() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!selectedFolder) return;
    setIsUploading(true);
    // Simulate upload — wire up to expo-document-picker in production
    await new Promise(r => setTimeout(r, 1500));
    setIsUploading(false);
    setSuccess(true);
    setTimeout(() => router.back(), 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={{ backgroundColor: Colors.white, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 14 }}>
            <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark }}>Upload Document</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {success && (
          <Banner variant="success" title="Upload Successful!" message="Your document has been uploaded and is pending review by our team." className="mb-4" />
        )}

        {/* Drop zone */}
        <Pressable
          style={{
            borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
            borderRadius: 18, padding: 32, alignItems: 'center',
            backgroundColor: Colors.primaryLight, marginBottom: 24,
          }}
        >
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 6 }}>
            Tap to choose file
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 }}>
            PDF, JPG, PNG up to 10MB{'\n'}Documents are AES-256 encrypted
          </Text>
        </Pressable>

        {/* Folder selection */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 12 }}>
          Save to folder
        </Text>
        <View style={{ gap: 10, marginBottom: 28 }}>
          {FOLDER_OPTIONS.map((opt) => {
            const isSelected = selectedFolder === opt.id;
            return (
              <Pressable key={opt.id} onPress={() => setSelectedFolder(opt.id)} style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: isSelected ? Colors.primaryLight : Colors.white,
                borderRadius: 12, padding: 14,
                borderWidth: isSelected ? 2 : 1.5,
                borderColor: isSelected ? Colors.primary : Colors.border,
                ...Shadow.sm,
              }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>{opt.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '500', color: isSelected ? Colors.primary : Colors.textBase, flex: 1 }}>
                  {opt.label}
                </Text>
                {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
              </Pressable>
            );
          })}
        </View>

        <CustomButton
          label={isUploading ? 'Uploading…' : 'Upload Document'}
          onPress={handleUpload}
          disabled={!selectedFolder || success}
          loading={isUploading}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </View>
  );
}