import { EntitlementsDao } from '../dao/entitlements.dao';
import type { PlanEntitlements } from './entitlements.types';

/** Maps the single profiles→plans join into the client entitlements contract. */
export abstract class EntitlementsService {
  static async getEntitlements(): Promise<PlanEntitlements> {
    const profile = await EntitlementsDao.getCurrentProfile();

    return {
      plan: profile.plan,
      keySource: profile.usePlatformKey ? 'platform' : 'user',
      showKeySettings: profile.showKeySettings,
      showAds: profile.showAds,
      canCreateWithoutKey: profile.canCreateWithoutKey,
    };
  }
}
