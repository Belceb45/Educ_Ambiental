import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/constants/i18n'; // Import i18n configuration
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const publicAuthRoutes = ['about', 'contact', 'terms', 'faq'];
    const isPublicRoute = inAuthGroup && publicAuthRoutes.includes(segments[1] as string);

    if (!user) {
      if (!inAuthGroup) {
        // Not logged in and trying to access private routes
        console.log('Redirecting to login: User is null and not in auth group');
        router.replace('/(auth)/login');
      }
    } else {
      if (inAuthGroup && !isPublicRoute) {
        // Logged in and trying to access login/register
        console.log('Redirecting to home: User is authenticated and trying to access auth routes');
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
