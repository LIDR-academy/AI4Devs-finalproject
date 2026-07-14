import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { IconButton } from '../../atoms/icon-button/icon-button';

import type { LessonListItemProps } from './lesson-list-item.types';

/**
 * LessonListItem — molecule for one saved-lesson row (title + created date + open).
 * Optional delete stays additive for task-6.
 */
export const LessonListItem = ({
  title,
  createdDateLabel,
  onOpen,
  openAccessibilityLabel,
  onDelete,
  deleteAccessibilityLabel,
}: LessonListItemProps) => (
  <View style={styles.row}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={openAccessibilityLabel}
      onPress={onOpen}
      style={styles.open}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{createdDateLabel}</Text>
    </Pressable>
    {onDelete && deleteAccessibilityLabel ? (
      <IconButton icon="delete" onPress={onDelete} accessibilityLabel={deleteAccessibilityLabel} />
    ) : null}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s3,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shape.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  open: {
    flex: 1,
    gap: theme.spacing.s1,
  },
  title: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurface,
  },
  date: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
