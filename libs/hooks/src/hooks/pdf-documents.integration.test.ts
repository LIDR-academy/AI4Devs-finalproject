import type { SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react';

import { usePdfDocuments } from './use-pdf-documents';

/**
 * Integration (pending-pdfs-generate, Slice 1): usePdfDocuments -> PdfDocumentsService ->
 * PdfDocumentsDao against a mocked Supabase `from` boundary. Nothing above the DAO is mocked.
 */
let client: SupabaseClient;

describe('pending-pdfs-generate slice-1 integration (hook -> service -> DAO)', () => {
  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  afterEach(() => jest.restoreAllMocks());

  // @s1/@s4/@s17 — list loads from user_documents with derived status through the real chain.
  it('loads own documents newest-first through the real hook -> service -> DAO chain', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'doc-2',
          filename: 'newer.pdf',
          page_count: 5,
          created_at: '2026-07-14T12:00:00.000Z',
          generation_error_code: null,
          lesson_id: 'lesson-1',
        },
        {
          id: 'doc-1',
          filename: 'older.pdf',
          page_count: 2,
          created_at: '2026-07-13T12:00:00.000Z',
          generation_error_code: 'timeout',
          lesson_id: null,
        },
      ],
      error: null,
    });
    const select = jest.fn(() => ({ order }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(client.from).toHaveBeenCalledWith('user_documents');
    expect(select).toHaveBeenCalledWith(
      'id, filename, page_count, created_at, generation_error_code, lesson_id',
    );
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result.current.documents).toEqual([
      {
        id: 'doc-2',
        filename: 'newer.pdf',
        pageCount: 5,
        createdAt: '2026-07-14T12:00:00.000Z',
        status: 'generated',
        lessonId: 'lesson-1',
      },
      {
        id: 'doc-1',
        filename: 'older.pdf',
        pageCount: 2,
        createdAt: '2026-07-13T12:00:00.000Z',
        status: 'failed',
        lessonId: null,
      },
    ]);
    expect(result.current.error).toBeNull();
  });

  // @s16 — refetch recovers after a failed load.
  it('refetch recovers after a failed load', async () => {
    const order = jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: 'offline' } })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'doc-1',
            filename: 'only.pdf',
            page_count: 1,
            created_at: '2026-07-14T00:00:00.000Z',
            generation_error_code: null,
            lesson_id: null,
          },
        ],
        error: null,
      });
    const select = jest.fn(() => ({ order }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => usePdfDocuments());

    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.documents).toEqual([
      {
        id: 'doc-1',
        filename: 'only.pdf',
        pageCount: 1,
        createdAt: '2026-07-14T00:00:00.000Z',
        status: 'ready',
        lessonId: null,
      },
    ]);
  });
});
