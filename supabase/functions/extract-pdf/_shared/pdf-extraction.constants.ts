// Mirrors libs/services/src/services/pdf-extraction.constants.ts — Deno can't import the
// workspace package, so this file is kept manually in sync with that one (spec's "Size / page
// limits" + "Image downscale/recompress targets" sections; task-3 note).

import type { PdfExtractionLimits } from './types.ts';

export const PDF_EXTRACTION_LIMITS: PdfExtractionLimits = {
  maxSizeBytes: 10 * 1024 * 1024,
  maxPages: 20,
};

export const PDF_FILE_EXTENSION = '.pdf';

export const SCANNED_DETECTION_MIN_TEXT_LENGTH = 40;

export const IMAGE_DOWNSCALE_TARGET = {
  maxLongestEdgePx: 1024,
  jpegQuality: 80,
  minDimensionPx: 100,
} as const;

export const PDF_UPLOAD_BUCKET = 'pdf-uploads';
export const PDF_IMAGES_BUCKET = 'pdf-images';
