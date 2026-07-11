import {
  IMAGE_DOWNSCALE_TARGET,
  PDF_EXTRACTION_LIMITS,
  PDF_FILE_EXTENSION,
  PDF_UPLOAD_BUCKET,
  SCANNED_DETECTION_MIN_TEXT_LENGTH,
} from './pdf-extraction.constants';

describe('pdf-extraction.constants', () => {
  // Spec decision #1 — the locked upload/extraction ceilings: 10 MiB and 20 pages. Asserted as
  // exact literal values (not just "the service enforces some limit") so a value mutation on
  // either number is caught directly, without depending on a service/DAO test to surface it.
  it('locks the size limit at 10 MiB and the page limit at 20 pages', () => {
    expect(PDF_EXTRACTION_LIMITS.maxSizeBytes).toBe(10 * 1024 * 1024);
    expect(PDF_EXTRACTION_LIMITS.maxPages).toBe(20);
  });

  // task-10, @s9 — the client-side pre-check accepts this exact file extension.
  it('locks the accepted client-side file extension at .pdf', () => {
    expect(PDF_FILE_EXTENSION).toBe('.pdf');
  });

  // spec risk R3 — the scanned/image-only heuristic threshold.
  it('locks the scanned-detection minimum text length at 40 characters', () => {
    expect(SCANNED_DETECTION_MIN_TEXT_LENGTH).toBe(40);
  });

  // Spec decision #4 — the image downscale/recompress targets read by `image-downscale.ts`.
  it('locks the image downscale target at a 1024px longest edge, quality 80, 100px decorative floor', () => {
    expect(IMAGE_DOWNSCALE_TARGET).toEqual({
      maxLongestEdgePx: 1024,
      jpegQuality: 80,
      minDimensionPx: 100,
    });
  });

  // Spec decision #3 — the locked private storage bucket name for the raw uploaded PDF.
  it('locks the upload bucket name at pdf-uploads', () => {
    expect(PDF_UPLOAD_BUCKET).toBe('pdf-uploads');
  });
});
