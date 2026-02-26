/**
 * app/(user)/profile/index.tsx — Stub (Phase 5)
 */
import { useAuth } from '@/hooks/useAuth';
import { Pressable, Text, View } from 'react-native';
import { Colors } from '../../../theme';
export default function ProfileScreen() {
  const { logout, user } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.white }}>{user?.name?.[0] ?? 'U'}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.textDark }}>{user?.name ?? 'Your Profile'}</Text>
      <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 4 }}>+91 {user?.mobile}</Text>
      <Pressable
        onPress={logout}
        style={{ marginTop: 32, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.danger }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.danger }}>Sign Out</Text>
      </Pressable>
    </View>
  );
}