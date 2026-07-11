import { Stack } from 'expo-router';
import { ApiKeyProvider } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';

export default function AppLayout() {
  const { t } = useLocalization();

  // ApiKeyProvider shares one useApiKey()-backed status across every screen in this group
  // (Settings and Upload both read it) instead of each screen issuing its own redundant
  // getApiKeyStatus() read when expo-router keeps both mounted in one session (Full-review
  // Round 1, Minor 14).
  return (
    <ApiKeyProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('nav.myLessons') }} />
        <Stack.Screen name="upload" options={{ title: t('nav.newLesson') }} />
        <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
        <Stack.Screen name="lesson/[id]/index" options={{ title: t('nav.lesson') }} />
        <Stack.Screen name="lesson/[id]/player" options={{ title: t('nav.study') }} />
        <Stack.Screen name="lesson/[id]/results" options={{ title: t('nav.results') }} />
      </Stack>
    </ApiKeyProvider>
  );
}
