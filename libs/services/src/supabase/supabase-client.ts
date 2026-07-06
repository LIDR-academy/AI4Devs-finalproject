import { createClient, SupabaseClient, SupportedStorage } from '@supabase/supabase-js';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  storage?: SupportedStorage;
  detectSessionInUrl?: boolean;
};

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
