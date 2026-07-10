import { act, renderHook, waitFor } from '@testing-library/react';
import { FunctionsFetchError, initSupabase } from '@helsoft/services';
import type { SupabaseClient } from '@helsoft/services';

import { usePdfExtraction } from './use-pdf-extraction';
import { useSession } from './use-session';

/**
 * Slice-2 integration (pdf-upload-extraction, task-12, @s13): usePdfExtraction -> PdfExtractionService
 * -> PdfUploadDao, exercised for real against a mocked Supabase client boundary — a transient
 * network failure on the first `functions.invoke` surfaces as a retryable `network_error`, and a
 * subsequent `retry()` (once the connection is restored) reuses the exact same documentId/storage
 * path and resolves with the typed success result. Mirrors `pdf-extraction.integration.test.ts`'s
 * shared-client pattern (avoids the "Multiple GoTrueClient instances" warning).
 */
let sharedClient: SupabaseClient;

describe('pdf-upload-extraction slice-2 error/retry integration', () => {
  beforeAll(() => {
    sharedClient = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  beforeEach(() => {
    jest.spyOn(sharedClient.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
      error: null,
    } as never);
    jest
      .spyOn(sharedClient.auth, 'onAuthStateChange')
      .mockImplementation(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }) as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('surfaces a transient network failure as a retryable error, then retry() reuses the same documentId and succeeds', async () => {
    const uploadedPaths: string[] = [];
    jest.spyOn(sharedClient.storage, 'from').mockReturnValue({
      upload: jest.fn((path: string) => {
        uploadedPaths.push(path);
        return Promise.resolve({ data: { path }, error: null });
      }),
    } as never);

    const upsertedRowIds: string[] = [];
    jest.spyOn(sharedClient, 'from').mockReturnValue({
      upsert: jest.fn((row: Record<string, unknown>) => {
        upsertedRowIds.push(row.id as string);
        return { select: () => ({ single: () => Promise.resolve({ data: { id: row.id }, error: null }) }) };
      }),
    } as never);

    const extractionResult = {
      documentId: 'doc-1',
      filename: 'notes.pdf',
      pageCount: 2,
      imageCount: 1,
      pages: [{ page: 1, text: 'hi' }],
      images: [],
    };
    const invoke = jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: new FunctionsFetchError(new Error('offline')) })
      .mockResolvedValueOnce({ data: extractionResult, error: null });
    jest.spyOn(sharedClient, 'functions', 'get').mockReturnValue({ invoke } as never);

    const { result } = renderHook(() => ({ session: useSession(), pdf: usePdfExtraction() }));
    await waitFor(() => expect(result.current.session.isLoading).toBe(false));

    await act(async () => {
      await result.current.pdf.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array([1, 2, 3]) });
    });

    expect(result.current.pdf.stage).toBe('error');
    expect(result.current.pdf.error).toBe('network_error');

    await act(async () => {
      await result.current.pdf.retry();
    });

    expect(result.current.pdf.stage).toBe('success');
    expect(result.current.pdf.result).toEqual(extractionResult);

    // No duplicate orphaned row/path (task-12): both the storage upload and the documents upsert
    // reused the exact same documentId across the failed attempt and the retry.
    expect(uploadedPaths).toHaveLength(2);
    expect(uploadedPaths[0]).toBe(uploadedPaths[1]);
    expect(upsertedRowIds).toHaveLength(2);
    expect(upsertedRowIds[0]).toBe(upsertedRowIds[1]);
    expect(invoke).toHaveBeenCalledTimes(2);
  });
});
