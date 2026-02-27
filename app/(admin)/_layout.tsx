/**
 * app/admin/_layout.tsx — Admin Route Group
 *
 * Guards the /admin/* routes — anyone without role === 'admin'
 * is immediately redirected to the user home screen.
 *
 * In production this check should also be enforced server-side
 * (API returns 403 for non-admin tokens).
 */

import { useAuth } from '@/hooks/useAuth';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Colors } from '../../theme';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      // Not an admin — redirect to user home
      router.replace('/(user)/home');
    }
  }, [user, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/[id]" />
      <Stack.Screen name="services/index" />
      <Stack.Screen name="broadcast/index" />
    </Stack>
  );
}