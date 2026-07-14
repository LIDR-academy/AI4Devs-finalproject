import type { SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { renderHook, waitFor } from '@testing-library/react';

import { useLesson } from './use-lesson';

/**
 * Slice-1 integration: useLesson → LessonsService → LessonsDao against a mocked Supabase
 * `from` boundary. Nothing above the DAO is mocked.
 */
let client: SupabaseClient;

describe('lesson-player slice-1 integration (hook → service → DAO)', () => {
  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  afterEach(() => jest.restoreAllMocks());

  // @s17/@s1 feed — full lesson with slides loads through the real chain.
  it('loads a full lesson with slides through useLesson → service → DAO', async () => {
    const slides = [
      {
        id: 'slide-1',
        lessonId: 'lesson-1',
        title: 'Intro',
        content: 'Hello',
        position: 0,
        kind: 'instructional' as const,
      },
    ];
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'lesson-1',
        title: 'Capitals',
        slides,
        created_at: '2026-07-12T12:00:00.000Z',
        user_id: 'user-1',
      },
      error: null,
    });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    const { result } = renderHook(() => useLesson('lesson-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(client.from).toHaveBeenCalledWith('lessons');
    expect(select).toHaveBeenCalledWith('id, title, slides, created_at, user_id');
    expect(eq).toHaveBeenCalledWith('id', 'lesson-1');
    expect(result.current.lesson).toEqual({
      id: 'lesson-1',
      title: 'Capitals',
      slides,
      createdAt: '2026-07-12T12:00:00.000Z',
      userId: 'user-1',
    });
    expect(result.current.error).toBeNull();
  });
});
