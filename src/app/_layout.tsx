import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const isPublicRoute = inAuthGroup
      || segments[0] === 'privacy'
      || segments[0] === 'support'
      || segments[0] === 'reset-password';
    if (!session && !isPublicRoute) router.replace('/login');
    if (session && inAuthGroup) router.replace('/(tabs)');
  }, [loading, router, segments, session]);

  if (loading) return <LoadingState label="Opening NetworkLoop…" />;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="settings/delete-account" options={{ title: 'Delete account' }} />
      <Stack.Screen name="contact/new" options={{ title: 'New contact', presentation: 'modal' }} />
      <Stack.Screen name="contact/[id]/index" options={{ title: 'Contact' }} />
      <Stack.Screen name="contact/[id]/edit" options={{ title: 'Edit contact', presentation: 'modal' }} />
      <Stack.Screen
        name="contact/[id]/conversation"
        options={{
          title: 'Add conversation',
          presentation: 'modal',
          headerRight: () => <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
