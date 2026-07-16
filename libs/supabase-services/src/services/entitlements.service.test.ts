jest.mock('../dao/entitlements.dao', () => ({
  EntitlementsDao: { getCurrentPlan: jest.fn() },
}));

import { EntitlementsDao } from '../dao/entitlements.dao';
import { EntitlementsService } from './entitlements.service';

const dao = EntitlementsDao as jest.Mocked<typeof EntitlementsDao>;

describe('EntitlementsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('@s2 derives free plan settings and ads from the live profile', async () => {
    dao.getCurrentPlan.mockResolvedValue({ plan: 'free' });

    await expect(EntitlementsService.getEntitlements()).resolves.toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });
  });

  it('@s9 derives platform access without key settings or ads for paid plans', async () => {
    dao.getCurrentPlan.mockResolvedValue({ plan: 'paid' });

    await expect(EntitlementsService.getEntitlements()).resolves.toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
    });
  });

  it('@s5 rejects an invalid stored plan instead of granting fallback entitlements', async () => {
    dao.getCurrentPlan.mockResolvedValue({ plan: 'enterprise' as 'free' });

    await expect(EntitlementsService.getEntitlements()).rejects.toThrow('Invalid profile plan');
  });

  it.each([
    ['free', true],
    ['paid', false],
  ] as const)('@s16 derives plan %s showAds=%s', async (plan, showAds) => {
    dao.getCurrentPlan.mockResolvedValue({ plan });

    await expect(EntitlementsService.getEntitlements()).resolves.toMatchObject({ plan, showAds });
  });
});
