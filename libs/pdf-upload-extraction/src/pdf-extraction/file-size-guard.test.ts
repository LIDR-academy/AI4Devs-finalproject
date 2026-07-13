import { PDF_EXTRACTION_LIMITS } from '../services/pdf-extraction.constants';
import { isFileTooLarge } from './file-size-guard';

describe('isFileTooLarge', () => {
  // M1 (security review round-1 fix) — the server-side, authoritative counterpart to the client
  // pre-check (@s10): a caller bypassing the client JS entirely must still be rejected before any
  // parse/image work runs in the Edge Function.
  it('returns false for a file well under the limit', () => {
    expect(isFileTooLarge(1, PDF_EXTRACTION_LIMITS)).toBe(false);
  });

  it('returns true for a file over the limit', () => {
    expect(isFileTooLarge(PDF_EXTRACTION_LIMITS.maxSizeBytes + 1_000_000, PDF_EXTRACTION_LIMITS)).toBe(true);
  });

  // Boundary (mutation-kill guard, review round-1 Part B #3) — the limit is an exclusive upper
  // bound (spec.md's "exceeds the size limit" language): exactly `maxSizeBytes` is still allowed.
  it('returns false for a file exactly at the size limit', () => {
    expect(isFileTooLarge(PDF_EXTRACTION_LIMITS.maxSizeBytes, PDF_EXTRACTION_LIMITS)).toBe(false);
  });

  it('returns true for a file one byte over the size limit', () => {
    expect(isFileTooLarge(PDF_EXTRACTION_LIMITS.maxSizeBytes + 1, PDF_EXTRACTION_LIMITS)).toBe(true);
  });
});
