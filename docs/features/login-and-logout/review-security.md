# Security review — login-and-logout (Round 1 / Slice 1: happy path + loading)

**Verdict: APPROVED**

Reviewed against `.agents/rules/review-standards.md` §4 (OWASP Top 10 + mobile-relevant MASVS),
`spec.md` (Error contract — one generic message, no user enumeration), and
`gherkin-scenarios.md` @s2/@s4/@s5/@s6/@s7/@s9/@s10/@s11. Scope is Slice 1 only
(`tdd.md`: error normalization / `AuthErrorCode` / inline error UI are explicitly Slice 2 —
judged as a design "red flag" check per the task brief, not held against this round).

## Checks performed

1. **Secrets** — `apps/app-study-buddy/src/lib/supabase.ts:6-7` reads `EXPO_PUBLIC_SUPABASE_URL` /
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` from env; no hardcoded URL/key. `.env` / `apps/app-study-buddy/.env`
   exist on disk but are git-ignored (`.gitignore:26 .env`, confirmed via `git ls-files` — not tracked).
   `libs/services/src/supabase/supabase-client.ts` takes config as parameters, no embedded secret.
   Only the anon (public) key is used client-side — no service-role key anywhere in `libs/`/`apps/`.
   Test fixtures (`auth.dao.test.ts`, `auth.service.test.ts`, `auth.integration.test.ts`) use
   obviously-fake values (`secret1`, `anon-key`, `example.supabase.co`) — not real credentials.
2. **Input validation at the service layer** — `libs/services/src/services/auth.service.ts:21-29`:
   `AuthService.signIn` calls `isValidEmail`/`isNonEmptyPassword` and rejects *before* calling
   `AuthDao.signInWithPassword` — confirmed by `auth.service.test.ts` ("rejects... no DAO call
   made"). No unchecked params reach the DAO/Supabase call.
3. **PII in logs** — grepped `auth.dao.ts`, `auth.service.ts`, `use-auth.ts`, `use-session.ts`,
   `sign-in-form.tsx`, `sign-out.tsx`: zero `console.*` calls. The only `console.warn` touching
   auth is `apps/app-study-buddy/src/lib/supabase.ts:18`, a dev-only ("`__DEV__`") message that
   Supabase env vars are missing — no email/password/token content.
4. **User enumeration (Error contract, spec.md "Error contract")** —
   `libs/services/src/dao/auth.dao.ts:24-25` (`if (error) throw error; return data;`) and
   `auth.service.ts:21-29` currently propagate the **raw, unmapped Supabase error** — no
   `AuthErrorCode` normalization exists yet (confirmed absent from `libs/types` and
   `libs/services`; `auth.dao.test.ts:29-30` comment explicitly assigns that mapping to "the
   service's job (task-6)", i.e. Slice 2). This is *not* currently exploitable: nothing in the
   Slice-1 UI surfaces the error at all — `sign-in-form.tsx:20` does `void signIn(email, password)`
   (fire-and-forget, no error path wired), so no distinguishing message reaches the user today.
   Additionally, Supabase's own `signInWithPassword` already returns one generic
   `"Invalid login credentials"` for both wrong-email and wrong-password today, so even the raw
   error doesn't currently leak account existence. **Tracked as a Slice-2 watchpoint below, not a
   Round-1 finding** (Slice 2 must map `invalid_credentials` without special-casing any
   Supabase-specific message, e.g. "Email not confirmed", that would reintroduce enumeration).
5. **Session/auth handling** — `use-session.ts` and `apps/app-study-buddy/src/lib/supabase.ts:9-16`
   (`persistSession: true`, `autoRefreshToken: true`) are pre-existing, out of this feature's
   change set per `spec.md` ("Context already in place" — this story verifies, not rebuilds).
   `AuthDao` uses only `getSupabase().auth.*` (anon-key client) — least-privilege, no direct table
   access, RLS/table policies correctly out of scope (spec.md non-goals; no `.sql` migrations in
   this diff).
6. **TLS** — Supabase client URL comes from env (expected `https://*.supabase.co`); no code path
   disables TLS/cert validation.
7. **Deep links / WebViews** — no `WebView`, `Linking.*`, or `expo-web-browser` usage introduced by
   this feature (`sign-in-form.tsx`, `sign-out.tsx` only use `expo-router`'s `router.push`/`Dialog`).
8. **Password field masking (MASVS-AUTH/UI)** — `libs/components/src/organisms/login-form/login-form.tsx:55`
   sets `secureTextEntry` on the password `TextField`. Satisfied.
9. **Dependencies** — `@supabase/supabase-js` resolves to `2.110.0` (`pnpm-lock.yaml`), current,
   no known-critical advisory. `expo-router ~57.0.3` added to `apps/app-study-buddy`/
   `libs/study-buddy` (`tdd.md` design note) is a first-party Expo SDK package matching the
   targeted Expo 57 — trusted, low risk, and used only for plain route navigation
   (`router.push('/sign-up')`), not session logic.

## Findings

None (blocker / major / minor) against Slice-1 code as scoped.

## Non-blocking notes carried forward to Slice 2 (not counted as Round-1 findings)

- When `AuthErrorCode`/`invalid_credentials` mapping lands, verify it collapses *every*
  Supabase auth-failure variant (including `"Email not confirmed"`, rate-limit responses, etc.)
  into the single generic message — not just the default "Invalid login credentials" case —
  to fully close the enumeration vector called out in `spec.md`'s Error contract.
- `sign-in-form.tsx:20` / `sign-out.tsx:29` (`void signIn(...)`, `void signOut()`) currently leave
  a rejected promise unhandled when `AuthService` throws; confirm Slice 2's error-state wiring
  (`useAuth`'s `error`/`reset()`) consumes these rejections so nothing reaches an unhandled-
  rejection/global-crash-reporter path with implementation details attached.
