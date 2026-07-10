import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function LoginScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('nav.logIn')}</Text>
      <Link href="/sign-up">
        <Text>{t('auth.toSignUp')}</Text>
      </Link>
    </ScreenContainer>
  );
}
