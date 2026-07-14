import type { PdfDocumentListItemData, PdfDocumentListState } from '@helsoft/components';
import type { PdfDocumentSummary } from '@helsoft/types';

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

/** Maps PdfDocumentSummary[] → PdfDocumentList item data (molecule owns labels). */
export const toPdfDocumentListItems = (
  documents: PdfDocumentSummary[],
): PdfDocumentListItemData[] =>
  documents.map((doc) => ({
    id: doc.id,
    filename: doc.filename,
    status: doc.status,
    createdAt: doc.createdAt,
    pageCount: doc.pageCount,
  }));
