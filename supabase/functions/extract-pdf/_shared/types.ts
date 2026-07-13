// Mirrors libs/types/src/pdf-extraction.ts — Deno can't import the workspace package, so this
// file is kept manually in sync with that one (task-2/task-3 note). Keep both in sync by hand.

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

export type PdfExtractionResult = {
  documentId: string;
  filename: string;
  pageCount: number;
  imageCount: number;
  pages: { page: number; text: string }[];
  images: ExtractedImageRef[];
};

export type PdfExtractionErrorCode =
  | 'unsupported_file_type'
  | 'file_too_large'
  | 'too_many_pages'
  | 'scanned_or_image_only'
  | 'corrupt_or_unreadable'
  | 'extraction_failed'
  | 'network_error'
  | 'unauthenticated';

export type PdfExtractionLimits = {
  maxSizeBytes: number;
  maxPages: number;
};

export type PdfExtractionError = {
  code: PdfExtractionErrorCode;
};
