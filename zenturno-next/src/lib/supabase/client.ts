import { createBrowserClient } from '@supabase/ssr';

/**
 * Checks if the current session is valid
 * @returns {Promise<boolean>} True if session is valid, false otherwise
 */
export const isValidSession = async (supabase: any) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !error && !!data?.session;
  } catch (e) {
    console.warn('Session validation error:', e);
    return false;
  }
};

/**
 * Creates a Supabase client for browser environments with enhanced auth configuration
 */
export const createClientSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase-auth-token',
      },
      cookies: {
        get(name) {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') {
            // We're in a server context, return undefined
            return undefined;
          }
          
          const cookie: Record<string, string> = {};
          document.cookie.split(';').forEach(function(el) {
            const [key, value] = el.split('=');
            if (key) cookie[key.trim()] = value;
          });
          return cookie[name];
        },
        set(name, value, options) {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') {
            // We're in a server context, do nothing
            return;
          }
          
          let cookie = `${name}=${value}`;
          if (options?.expires) {
            cookie += `; expires=${options.expires.toUTCString()}`;
          }
          if (options?.path) {
            cookie += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`;
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookie += '; secure';
          }
          document.cookie = cookie;
        },
        remove(name, options) {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') {
            // We're in a server context, do nothing
            return;
          }
          
          let cookieString = `${name}=; max-age=0`
          if (options?.path) cookieString += `; path=${options.path}`
          if (options?.domain) cookieString += `; domain=${options.domain}`
          document.cookie = cookieString
        }
      }
    }
  );
};

/**
 * Creates a Supabase client for browser environments with enhanced auth configuration
 */
export const createClient = createClientSupabaseClient

// Keep the old export for backward compatibility but mark as deprecated
// export const createClient = createClientSupabaseClient
