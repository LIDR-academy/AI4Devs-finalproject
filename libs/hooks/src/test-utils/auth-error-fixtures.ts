/**
 * Test-only factory for a Supabase GoTrue `AuthApiError`-shaped fixture, used by
 * `auth.integration.test.ts` to exercise `AuthService`'s real error normalization against a
 * realistic rejection — without `@helsoft/hooks` taking a dependency on `@supabase/supabase-js`
 * just for test fixtures (Slice 2, Round 1 review, Minor 3 — `@helsoft/supabase-services`'s production
 * barrel no longer re-exports the vendor `AuthApiError` class solely for this purpose).
 *
 * Duck-types the exact shape `@supabase/auth-js`'s `isAuthError`/`isAuthApiError` check at
 * runtime (`'__isAuthError' in error` + `error.name === 'AuthApiError'`), so
 * `AuthService.signIn`'s real `normalizeAuthError` classifies it identically to a genuine
 * `AuthApiError` instance.
 */
export const buildAuthApiErrorFixture = (message: string, status: number, code: string): Error =>
  Object.assign(new Error(message), {
    name: 'AuthApiError',
    status,
    code,
    __isAuthError: true,
  });
