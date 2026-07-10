/**
 * The shared, library-agnostic extraction contract: the client layers (DAO/service/hook/UI), the
 * `extract-pdf` Edge Function, and R2 (generation) all agree on these shapes. This is the seam
 * that lets the parsing library (mupdf-wasm, spec decision #2) be swapped without touching any
 * consumer.
 */

/** One embedded image, downscaled/recompressed and persisted to storage, tied to the page and
 * in-page position it came from (@s2). */
export type ExtractedImageRef = {
  id: string;
  documentId: string;
  pageNumber: number;
  positionIndex: number;
  storagePath: string;
  width: number;
  height: number;
  mimeType: string;
  description?: string;
};

/** The typed success result `PdfExtractionService.extract` resolves with (@s1/@s2/@s3): every
 * page's text, in document order, plus every extracted image reference. */
export type PdfExtractionResult = {
  documentId: string;
  filename: string;
  pageCount: number;
  imageCount: number;
  pages: { page: number; text: string }[];
  images: ExtractedImageRef[];
};

/** The closed set of failure codes every extraction failure — client pre-check, transport, or
 * server result — normalizes to (spec.md's Error contract table), so the UI never branches on a
 * raw Supabase/function error. */
export type PdfExtractionErrorCode =
  | 'unsupported_file_type'
  | 'file_too_large'
  | 'too_many_pages'
  | 'scanned_or_image_only'
  | 'corrupt_or_unreadable'
  | 'extraction_failed'
  | 'network_error'
  | 'unauthenticated';

/** The shape of the single-source size/page limits constant (`PDF_EXTRACTION_LIMITS`,
 * `libs/services/src/services/pdf-extraction.constants.ts`). This file holds only the shape —
 * the locked values (10 MB / 20 pages, spec decision #1) live in that constant, not here. */
export type PdfExtractionLimits = {
  maxSizeBytes: number;
  maxPages: number;
};
