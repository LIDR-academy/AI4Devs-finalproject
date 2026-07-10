import { PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH } from '../services/pdf-extraction.constants';
import { detectExtractionFailure } from './extraction-failure-detection';

const buildPages = (count: number, textPerPage = 'a'.repeat(50)) =>
  Array.from({ length: count }, (_, index) => ({ page: index + 1, text: textPerPage }));

describe('detectExtractionFailure', () => {
  // @s11 — a document whose page count exceeds the locked limit is rejected, even though its
  // text is otherwise perfectly readable.
  it('returns too_many_pages when the page count exceeds the limit', () => {
    const pages = buildPages(21);

    expect(detectExtractionFailure({ pages }, PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH)).toBe('too_many_pages');
  });

  // @s8 — a document within the page limit but whose combined extracted text falls below the
  // scanned-detection threshold is treated as scanned/image-only (no OCR in v1).
  it('returns scanned_or_image_only when the combined extracted text is below the threshold', () => {
    const pages = [
      { page: 1, text: '' },
      { page: 2, text: 'hi' },
    ];

    expect(detectExtractionFailure({ pages }, PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH)).toBe('scanned_or_image_only');
  });

  // Happy path — a document within the page limit and with enough extracted text triggers
  // neither guard.
  it('returns null for a clean, in-limit, sufficiently text-bearing document', () => {
    const pages = buildPages(5);

    expect(detectExtractionFailure({ pages }, PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH)).toBeNull();
  });

  // Precedence — a document that violates both guards at once is reported as too_many_pages: the
  // structural page-count ceiling is checked before the content heuristic.
  it('reports too_many_pages before scanned_or_image_only when both guards are violated', () => {
    const pages = buildPages(25, '');

    expect(detectExtractionFailure({ pages }, PDF_EXTRACTION_LIMITS, SCANNED_DETECTION_MIN_TEXT_LENGTH)).toBe('too_many_pages');
  });
});
