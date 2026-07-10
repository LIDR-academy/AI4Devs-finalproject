# Security review — login-and-logout (Round 3 / FINAL)

**Verdict: APPROVED**

Scope: re-verification of commit `c9ec582` (`fix(login-and-logout): resolve Round 2 findings
(iOS a11y, locale)`) per review-standards.md's "re-run all six every round" rule, plus a full
re-check of everything already covered in `review-security.md` (Round 1) and
`review-security-r2.md` (Round 2) against `.agents/rules/review-standards.md` §4
(OWASP Top 10 + mobile-relevant MASVS). Rounds 1 and 2 both closed with zero findings for this
lens; this is Round 3, the final round (3-round cap) — no further round exists after this one.

## Diff surface actually touched (confirmed via `git show c9ec582 --stat`)

```
docs/features/login-and-logout/tdd.md                                    |  66 ++++
libs/components/src/organisms/login-form/login-form.test.tsx             |  22 ++
libs/components/src/organisms/login-form/login-form.tsx                  |  14 +-
libs/localization/src/resources/de.ts                                    |   4 +
libs/localization/src/resources/en.ts                                    |   4 +
libs/localization/src/resources/es.ts                                    |   4 +
libs/localization/src/resources/pt.ts                                    |   4 +
```

No `auth.service.ts`, `auth.dao.ts`, `use-auth.ts`, `use-session.ts`, `supabase-client.ts`,
`sign-in-form.tsx`, `sign-out.tsx`, `.sql` migration, `.env*`, or lockfile is present in this
commit — confirmed directly from `git show c9ec582 --stat` output above (7 files total, all
doc/component/test/locale). The auth/service/DAO boundary reviewed and approved in Round 1/2 is
provably untouched by this commit, so those findings stand without re-derivation; re-verified
below anyway for completeness.

## 1. `AccessibilityInfo.announceForAccessibility` call — PII/sensitive-data check

`libs/components/src/organisms/login-form/login-form.tsx:42-46`:

```ts
useEffect(() => {
  if (isSubmitting) {
    AccessibilityInfo.announceForAccessibility(labels.signingIn);
  }
}, [isSubmitting, labels.signingIn]);
```

- The only argument passed to the native accessibility announcement API is `labels.signingIn`,
  a caller-supplied **string prop**, never `email`/`password` local state (`login-form.tsx:37-38`).
  Nothing in the effect closes over the `email`/`password` `useState` values or reads them.
- Traced the label back through the plumbing: `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:29`
  sets `signingIn: t('auth.signingIn')` — a static-key lookup into the localization bundle, not
  derived from any user input, form value, form field, or auth response.
- `libs/components/src/organisms/login-form/login-form.test.tsx:84-100` (new test in this
  commit) asserts `announceSpy` is called with exactly `labels.signingIn` ("Signing in…") and
  never with the entered email/password used in the sibling test at lines 26-39
  (`'user@example.com'` / `'secret1'`) — confirms empirically, not just by inspection, that no
  credential ever reaches this announcement path.
- MASVS-STORAGE-2 / OWASP Mobile M2 (insecure data storage/exposure via unintended channel —
  screen-reader announcements are a real historical leak vector for OTP/password fields on
  other apps) does not apply here: the announced string is fixed, non-secret UI copy in every
  locale. No finding.

## 2. New locale keys (`auth.email`, `auth.password`, `auth.submit`, `auth.signingIn`) — injection surface

Read all four bundles in full (`libs/localization/src/resources/{en,es,de,pt}.ts`):

- `en.ts:47-50`, `es.ts:42-45`, `de.ts:42-45`, `pt.ts:42-45` — each new key is a literal string
  (`'Email'`, `'Signing in…'`, `'Iniciando sesión…'`, `'Anmeldung läuft…'`, `'Entrando…'`, etc.),
  none containing i18next interpolation placeholders (`{{...}}`) — contrast with genuinely
  interpolated keys elsewhere in the same files (`lesson.title: 'Lesson {{id}}'` at `en.ts:33`,
  `lessons.count_other: '{{count}} lessons'` at `en.ts:27`), which shows the codebase does use
  interpolation elsewhere but deliberately not here.
- Consumption site (`sign-in-form.tsx:26-29`, via `t('auth.email')`/`t('auth.password')`/
  `t('auth.submit')`/`t('auth.signingIn')`) passes no second-argument interpolation object to
  any of these four calls, so there is no path for user-controlled data (typed email/password,
  or anything else) to be substituted into these translation strings. No i18next injection
  surface (there is no `dangerouslySetInnerHTML`-equivalent in React Native anyway, but even the
  string-interpolation vector is absent here). No finding.

## 3. Re-verification of prior rounds' findings — still correct and untouched

- **Secrets** (Round 1 §1): env-sourced `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`
  in `apps/app-study-buddy/src/lib/supabase.ts:6-7`, no service-role key client-side — file not
  touched by `c9ec582`, re-confirmed via the stat diff above and a fresh grep below.
- **Input validation at the service layer** (Round 1 §2): `libs/services/src/services/auth.service.ts:21-29`
  (`isValidEmail`/`isNonEmptyPassword` before the DAO call) — file not in this commit's diff, so
  unchanged.
- **No PII in logs**: re-ran a grep across the full current tree for `console.` in
  auth/login-related files and the newly-touched files; the only hits remain the pre-existing
  `__DEV__`-gated warning in `apps/app-study-buddy/src/lib/supabase.ts:18` (no email/password/
  token content) and Jest's own `console.warn` spy in `auth.integration.test.ts` (test
  infrastructure, not app code) — both already accepted in Rounds 1/2, no new `console.*` added
  by `c9ec582` (confirmed: the diff for `login-form.tsx` above contains no logging statement).
- **Supabase RLS/auth/least-privilege**: `auth.dao.ts`, `use-session.ts`, `supabase-client.ts` —
  none present in this commit's file list; Round 1's assessment (anon-key client only, no direct
  table access, RLS out of this feature's scope per `spec.md`) stands unchanged.
- **TLS / deep links / WebViews**: no new `WebView`, `Linking.*`, or non-HTTPS endpoint
  introduced — this commit touches only a presentational component, its test, and static locale
  copy; no networking code at all in the diff.
- **Dependencies**: no `package.json`/`pnpm-lock.yaml` change in this commit — no new dependency
  to assess.

```
$ grep -rn "console\." libs/components/src/organisms/login-form/ libs/study-buddy/src/components/sign-in-form/ libs/study-buddy/src/components/sign-out/
(no output)
```

## 4. Verification gates (hard rule: never approve with these red)

- `pnpm turbo run check-types --filter=@helsoft/components --filter=@helsoft/localization --filter=@helsoft/study-buddy` → all 6 tasks (incl. transitive `types`/`services`/`hooks`) succeeded.
- `pnpm turbo run test --filter=@helsoft/components --filter=@helsoft/localization --filter=@helsoft/study-buddy` → 3/3 suites green: `@helsoft/localization` 8 suites/52 tests, `@helsoft/components` 4 suites/29 tests (incl. the new `login-form.test.tsx` a11y-announcement test), `@helsoft/study-buddy` 3 suites/14 tests.
- `pnpm turbo run lint --filter=...` → "No tasks were executed" (these three libs have no `lint` script defined in their `package.json`; this is a pre-existing, project-wide condition, not something introduced or regressed by `c9ec582` — not a red result, just an absent one, so it does not block under the "never approve with failing lint" rule since there is no lint task to fail).

## Findings

None (blocker / major / minor).

## Round 3 disposition

Zero open security findings after three rounds. No blocker/major/minor to escalate; nothing to
carry forward as a documented human-accepted risk for this lens (unlike Rounds 1's non-blocking
Slice-2 watchpoints, which were resolved by Slice 2's error-code normalization work and are not
reopened by this commit, which touches neither the error path nor the DAO/service layer).
