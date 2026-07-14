import { LessonList } from '@helsoft/components';
import { useLessons } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { toLessonListItems, toLessonListState } from './saved-lessons.helpers';

/**
 * SavedLessons — Home wiring: useLessons + t()/date format → LessonList + reopen nav.
 */
export const SavedLessons = () => {
  const { lessons, isLoading, error, refetch } = useLessons();
  const { t, locale } = useLocalization();
  const router = useRouter();

  const state = toLessonListState(isLoading, error, lessons.length);
  const items = toLessonListItems(lessons, locale, t);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('home.savedLessons')}
      </Text>
      {state === 'content' ? (
        <Text style={styles.count}>{t('lessons.count', { count: lessons.length })}</Text>
      ) : null}
      <LessonList
        state={state}
        lessons={items}
        labels={{
          loading: t('home.loading'),
          empty: t('home.empty'),
          error: t('home.error'),
          retry: t('home.retry'),
        }}
        onOpenLesson={(id) => {
          router.push({ pathname: '/lesson/[id]', params: { id } });
        }}
        onRetry={refetch}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s3,
  },
  heading: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
  },
  count: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
