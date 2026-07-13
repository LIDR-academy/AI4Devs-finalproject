import type { SupportedStorage } from '@supabase/supabase-js';

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  storage?: SupportedStorage;
  detectSessionInUrl?: boolean;
};
