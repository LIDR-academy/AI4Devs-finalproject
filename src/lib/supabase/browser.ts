import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseBrowserEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getSupabaseBrowserEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}