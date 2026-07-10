import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('player.intro', { id })}</Text>
      <Link href={{ pathname: '/lesson/[id]/results', params: { id } }} replace>
        <Text>{t('player.finish')}</Text>
      </Link>
    </ScreenContainer>
  );
}
