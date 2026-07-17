import type { PdfDocumentSummary } from '@helsoft/types';

export type UsePdfDocumentsResult = {
  documents: PdfDocumentSummary[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  deleteDocument: (id: string) => Promise<void>;
};
