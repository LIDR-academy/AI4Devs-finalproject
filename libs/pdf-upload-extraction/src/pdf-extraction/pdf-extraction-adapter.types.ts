import type * as Mupdf from 'mupdf';

/**
 * The seam that isolates the PDF-parsing library (mupdf-wasm, spec decision #2) from every
 * consumer (the extract-pdf Edge Function orchestration, and — mirrored — its Deno copy).
 * Consumers depend on this interface only, so the library stays swappable (risk R1's documented
 * fallback is `unpdf`) without reworking the orchestration, downscale, or DTO-shaping modules.
 * `ExtractedImage.pixmap`'s concrete `Mupdf.Pixmap` type is the one deliberate exception to that
 * isolation (M2, performance review round-1 fix) — passing the already-decoded pixmap straight
 * into `image-downscale.ts` avoids a redundant decode+encode round-trip through serialized PNG
 * bytes; swapping the parsing library would need to update this one field's type too.
 */

/** One page's plain-text content, in document order (page numbers are 1-based). */
export type ExtractedPageText = {
  page: number;
  text: string;
};

/** One embedded raster image as extracted, before downscale/recompress (task-3 scope ends here;
 * the downscale module in this same folder takes this shape as its input). */
export type ExtractedImage = {
  page: number;
  /** Order of appearance within the page (0-based) — carries @s2/@s3's "position it came from". */
  positionIndex: number;
  /** The already-decoded pixmap (M2 fix) — handed directly to `downscaleImage`, never
   * re-serialized to/from bytes in between. */
  pixmap: Mupdf.Pixmap;
  width: number;
  height: number;
};

export type PdfExtractionAdapterResult = {
  pages: ExtractedPageText[];
  images: ExtractedImage[];
};

/**
 * The shape every extraction library implementation must satisfy (mupdf-wasm today; `unpdf` is
 * the documented fallback, risk R1). A static-method class (matching the project's
 * abstract-class-with-static-methods DAO/Service convention) is assigned to this type at its
 * call site rather than via `implements`, so orchestration code depends on the type, not the
 * concrete class.
 */
export type PdfExtractionAdapter = {
  extract(bytes: Uint8Array): Promise<PdfExtractionAdapterResult>;
};
