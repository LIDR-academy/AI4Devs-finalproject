import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useSession } from '@helsoft/hooks';

import '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync().catch(() => {});
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
