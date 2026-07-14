import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { LessonListItem } from '../../molecules/lesson-list-item/lesson-list-item';
import { Dialog } from '../dialog/dialog';

import type { LessonListProps } from './lesson-list.types';
import { useLessonList } from './use-lesson-list';

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;

/** testID for the Loading-state affordance (@s13). */
export const LESSON_LIST_LOADING_TEST_ID = 'lesson-list-loading-indicator';

/**
 * LessonList — presentational organism for Home saved lessons (Loading / Content / Empty / Error).
 * Prop-driven: receives pre-formatted labels; never calls `t` or formats dates.
 * Delete confirms via shared Dialog before calling `onDelete` (@s8/@s9).
 */
export const LessonList = ({
  state,
  lessons,
  labels,
  onOpenLesson,
  onRetry,
  onDelete,
  deleteLabel,
}: LessonListProps) => {
  const { pendingDeleteId, setPendingDeleteId } = useLessonList({
    state,
    loadingLabel: labels.loading,
    emptyLabel: labels.empty,
    errorLabel: labels.error,
  });

  if (state === 'loading') {
    return (
      <View testID={LESSON_LIST_LOADING_TEST_ID}>
        <ProgressIndicator
          variant="circular"
          size={LOADING_SPINNER_SIZE}
          thickness={LOADING_SPINNER_THICKNESS}
        />
        <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
          {labels.loading}
        </Text>
      </View>
    );
  }

  if (state === 'empty') {
    return (
      <View accessibilityRole="text" accessibilityLiveRegion="polite">
        <Text style={styles.emptyText}>{labels.empty}</Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View
        style={styles.errorBanner}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
      >
        <Text style={styles.errorText}>{labels.error}</Text>
        <Button variant="text" onPress={onRetry}>
          {labels.retry}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {lessons.map((lesson) => (
        <LessonListItem
          key={lesson.id}
          title={lesson.title}
          createdDateLabel={lesson.createdDateLabel}
          openAccessibilityLabel={lesson.openAccessibilityLabel}
          onOpen={() => onOpenLesson(lesson.id)}
          onDelete={onDelete ? () => setPendingDeleteId(lesson.id) : undefined}
          deleteAccessibilityLabel={lesson.deleteAccessibilityLabel ?? deleteLabel}
        />
      ))}
      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        headline={labels.deleteConfirmHeadline}
        confirmLabel={labels.deleteConfirmAction}
        cancelLabel={labels.deleteConfirmCancelAction}
        onConfirm={() => {
          const id = pendingDeleteId;
          setPendingDeleteId(null);
          if (id) onDelete?.(id);
        }}
      >
        {labels.deleteConfirmBody}
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s3,
  },
  emptyText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurfaceVariant,
  },
  errorBanner: {
    gap: theme.spacing.s3,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
  },
  errorText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onErrorContainer,
  },
  /** Off-screen but mounted — live-region for Android/Web (mirrors ApiKeyForm). */
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));
