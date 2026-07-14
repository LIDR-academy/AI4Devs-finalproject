import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { SavedLessons } from '@helsoft/study-buddy';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function HomeScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer style={{ gap: 10, padding: 20 }}>
      <SavedLessons />
      <Link href="/upload">
        <Text>{t('nav.newLesson')}</Text>
      </Link>
      <Link href="/settings">
        <Text>{t('nav.settings')}</Text>
      </Link>
    </ScreenContainer>
  );
}
