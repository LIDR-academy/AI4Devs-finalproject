import type { PdfExtractionLimits } from '../types/pdf-extraction.types';

/**
 * Single source of truth for the upload/extraction size ceilings (spec decision #1). The client
 * pre-check (task-10), the UI constraints hint (task-11/13), and the server page-count guard
 * (task-9) all read from this one constant — never a scattered literal. The Edge Function (Deno)
 * can't import this workspace package, so it mirrors this value in
 * `supabase/functions/extract-pdf/_shared/` and is kept in sync by hand.
 */
export const PDF_EXTRACTION_LIMITS: PdfExtractionLimits = {
  maxSizeBytes: 10 * 1024 * 1024,
  maxPages: 20,
};

/**
 * The file extension the client-side pre-check (task-10, @s9) accepts — checked against the
 * picked file's own filename, since `expo-document-picker`'s `type` filter can be bypassed by the
 * underlying OS/browser picker (e.g. web's "All Files").
 */
export const PDF_FILE_EXTENSION = '.pdf';

/**
 * Scanned-detection heuristic threshold (spec risk R3): a document whose combined extracted-page
 * text falls below this character count is treated as scanned/image-only (@s8) — no OCR in v1.
 * Kept single-source and tunable, separate from `PDF_EXTRACTION_LIMITS`'s hard size/page
 * ceilings; retune after the task-3 spike's real-file latency/cost data.
 */
export const SCANNED_DETECTION_MIN_TEXT_LENGTH = 40;

/**
 * Single source of truth for the image downscale/recompress targets (spec decision #4), read by
 * the `image-downscale` module and mirrored the same way as `PDF_EXTRACTION_LIMITS` above.
 */
export const IMAGE_DOWNSCALE_TARGET = {
  /** Longest edge cap, in pixels — aspect ratio preserved, never upscaled. */
  maxLongestEdgePx: 1024,
  /** JPEG encode quality for opaque images (0-100). */
  jpegQuality: 80,
  /** Images with either dimension below this are decorative (bullets, rules, icons) and dropped. */
  minDimensionPx: 100,
} as const;

/**
 * Locked storage bucket names (spec decision #3), both private, keyed `{user_id}/{document_id}/…`.
 * Mirrored the same way as the other constants above.
 */
export const PDF_UPLOAD_BUCKET = 'pdf-uploads';
export const PDF_IMAGES_BUCKET = 'pdf-images';
