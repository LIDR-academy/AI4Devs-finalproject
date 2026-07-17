import { ProfileDao } from '../dao/profile.dao';
import type { ProfilePlan } from './profile.types';

/** Maps the single profiles→plans join into the client profile contract. */
export abstract class ProfileService {
  static async getProfile(): Promise<ProfilePlan> {
    const profile = await ProfileDao.getCurrentProfile();

    return {
      plan: profile.plan,
      keySource: profile.usePlatformKey ? 'platform' : 'user',
      showKeySettings: profile.showKeySettings,
      showAds: profile.showAds,
    };
  }
}
