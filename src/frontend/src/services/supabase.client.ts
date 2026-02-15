/**
 * Supabase Client Singleton (T-031-FRONT)
 * 
 * Provides a singleton instance of the Supabase client for Realtime subscriptions.
 * Supports Dependency Injection for testing and custom configurations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Configuration for Supabase client initialization.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance (singleton pattern).
 * 
 * Supports two modes:
 * 1. Production: Reads from import.meta.env (default)
 * 2. Testing/Custom: Accepts explicit config parameter
 * 
 * @param config - Optional configuration object for DI/testing
 * @throws Error if configuration is missing or invalid
 * @returns Supabase client instance
 */
export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Determine configuration source
  const finalConfig: SupabaseConfig = config || {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  // Validate configuration
  if (!finalConfig.url || !finalConfig.anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  // Create and store singleton instance
  supabaseInstance = createClient(finalConfig.url, finalConfig.anonKey);

  return supabaseInstance;
}

/**
 * Reset the singleton instance (for testing purposes only).
 * @internal
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
