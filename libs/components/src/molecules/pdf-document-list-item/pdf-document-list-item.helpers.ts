import type { PdfDocumentStatus } from '@helsoft/types';

/** Locale-aware medium date for a document createdAt ISO string. */
export const formatPdfDocumentCreatedDate = (iso: string, locale: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
};

/** Maps status → translation key (resolved with t() at the usage site). */
export const PDF_DOCUMENT_STATUS_LABEL_KEYS: Record<PdfDocumentStatus, string> = {
  ready: 'pdfList.status.ready',
  failed: 'pdfList.status.failed',
  generated: 'pdfList.status.generated',
};
