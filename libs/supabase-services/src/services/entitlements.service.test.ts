jest.mock('../dao/entitlements.dao', () => ({
  EntitlementsDao: { getCurrentPlan: jest.fn() },
}));

import { EntitlementsDao } from '../dao/entitlements.dao';
import { EntitlementsService } from './entitlements.service';

const dao = EntitlementsDao as jest.Mocked<typeof EntitlementsDao>;

describe('EntitlementsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('@s2 maps free plan flags to user-key entitlements', async () => {
    dao.getCurrentPlan.mockResolvedValue({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
      canCreateWithoutKey: false,
    });

    await expect(EntitlementsService.getEntitlements()).resolves.toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
    });
  });

  it('@s9 maps paid plan flags to platform entitlements without key settings or ads', async () => {
    dao.getCurrentPlan.mockResolvedValue({
      plan: 'paid',
      usePlatformKey: true,
      showAds: false,
      showKeySettings: false,
      canCreateWithoutKey: true,
    });

    await expect(EntitlementsService.getEntitlements()).resolves.toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
    });
  });

  it('@s16 exposes showAds from the plan row without starting ad behavior', async () => {
    dao.getCurrentPlan.mockResolvedValue({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
      canCreateWithoutKey: false,
    });

    await expect(EntitlementsService.getEntitlements()).resolves.toMatchObject({
      plan: 'free',
      showAds: true,
    });
  });
});
