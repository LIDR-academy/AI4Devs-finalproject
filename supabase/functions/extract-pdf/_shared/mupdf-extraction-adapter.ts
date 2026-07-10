// Mirrors libs/services/src/pdf-extraction/mupdf-extraction-adapter.ts — kept manually in sync
// (task-3 note). Deno's native ESM support means the Jest-only `await import('mupdf')` workaround
// (needed there because `mupdf`'s ESM-only bundle can't survive a CommonJS test runtime) is
// unnecessary here — a plain static `npm:` import works directly in the real Edge runtime.
import * as mupdf from 'npm:mupdf@1.28.0';

import type { ExtractedImage, ExtractedPageText, PdfExtractionAdapterResult } from './pdf-extraction-adapter.ts';

const STRUCTURED_TEXT_OPTIONS = 'preserve-images';
const RAW_IMAGE_MIME_TYPE = 'image/png';

const extractPageImages = (page: mupdf.Page, pageNumber: number): ExtractedImage[] => {
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

/** `PdfExtractionAdapter`-shaped implementation over `mupdf`-wasm (spec decision #2), the real
 * Deno deployment source — see the Jest-tested twin at
 * libs/services/src/pdf-extraction/mupdf-extraction-adapter.ts for the unit-tested logic this
 * mirrors. Not executed in this sandbox (no Deno CLI available) — verify manually after
 * `supabase functions deploy` in a real environment. */
export abstract class MupdfExtractionAdapter {
  static async extract(bytes: Uint8Array): Promise<PdfExtractionAdapterResult> {
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
