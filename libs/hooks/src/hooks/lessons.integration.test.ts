import type { SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useLessons } from './use-lessons';

/**
 * Integration (signup-and-lesson-persistence, Slice 1): useLessons -> LessonsService ->
 * LessonsDao against a mocked Supabase `from` boundary. Nothing above the DAO is mocked.
 * Mirrors `api-key.integration.test.ts`: one real client for the file.
 */
let client: SupabaseClient;

describe('signup-and-lesson-persistence slice-1 integration (hook -> service -> DAO)', () => {
  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  afterEach(() => jest.restoreAllMocks());

  // @s4/@s11 — Home list loads newest-first through the real chain; RLS (not a client userId
  // filter) scopes rows — the DAO only asks for id/title/created_at ordered desc.
  it('loads own lessons newest-first through the real hook -> service -> DAO chain', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        { id: 'lesson-2', title: 'Newer', created_at: '2026-07-13T12:00:00.000Z' },
        { id: 'lesson-1', title: 'Older', created_at: '2026-07-12T12:00:00.000Z' },
      ],
      error: null,
    });
    const select = jest.fn(() => ({ order }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(client.from).toHaveBeenCalledWith('lessons');
    expect(select).toHaveBeenCalledWith('id, title, created_at');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result.current.lessons).toEqual([
      { id: 'lesson-2', title: 'Newer', createdAt: '2026-07-13T12:00:00.000Z' },
      { id: 'lesson-1', title: 'Older', createdAt: '2026-07-12T12:00:00.000Z' },
    ]);
    expect(result.current.error).toBeNull();
  });

  // @s7 feed — refetch after a failure recovers the list (logout/login survival is DB-side;
  // refetch is the client seam).
  it('refetch recovers after a failed load', async () => {
    const order = jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: 'offline' } })
      .mockResolvedValueOnce({
        data: [{ id: 'lesson-1', title: 'Only', created_at: '2026-07-13T00:00:00.000Z' }],
        error: null,
      });
    const select = jest.fn(() => ({ order }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.lessons).toEqual([
      { id: 'lesson-1', title: 'Only', createdAt: '2026-07-13T00:00:00.000Z' },
    ]);
  });
});
