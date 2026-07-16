import type { Plan } from '@helsoft/types';

import { getSupabase } from '../supabase/supabase-client';

type ProfilePlanRow = {
  plan: Plan;
};

export abstract class EntitlementsDao {
  static async getCurrentPlan(): Promise<ProfilePlanRow> {
    const { data, error } = await getSupabase().from('profiles').select('plan').single();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data as ProfilePlanRow;
  }
}
