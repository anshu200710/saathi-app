/**
 * app/(user)/compliance/index.tsx — Stub (Phase 4)
 */
import { Text, View } from 'react-native';
import { Colors } from '../../../theme';
export default function ComplianceScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 32 }}>📋</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textDark, marginTop: 12 }}>Compliance</Text>
      <Text style={{ fontSize: 13, color: Colors.textMuted, marginTop: 6 }}>Coming in Phase 4</Text>
    </View>
  );
}