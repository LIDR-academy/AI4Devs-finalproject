import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { getLocales } from 'expo-localization';
import { useColorScheme } from 'react-native';
import { useSession } from '@helsoft/hooks';
import { LocalizationProvider } from '@helsoft/localization';

import '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // The app is the only place that reads the native device locale; the shared,
  // platform-agnostic lib resolves it to a supported locale.
  const deviceLocale = getLocales()[0]?.languageTag;

  return (
    <LocalizationProvider deviceLocale={deviceLocale}>
      <RootNavigator />
    </LocalizationProvider>
  );
}

function RootNavigator() {
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
