import { useLocalization } from '@helsoft/localization';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { PdfDocumentListItem } from '../../molecules/pdf-document-list-item/pdf-document-list-item';
import { Dialog } from '../dialog/dialog';
import type { PdfDocumentListItemData, PdfDocumentListProps } from './pdf-document-list.types';
import { usePdfDocumentList } from './use-pdf-document-list';

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;

/** testID for the Loading-state affordance (@s15). */
export const PDF_DOCUMENT_LIST_LOADING_TEST_ID = 'pdf-document-list-loading-indicator';

/** testID for the virtualized content list. */
export const PDF_DOCUMENT_LIST_TEST_ID = 'pdf-document-list';

/**
 * PdfDocumentList — presentational organism for the upload-screen PDF list
 * (Loading / Content / Empty / Error). Prop-driven row copy; state copy via `t`.
 * Delete confirms via shared Dialog before calling `onDelete` (@s12/@s13).
 */
export const PdfDocumentList = ({
  state,
  documents,
  onGenerate,
  onOpenLesson,
  onRetry,
  onDelete,
}: PdfDocumentListProps) => {
  const { t } = useLocalization();
  const { pendingDeleteId, setPendingDeleteId } = usePdfDocumentList({ state });

  const keyExtractor = useCallback((item: PdfDocumentListItemData) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: PdfDocumentListItemData }) => (
      <PdfDocumentListItem
        filename={item.filename}
        status={item.status}
        statusLabel={item.statusLabel}
        createdDateLabel={item.createdDateLabel}
        pageCountLabel={item.pageCountLabel}
        generateLabel={item.generateLabel}
        retryLabel={item.retryLabel}
        openLessonLabel={item.openLessonLabel}
        generateAccessibilityLabel={item.generateAccessibilityLabel}
        retryAccessibilityLabel={item.retryAccessibilityLabel}
        openLessonAccessibilityLabel={item.openLessonAccessibilityLabel}
        onGenerate={() => onGenerate(item.id)}
        onOpenLesson={() => onOpenLesson(item.id)}
        onDelete={
          onDelete && item.deleteAccessibilityLabel ? () => setPendingDeleteId(item.id) : undefined
        }
        deleteAccessibilityLabel={item.deleteAccessibilityLabel}
      />
    ),
    [onGenerate, onOpenLesson, onDelete, setPendingDeleteId],
  );

  if (state === 'loading') {
    return (
      <View testID={PDF_DOCUMENT_LIST_LOADING_TEST_ID}>
        <ProgressIndicator
          variant="circular"
          size={LOADING_SPINNER_SIZE}
          thickness={LOADING_SPINNER_THICKNESS}
        />
        <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
          {t('pdfList.loading')}
        </Text>
      </View>
    );
  }

  if (state === 'empty') {
    return (
      <View accessibilityRole="text" accessibilityLiveRegion="polite">
        <Text style={styles.emptyText}>{t('pdfList.empty')}</Text>
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
        <Text style={styles.errorText}>{t('pdfList.error')}</Text>
        <Button variant="text" onPress={onRetry}>
          {t('pdfList.retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        testID={PDF_DOCUMENT_LIST_TEST_ID}
        data={documents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      {onDelete ? (
        <Dialog
          open={pendingDeleteId !== null}
          onClose={() => setPendingDeleteId(null)}
          headline={t('pdfList.delete.confirmHeadline')}
          confirmLabel={t('pdfList.delete.confirmAction')}
          cancelLabel={t('pdfList.delete.cancelAction')}
          onConfirm={() => {
            const id = pendingDeleteId;
            setPendingDeleteId(null);
            if (id) onDelete(id);
          }}
        >
          {t('pdfList.delete.confirmBody')}
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
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));
