// Mirrors libs/services/src/pdf-extraction/extraction-dto.ts — kept manually in sync (task-3
// note). Not executed in this sandbox — verify manually after `supabase functions deploy`.
import type { ExtractedImageRef, PdfExtractionResult } from './types.ts';

export type BuildPdfExtractionResultInput = {
  documentId: string;
  filename: string;
  pages: { page: number; text: string }[];
  images: ExtractedImageRef[];
};

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
