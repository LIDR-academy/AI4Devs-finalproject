jest.mock('../dao/profile.dao', () => ({
  ProfileDao: { getCurrentProfile: jest.fn() },
}));

import { ProfileDao } from '../dao/profile.dao';
import { ProfileService } from './profile.service';

const dao = ProfileDao as jest.Mocked<typeof ProfileDao>;

describe('ProfileService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('@s2 maps free plan flags to user-key entitlements', async () => {
    dao.getCurrentProfile.mockResolvedValue({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
    });

    await expect(ProfileService.getProfile()).resolves.toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });
  });

  it('@s9 maps paid plan flags to platform entitlements without key settings or ads', async () => {
    dao.getCurrentProfile.mockResolvedValue({
      plan: 'paid',
      usePlatformKey: true,
      showAds: false,
      showKeySettings: false,
    });

    await expect(ProfileService.getProfile()).resolves.toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
    });
  });

  it('@s16 exposes showAds from the plan row without starting ad behavior', async () => {
    dao.getCurrentProfile.mockResolvedValue({
      plan: 'free',
      usePlatformKey: false,
      showAds: true,
      showKeySettings: true,
    });

    await expect(ProfileService.getProfile()).resolves.toMatchObject({
      plan: 'free',
      showAds: true,
    });
  });
});
