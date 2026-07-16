jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { EntitlementsDao } from '../index';
import { getSupabase } from '../supabase/supabase-client';

const mockGetSupabase = getSupabase as jest.Mock;

const freePlansEmbed = {
  use_platform_key: false,
  show_ads: true,
  show_key_settings: true,
  can_create_without_key: false,
};

describe('EntitlementsDao', () => {
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

    await expect(EntitlementsDao.getCurrentProfile()).resolves.toEqual({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
      canCreateWithoutKey: false,
    });
    expect(from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith(
      'plan_id, plans(use_platform_key, show_ads, show_key_settings, can_create_without_key)',
    );
    expect(single).toHaveBeenCalledWith();
  });

  it('@s5 rejects a missing profile instead of coercing it to free', async () => {
    single.mockResolvedValue({ data: null, error: null });

    await expect(EntitlementsDao.getCurrentProfile()).rejects.toThrow('Profile not found');
  });

  it('@s5 throws the Supabase data-access error unchanged', async () => {
    const error = { message: 'profiles unavailable', code: 'PGRST001' };
    single.mockResolvedValue({ data: null, error });

    await expect(EntitlementsDao.getCurrentProfile()).rejects.toBe(error);
  });
});
