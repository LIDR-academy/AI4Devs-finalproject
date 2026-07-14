import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { LessonListItem } from '../../molecules/lesson-list-item/lesson-list-item';
import { Dialog } from '../dialog/dialog';

import type { LessonListItemData, LessonListProps } from './lesson-list.types';
import { useLessonList } from './use-lesson-list';

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;

/** testID for the Loading-state affordance (@s13). */
export const LESSON_LIST_LOADING_TEST_ID = 'lesson-list-loading-indicator';

/** testID for the virtualized content list (full-review perf). */
export const LESSON_LIST_TEST_ID = 'lesson-list';

/**
 * LessonList — presentational organism for Home saved lessons (Loading / Content / Empty / Error).
 * Prop-driven: receives pre-formatted labels; never calls `t` or formats dates.
 * Delete confirms via shared Dialog before calling `onDelete` (@s8/@s9).
 * Content uses FlatList so unbounded @s4 lists stay windowed.
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

  const keyExtractor = useCallback((item: LessonListItemData) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: LessonListItemData }) => (
      <LessonListItem
        title={item.title}
        createdDateLabel={item.createdDateLabel}
        openAccessibilityLabel={item.openAccessibilityLabel}
        onOpen={() => onOpenLesson(item.id)}
        onDelete={onDelete ? () => setPendingDeleteId(item.id) : undefined}
        deleteAccessibilityLabel={item.deleteAccessibilityLabel ?? deleteLabel}
      />
    ),
    [onOpenLesson, onDelete, setPendingDeleteId, deleteLabel],
  );

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
      <FlatList
        testID={LESSON_LIST_TEST_ID}
        data={lessons}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      {onDelete ? (
        <Dialog
          open={pendingDeleteId !== null}
          onClose={() => setPendingDeleteId(null)}
          headline={labels.deleteConfirmHeadline}
          confirmLabel={labels.deleteConfirmAction}
          cancelLabel={labels.deleteConfirmCancelAction}
          onConfirm={() => {
            const id = pendingDeleteId;
            setPendingDeleteId(null);
            if (id) onDelete(id);
          }}
        >
          {labels.deleteConfirmBody}
        </Dialog>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    gap: theme.spacing.s3,
  },
  list: {
    flex: 1,
  },
  listContent: {
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
