jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { ProfileDao } from '../index';
import { getSupabase } from '../supabase/supabase-client';

const mockGetSupabase = getSupabase as jest.Mock;

const freePlansEmbed = {
  use_platform_key: false,
  show_ads: true,
  show_key_settings: true,
};

describe('ProfileDao', () => {
  const single = jest.fn();
  const select = jest.fn(() => ({ single }));
  const from = jest.fn(() => ({ select }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabase.mockReturnValue({ from });
  });

  it('@s2 reads the current caller profile with plan flags via profiles→plans join', async () => {
    single.mockResolvedValue({
      data: { plan_id: 'free', plans: freePlansEmbed },
      error: null,
    });

    await expect(ProfileDao.getCurrentProfile()).resolves.toEqual({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
    });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith(
      'plan_id, plans(use_platform_key, show_ads, show_key_settings)',
    );
    expect(single).toHaveBeenCalledWith();
  });

  it('@s5 rejects a missing profile instead of coercing it to free', async () => {
    single.mockResolvedValue({ data: null, error: null });

    await expect(ProfileDao.getCurrentProfile()).rejects.toThrow('Profile not found');
  });

  it('@s5 throws the Supabase data-access error unchanged', async () => {
    const error = { message: 'profiles unavailable', code: 'PGRST001' };
    single.mockResolvedValue({ data: null, error });

    await expect(ProfileDao.getCurrentProfile()).rejects.toBe(error);
  });
});
