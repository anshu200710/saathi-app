/**
 * app/(user)/_layout.tsx — Bottom Tab Navigator
 *
 * Custom tab bar with:
 *  • Floating pill indicator on active tab
 *  • Animated icon scale on press
 *  • Notification badge support
 *  • Safe area aware
 *
 * Tabs: Home | Services | Funding | Compliance | Profile
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { Colors } from '../../theme';

type TabIconProps = {
  name: string;
  focused: boolean;
  label: string;
  badge?: number;
};

function TabIcon({ name, focused, label, badge }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <View style={{ position: 'relative' }}>
        <Ionicons
          name={name as any}
          size={23}
          color={focused ? Colors.primary : Colors.textMuted}
        />
        {/* Notification badge */}
        {badge !== undefined && badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              backgroundColor: Colors.danger,
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
              borderWidth: 1.5,
              borderColor: Colors.white,
            }}
          >
            <Text style={{ fontSize: 9, color: 'white', fontWeight: '800' }}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 10,
          marginTop: 3,
          fontWeight: focused ? '700' : '500',
          color: focused ? Colors.primary : Colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.07,
          shadowRadius: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              label="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'grid' : 'grid-outline'}
              focused={focused}
              label="Services"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="funding/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'cash' : 'cash-outline'}
              focused={focused}
              label="Funding"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="compliance/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              focused={focused}
              label="Comply"
              badge={1}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              focused={focused}
              label="Profile"
            />
          ),
        }}
      />
      {/* Hidden routes — accessible via router.push, not tab bar */}
      <Tabs.Screen name="services/[id]" options={{ href: null }} />
      <Tabs.Screen name="funding/[id]" options={{ href: null }} />
      <Tabs.Screen name="funding/eligibility/index" options={{ href: null }} />
      <Tabs.Screen name="funding/eligibility/result" options={{ href: null }} />
      <Tabs.Screen name="documents/index" options={{ href: null }} />
      <Tabs.Screen name="documents/upload" options={{ href: null }} />
      <Tabs.Screen name="documents/[folder]" options={{ href: null }} />
      <Tabs.Screen name="tools/index" options={{ href: null }} />
      <Tabs.Screen name="tools/gst-calculator" options={{ href: null }} />
      <Tabs.Screen name="tools/income-tax" options={{ href: null }} />
      <Tabs.Screen name="tools/agreement-generator" options={{ href: null }} />
      <Tabs.Screen name="tools/invoice-generator" options={{ href: null }} />
      <Tabs.Screen name="tools/trademark-search" options={{ href: null }} />
      <Tabs.Screen name="tools/compliance-health" options={{ href: null }} />
      <Tabs.Screen name="plans/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="support/index" options={{ href: null }} />
    </Tabs>
  );
}