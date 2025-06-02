import { createBrowserClient } from '@supabase/ssr'

export const createClientSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Keep the old export for backward compatibility but mark as deprecated
export const createClient = createClientSupabaseClient
