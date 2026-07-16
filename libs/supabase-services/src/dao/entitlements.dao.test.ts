jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { EntitlementsDao } from '../index';
import { getSupabase } from '../supabase/supabase-client';

const mockGetSupabase = getSupabase as jest.Mock;

describe('EntitlementsDao', () => {
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const from = jest.fn(() => ({ select }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue({ from });
  });

  it('@s2 reads the current caller profile plan', async () => {
    single.mockResolvedValue({ data: { plan: 'free' }, error: null });

    await expect(EntitlementsDao.getCurrentPlan()).resolves.toEqual({ plan: 'free' });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('plan');
    expect(single).toHaveBeenCalledWith();
  });

  it('@s5 rejects a missing profile instead of coercing it to free', async () => {
    single.mockResolvedValue({ data: null, error: null });

    await expect(EntitlementsDao.getCurrentPlan()).rejects.toThrow('Profile not found');
  });

  it('@s5 throws the Supabase data-access error unchanged', async () => {
    const error = { message: 'profiles unavailable', code: 'PGRST001' };
    single.mockResolvedValue({ data: null, error });

    await expect(EntitlementsDao.getCurrentPlan()).rejects.toBe(error);
  });
});
