/**
 * app/(user)/documents/[folder].tsx — Folder Document List
 * Shows all documents in a folder with status, file info, and upload CTA.
 */

import { useFolderDocuments } from '@/hooks/useFunding';
import type { Document } from '@/types/funding.types';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { Colors, Shadow } from '../../../theme';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  verified:       { label: 'Verified',        bg: Colors.successLight,  text: Colors.success,   icon: 'shield-checkmark' },
  pending_review: { label: 'In Review',        bg: Colors.warningLight,  text: Colors.warning,   icon: 'time' },
  rejected:       { label: 'Rejected',         bg: Colors.dangerLight,   text: Colors.danger,    icon: 'close-circle' },
  expired:        { label: 'Expired',          bg: Colors.dangerLight,   text: Colors.danger,    icon: 'alert-circle' },
  uploaded:       { label: 'Uploaded',         bg: Colors.primaryLight,  text: Colors.primary,   icon: 'cloud-done' },
};

const FILE_ICONS: Record<string, string> = { pdf: '📄', image: '🖼️', excel: '📊' };

function DocumentRow({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  const cfg = STATUS_CFG[doc.status] ?? STATUS_CFG.uploaded;
  const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date();

  return (
    <View style={{
      backgroundColor: Colors.white,
      borderRadius: 14, padding: 14, marginBottom: 10,
      borderWidth: 1,
      borderColor: doc.status === 'rejected' || isExpired ? Colors.danger + '40' : Colors.border,
      ...Shadow.sm,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* File type icon */}
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: Colors.surfaceAlt,
          alignItems: 'center', justifyContent: 'center',
          marginRight: 12, flexShrink: 0,
        }}>
          <Text style={{ fontSize: 22 }}>{FILE_ICONS[doc.fileType] ?? '📎'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textDark, flex: 1 }} numberOfLines={1}>
              {doc.title}
            </Text>
            {doc.isRequired && (
              <View style={{ backgroundColor: Colors.dangerLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginLeft: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.danger }}>REQUIRED</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 8 }}>
            {doc.fileName} · {doc.fileSize}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: cfg.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name={cfg.icon as any} size={10} color={cfg.text} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.text }}>{cfg.label}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, color: Colors.textMuted }}>
              {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
            </Text>
          </View>

          {doc.expiresAt && (
            <Text style={{ fontSize: 10, marginTop: 6, color: isExpired ? Colors.danger : Colors.warning, fontWeight: '600' }}>
              {isExpired ? '⚠️ Expired' : `⏳ Expires ${new Date(doc.expiresAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
            </Text>
          )}
        </View>
      </View>

      {/* Action row */}
      {doc.status === 'rejected' && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderMuted }}>
          <View style={{ flex: 1, backgroundColor: Colors.dangerLight, padding: 10, borderRadius: 10 }}>
            <Text style={{ fontSize: 12, color: Colors.danger, fontWeight: '500' }}>
              {doc.notes ?? 'Document was rejected. Please re-upload a clearer version.'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(user)/documents/upload')}
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Re-upload</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function FolderScreen() {
  const { folder: folderId } = useLocalSearchParams<{ folder: string }>();
  const { documents, isLoading, isUploading, upload, remove } = useFolderDocuments(folderId);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={{ backgroundColor: Colors.white, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginRight: 14 }}>
            <AntDesign name="arrow-left" size={22} color={Colors.textDark} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark }}>Document Folder</Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>{documents.length} documents uploaded</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(user)/documents/upload')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
          >
            {isUploading ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="cloud-upload" size={14} color={Colors.white} />}
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.white }}>Upload</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : documents.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48 }}>📂</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.textDark, marginTop: 16 }}>No documents yet</Text>
            <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Upload your documents here to share them securely with our experts.
            </Text>
            <Pressable
              onPress={() => router.push('/(user)/documents/upload')}
              style={{ marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.white }}>Upload First Document</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onDelete={remove} />
            ))}
            <Pressable
              onPress={() => router.push('/(user)/documents/upload')}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
                borderRadius: 14, paddingVertical: 16, marginTop: 4,
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary, marginLeft: 8 }}>Add More Documents</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}