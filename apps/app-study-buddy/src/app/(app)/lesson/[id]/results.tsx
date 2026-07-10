import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('results.summary', { id })}</Text>
      <Link href={{ pathname: '/lesson/[id]/player', params: { id } }} replace>
        <Text>{t('results.retake')}</Text>
      </Link>
      <Link href="/" replace>
        <Text>{t('results.backHome')}</Text>
      </Link>
    </ScreenContainer>
  );
}
