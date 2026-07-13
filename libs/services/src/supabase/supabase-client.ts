import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { SupabaseConfig } from './supabase-client.types';

let client: SupabaseClient | undefined;

export const initSupabase = (config: SupabaseConfig): SupabaseClient => {
  client = createClient(config.url, config.anonKey, {
    auth: {
      storage: config.storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: config.detectSessionInUrl ?? false,
    },
  });
  return client;
};

export const getSupabase = (): SupabaseClient => {
  if (!client) {
    throw new Error('Supabase client not initialized. Call initSupabase() first.');
  }
  return client;
};
