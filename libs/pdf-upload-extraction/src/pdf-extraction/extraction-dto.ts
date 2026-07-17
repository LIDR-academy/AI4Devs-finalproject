import type { ExtractedImageRef, PdfExtractionResult } from '../types/pdf-extraction.types';

type BuildPdfExtractionResultInput = {
  documentId: string;
  filename: string;
  pages: { page: number; text: string }[];
  images: ExtractedImageRef[];
};

/**
 * Shapes the extraction orchestration's raw pieces (document identity, ordered page text,
 * persisted image references) into the typed `PdfExtractionResult` the client receives
 * (@s1/@s2/@s3) — `pageCount`/`imageCount` are derived here rather than trusted from a
 * separately-passed-in count, so they can never drift from the actual arrays. Pure,
 * Jest-testable TypeScript (task-3 sandbox adaptation) — mirrored into
 * `supabase/functions/extract-pdf/_shared/` as the real Deno deployment source.
 */
export const buildPdfExtractionResult = ({
  documentId,
  filename,
  pages,
  images,
}: BuildPdfExtractionResultInput): PdfExtractionResult => ({
  documentId,
  filename,
  pageCount: pages.length,
  imageCount: images.length,
  pages,
  images,
});
