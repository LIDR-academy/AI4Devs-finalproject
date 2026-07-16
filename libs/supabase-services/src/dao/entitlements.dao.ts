import type { Plan } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

export type PlanFlagsRow = {
  plan: Plan;
  usePlatformKey: boolean;
  showAds: boolean;
  showKeySettings: boolean;
  canCreateWithoutKey: boolean;
};

type PlansEmbed = {
  use_platform_key: boolean;
  show_ads: boolean;
  show_key_settings: boolean;
  can_create_without_key: boolean;
};

type ProfilePlanJoinRow = {
  plan_id: string;
  plans: PlansEmbed | PlansEmbed[] | null;
};

const asPlan = (planId: string): Plan => {
  if (planId === 'free' || planId === 'paid') return planId;
  throw new Error('Invalid profile plan');
};

const embedPlans = (plans: ProfilePlanJoinRow['plans']): PlansEmbed => {
  if (!plans) throw new Error('Plan not found');
  return Array.isArray(plans) ? plans[0] : plans;
};

export abstract class EntitlementsDao {
  static async getCurrentPlan(): Promise<PlanFlagsRow> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select(
        'plan_id, plans(use_platform_key, show_ads, show_key_settings, can_create_without_key)',
      )
      .single();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');

    const row = data as ProfilePlanJoinRow;
    const plan = embedPlans(row.plans);

    return {
      plan: asPlan(row.plan_id),
      usePlatformKey: plan.use_platform_key,
      showAds: plan.show_ads,
      showKeySettings: plan.show_key_settings,
      canCreateWithoutKey: plan.can_create_without_key,
    };
  }
}
