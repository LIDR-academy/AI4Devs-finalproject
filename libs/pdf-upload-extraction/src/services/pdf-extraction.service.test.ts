jest.mock('../dao/pdf-upload.dao', () => ({
  PdfUploadDao: {
    uploadPdf: jest.fn(),
    insertDocument: jest.fn(),
    invokeExtraction: jest.fn(),
  },
}));
jest.mock('../analytics/pdf-extraction-analytics', () => ({ trackPdfExtractionEvent: jest.fn() }));

import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { trackPdfExtractionEvent } from '../analytics/pdf-extraction-analytics';
import { PdfUploadDao } from '../dao/pdf-upload.dao';
import { PDF_EXTRACTION_LIMITS } from './pdf-extraction.constants';
import { generateDocumentId, PdfExtractionService } from './pdf-extraction.service';

const dao = PdfUploadDao as jest.Mocked<typeof PdfUploadDao>;
const trackEvent = trackPdfExtractionEvent as jest.Mock;

/** A `FunctionsHttpError`-shaped rejection carrying the Edge Function's `{ errorCode }` JSON
 * body, unread until `.context.json()` is called (real `@supabase/functions-js` behavior — see
 * docs/features/pdf-upload-extraction/tdd.md's task-9 section). */
const httpErrorWithBody = (body: unknown): FunctionsHttpError => new FunctionsHttpError({ json: () => Promise.resolve(body) });

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('PdfExtractionService', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s1/@s4 — the happy path uploads through the DAO, inserts the document row, invokes
  // extraction, and returns the typed result — going through service -> DAO only, never
  // parsing the PDF itself (@s4).
  it('extract generates a documentId, uploads, inserts, invokes extraction, and returns the typed result', async () => {
    dao.uploadPdf.mockResolvedValue({ path: 'ignored' } as never);
    dao.insertDocument.mockResolvedValue({ id: 'ignored' } as never);
    const extractionResult = {
      documentId: 'ignored',
      filename: 'notes.pdf',
      pageCount: 2,
      imageCount: 1,
      pages: [],
      images: [],
    };
    dao.invokeExtraction.mockResolvedValue(extractionResult);

    const bytes = new Uint8Array([1, 2, 3]);
    const result = await PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes }, 'user-1');

    expect(result).toBe(extractionResult);

    const [uploadArgs] = dao.uploadPdf.mock.calls[0];
    expect(uploadArgs).toEqual({ userId: 'user-1', documentId: expect.stringMatching(UUID_V4_PATTERN), bytes });

    const [insertArgs] = dao.insertDocument.mock.calls[0];
    expect(insertArgs).toEqual({
      documentId: uploadArgs.documentId,
      userId: 'user-1',
      filename: 'notes.pdf',
      sizeBytes: 3,
    });

    expect(dao.invokeExtraction).toHaveBeenCalledWith(uploadArgs.documentId);
  });

  // Exact bit-formatting (mutation-kill, round-3 pass) — the uniqueness assertion below proves
  // IDs differ from each other, but not that each hex digit is actually derived from
  // `Math.random()` at every `x`/`y` template position (a mutant that always takes the `y`-only
  // "clamp to variant" branch would still produce syntactically-valid, unique-looking v4 UUIDs).
  // Pinning `Math.random()` to a fixed value and asserting the exact resulting string proves the
  // `x` positions read the raw random digit while the version nibble (fixed '4' in the template)
  // and the `y` position's variant nibble (`(random & 0x3) | 0x8`, clamped to 8-b) land at their
  // exact string positions.
  it('generates each hex digit from Math.random(), with the version fixed at 4 and the variant clamped to 8-b at their exact template positions', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    expect(generateDocumentId()).toBe('00000000-0000-4000-8000-000000000000');

    randomSpy.mockRestore();
  });

  // Uniqueness — two separate extract() calls generate two different documentIds, so concurrent
  // uploads never collide on the same storage path/row.
  it('generates a different documentId for each extract() call', async () => {
    dao.uploadPdf.mockResolvedValue({} as never);
    dao.insertDocument.mockResolvedValue({} as never);
    dao.invokeExtraction.mockResolvedValue({} as never);

    await PdfExtractionService.extract({ filename: 'a.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1');
    await PdfExtractionService.extract({ filename: 'b.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1');

    const firstId = dao.uploadPdf.mock.calls[0][0].documentId;
    const secondId = dao.uploadPdf.mock.calls[1][0].documentId;
    expect(firstId).not.toBe(secondId);
  });

  // @s14 (task-9) — no session at all is rejected client-side, before any DAO call. The `.message`
  // is asserted exactly (mutation-kill, round-3 pass), not just `.code` — the code is the UI's
  // contract, but the message is still part of the thrown Error's observable shape.
  it('rejects with unauthenticated and never calls the DAO when no userId is given', async () => {
    await expect(
      PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() }, ''),
    ).rejects.toMatchObject({ code: 'unauthenticated', message: 'PDF extraction failed: unauthenticated' });

    expect(dao.uploadPdf).not.toHaveBeenCalled();
  });

  describe('server error normalization (task-9)', () => {
    // @s8 — the Edge Function's scanned-detection result is surfaced as the typed code.
    it('normalizes a scanned_or_image_only server error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'scanned_or_image_only' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'scanned_or_image_only' });
    });

    // @s11 — the Edge Function's page-count guard is surfaced as the typed code.
    it('normalizes a too_many_pages server error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'too_many_pages' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'too_many_pages' });
    });

    // @s12 — a parse failure the Edge Function caught is surfaced as the typed code.
    it('normalizes a corrupt_or_unreadable server error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'corrupt_or_unreadable' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'corrupt_or_unreadable' });
    });

    // @s14 — the Edge Function's own auth check (e.g. an expired token by the time it runs) is
    // surfaced as the typed code too, not just the client's own pre-check above.
    it('normalizes an unauthenticated server error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'unauthenticated' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'unauthenticated' });
    });

    // Defensive — a missing/malformed error body (violated server contract) never leaks a raw
    // shape to the UI; it falls back to the generic code instead.
    it('falls back to extraction_failed when the server error body has no known errorCode', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'not_a_real_code' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'extraction_failed' });
    });

    // Defensive, exercising the `body?.errorCode` optional-chaining path directly (mutation-kill
    // investigation, round-3 pass): the error body itself resolves to `null` (not just missing the
    // `errorCode` field) — the fallback path this optional chaining protects.
    it('falls back to extraction_failed when the server error body itself resolves to null', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody(null));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'extraction_failed' });
    });

    // @s12/task-9 — an error that is none of the three known DAO-thrown shapes (not a
    // FunctionsHttpError, FunctionsFetchError, or FunctionsRelayError) still falls through to the
    // generic extraction_failed code, distinct from network_error (mutation-kill, round-3 pass):
    // pins the transport-error union check's own boundary, which the two `network_error` tests
    // above can't distinguish from an always-true condition on their own.
    it('normalizes an unrecognized error type as extraction_failed, not network_error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(new Error('unexpected DAO failure'));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'extraction_failed' });
    });

    // @s13 — a transport-level failure reaching the function at all (offline, DNS, etc.) is
    // surfaced as network_error, distinct from a typed server response.
    it('normalizes a transport-level FunctionsFetchError as network_error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(new FunctionsFetchError(new Error('offline')));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'network_error' });
    });

    // @s13 — the Supabase relay itself failing to reach the function is also a transport-level
    // failure from the client's point of view.
    it('normalizes a FunctionsRelayError as network_error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(new FunctionsRelayError({ region: 'us-east-1' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'network_error' });
    });
  });

  describe('client pre-validation (task-10)', () => {
    // @s9 — a non-PDF filename is rejected before any DAO call.
    it('rejects with unsupported_file_type and never calls the DAO for a non-PDF filename', async () => {
      await expect(
        PdfExtractionService.extract({ filename: 'notes.txt', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'unsupported_file_type' });

      expect(dao.uploadPdf).not.toHaveBeenCalled();
    });

    // @s10 — an over-size file is rejected before any DAO call.
    it('rejects with file_too_large and never calls the DAO for an over-size file', async () => {
      const oversizeBytes = PDF_EXTRACTION_LIMITS.maxSizeBytes + 1;

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: oversizeBytes, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'file_too_large' });

      expect(dao.uploadPdf).not.toHaveBeenCalled();
    });

    // Boundary (mutation-kill guard, review round-1 Part B #3) — the limit is an exclusive upper
    // bound (spec.md's "exceeds the size limit" language): a file of exactly `maxSizeBytes` is
    // still within the limit and must pass client pre-validation through to the DAO.
    it('accepts a file exactly at the size limit and calls the DAO', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockResolvedValue({} as never);

      await PdfExtractionService.extract(
        { filename: 'notes.pdf', sizeBytes: PDF_EXTRACTION_LIMITS.maxSizeBytes, bytes: new Uint8Array() },
        'user-1',
      );

      expect(dao.uploadPdf).toHaveBeenCalledTimes(1);
    });
  });

  // Retry support (task-12) — a caller (usePdfExtraction) can pass a previously-generated
  // documentId back in so a retry reuses the same row/storage path instead of minting a new one.
  it('reuses a given documentId instead of generating a new one', async () => {
    dao.uploadPdf.mockResolvedValue({} as never);
    dao.insertDocument.mockResolvedValue({} as never);
    dao.invokeExtraction.mockResolvedValue({} as never);

    await PdfExtractionService.extract(
      { filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() },
      'user-1',
      'given-document-id',
    );

    expect(dao.uploadPdf.mock.calls[0][0].documentId).toBe('given-document-id');
    expect(dao.invokeExtraction).toHaveBeenCalledWith('given-document-id');
  });

  // @s17 (task-15) — the extraction lifecycle emits three PII-free, vendor-agnostic events at the
  // right lifecycle points: upload-started (once client pre-validation passes), and either
  // extraction-succeeded or extraction-failed. No filename/bytes/user text ever reaches a payload.
  describe('analytics (task-15, @s17)', () => {
    it('emits pdf_upload_started with size_bytes and document_id once validation passes, before any DAO call', async () => {
      dao.uploadPdf.mockImplementation(() => {
        // pdf_upload_started must already have fired by the time the DAO is first touched.
        expect(trackEvent).toHaveBeenCalledWith({
          name: 'pdf_upload_started',
          properties: { size_bytes: 3, document_id: expect.stringMatching(UUID_V4_PATTERN) },
        });
        return Promise.resolve({} as never);
      });
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockResolvedValue({} as never);

      await PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() }, 'user-1');

      expect(dao.uploadPdf).toHaveBeenCalledTimes(1);
    });

    it('emits pdf_extraction_succeeded with document_id/page_count/image_count/duration_ms on success', async () => {
      // Deterministic Date.now() sequence (mutation-kill guard, review round-1 Part B #2):
      // `expect.any(Number)` alone proves the field exists but not its sign — this pins the
      // `startedAt`/completion readings so `duration_ms` is provably `50`, catching a
      // `Date.now() - startedAt` → `+` mutation without relying on real wall-clock timing (which
      // could otherwise read 0ms on a fast run and pass by coincidence either way).
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(1_050);
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockResolvedValue({ documentId: 'ignored', pageCount: 4, imageCount: 2, filename: 'x', pages: [], images: [] });

      await PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() }, 'user-1');

      const documentId = dao.uploadPdf.mock.calls[0][0].documentId;
      const succeededCall = trackEvent.mock.calls.find(([event]) => event.name === 'pdf_extraction_succeeded');
      expect(succeededCall?.[0]).toEqual({
        name: 'pdf_extraction_succeeded',
        properties: {
          document_id: documentId,
          page_count: 4,
          image_count: 2,
          duration_ms: 50,
        },
      });
      expect(succeededCall?.[0].properties.duration_ms).toBeGreaterThan(0);
      nowSpy.mockRestore();
    });

    it('emits pdf_extraction_failed with stage client for a client pre-validation rejection, and never emits pdf_upload_started', async () => {
      await expect(
        PdfExtractionService.extract({ filename: 'notes.txt', sizeBytes: 3, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'unsupported_file_type' });

      expect(trackEvent).toHaveBeenCalledWith({
        name: 'pdf_extraction_failed',
        properties: {
          document_id: expect.stringMatching(UUID_V4_PATTERN),
          error_code: 'unsupported_file_type',
          stage: 'client',
        },
      });
      expect(trackEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'pdf_upload_started' }));
    });

    it('emits pdf_extraction_failed with stage client when unauthenticated, and never emits pdf_upload_started', async () => {
      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() }, ''),
      ).rejects.toMatchObject({ code: 'unauthenticated' });

      expect(trackEvent).toHaveBeenCalledWith({
        name: 'pdf_extraction_failed',
        properties: {
          document_id: expect.stringMatching(UUID_V4_PATTERN),
          error_code: 'unauthenticated',
          stage: 'client',
        },
      });
      expect(trackEvent).not.toHaveBeenCalledWith(expect.objectContaining({ name: 'pdf_upload_started' }));
    });

    it('emits pdf_extraction_failed with stage server for a normalized server error', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockRejectedValue(httpErrorWithBody({ errorCode: 'scanned_or_image_only' }));

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 1, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'scanned_or_image_only' });

      const documentId = dao.uploadPdf.mock.calls[0][0].documentId;
      expect(trackEvent).toHaveBeenCalledWith({
        name: 'pdf_extraction_failed',
        properties: { document_id: documentId, error_code: 'scanned_or_image_only', stage: 'server' },
      });
    });

    it('never includes filename, bytes, or any field beyond the locked PII-free payload shape', async () => {
      dao.uploadPdf.mockResolvedValue({} as never);
      dao.insertDocument.mockResolvedValue({} as never);
      dao.invokeExtraction.mockResolvedValue({ documentId: 'ignored', pageCount: 1, imageCount: 0, filename: 'secret-notes.pdf', pages: [], images: [] });

      await PdfExtractionService.extract(
        { filename: 'secret-notes.pdf', sizeBytes: 3, bytes: new Uint8Array([1, 2, 3]) },
        'user-1',
      );

      for (const [event] of trackEvent.mock.calls) {
        const values = Object.values(event.properties);
        expect(values).not.toContain('secret-notes.pdf');
        expect(JSON.stringify(event.properties)).not.toMatch(/secret-notes/);
      }
    });
  });
});
