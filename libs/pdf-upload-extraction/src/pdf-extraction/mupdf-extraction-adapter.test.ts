import type * as Mupdf from 'mupdf';

import { MupdfExtractionAdapter } from './mupdf-extraction-adapter';
import { buildSolidPng } from './test-utils/build-solid-png';
import { buildTestPdf } from './test-utils/build-test-pdf';

const RED_PIXEL_PNG = buildSolidPng({ width: 4, height: 4, color: [255, 0, 0] });
const BLUE_PIXEL_PNG = buildSolidPng({ width: 8, height: 6, color: [0, 0, 255] });

describe('MupdfExtractionAdapter', () => {
  // @s1/@s3 — a real, mixed-page PDF (text-only, text+image, image-only) is fully extracted:
  // every page's text is present, in document order, and page numbers are 1-based. Text values
  // are asserted exactly (not `stringContaining`, mutation-kill guard round-3 pass) — mupdf's
  // `StructuredText.asText()` appends a trailing blank line per page (verified: `'Hello page
  // one\n\n'`), so an exact match pins the adapter's own `.trim()` call, which a
  // `stringContaining` match would let survive.
  it('extracts text from every page in document order', async () => {
    const bytes = await buildTestPdf([
      { text: 'Hello page one' },
      { text: 'World page two', images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
      { images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
    ]);

    const result = await MupdfExtractionAdapter.extract(bytes);

    expect(result.pages).toEqual([
      { page: 1, text: 'Hello page one' },
      { page: 2, text: 'World page two' },
      { page: 3, text: '' },
    ]);
  });

  // @s1/@s3 (mutation-kill, round-3 pass) — the PDF's bytes are opened with the exact
  // 'application/pdf' MIME hint, not an empty/unspecified one; asserted by spying on the real
  // `mupdf.Document.openDocument` static method (the only observable point in mupdf's own API
  // where this argument surfaces).
  it('opens the document bytes with the application/pdf MIME type', async () => {
    const mupdf: typeof Mupdf = await import('mupdf');
    const openDocumentSpy = jest.spyOn(mupdf.Document, 'openDocument');
    const bytes = await buildTestPdf([{ text: 'Hello page one' }]);

    await MupdfExtractionAdapter.extract(bytes);

    expect(openDocumentSpy).toHaveBeenCalledWith(bytes, 'application/pdf');
    openDocumentSpy.mockRestore();
  });

  // @s2/@s3 — an embedded image is extracted and associated with the exact page it came from;
  // its reported dimensions are the source image's own pixel size (not the drawn box). The image
  // carries the already-decoded `Pixmap` directly (M2, performance review round-1 fix) rather than
  // re-serialized PNG bytes, so its own reported dimensions must agree with the extracted
  // width/height fields.
  it('associates an extracted image with the page it came from and its native pixel size', async () => {
    const bytes = await buildTestPdf([
      { text: 'Text only page' },
      { text: 'One image', images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
    ]);

    const result = await MupdfExtractionAdapter.extract(bytes);

    expect(result.images).toHaveLength(1);
    const [image] = result.images;
    expect(image).toMatchObject({ page: 2, positionIndex: 0, width: 4, height: 4 });
    expect(image.pixmap.getWidth()).toBe(4);
    expect(image.pixmap.getHeight()).toBe(4);
  });

  // @s2/@s3 — two images on the same page get increasing positionIndex values in draw order,
  // so generation (R2) can tell which figure came first on the page.
  it('assigns increasing positionIndex values to multiple images on the same page', async () => {
    const bytes = await buildTestPdf([
      {
        text: 'Two images',
        images: [
          { png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 },
          { png: BLUE_PIXEL_PNG, drawWidth: 40, drawHeight: 40 },
        ],
      },
    ]);

    const result = await MupdfExtractionAdapter.extract(bytes);

    expect(result.images).toHaveLength(2);
    expect(
      result.images.map((image) => ({
        page: image.page,
        positionIndex: image.positionIndex,
        width: image.width,
        height: image.height,
      })),
    ).toEqual([
      { page: 1, positionIndex: 0, width: 4, height: 4 },
      { page: 1, positionIndex: 1, width: 8, height: 6 },
    ]);
    expect(result.images.map((image) => image.pixmap.getWidth())).toEqual([4, 8]);
  });

  // @s12 (Slice 2, task-9) — a damaged/unparseable byte buffer fails to open. The orchestration
  // (extract-pdf's index.ts) catches this specific parse failure and maps it to
  // corrupt_or_unreadable, distinct from the generic extraction_failed catch-all.
  it('rejects when the given bytes are not a parseable PDF', async () => {
    const garbageBytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    await expect(MupdfExtractionAdapter.extract(garbageBytes)).rejects.toThrow();
  });
});
