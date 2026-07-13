import { useLocalization } from '@helsoft/localization';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { t } = useLocalization();

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: t('nav.logIn') }} />
      <Stack.Screen name="sign-up" options={{ title: t('nav.signUp') }} />
    </Stack>
  );
}
