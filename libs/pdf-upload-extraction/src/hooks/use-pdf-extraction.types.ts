import type {
  PdfExtractionErrorCode,
  PdfExtractionInput,
  PdfExtractionResult,
} from '../types/pdf-extraction.types';

export type PdfExtractionStage = 'idle' | 'processing' | 'success' | 'error';

export type UsePdfExtractionResult = {
  extract: (input: PdfExtractionInput) => Promise<void>;
  stage: PdfExtractionStage;
  result: PdfExtractionResult | null;
  /** The normalized code from the most recent failed extract()/retry() — null once it succeeds. */
  error: PdfExtractionErrorCode | null;
  /** Re-invokes the last extraction with the exact same input and documentId (@s13) — a no-op
   * before any extract() attempt. Reusing the documentId avoids a duplicate orphaned row
   * (task-12/task-9's failure cleanup). */
  retry: () => Promise<void>;
};
