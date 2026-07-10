import { ScreenContainer } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { SignOut } from '@helsoft/study-buddy';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function HomeScreen() {
  const { t } = useLocalization();

  return (
    <ScreenContainer>
      <Text>{t('home.savedLessons')}</Text>
      <Text>{t('lessons.count', { count: 0 })}</Text>
      <Link href="/upload">
        <Text>{t('nav.newLesson')}</Text>
      </Link>
      <Link href="/settings">
        <Text>{t('nav.settings')}</Text>
      </Link>
      <Link href={{ pathname: '/lesson/[id]', params: { id: 'demo' } }}>
        <Text>{t('home.openDemo')}</Text>
      </Link>
      <SignOut />
    </ScreenContainer>
  );
}
