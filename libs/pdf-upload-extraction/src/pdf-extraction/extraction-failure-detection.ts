import type { PdfExtractionErrorCode, PdfExtractionLimits } from '../types/pdf-extraction.types';
import type { ExtractedPageText } from './pdf-extraction-adapter.types';

type DetectExtractionFailureInput = {
  pages: ExtractedPageText[];
};

/**
 * Runs the server-side structural/content guards over a document that has already been parsed
 * successfully — a parse failure never reaches this function (that becomes
 * `corrupt_or_unreadable` at the orchestration's own parse step, @s12). Checks the page-count
 * ceiling (a hard structural limit, @s11) before the scanned-content heuristic (@s8), so a
 * document violating both is reported as the structural failure. Pure, Jest-testable TypeScript
 * (task-3/task-9 sandbox adaptation) — mirrored into
 * `supabase/functions/extract-pdf/_shared/` as the real Deno deployment source.
 */
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
