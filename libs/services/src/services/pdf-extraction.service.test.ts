jest.mock('../dao/pdf-upload.dao', () => ({
  PdfUploadDao: {
    uploadPdf: jest.fn(),
    insertDocument: jest.fn(),
    invokeExtraction: jest.fn(),
  },
}));

import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { PdfUploadDao } from '../dao/pdf-upload.dao';
import { PdfExtractionService } from './pdf-extraction.service';

const dao = PdfUploadDao as jest.Mocked<typeof PdfUploadDao>;

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

  // @s14 (task-9) — no session at all is rejected client-side, before any DAO call.
  it('rejects with unauthenticated and never calls the DAO when no userId is given', async () => {
    await expect(
      PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array() }, ''),
    ).rejects.toMatchObject({ code: 'unauthenticated' });

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
      const oversizeBytes = 10 * 1024 * 1024 + 1;

      await expect(
        PdfExtractionService.extract({ filename: 'notes.pdf', sizeBytes: oversizeBytes, bytes: new Uint8Array() }, 'user-1'),
      ).rejects.toMatchObject({ code: 'file_too_large' });

      expect(dao.uploadPdf).not.toHaveBeenCalled();
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
});
