import { MupdfExtractionAdapter } from './mupdf-extraction-adapter';
import { buildSolidPng } from './test-utils/build-solid-png';
import { buildTestPdf } from './test-utils/build-test-pdf';

const RED_PIXEL_PNG = buildSolidPng({ width: 4, height: 4, color: [255, 0, 0] });
const BLUE_PIXEL_PNG = buildSolidPng({ width: 8, height: 6, color: [0, 0, 255] });

describe('MupdfExtractionAdapter', () => {
  // @s1/@s3 — a real, mixed-page PDF (text-only, text+image, image-only) is fully extracted:
  // every page's text is present, in document order, and page numbers are 1-based.
  it('extracts text from every page in document order', async () => {
    const bytes = await buildTestPdf([
      { text: 'Hello page one' },
      { text: 'World page two', images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
      { images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
    ]);

    const result = await MupdfExtractionAdapter.extract(bytes);

    expect(result.pages).toEqual([
      { page: 1, text: expect.stringContaining('Hello page one') },
      { page: 2, text: expect.stringContaining('World page two') },
      { page: 3, text: '' },
    ]);
  });

  // @s2/@s3 — an embedded image is extracted and associated with the exact page it came from;
  // its reported dimensions are the source image's own pixel size (not the drawn box).
  it('associates an extracted image with the page it came from and its native pixel size', async () => {
    const bytes = await buildTestPdf([
      { text: 'Text only page' },
      { text: 'One image', images: [{ png: RED_PIXEL_PNG, drawWidth: 40, drawHeight: 40 }] },
    ]);

    const result = await MupdfExtractionAdapter.extract(bytes);

    expect(result.images).toEqual([
      { page: 2, positionIndex: 0, bytes: expect.any(Uint8Array), width: 4, height: 4, mimeType: 'image/png' },
    ]);
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

    expect(result.images).toEqual([
      { page: 1, positionIndex: 0, bytes: expect.any(Uint8Array), width: 4, height: 4, mimeType: 'image/png' },
      { page: 1, positionIndex: 1, bytes: expect.any(Uint8Array), width: 8, height: 6, mimeType: 'image/png' },
    ]);
  });

  // @s12 (Slice 2, task-9) — a damaged/unparseable byte buffer fails to open. The orchestration
  // (extract-pdf's index.ts) catches this specific parse failure and maps it to
  // corrupt_or_unreadable, distinct from the generic extraction_failed catch-all.
  it('rejects when the given bytes are not a parseable PDF', async () => {
    const garbageBytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    await expect(MupdfExtractionAdapter.extract(garbageBytes)).rejects.toThrow();
  });
});
