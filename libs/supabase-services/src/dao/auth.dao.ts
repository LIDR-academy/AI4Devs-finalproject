import { getSupabase } from '../supabase/supabase-client';

import type { SignInWithPasswordParams, SignInWithPasswordResult } from './auth.types';

/**
 * Raw Supabase auth data access. No validation, no error mapping — the service layer
 * decides what an invalid-credentials or network failure means to the UI.
 */
export abstract class AuthDao {
  static async signInWithPassword({
    email,
    password,
  }: SignInWithPasswordParams): Promise<SignInWithPasswordResult> {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  static async signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }
}
