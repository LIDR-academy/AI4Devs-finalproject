jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { LessonsDao } from './lessons.dao';

const mockGetSupabase = getSupabase as jest.Mock;

describe('LessonsDao', () => {
  const order = jest.fn();
  const select = jest.fn();
  const eq = jest.fn();
  const single = jest.fn();
  const from = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    order.mockReset();
    select.mockReset();
    eq.mockReset();
    single.mockReset();
    from.mockReset();

    // getLessons chain: from().select().order()
    order.mockResolvedValue({ data: [], error: null });
    select.mockReturnValue({ order, eq });
    eq.mockReturnValue({ single });
    from.mockReturnValue({ select });
    mockGetSupabase.mockReturnValue({ from });
  });

  // @s4 — newest first, show all; RLS scopes to the caller (no client-supplied userId filter).
  it('selects all lessons ordered by created_at descending with no user_id filter', async () => {
    order.mockResolvedValue({
      data: [
        {
          id: 'lesson-2',
          title: 'Newer',
          created_at: '2026-07-13T12:00:00.000Z',
        },
        {
          id: 'lesson-1',
          title: 'Older',
          created_at: '2026-07-12T12:00:00.000Z',
        },
      ],
      error: null,
    });

    const result = await LessonsDao.getLessons();

    expect(from).toHaveBeenCalledWith('lessons');
    expect(select).toHaveBeenCalledWith('id, title, created_at');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(eq).not.toHaveBeenCalled();
    expect(result).toEqual([
      { id: 'lesson-2', title: 'Newer', createdAt: '2026-07-13T12:00:00.000Z' },
      { id: 'lesson-1', title: 'Older', createdAt: '2026-07-12T12:00:00.000Z' },
    ]);
  });

  // @s11 — DAO never filters by a client-supplied user id; RLS does isolation.
  it('never passes a user_id equality filter on getLessons', async () => {
    await LessonsDao.getLessons();

    const eqCalls = eq.mock.calls as unknown[][];
    expect(eqCalls.every((call) => call[0] !== 'user_id')).toBe(true);
  });

  it('throws the raw supabase error when getLessons fails', async () => {
    const error = { message: 'select failed' };
    order.mockResolvedValue({ data: null, error });

    await expect(LessonsDao.getLessons()).rejects.toBe(error);
  });

  // @s8/@s12 — delete by id only; RLS scopes to the caller's rows (no client user_id filter).
  it('deleteLesson deletes by id with no user_id filter', async () => {
    const delEq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq: delEq });
    from.mockReturnValue({ select, delete: del });

    await LessonsDao.deleteLesson('lesson-1');

    expect(from).toHaveBeenCalledWith('lessons');
    expect(del).toHaveBeenCalledWith();
    expect(delEq).toHaveBeenCalledWith('id', 'lesson-1');
    expect(delEq.mock.calls.every((call) => call[0] !== 'user_id')).toBe(true);
  });

  // @s8 — Supabase error on delete is thrown raw for the service to normalize.
  it('throws the raw supabase error when deleteLesson fails', async () => {
    const error = { message: 'delete failed' };
    const delEq = jest.fn().mockResolvedValue({ error });
    const del = jest.fn().mockReturnValue({ eq: delEq });
    from.mockReturnValue({ select, delete: del });

    await expect(LessonsDao.deleteLesson('lesson-1')).rejects.toBe(error);
  });
});
