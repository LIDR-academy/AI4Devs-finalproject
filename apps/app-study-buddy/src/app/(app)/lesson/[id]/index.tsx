import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('lesson.title', { id })}</Text>
      <Link href={{ pathname: '/lesson/[id]/player', params: { id } }}>
        <Text>{t('lesson.start')}</Text>
      </Link>
      <Link href={{ pathname: '/lesson/[id]/results', params: { id } }}>
        <Text>{t('lesson.viewResults')}</Text>
      </Link>
    </ScreenContainer>
  );
}
