/** Shared CORS for browser invokes (EAS web → hosted functions). */
const ALLOWED_ORIGINS = new Set([
  'https://aistudybuddy.expo.app',
  'http://localhost:8081',
  'http://localhost:8091',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8091',
]);

const DEFAULT_ORIGIN = 'https://aistudybuddy.expo.app';

const baseHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
} as const;

/** Reflect request Origin when allowlisted; else prod web URL. */
export const corsHeaders = (req?: Request): Record<string, string> => {
  const origin = req?.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ORIGIN;
  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
  };
};

export const corsPreflightResponse = (req?: Request): Response =>
  new Response('ok', { headers: corsHeaders(req) });
