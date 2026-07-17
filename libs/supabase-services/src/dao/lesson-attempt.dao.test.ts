jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { LessonAttemptDao } from './lesson-attempt.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('LessonAttemptDao', () => {
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const insert = jest.fn(() => ({ select }));
  const from = jest.fn(() => ({ insert }));

  beforeEach(() => {
    jest.clearAllMocks();
    single.mockReset();
    select.mockReturnValue({ single });
    insert.mockReturnValue({ select });
    from.mockReturnValue({ insert });
    mockGetSupabase.mockReturnValue({ from });
  });

  // @s6 — inserting sends only lesson_id/score/total (never user_id — the column default +
  // RLS set/enforce it), each call is a fresh insert (additive, no update path exists).
  it('inserts only lesson_id, score, and total on the lesson_attempts table', async () => {
    single.mockResolvedValue({
      data: {
        id: 'attempt-1',
        lesson_id: 'lesson-1',
        score: 3,
        total: 3,
        created_at: '2026-07-11T00:00:00.000Z',
      },
      error: null,
    });

    await LessonAttemptDao.insertAttempt({ lessonId: 'lesson-1', score: 3, total: 3 });

    expect(from).toHaveBeenCalledWith('lesson_attempts');
    expect(insert).toHaveBeenCalledWith({ lesson_id: 'lesson-1', score: 3, total: 3 });
  });

  // Row → LessonAttempt mapping (snake_case DB → camelCase type).
  it('maps the inserted row to a camelCase LessonAttempt', async () => {
    single.mockResolvedValue({
      data: {
        id: 'attempt-1',
        lesson_id: 'lesson-1',
        score: 3,
        total: 3,
        created_at: '2026-07-11T00:00:00.000Z',
      },
      error: null,
    });

    const result = await LessonAttemptDao.insertAttempt({
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
    });

    expect(result).toEqual({
      id: 'attempt-1',
      lessonId: 'lesson-1',
      score: 3,
      total: 3,
      createdAt: '2026-07-11T00:00:00.000Z',
    });
  });

  // Failure path — a Supabase insert error is thrown as-is; the service decides what it means.
  it('throws the raw supabase error when the insert fails', async () => {
    const error = { message: 'insert failed' };
    single.mockResolvedValue({ data: null, error });

    await expect(
      LessonAttemptDao.insertAttempt({ lessonId: 'lesson-1', score: 3, total: 3 }),
    ).rejects.toBe(error);
  });
});
