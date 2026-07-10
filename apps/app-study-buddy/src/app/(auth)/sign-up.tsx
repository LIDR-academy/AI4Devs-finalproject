import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function SignUpScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('nav.signUp')}</Text>
      <Link href="/login">
        <Text>{t('auth.toLogIn')}</Text>
      </Link>
    </ScreenContainer>
  );
}
