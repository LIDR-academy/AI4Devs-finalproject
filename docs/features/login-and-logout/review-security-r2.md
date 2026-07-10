# Security review — login-and-logout (Round 2)

**Verdict: APPROVED**

Scope: re-verification of commit `7751666` (`fix(login-and-logout): resolve Round 1 review
findings`) per review-standards.md's "re-run all six every round" rule. Round-1 verdict for
this lens was APPROVED with zero findings; this pass confirms the fix commit introduces no
new gap against `.agents/rules/review-standards.md` §4 (OWASP Top 10 + mobile-relevant MASVS).

## Files in the diff and disposition

1. **`libs/components/src/atoms/button/button.tsx` / `button.test.tsx`** — pure a11y/layout
   change (`hitSlop`, `minHeight` instead of fixed `height`). No new I/O, no secret, no user
   input handling. No security surface touched.
2. **`libs/components/src/organisms/login-form/login-form.tsx:47-72`** — replaces
   `editable={!isSubmitting}` with `disabled={isSubmitting}` + `accessibilityState`, and adds an
   off-screen `accessibilityLiveRegion="polite"` `<Text>` announcing `labels.signingIn` (a
   caller-supplied, non-PII, static UI string — "Signing in…"). Password field keeps
   `secureTextEntry` (`login-form.tsx:60`, unchanged from Round 1). No credential/PII is placed
   in the announced text or in any new prop. Not a security-relevant change.
3. **`login-form.stories.tsx:10`, `login-form.test.tsx`** — adds the `signingIn` label to the
   Storybook fixture/test `labels` object (`'Signing in…'`). Plain UI copy, not a secret.
4. **`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:29`** — adds
   `signingIn: t('auth.signingIn')`, sourced from the localization layer like every other label
   on this line. No secret/token, no new external call.
5. **`libs/study-buddy/src/components/sign-in-form/sign-in-form.test.tsx`,
   `libs/study-buddy/src/components/sign-out/sign-out.test.tsx`** — both now import
   `authValue`/`localizationValue` from the new shared factory instead of a locally duplicated
   copy. Behaviorally identical mock shapes to Round 1 (`signIn: jest.fn()`, `signOut: jest.fn()`,
   `isSubmitting: false`, `t: (key) => key`, `locale: 'en'`, `setLocale: jest.fn()`,
   `supportedLocales: ['en','es','pt','de']`). No credential-shaped value in either factory
   function (`libs/study-buddy/src/test-utils/auth-test-factories.ts:11-16, 18-23`) — `jest.fn()`
   stubs and a translation-key echo, nothing that resembles a real secret, JWT, or API key.
6. **`libs/hooks/src/hooks/auth.integration.test.ts`** — reviewed in detail below.
7. **`libs/hooks/package.json:25`, `libs/hooks/tsconfig.json:4`** — adds `@types/node ~26.1.0` as
   a dev-only type dependency (already used at this exact version elsewhere in the lockfile —
   confirmed via `pnpm-lock.yaml` diff showing `jest@29.7.0(@types/node@26.1.0)` resolutions
   already present pre-commit for sibling workspaces). Types-only package, not shipped to the
   app bundle, no known-critical advisory, no runtime code added.
8. **`pnpm-lock.yaml`** — only resolves the new `@types/node` dev dependency and dedupes existing
   `jest`/`ts-jest`/`@testing-library/react-native` peer-resolution hashes for `libs/hooks`; no
   new production dependency, no downgrade, no dependency swapped for an unfamiliar package.

## `auth.integration.test.ts` — shared-client refactor, checked against masking a real issue

- `auth.integration.test.ts:39` builds one real `SupabaseClient` in `beforeAll` with the same
  obviously-fake fixture values already accepted in Round 1
  (`url: 'https://example.supabase.co'`, `anonKey: 'anon-key'` — see Round-1
  `review-security.md` §1, which explicitly named these as non-real). No real credential was
  substituted in; the values are byte-for-byte what was there before, just hoisted from
  per-test to per-file scope.
- The boundary actually exercised by each `@s` scenario is unchanged: every test still calls
  `jest.spyOn(client.auth, '<method>').mockImplementation(...)` per test
  (`getSession` at line 50/62/84/105, `signInWithPassword` at line 64, `signOut` at line 85) to
  supply its own request/response for that scenario. Reusing the outer `SupabaseClient` object
  only avoids re-constructing the GoTrueClient wrapper; it does not reuse mocked
  request/response bodies or state across tests, so no test's assertions are weakened or made
  to pass vacuously. `buildMockedClient()` (lines 22-32) still re-installs a fresh
  `onAuthStateChange` spy per test, so the emit/observe wiring stays test-scoped.
- No un-mocked method on `sharedClient.auth` is invoked by any test path — if one were, it would
  hit `https://example.supabase.co` for real and fail/timeout the test rather than silently
  leak or succeed, so the refactor does not introduce a route to a live network call.
- The new `beforeAll`/`afterAll` `console.warn` spy (lines 37-38, 42-43) and its assertion
  (lines 117-121) only observe console output for a noise regression guard; it does not
  suppress or swallow any warning that a real auth/security defect would otherwise surface
  through — Jest's default `console.warn` behavior (printing to the test runner's output) is
  unaffected by `jest.spyOn` without `.mockImplementation()`.
- Net: this is a test-infrastructure change with no reduction in what's exercised at the
  auth boundary, and no credential-leakage vector.

## PII / secrets check across the full diff

- `git grep`-equivalent read of every changed line: no email/password/token literal beyond the
  pre-existing, Round-1-accepted test fixtures (`'user@example.com'` / `'secret1'` at
  `auth.integration.test.ts:74`, unchanged from Round 1's own findings §1). No new log
  statement (`console.*`) was added anywhere in the diff except the test-only `console.warn`
  spy described above, which spies rather than logs new content.
- No `.env`, config, or committed secret file touched by this commit (`git show 7751666 --stat`
  confirms the 15 changed files are all source/test/doc/lockfile — no `.env*`).

## Findings

None (blocker / major / minor).
