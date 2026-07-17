// Mirrors libs/services/src/pdf-extraction/pdf-extraction-adapter.ts — kept manually in sync
// (task-3 note).
import * as mupdf from 'npm:mupdf@1.28.0';

export type ExtractedPageText = {
  page: number;
  text: string;
};

// `pixmap`'s concrete `mupdf.Pixmap` type is a deliberate exception to this file's usual
// "plain types only" rule (M2, performance review round-1 fix) — the already-decoded pixmap is
// handed straight through to `image-downscale.ts`, avoiding a redundant decode+encode round-trip
// through serialized PNG bytes.
export type ExtractedImage = {
  page: number;
  positionIndex: number;
  pixmap: mupdf.Pixmap;
  width: number;
  height: number;
};

export type PdfExtractionAdapterResult = {
  pages: ExtractedPageText[];
  images: ExtractedImage[];
};

export type PdfExtractionAdapter = {
  extract(bytes: Uint8Array): Promise<PdfExtractionAdapterResult>;
};
