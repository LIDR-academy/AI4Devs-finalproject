import { PDFDocument } from 'pdf-lib';

export type TestPdfImageSpec = {
  png: Uint8Array;
  /** Drawn box on the page — independent of the PNG's own pixel dimensions. */
  drawWidth: number;
  drawHeight: number;
};

export type TestPdfPageSpec = {
  text?: string;
  images?: TestPdfImageSpec[];
};

const PAGE_SIZE = 400;

/** Builds a real, mupdf-decodable, multi-page PDF from a page spec list — the shared fixture
 * builder for adapter/service-level extraction tests (no binary test assets committed). Images
 * are drawn left-to-right so their draw order matches the expected extraction position order. */
export const buildTestPdf = async (pages: TestPdfPageSpec[]): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  for (const spec of pages) {
    const page = doc.addPage([PAGE_SIZE, PAGE_SIZE]);
    if (spec.text) {
      page.drawText(spec.text, { x: 20, y: PAGE_SIZE - 40, size: 14 });
    }
    let x = 20;
    for (const image of spec.images ?? []) {
      const embedded = await doc.embedPng(image.png);
      page.drawImage(embedded, { x, y: 20, width: image.drawWidth, height: image.drawHeight });
      x += image.drawWidth + 20;
    }
  }
  return doc.save();
};
