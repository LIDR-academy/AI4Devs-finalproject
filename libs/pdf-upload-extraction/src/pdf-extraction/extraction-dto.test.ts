import { buildPdfExtractionResult } from './extraction-dto';

describe('buildPdfExtractionResult', () => {
  // @s1/@s2/@s3 — shapes the orchestration's raw pieces (document identity, ordered page text,
  // persisted image references) into the typed PdfExtractionResult the client receives, deriving
  // pageCount/imageCount rather than trusting a separately-passed-in count.
  it('builds the typed result with derived pageCount and imageCount', () => {
    const pages = [
      { page: 1, text: 'Hello' },
      { page: 2, text: 'World' },
    ];
    const images = [
      {
        id: 'img-1',
        documentId: 'doc-1',
        pageNumber: 2,
        positionIndex: 0,
        storagePath: 'user-1/doc-1/p2-0.jpg',
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
      },
    ];

    const result = buildPdfExtractionResult({
      documentId: 'doc-1',
      filename: 'notes.pdf',
      pages,
      images,
    });

    expect(result).toEqual({
      documentId: 'doc-1',
      filename: 'notes.pdf',
      pageCount: 2,
      imageCount: 1,
      pages,
      images,
    });
  });

  // Edge case — a document with no extractable images still shapes correctly (imageCount 0).
  it('reports zero imageCount for a document with no images', () => {
    const result = buildPdfExtractionResult({
      documentId: 'doc-2',
      filename: 'text-only.pdf',
      pages: [{ page: 1, text: 'Just text' }],
      images: [],
    });

    expect(result.imageCount).toBe(0);
    expect(result.pageCount).toBe(1);
  });
});
