import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseBrowserEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseAnonKey, supabaseUrl } = getSupabaseBrowserEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, options, value }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}