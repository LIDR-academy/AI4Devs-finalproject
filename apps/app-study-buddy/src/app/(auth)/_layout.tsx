import { Stack } from 'expo-router';
import { useLocalization } from '@helsoft/localization';

export default function AuthLayout() {
  const { t } = useLocalization();

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: t('nav.logIn') }} />
      <Stack.Screen name="sign-up" options={{ title: t('nav.signUp') }} />
    </Stack>
  );
}
