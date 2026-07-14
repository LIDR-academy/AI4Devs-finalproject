import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { IconButton } from '../../atoms/icon-button/icon-button';
import { layout } from '../../theme/spacing';

import type { PdfDocumentListItemProps } from './pdf-document-list-item.types';

/**
 * PdfDocumentListItem — molecule for one PDF-list row (filename/status/date/pages + action).
 * Prop-driven copy; status maps to Generate / Retry / Open lesson. Delete only when no lesson.
 */
export const PdfDocumentListItem = ({
  filename,
  status,
  statusLabel,
  createdDateLabel,
  pageCountLabel,
  generateLabel,
  retryLabel,
  openLessonLabel,
  generateAccessibilityLabel,
  retryAccessibilityLabel,
  openLessonAccessibilityLabel,
  onGenerate,
  onOpenLesson,
  onDelete,
  deleteAccessibilityLabel,
}: PdfDocumentListItemProps) => {
  const isGenerated = status === 'generated';
  const actionLabel =
    status === 'ready' ? generateLabel : status === 'failed' ? retryLabel : openLessonLabel;
  const actionAccessibilityLabel =
    status === 'ready'
      ? generateAccessibilityLabel
      : status === 'failed'
        ? retryAccessibilityLabel
        : openLessonAccessibilityLabel;
  const onAction = isGenerated ? onOpenLesson : onGenerate;
  const showDelete = !isGenerated && onDelete && deleteAccessibilityLabel;

  return (
    <View style={styles.row}>
      <View style={styles.info} accessible accessibilityLabel={`${filename}, ${statusLabel}`}>
        <Text style={styles.filename}>{filename}</Text>
        <Text style={styles.meta}>{statusLabel}</Text>
        <Text style={styles.meta}>{createdDateLabel}</Text>
        <Text style={styles.meta}>{pageCountLabel}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          variant="tonal"
          size="small"
          onPress={onAction}
          accessibilityLabel={actionAccessibilityLabel}
        >
          {actionLabel}
        </Button>
        {showDelete ? (
          <IconButton
            icon="delete"
            size={layout.touchTarget}
            onPress={onDelete}
            accessibilityLabel={deleteAccessibilityLabel}
          />
        ) : null}
      </View>
    </View>
  );
};

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
  info: {
    flex: 1,
    gap: theme.spacing.s1,
  },
  filename: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurface,
  },
  meta: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
}));
