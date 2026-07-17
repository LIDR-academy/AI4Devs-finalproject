// Mirrors libs/services/src/pdf-extraction/extraction-failure-detection.ts — kept manually in
// sync (task-3/task-9 note). Plain types only; no Deno-specific globals.

import type { ExtractedPageText } from './pdf-extraction-adapter.ts';
import type { PdfExtractionErrorCode, PdfExtractionLimits } from './types.ts';

export type DetectExtractionFailureInput = {
  pages: ExtractedPageText[];
};

export const detectExtractionFailure = (
  { pages }: DetectExtractionFailureInput,
  limits: PdfExtractionLimits,
  minScannedTextLength: number,
): PdfExtractionErrorCode | null => {
  if (pages.length > limits.maxPages) return 'too_many_pages';

  const totalTextLength = pages.reduce((total, page) => total + page.text.length, 0);
  if (totalTextLength < minScannedTextLength) return 'scanned_or_image_only';

  return null;
};
