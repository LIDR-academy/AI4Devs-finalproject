import type { Plan } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

export type ProfileWithPlanFlags = {
  plan: Plan;
  usePlatformKey: boolean;
  showAds: boolean;
  showKeySettings: boolean;
};

type PlansEmbed = {
  use_platform_key: boolean;
  show_ads: boolean;
  show_key_settings: boolean;
};

type ProfilePlanJoinRow = {
  plan_id: string;
  plans: PlansEmbed | PlansEmbed[] | null;
};

const embedPlans = (plans: ProfilePlanJoinRow['plans']): PlansEmbed => {
  if (!plans) throw new Error('Plan not found');
  return Array.isArray(plans) ? plans[0] : plans;
};

/** One Supabase round-trip: caller's profile row joined with its plan flags. */
export abstract class ProfileDao {
  static async getCurrentProfile(): Promise<ProfileWithPlanFlags> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('plan_id, plans(use_platform_key, show_ads, show_key_settings)')
      .single();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');

    const row = data as ProfilePlanJoinRow;
    const plan = embedPlans(row.plans);

    return {
      plan: row.plan_id,
      usePlatformKey: plan.use_platform_key,
      showAds: plan.show_ads,
      showKeySettings: plan.show_key_settings,
    };
  }
}
