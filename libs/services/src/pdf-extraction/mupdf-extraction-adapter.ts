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

/** Raw-extracted images are always re-encoded as PNG here — universally decodable input for the
 * downscale module (which re-encodes to the spec's final JPEG/PNG target), regardless of the
 * embedded image's original on-disk format. */
const RAW_IMAGE_MIME_TYPE = 'image/png';

const extractPageImages = (page: Mupdf.Page, pageNumber: number): ExtractedImage[] => {
  const images: ExtractedImage[] = [];
  const structuredText = page.toStructuredText(STRUCTURED_TEXT_OPTIONS);
  structuredText.walk({
    onImageBlock(_bbox, _transform, image) {
      const pixmap = image.toPixmap();
      images.push({
        page: pageNumber,
        positionIndex: images.length,
        bytes: pixmap.asPNG(),
        width: pixmap.getWidth(),
        height: pixmap.getHeight(),
        mimeType: RAW_IMAGE_MIME_TYPE,
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
      const text = page.toStructuredText(STRUCTURED_TEXT_OPTIONS).asText().trim();
      pages.push({ page: pageNumber, text });
      images.push(...extractPageImages(page, pageNumber));
    }

    return { pages, images };
  }
}

// Compile-time proof that MupdfExtractionAdapter's static side satisfies PdfExtractionAdapter —
// the seam that keeps the library swappable (risk R1's `unpdf` fallback) without touching
// consumers, which depend on this type rather than the concrete class.
const _typeCheck: PdfExtractionAdapter = MupdfExtractionAdapter;
void _typeCheck;
