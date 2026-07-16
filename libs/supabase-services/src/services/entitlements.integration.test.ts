jest.mock('../supabase/supabase-client', () => ({ getSupabase: jest.fn() }));

import { getSupabase } from '../supabase/supabase-client';
import { EntitlementsService } from './entitlements.service';

const mockGetSupabase = getSupabase as jest.Mock;

describe('entitlements service integration', () => {
  it('@s12 reads the latest profile plan through the DAO and derives fresh entitlements', async () => {
    const single = jest.fn().mockResolvedValue({ data: { plan: 'free' }, error: null });
    const select = jest.fn(() => ({ single }));
    mockGetSupabase.mockReturnValue({ from: jest.fn(() => ({ select })) });

    await expect(EntitlementsService.getEntitlements()).resolves.toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });
  });
});
