import { PdfDocumentList } from '@helsoft/components';
import { usePdfDocuments } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { toPdfDocumentListItems, toPdfDocumentListState } from './pdf-documents.helpers';
import type { PdfDocumentsProps } from './pdf-documents.types';

/**
 * PdfDocuments — upload-screen wiring: usePdfDocuments + t()/date format → PdfDocumentList.
 * Raises onGenerate/onOpenLesson to the screen; delete stays in the hook (@s5/@s6/@s7/@s11–@s13).
 */
export const PdfDocuments = ({ onGenerate, onOpenLesson, reloadToken }: PdfDocumentsProps) => {
  const { documents, isLoading, error, refetch, deleteDocument } = usePdfDocuments();
  const { t, locale } = useLocalization();

  const state = toPdfDocumentListState(isLoading, error, documents.length);
  const items = useMemo(() => toPdfDocumentListItems(documents, locale, t), [documents, locale, t]);
  const deleteFailedLabel = t('pdfList.delete.failed');

  // Skip the initial mount — usePdfDocuments already loads once. Refetch only on later bumps.
  const isFirstTokenEffect = useRef(true);
  useEffect(() => {
    if (isFirstTokenEffect.current) {
      isFirstTokenEffect.current = false;
      return;
    }
    // reloadToken is the intentional trigger (screen bumps on extract/generate).
    if (reloadToken === undefined) return;
    refetch();
  }, [reloadToken, refetch]);

  const handleOpenLesson = useCallback(
    (documentId: string) => {
      const lessonId = documents.find((doc) => doc.id === documentId)?.lessonId?.trim();
      if (!lessonId) return;
      onOpenLesson(lessonId);
    },
    [documents, onOpenLesson],
  );

  const handleDelete = useCallback(
    (id: string) => {
      // SignOut pattern: swallow so a rethrown hook error never floats unhandled.
      void deleteDocument(id).catch(() => {});
    },
    [deleteDocument],
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
        {t('pdfList.heading')}
      </Text>
      <PdfDocumentList
        state={state}
        documents={items}
        onGenerate={onGenerate}
        onOpenLesson={handleOpenLesson}
        onRetry={refetch}
        onDelete={handleDelete}
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
  deleteError: {
    ...theme.typography.bodyMedium,
    color: theme.colors.error,
  },
}));
