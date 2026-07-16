import { EntitlementsDao } from '../dao/entitlements.dao';
import type { PlanEntitlements } from './entitlements.types';

export abstract class EntitlementsService {
  static async getEntitlements(): Promise<PlanEntitlements> {
    const { plan } = await EntitlementsDao.getCurrentPlan();
    if (plan === 'paid') {
      return {
        plan,
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
      };
    }
    if (plan !== 'free') throw new Error('Invalid profile plan');

    return {
      plan,
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    };
  }
}
