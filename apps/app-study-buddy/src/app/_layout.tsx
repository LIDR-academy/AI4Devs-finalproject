import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans';
import { MaterialSymbolsRounded_400Regular } from '@expo-google-fonts/material-symbols-rounded';
import { Sora_700Bold } from '@expo-google-fonts/sora';
import { useSession } from '@helsoft/hooks';
import { LocalizationProvider } from '@helsoft/localization';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Keys must match `fontFamily` tokens in `@helsoft/components` theme typography.
  const [fontsLoaded, fontError] = useFonts({
    'Material Symbols Rounded': MaterialSymbolsRounded_400Regular,
    Sora: Sora_700Bold,
    'IBM Plex Sans': IBMPlexSans_400Regular,
    'IBM Plex Mono': IBMPlexMono_400Regular,
  });

  // The app is the only place that reads the native device locale; the shared,
  // platform-agnostic lib resolves it to a supported locale.
  const deviceLocale = getLocales()[0]?.languageTag;

  if (!fontsLoaded && !fontError) return null;

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
