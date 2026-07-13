/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { useSession } from '@helsoft/hooks';
import { initSupabase } from '@helsoft/supabase-services';
import type { SupabaseClient } from '@helsoft/supabase-services';

import { usePdfExtraction } from './use-pdf-extraction';

/**
 * Slice-1 integration (pdf-upload-extraction, task-8): usePdfExtraction -> PdfExtractionService
 * -> PdfUploadDao, exercised for real against a mocked Supabase client boundary — only
 * storage/table/functions calls are stubbed, mirroring `auth.integration.test.ts`'s pattern of
 * one shared real `SupabaseClient` reused across tests (avoids the "Multiple GoTrueClient
 * instances" warning).
 */
let sharedClient: SupabaseClient;

describe('pdf-upload-extraction slice-1 integration', () => {
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

  // @s1/@s4 — the happy path goes through hook -> service -> DAO only: it uploads the raw bytes
  // to pdf-uploads at the {userId}/{documentId}/source.pdf path, inserts a processing documents
  // row, invokes extract-pdf, and resolves with the typed PdfExtractionResult. No PDF parsing
  // happens on the client.
  it('extract() uploads, inserts, invokes extraction, and resolves with the typed result', async () => {
    const uploadedPaths: string[] = [];
    jest.spyOn(sharedClient.storage, 'from').mockReturnValue({
      upload: jest.fn((path: string) => {
        uploadedPaths.push(path);
        return Promise.resolve({ data: { path }, error: null });
      }),
    } as never);

    const insertedRows: Record<string, unknown>[] = [];
    // `insertDocument` upserts (task-12, retry-safety) rather than plain-inserting — see
    // pdf-upload.dao.test.ts.
    jest.spyOn(sharedClient, 'from').mockReturnValue({
      upsert: jest.fn((row: Record<string, unknown>) => {
        insertedRows.push(row);
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
    // `functions` is a getter that builds a fresh FunctionsClient on every access (supabase-js's
    // SupabaseClient.ts) — spying on one snapshot instance's `invoke` wouldn't reach the instance
    // PdfUploadDao later obtains via its own `getSupabase().functions` access; stub the getter.
    jest
      .spyOn(sharedClient, 'functions', 'get')
      .mockReturnValue({ invoke: jest.fn().mockResolvedValue({ data: extractionResult, error: null }) } as never);

    const { result } = renderHook(() => ({ session: useSession(), pdf: usePdfExtraction() }));
    await waitFor(() => expect(result.current.session.isLoading).toBe(false));

    expect(result.current.pdf.stage).toBe('idle');

    await act(async () => {
      await result.current.pdf.extract({ filename: 'notes.pdf', sizeBytes: 3, bytes: new Uint8Array([1, 2, 3]) });
    });

    expect(result.current.pdf.stage).toBe('success');
    expect(result.current.pdf.result).toEqual(extractionResult);
    expect(uploadedPaths[0]).toMatch(/^user-1\/[0-9a-f-]+\/source\.pdf$/);
    expect(insertedRows[0]).toMatchObject({
      user_id: 'user-1',
      filename: 'notes.pdf',
      size_bytes: 3,
      status: 'processing',
    });
  });
});
