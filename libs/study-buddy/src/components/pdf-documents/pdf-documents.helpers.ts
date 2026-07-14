import type { PdfDocumentListItemData, PdfDocumentListState } from '@helsoft/components';
import type { PdfDocumentStatus, PdfDocumentSummary } from '@helsoft/types';

/** Maps usePdfDocuments flags → PdfDocumentList state (@s14/@s15/@s16). */
export const toPdfDocumentListState = (
  isLoading: boolean,
  error: Error | null,
  documentCount: number,
): PdfDocumentListState => {
  if (isLoading) return 'loading';
  // Load Error only when the list is gone. Delete failures keep docs — stay Content.
  if (error && documentCount === 0) return 'error';
  if (documentCount === 0) return 'empty';
  return 'content';
};

/** Locale-aware medium date for a document createdAt ISO string. */
export const formatPdfDocumentCreatedDate = (iso: string, locale: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
};

const STATUS_LABEL_KEYS: Record<PdfDocumentStatus, string> = {
  ready: 'pdfList.status.ready',
  failed: 'pdfList.status.failed',
  generated: 'pdfList.status.generated',
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Maps PdfDocumentSummary[] → PdfDocumentList item props with resolved labels. */
export const toPdfDocumentListItems = (
  documents: PdfDocumentSummary[],
  locale: string,
  t: Translate,
): PdfDocumentListItemData[] =>
  documents.map((doc) => {
    const date = formatPdfDocumentCreatedDate(doc.createdAt, locale);
    const item: PdfDocumentListItemData = {
      id: doc.id,
      filename: doc.filename,
      status: doc.status,
      statusLabel: t(STATUS_LABEL_KEYS[doc.status]),
      createdDateLabel: t('pdfList.createdDate', { date }),
      pageCountLabel: t('pdfList.pageCount', { count: doc.pageCount ?? 0 }),
      generateLabel: t('pdfList.action.generate'),
      retryLabel: t('pdfList.action.retry'),
      openLessonLabel: t('pdfList.action.openLesson'),
      generateAccessibilityLabel: t('pdfList.action.generateA11y', { filename: doc.filename }),
      retryAccessibilityLabel: t('pdfList.action.retryA11y', { filename: doc.filename }),
      openLessonAccessibilityLabel: t('pdfList.action.openLessonA11y', {
        filename: doc.filename,
      }),
    };
    // @s11 — delete only for lesson-less rows.
    if (doc.status !== 'generated') {
      item.deleteAccessibilityLabel = t('pdfList.delete.action', { filename: doc.filename });
    }
    return item;
  });
