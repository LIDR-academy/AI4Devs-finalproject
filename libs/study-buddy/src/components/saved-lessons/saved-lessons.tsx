import { LessonList } from '@helsoft/components';
import { useLessons } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { toLessonListItems, toLessonListState } from './saved-lessons.helpers';

/**
 * SavedLessons — Home wiring: useLessons + t()/date format → LessonList + reopen/delete.
 */
export const SavedLessons = () => {
  const { lessons, isLoading, error, refetch, deleteLesson } = useLessons();
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
          deleteConfirmHeadline: t('home.delete.confirmHeadline'),
          deleteConfirmBody: t('home.delete.confirmBody'),
          deleteConfirmAction: t('home.delete.confirmAction'),
          deleteConfirmCancelAction: t('home.delete.cancelAction'),
        }}
        onOpenLesson={(id) => {
          router.push({ pathname: '/lesson/[id]', params: { id } });
        }}
        onRetry={refetch}
        onDelete={(id) => {
          // SignOut pattern: swallow so a rethrown hook error never floats unhandled.
          void deleteLesson(id).catch(() => {});
        }}
      />
      {state === 'content' && error ? (
        <Text accessibilityLiveRegion="assertive" style={styles.deleteError}>
          {t('home.delete.failed')}
        </Text>
      ) : null}
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
  deleteError: {
    ...theme.typography.bodyMedium,
    color: theme.colors.error,
  },
}));
