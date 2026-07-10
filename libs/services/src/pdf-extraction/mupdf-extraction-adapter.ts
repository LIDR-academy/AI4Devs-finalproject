import type * as Mupdf from 'mupdf';

import type {
  ExtractedImage,
  ExtractedPageText,
  PdfExtractionAdapter,
  PdfExtractionAdapterResult,
} from './pdf-extraction-adapter';

/** Enables StructuredText's image walk callback — without it, `onImageBlock` never fires
 * (confirmed against the real mupdf-wasm runtime during the task-3 spike, risk R1). */
const STRUCTURED_TEXT_OPTIONS = 'preserve-images';

/** Walks the page's already-built `StructuredText` (M3, performance review round-1 fix — computed
 * once per page by the caller below, not rebuilt here) to collect its images, handing each
 * already-decoded `Pixmap` straight through (M2 fix) instead of re-encoding it to PNG bytes just
 * to have `image-downscale.ts` decode it again. */
const extractPageImages = (structuredText: Mupdf.StructuredText, pageNumber: number): ExtractedImage[] => {
  const images: ExtractedImage[] = [];
  structuredText.walk({
    onImageBlock(_bbox, _transform, image) {
      const pixmap = image.toPixmap();
      images.push({
        page: pageNumber,
        positionIndex: images.length,
        pixmap,
        width: pixmap.getWidth(),
        height: pixmap.getHeight(),
      });
    },
  });
  return images;
};

/**
 * `PdfExtractionAdapter`-shaped implementation over `mupdf`-wasm (spec decision #2). Kept as
 * pure, Jest-testable TypeScript (no Deno globals) per the task-3 sandbox adaptation — mirrored
 * into `supabase/functions/extract-pdf/_shared/` as the real Deno deployment source.
 *
 * `mupdf` ships ESM-only (its dist bundle uses top-level `await` to feature-detect Node vs.
 * browser, which cannot be downgraded to CommonJS — task-3 spike finding, see
 * docs/features/pdf-upload-extraction/tdd.md). It is loaded via a dynamic `import()` so Jest's
 * CommonJS test runtime delegates to Node's real ESM loader instead of trying to transform it.
 */
export abstract class MupdfExtractionAdapter {
  static async extract(bytes: Uint8Array): Promise<PdfExtractionAdapterResult> {
    const mupdf: typeof Mupdf = await import('mupdf');
    const document = mupdf.Document.openDocument(bytes, 'application/pdf');
    const pageCount = document.countPages();
    const pages: ExtractedPageText[] = [];
    const images: ExtractedImage[] = [];

    for (let index = 0; index < pageCount; index++) {
      const pageNumber = index + 1;
      const page = document.loadPage(index);
      // Computed once per page (M3 fix) and passed into extractPageImages, instead of each
      // building its own independent StructuredText for the same page.
      const structuredText = page.toStructuredText(STRUCTURED_TEXT_OPTIONS);
      pages.push({ page: pageNumber, text: structuredText.asText().trim() });
      images.push(...extractPageImages(structuredText, pageNumber));
    }

    return { pages, images };
  }
}

// Compile-time proof that MupdfExtractionAdapter's static side satisfies PdfExtractionAdapter —
// the seam that keeps the library swappable (risk R1's `unpdf` fallback) without touching
// consumers, which depend on this type rather than the concrete class.
const _typeCheck: PdfExtractionAdapter = MupdfExtractionAdapter;
void _typeCheck;
