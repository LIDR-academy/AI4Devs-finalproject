import { EntitlementsDao } from '../dao/entitlements.dao';
import type { PlanEntitlements } from './entitlements.types';

export abstract class EntitlementsService {
  static async getEntitlements(): Promise<PlanEntitlements> {
    const flags = await EntitlementsDao.getCurrentPlan();

    return {
      plan: flags.plan,
      keySource: flags.usePlatformKey ? 'platform' : 'user',
      showKeySettings: flags.showKeySettings,
      showAds: flags.showAds,
      canCreateWithoutKey: flags.canCreateWithoutKey,
    };
  }
}
