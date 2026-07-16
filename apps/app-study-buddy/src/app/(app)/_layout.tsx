import { ApiKeyProvider, EntitlementsProvider } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { AppChrome } from '@helsoft/study-buddy';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { t } = useLocalization();

  // ApiKeyProvider + EntitlementsProvider: one shared key-status and one profile→plans
  // flags fetch for the authenticated shell (Settings, Upload, …).
  return (
    <ApiKeyProvider>
      <EntitlementsProvider>
        <AppChrome />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: t('nav.myLessons') }} />
          <Stack.Screen name="upload" options={{ title: t('nav.newLesson') }} />
          <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
          <Stack.Screen name="lesson/[id]/index" options={{ title: t('nav.lesson') }} />
          <Stack.Screen name="lesson/[id]/player" options={{ title: t('nav.study') }} />
          <Stack.Screen name="lesson/[id]/results" options={{ title: t('nav.results') }} />
        </Stack>
      </EntitlementsProvider>
    </ApiKeyProvider>
  );
}
