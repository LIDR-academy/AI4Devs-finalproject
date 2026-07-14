import { LessonList } from '@helsoft/components';
import { useLessons } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
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
  const items = useMemo(() => toLessonListItems(lessons, locale, t), [lessons, locale, t]);
  const deleteFailedLabel = t('home.delete.failed');

  const labels = useMemo(
    () => ({
      loading: t('home.loading'),
      empty: t('home.empty'),
      error: t('home.error'),
      retry: t('home.retry'),
      deleteConfirmHeadline: t('home.delete.confirmHeadline'),
      deleteConfirmBody: t('home.delete.confirmBody'),
      deleteConfirmAction: t('home.delete.confirmAction'),
      deleteConfirmCancelAction: t('home.delete.cancelAction'),
    }),
    [t],
  );

  const onOpenLesson = useCallback(
    (id: string) => {
      router.push({ pathname: '/lesson/[id]', params: { id } });
    },
    [router],
  );

  const onDelete = useCallback(
    (id: string) => {
      // SignOut pattern: swallow so a rethrown hook error never floats unhandled.
      void deleteLesson(id).catch(() => {});
    },
    [deleteLesson],
  );

  // accessibilityLiveRegion covers Android/Web; iOS needs announceForAccessibility (WCAG 4.1.3).
  useEffect(() => {
    if (state === 'content' && error) {
      AccessibilityInfo.announceForAccessibility(deleteFailedLabel);
    }
  }, [state, error, deleteFailedLabel]);

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
        labels={labels}
        onOpenLesson={onOpenLesson}
        onRetry={refetch}
        onDelete={onDelete}
      />
      {state === 'content' && error ? (
        <Text accessibilityLiveRegion="assertive" style={styles.deleteError}>
          {deleteFailedLabel}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
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
