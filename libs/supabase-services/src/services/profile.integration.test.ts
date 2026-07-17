jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { ProfileService } from './profile.service';

const mockGetSupabase = getSupabase as jest.Mock;

describe('entitlements service integration', () => {
  it('@s12 reads the latest plan flags through the DAO and maps fresh entitlements', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        plan_id: 'free',
        plans: {
          use_platform_key: false,
          show_ads: true,
          show_key_settings: true,
        },
      },
      error: null,
    });
    const select = jest.fn(() => ({ single }));
    mockGetSupabase.mockReturnValue({ from: jest.fn(() => ({ select })) });

    await expect(ProfileService.getProfile()).resolves.toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });
  });
});
