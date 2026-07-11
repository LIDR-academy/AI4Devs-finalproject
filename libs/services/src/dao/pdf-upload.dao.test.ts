jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { PdfUploadDao } from './pdf-upload.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('PdfUploadDao', () => {
  const upload = jest.fn();
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const upsert = jest.fn(() => ({ select }));
  const from = jest.fn(() => ({ upsert }));
  const invoke = jest.fn();
  const storageFrom = jest.fn(() => ({ upload }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue({
      storage: { from: storageFrom },
      from,
      functions: { invoke },
    });
  });

  describe('uploadPdf', () => {
    // @s1/@s4/@s13 (Slice 2, task-12) — uploads the raw PDF bytes to the private pdf-uploads
    // bucket at the locked {user_id}/{document_id}/source.pdf path (spec decision #3); no
    // parsing happens here. `upsert: true` lets a retry (which reuses the same documentId/path,
    // task-12) overwrite a prior attempt's object instead of erroring on a conflict.
    it('uploads the given bytes to the pdf-uploads bucket at the {userId}/{documentId}/source.pdf path, allowing overwrite for retries', async () => {
      upload.mockResolvedValue({ data: { path: 'u1/d1/source.pdf' }, error: null });
      const bytes = new Uint8Array([1, 2, 3]);

      const result = await PdfUploadDao.uploadPdf({ userId: 'u1', documentId: 'd1', bytes });

      expect(storageFrom).toHaveBeenCalledWith('pdf-uploads');
      expect(upload).toHaveBeenCalledWith('u1/d1/source.pdf', bytes, { contentType: 'application/pdf', upsert: true });
      expect(result).toEqual({ path: 'u1/d1/source.pdf' });
    });

    it('throws the raw supabase storage error when the upload fails', async () => {
      const error = { message: 'storage down' };
      upload.mockResolvedValue({ data: null, error });

      await expect(
        PdfUploadDao.uploadPdf({ userId: 'u1', documentId: 'd1', bytes: new Uint8Array() }),
      ).rejects.toBe(error);
    });
  });

  describe('insertDocument', () => {
    // @s1/@s13 (Slice 2, task-12) — upserts the documents row (by id) with status 'processing'
    // and a cleared error_code (spec's processing model, step 3). Upserting rather than plain
    // inserting means a retry that reuses the same documentId (task-12) updates the existing
    // failed row instead of erroring on a duplicate primary key.
    it('upserts a documents row with status processing, clears any prior error_code, and returns the row', async () => {
      const row = { id: 'd1', user_id: 'u1', filename: 'notes.pdf', size_bytes: 2048, status: 'processing' };
      single.mockResolvedValue({ data: row, error: null });

      const result = await PdfUploadDao.insertDocument({
        documentId: 'd1',
        userId: 'u1',
        filename: 'notes.pdf',
        sizeBytes: 2048,
      });

      expect(from).toHaveBeenCalledWith('documents');
      expect(upsert).toHaveBeenCalledWith({
        id: 'd1',
        user_id: 'u1',
        filename: 'notes.pdf',
        size_bytes: 2048,
        status: 'processing',
        error_code: null,
      });
      expect(result).toBe(row);
    });

    it('throws the raw supabase error when the upsert fails', async () => {
      const error = { message: 'insert failed' };
      single.mockResolvedValue({ data: null, error });

      await expect(
        PdfUploadDao.insertDocument({ documentId: 'd1', userId: 'u1', filename: 'notes.pdf', sizeBytes: 1 }),
      ).rejects.toBe(error);
    });
  });

  describe('invokeExtraction', () => {
    // @s1/@s4 — invokes the extract-pdf function with the given documentId and returns its raw
    // result untouched; normalizing it into the typed contract is the service's job.
    it('invokes the extract-pdf function with the given documentId and returns its raw result', async () => {
      const raw = { documentId: 'd1', filename: 'notes.pdf', pageCount: 2, imageCount: 1, pages: [], images: [] };
      invoke.mockResolvedValue({ data: raw, error: null });

      const result = await PdfUploadDao.invokeExtraction('d1');

      expect(invoke).toHaveBeenCalledWith('extract-pdf', { body: { documentId: 'd1' } });
      expect(result).toBe(raw);
    });

    it('throws the raw supabase functions error when the invoke fails', async () => {
      const error = { message: 'function crashed' };
      invoke.mockResolvedValue({ data: null, error });

      await expect(PdfUploadDao.invokeExtraction('d1')).rejects.toBe(error);
    });
  });
});
