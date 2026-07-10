import { Stack } from 'expo-router';
import { useLocalization } from '@helsoft/localization';

export default function AppLayout() {
  const { t } = useLocalization();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('nav.myLessons') }} />
      <Stack.Screen name="upload" options={{ title: t('nav.newLesson') }} />
      <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
      <Stack.Screen name="lesson/[id]/index" options={{ title: t('nav.lesson') }} />
      <Stack.Screen name="lesson/[id]/player" options={{ title: t('nav.study') }} />
      <Stack.Screen name="lesson/[id]/results" options={{ title: t('nav.results') }} />
    </Stack>
  );
}
