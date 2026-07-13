export * from './supabase/supabase-client';
export type * from './supabase/supabase-client.types';
export * from './services';
export type { Session, SupabaseClient, User } from '@supabase/supabase-js';
// Re-exported (not just types) so consumers — e.g. the Slice-2 error/retry integration test —
// can construct representative transport-failure fixtures without adding a direct
// `@supabase/supabase-js` dependency of their own (task-12).
export { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
