# Security review — login-and-logout (Round 3, FINAL)

**Verdict: APPROVED**

Scope: re-verification of commit `4f47504` (`fix(login-and-logout): derive TextField
accessibilityInvalid from error`, the sole change since Round 2, where this lens was APPROVED
with zero findings) per `.agents/rules/review-standards.md` §4 (OWASP Top 10 + mobile-relevant
MASVS), plus a fresh full-feature OWASP/MASVS sweep across every commit `0ddd2b3..HEAD` touching
this feature, as instructed for the final round.

## 1. Commit `4f47504` — targeted re-check

Files touched: `text-field.tsx`, new `text-field.test.tsx`, `text-field.e2e.js`, `login-form.tsx`
(2-line removal), `docs/features/login-and-logout/tdd.md`. No `package.json`/`pnpm-lock.yaml`
entry in the diff (`git show 4f47504 --stat` — 5 files, no dependency manifest) — **no new
dependency added**, confirming the orchestrator's expectation.

- `text-field.tsx:52` — `accessibilityInvalid = error` is a pure default-parameter boolean
  derivation from an already-owned, already-typed `boolean` prop (`error?: boolean`,
  `text-field.tsx:13`). No new parsing, no new external input, no string concatenation, no
  dynamic property access driven by user input — it cannot introduce an injection surface
  (OWASP A03:2021 – Injection is not applicable here: there is no interpreter, query, or command
  construction involved, just `boolean = boolean`).
- `text-field.tsx:63` — `inputProps = { ...rest, accessibilityInvalid }` merges the derived
  boolean into the same `...rest` spread that was already forwarded onto `TextInput` pre-fix;
  this doesn't change what class of values can flow through `...rest` (still whatever
  `TextInputProps` the caller passes), so no new prop-injection surface either.
  `accessibilityInvalid` itself is only ever a `boolean` (typed, and default-derived from another
  `boolean`), never attacker-controlled free text.
- `login-form.tsx` — only removes two now-redundant explicit
  `accessibilityInvalid={!!emailError}` / `accessibilityInvalid={!!passwordError}` props (already
  a `!!`-coerced boolean pre-fix); net effect on the trust boundary is zero, confirmed identical
  by the unchanged assertions in `login-form.test.tsx`'s 4 pre-existing `accessibilityInvalid`
  tests (per `tdd.md`'s Round-2-fix log, "required zero changes and stayed green").
- `text-field.test.tsx` / `text-field.e2e.js` — test-only, assert the derived boolean and its
  `aria-invalid` DOM projection; no secret/PII-shaped fixture, no network call.
- **Conclusion**: confirmed trivially clean, as anticipated — a boolean-to-boolean default
  derivation introduces no new input-handling, validation, or injection surface.

## 2. Full-feature OWASP/MASVS re-sweep (all commits `0ddd2b3..HEAD`)

**Secrets (OWASP A05:2021 – Security Misconfiguration / MASVS-STORAGE-1)**
- `apps/app-study-buddy/src/lib/supabase.ts:6-7` — `EXPO_PUBLIC_SUPABASE_URL` /
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` read from `process.env`, both correctly `EXPO_PUBLIC_*`
  (anon/public-safe). No service-role key referenced anywhere in the feature's diff.
  `apps/app-study-buddy/.env.example` has empty placeholders; `.env` is gitignored
  (`.gitignore:26`) and not committed. `git grep`-equivalent pass over every changed line
  (`0ddd2b3..HEAD`, all feature libs + app) for `secret|token|apikey|api_key|service_role`
  found only: test-fixture tokens (`'tok-1'`, `'tok-2'`, `'tok-3'`, `'persisted-tok'`,
  `access_token` field names on mock `Session` objects) and the word "token" inside doc-comment
  prose — no real credential-shaped value anywhere.

**Input validation at the service layer (OWASP A03:2021 / MASVS-CODE-4)**
- `auth.service.ts:41-47,49-61` — `AuthService.isValidEmail`/`isNonEmptyPassword` validate
  *before* `AuthDao.signInWithPassword` is ever called (`auth.service.test.ts` proves no DAO
  call on validation failure). `AuthDao` (`auth.dao.ts:20-27`) does no validation itself — by
  design, matching `hooks-service-dao.mdc`'s layering (DAO = raw access only).
- `sign-in-form.tsx:41` re-validates email client-side for UX (immediate inline error) but
  `AuthService.signIn`'s own validation (`auth.service.ts:50-55`) remains the defensive
  backstop for any caller that bypasses the form — confirmed by `auth.service.test.ts`'s
  standalone validation tests, independent of `SignInForm`.

**PII in logs/analytics (OWASP A09:2021 – Security Logging Failures, applied to over-logging)**
- Zero `console.*` calls in any production file added/changed by this feature
  (`login-form.tsx`, `text-field.tsx`, `sign-in-form.tsx`, `sign-out.tsx`, `auth.service.ts`,
  `auth.dao.ts`, `use-auth.ts`) — confirmed by grep across the full feature diff. The only
  `console.warn` in the diff (`libs/hooks/src/hooks/auth.integration.test.ts`) is a test-only
  spy asserting *absence* of a specific noise string, not a new log statement, and never
  executes in the shipped app. `apps/app-study-buddy/src/lib/supabase.ts`'s pre-existing
  `console.warn` (config-missing) logs no credential value, only a static instruction string.

**Supabase RLS / session / least-privilege (MASVS-AUTH)**
- `auth.dao.ts:24,30` — thin wrappers around `getSupabase().auth.signInWithPassword` /
  `.signOut()`; no direct table/query access in this feature, so no RLS-bypassing query surface
  was introduced. Session state is entirely owned by supabase-js/GoTrue via `useSession()`
  (untouched by this feature) and the root `Stack.Protected` guard — no manual token storage,
  no custom session persistence added.
- `use-auth.ts:16-17` — `isAuthErrorShape` narrows any thrown `cause` to the closed
  `AuthErrorCode` union before trusting `.code`, defaulting to `network_error` otherwise — no
  raw provider error (which could carry request/response internals) is ever exposed to the UI;
  `auth.service.ts:28-33`'s `normalizeAuthError` is the single sanitization chokepoint for both
  `signIn` and `signOut` failures.

**TLS**
- All Supabase calls route through `getSupabase()` (the shared `SupabaseClient`, initialized
  once from `EXPO_PUBLIC_SUPABASE_URL`, which for a hosted Supabase project is `https://`).
  Nothing in this feature constructs a raw `fetch`/`http://` URL.

**Deep links / webviews**
- No `WebView` usage anywhere in this feature. Navigation is exclusively `expo-router`'s typed
  `Link`/`router.push`/`router.replace` with **static, hardcoded** path literals
  (`'/sign-up'`, `/settings`, `/upload`, `{ pathname: '/lesson/[id]', params: { id: 'demo' } }`)
  — no user-controlled string is ever interpolated into a route or deep-link target.

**Dependencies**
- `4f47504` adds no dependency (confirmed above). Across the whole feature, the only
  dependency-manifest changes remain what Round 1/2 already reviewed and cleared: `@types/node`
  (dev-only, `libs/hooks`), `expo-router` (already a workspace dependency, declared explicitly
  for `@helsoft/study-buddy`), and `pnpm-lock.yaml` resolution updates — no production
  dependency added or swapped this round, and re-checking `pnpm-lock.yaml` at `HEAD` shows the
  same disposition. No known-critical-advisory package introduced.

## 3. Verification run (this round)
- `pnpm turbo run check-types --force` — 8/8 packages green.
- `pnpm turbo run lint --force` — clean.
- `pnpm turbo run test --force` — 6/6 workspaces green (`@helsoft/services` 38/38,
  `@helsoft/hooks` 21/21, `@helsoft/components` 65/65, `@helsoft/study-buddy` 25/25,
  `@helsoft/localization` 55/55, `@helsoft/lib-with-storybook` 2/2).
- `pnpm --filter @helsoft/components exec playwright test` — the two files touched/relevant to
  security-relevant auth UI (`text-field.e2e.js` 14/14, `login-form.e2e.js` 6/6, 20/20
  together) pass deterministically with `--workers=1` against a freshly started Storybook dev
  server. **Note for transparency**: a first full-suite run under default parallelism produced
  transient `ERR_CONNECTION_REFUSED`/`ERR_CONNECTION_RESET` failures across unrelated files too
  (`card.e2e.js`, `language-selector.e2e.js`, etc.), traced to the shared dev Storybook server
  on port 6007 being contended/restarted — an untracked `libs/components/tests/e2e/tmp-a11y-r3/`
  probe directory (not part of this commit, not authored by this review) indicates a concurrent
  reviewer process hitting the same server. This is the same class of transient
  environment/tooling anomaly independently observed and disregarded by multiple reviewers in
  Round 2 (`review.md` "Verified clean this round" section) — re-running the security-relevant
  files in isolation against a stable server confirms no functional regression; not a finding.

## Findings

None (blocker / major / minor).
