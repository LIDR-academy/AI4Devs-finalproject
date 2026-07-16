import { useLocalization } from '@helsoft/localization';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { IconButton } from '../../atoms/icon-button/icon-button';
import { layout } from '../../theme/spacing';

import {
  formatPdfDocumentCreatedDate,
  PDF_DOCUMENT_STATUS_LABEL_KEYS,
} from './pdf-document-list-item.helpers';
import type { PdfDocumentListItemProps } from './pdf-document-list-item.types';

/**
 * PdfDocumentListItem — molecule for one PDF-list row (filename/status/date/pages + action).
 * Owns i18n via t(); status maps to Generate / Retry / Open lesson. Delete only when no lesson.
 */
export const PdfDocumentListItem = ({
  filename,
  status,
  createdAt,
  pageCount,
  onGenerate,
  onOpenLesson,
  onDelete,
}: PdfDocumentListItemProps) => {
  const { t, locale } = useLocalization();
  const isGenerated = status === 'generated';
  const statusLabel = t(PDF_DOCUMENT_STATUS_LABEL_KEYS[status]);
  const createdDateLabel = t('pdfList.createdDate', {
    date: formatPdfDocumentCreatedDate(createdAt, locale),
  });
  const pageCountLabel = t('pdfList.pageCount', { count: pageCount ?? 0 });
  const actionLabel =
    status === 'ready'
      ? t('pdfList.action.generate')
      : status === 'failed'
        ? t('pdfList.action.retry')
        : t('pdfList.action.openLesson');
  const actionAccessibilityLabel =
    status === 'ready'
      ? t('pdfList.action.generateA11y', { filename })
      : status === 'failed'
        ? t('pdfList.action.retryA11y', { filename })
        : t('pdfList.action.openLessonA11y', { filename });
  const onAction = isGenerated ? onOpenLesson : onGenerate;
  const showDelete = !isGenerated && onDelete;

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
          style={styles.actionButton}
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
            accessibilityLabel={t('pdfList.delete.action', { filename })}
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
  actionButton: {
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
}));
