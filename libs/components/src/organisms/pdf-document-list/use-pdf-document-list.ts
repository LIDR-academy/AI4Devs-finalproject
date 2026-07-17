import { useLocalization } from '@helsoft/localization';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import type { PdfDocumentListState } from './pdf-document-list.types';

type UsePdfDocumentListArgs = {
  state: PdfDocumentListState;
};

/**
 * Announces Loading / Empty / Error to assistive tech (WCAG 4.1.3 / @s21) and owns the
 * delete-confirmation Dialog open state (pending document id).
 */
export const usePdfDocumentList = ({ state }: UsePdfDocumentListArgs) => {
  const { t } = useLocalization();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (state === 'loading') {
      AccessibilityInfo.announceForAccessibility(t('pdfList.loading'));
    } else if (state === 'empty') {
      AccessibilityInfo.announceForAccessibility(t('pdfList.empty'));
    } else if (state === 'error') {
      AccessibilityInfo.announceForAccessibility(t('pdfList.error'));
    }
  }, [state, t]);

  return { pendingDeleteId, setPendingDeleteId };
};
