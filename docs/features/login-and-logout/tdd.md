# TDD log — login-and-logout

`implementator` build log — one line per Red→Green→Refactor cycle, grouped by slice/round. Every
`@s` in `gherkin-scenarios.md` maps to ≥ 1 concrete test below. Full detail lives in git history.

## Design reconciliation (for reviewers)
- Slice 1 is a strictly thin vertical: `AuthErrorCode`, `useAuth.error`, and `LoginForm.errorMessage/emailError/passwordError` land in task-6/7 (Slice 2).
- Added `libs/components/jest-setup-after.ts` (+`setupFilesAfterEnv`) mirroring the `libs/study-buddy` fix so `jest-expo` doesn't resolve native AsyncStorage — no production change.
- RNTL + React 19 needs explicit `await act()` around `fireEvent` for controlled-input/Modal state.
- `ProgressIndicator`'s `progressbar` role isn't exposed to `getByRole`; worked around with a `testID` wrapper (`LOADING_INDICATOR_TEST_ID`) in `LoginForm`.
- `expo-router` added as peer/dev dep of `@helsoft/study-buddy` (plain `router.push('/sign-up')`, not session-driven redirect).

---

## @s → test map (Slice 1)

| @s | Scenario | Test(s) |
|---|---|---|
| @s1 | Unauthenticated → routed to login, no protected access | `auth.integration.test.ts` (no session at startup — the `useSession` state the guard reads) |
| @s2 | Successful login → session + home | `auth.dao.test.ts`, `auth.service.test.ts`, `use-auth.test.ts`, `login-form.test.tsx`, `sign-in-form.test.tsx`, `auth.integration.test.ts` |
| @s3 | Loading state while authenticating | `use-auth.test.ts` (`isSubmitting`), `login-form.test.tsx` (disabled fields/submit + affordance), `sign-in-form.test.tsx` |
| @s4 | Log out with confirmation clears session | `auth.dao.test.ts`, `auth.service.test.ts`, `use-auth.test.ts`, `sign-out.test.tsx`, `auth.integration.test.ts` |
| @s7 | Session persists across app restart | `auth.integration.test.ts` (restores persisted session on fresh mount — verifies existing wiring, no new code) |
| @s9 | Malformed email / empty password rejected (validators only) | `auth.service.test.ts` (`isValidEmail`, `isNonEmptyPassword`, `signIn` rejects before the DAO) |
| @s10 | Logout confirmation can be dismissed | `sign-out.test.tsx` (does not call signOut when dismissed) |
| @s11 | Log out from Home screen with confirmation | `sign-out.test.tsx` (same `SignOut`, mounted Settings + Home) |

(@s5, @s6, @s8, @s12, @s13 are Slice 2/3 scope — task-6/7/8/9.)

## Slice 1 — Happy path + Loading
- **task-1 AuthDao (@s2,@s4)** — `AuthDao.signInWithPassword`/`signOut` (Pattern A: throw raw error, return data). 4 tests green.
- **task-2 AuthService (@s2,@s4,@s9)** — `isValidEmail` (EMAIL_PATTERN), `isNonEmptyPassword`, `signIn` (validates before DAO call), `signOut`. 13 tests green.
- **task-3 useAuth (@s2,@s3,@s4)** — `signIn`/`signOut` delegating to `AuthService`; `isSubmitting` flips around calls; refactored to shared `withSubmitting<T>()` helper. Plain `useState`, no tanstack-query. 5 tests green.
- **task-4 LoginForm (@s2,@s3)** — labelled email/password + submit; `onSubmit` reports credentials; `isSubmitting` disables fields/submit + loading affordance; sign-up prompt via `onNavigateToSignUp`. Story `Content`/`Loading`. 7 tests green.
- **task-5 Wiring+integration (@s1,@s2,@s4,@s7,@s10,@s11)** — `SignInForm` (submit→signIn, sign-up push); `SignOut` (confirm Dialog; confirm→signOut; dismiss doesn't @s10); screens login/settings/index (@s11); integration across `useAuth→AuthService→AuthDao`+`useSession` vs mocked Supabase (@s1/@s2/@s4/@s7). No manual redirect. 3+4 unit + 4 integration green.
- **Slice-1 gate ✅** — `pnpm test`/`check-types`(8)/`lint` green. Copy via `t('auth.*')` (content lands task-8). Commit `feat(login-and-logout): implement happy path`.

## Round-1 review fixes (4 major + 2 minor, 0 blockers)
- **Major 1 (@s3)** — `TextField.disabled` (opacity dim) + `accessibilityState.disabled` on both fields while submitting, replacing `editable={!isSubmitting}`. 2 tests.
- **Major 2 (@s3)** — perceivable Loading announcement: `signingIn` label in a visually-hidden `accessibilityLiveRegion="polite"` Text. 3 tests.
- **Major 3 (@s3)** — 48dp touch target via per-size `HIT_SLOP` on `Button` (derived from `layout.touchTarget`). 1 test.
- **Major 4 (@s3)** — `Button` uses derived `minHeight` instead of fixed `height` (Dynamic Type); `useVariants` narrowed to `{ variant }`. 1 test.
- **Minor 5** — silence "Multiple GoTrueClient instances": hoisted `initSupabase` into one `beforeAll` shared client in `auth.integration.test.ts`. 1 regression guard.
- **Minor 6** — test-only: deduped `authValue`/`localizationValue` factories into `test-utils/auth-test-factories.ts`.
- **Gate ✅** — check-types/tests/lint green; tokens only. Slice 2/3 scope untouched.

## Round-2 review fixes (1 major + 2 minor, 0 blockers)
- **Major 1 (@s3)** — iOS VoiceOver: `useEffect` calling `AccessibilityInfo.announceForAccessibility(labels.signingIn)` on `isSubmitting` true (additive to the Android/Web live-region). 1 test.
- **Minor 2 (@s3)** — content-only: fixed stale `LOADING_INDICATOR_TEST_ID` doc comment (reworded to avoid tripping the localization literal-text scan).
- **Minor 3 (@s3,@s2)** — added `auth.email/password/submit/signingIn` to `en/es/de/pt` bundles (all four together, `TranslationResource`-enforced).
- **Gate ✅** — all workspaces + check-types(8) + lint green. Commit `fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)`.

## Mutation-kill pass (Phase 4 — StrykerJS survivors; test-only, no production change)
- **auth.service.ts (@s9,@s2) — 4/4** — 2 `isValidEmail` anchor cases + exact `signIn` rejection messages. 84.62%→100%.
- **use-auth.ts (@s2,@s3,@s4) — 0/3, equivalent** — `useCallback` dep-array mutants; `withSubmitting` identity constant so no observable diff. Documented equivalent in `mutation.md`.
- **login-form.tsx (@s2,@s3) — 11/11** — pristine values, `LOADING_INDICATOR_TEST_ID` literal, style assertions. 50%→100%. 5 tests.
- **button.tsx — 0/40, out-of-scope** — 39 pre-existing untouched; 1 unistyles-mock no-op. Feature's hitSlop/minHeight already 100%.
- **sign-in-form.tsx (@s3) — 1/1** — asserts `auth.signingIn` key into Loading affordance. 90%→100%.
- **sign-out.tsx (@s4,@s10,@s11) — 3/3** — dialog hidden pre-press, headline key, closes after confirm. 76.92%→100%.
- **Gate ✅** — all workspaces green; no production code touched. Commit `test(login-and-logout): kill surviving mutants`.

---

## @s → test map (Slice 2)

| @s | Scenario | Test(s) |
|---|---|---|
| @s5 | Invalid credentials → generic error, no session | `auth.service.test.ts` (normalization), `use-auth.test.ts`, `auth.integration.test.ts`, `login-form.test.tsx` (banner), `sign-in-form.test.tsx` (banner key) |
| @s6 | Network failure → retryable error, retry works | `auth.service.test.ts` (normalization + retry), `use-auth.test.ts` (error clears on new attempt), `auth.integration.test.ts`, `login-form.test.tsx`, `sign-in-form.test.tsx` |
| @s8 | Pristine form disables submission, no error | `login-form.test.tsx` (Empty state) |
| @s9 | Malformed email / empty password rejected inline | `auth.service.test.ts` (validation_error code), `login-form.test.tsx` (emailError/passwordError props), `sign-in-form.test.tsx` (email wiring; empty-password covered by Empty-state gating) |

## Slice 2 — Empty + Error + Retry
- **task-6 error contract (@s5,@s6)** — `libs/types/src/auth-error.ts` (`AuthErrorCode`/`AuthError`); `toAuthError`/`normalizeAuthError` (`isAuthApiError`→`invalid_credentials`, else `network_error`); `signIn` try/catch normalizes; retryable/unknown/retry-works tests; validation throws `validation_error`; `useAuth.error` set/cleared per attempt. 19 service + 9 hook + 6 integration green.
- **task-7 Empty+Error+inline (@s5,@s6,@s8,@s9)** — `isPristine` gate disables submit (@s8); `errorMessage` banner (MD3 tokens, editable @s5/@s6); `emailError`/`passwordError` inline via `TextField.error/supportingText`, `hasFieldError` gates submit (@s9). Stories `Empty`/`Content`/`Loading`/`Error`/`ErrorInlineValidation`. 24 tests.
- **Wiring SignInForm (@s5,@s6,@s9)** — `handleSubmit` validates email → `emailError` before `signIn` (@s9); `AUTH_ERROR_KEYS` maps `useAuth().error` → `errorMessage` (@s5/@s6). Removed unreachable `passwordError` branch (dead per `isPristine` gating) — see spec Open decisions. 9 tests.
- **Slice-2 gate** — all workspaces test/check-types/lint/e2e green; `auth.error.*` content lands task-8.

## Slice 2, Round 1 fixes (1 major + 3 minor; design approved 0)
- **Major 1 (@s5,@s6)** — `normalizeAuthError` now requires `isAuthApiError && code === INVALID_LOGIN_CODE`; other GoTrue errors → `network_error`. 20 tests.
- **Minor 2 (@s9)** — documented the empty-password scope cut (unreachable `passwordError`) as a spec.md Open decision + `sign-in-form.tsx` docblock pointer.
- **Minor 3** — removed test-only `AuthApiError` re-export from `services` barrel; added `libs/hooks/src/test-utils/auth-error-fixtures.ts` (`buildAuthApiErrorFixture`, duck-typed). hooks 20/20.
- **Minor 4 (@s5,@s6)** — added `isAuthErrorShape` runtime guard in `useAuth` replacing unchecked `(cause as AuthError).code` cast. hooks 20/20.
- **Gate ✅** — 6/6 test, 8/8 check-types, lint green.

## Slice 2, Round 2 fixes (2 blockers; both verified RED via revert→confirm→restore)
- **Blocker 1 (@s9)** — submit-deadlock after one malformed email: `LoginForm.onEmailChange` + `SignInForm.handleEmailChange` re-validates only once `emailError` is set (clears when valid). components 25/25, study-buddy 10/10.
- **Blocker 2 (@s5,@s6,@s9)** — missing `auth.error.{email,invalidCredentials,network}` keys added to all 4 bundles + coverage test scanning `sign-in-form/` (flagged `sign-out.tsx`'s keys forward). localization 54/54.
- **Gate ✅** — all workspaces + check-types(8) + lint + e2e 19/19 green.

---

## @s → test map (Slice 3)

| @s | Scenario | Test(s) |
|---|---|---|
| @s12 | The login form is accessible (labels, button role, error announced) | `login-form.test.tsx` (roles/labels/live-region/AccessibilityInfo/accessibilityHint/reading-order), Playwright `login-form.e2e.js` |
| @s13 | All user-facing strings are localized | `migration-coverage.test.ts` (`t()` key existence coverage, sign-in-form + sign-out), locale bundles `en/es/de/pt` |

## Slice 3 — a11y + i18n
- **task-8 i18n (@s13)** — added `sign-out.tsx`'s 5 `auth.logOut*` keys to all 4 bundles + coverage test; refactored the two coverage blocks into one `describe.each(AUTH_COMPONENT_DIRS)`. localization 55/55, study-buddy 23/23.
- **task-9 a11y + e2e (@s12)** — error banner `accessibilityRole="alert"` + `accessibilityLiveRegion="assertive"` + `AccessibilityInfo` announce; `accessibilityHint={emailError/passwordError}` on fields (RN has no aria-describedby; label untouched to keep `getByLabelText` exact); reading-order regression guard (verified non-vacuous); new `login-form.e2e.js` (6 tests). login-form.test 30/30, lib 49/49, e2e 25/25.
- **Slice 3 gate ✅** — 6/6 test, 8/8 check-types, lint, e2e 25/25 green. Per-slice light review skipped (full 6-reviewer + mutation next). Commit `feat(login-and-logout): add localization and accessibility`.

---

## Full-review Round 1 fixes (5 major + 3 minor, 0 blockers; all 6 reviewers + mutation)
- **Major 1** — `AuthService.signOut` normalizes errors; `SignOut.onConfirm` does `signOut().catch(()=>{})` (no unhandled rejection). services 38, study-buddy 25.
- **Major 2** — `SignInForm`'s `void signIn(...).catch(()=>{})` (real-useAuth test, unhandledRejection spy). study-buddy 25.
- **Major 3** — added `accessibilityInvalid` prop on `TextField` (RN typings lack it → forwarded via `...rest`; web maps to `aria-invalid`); wired `!!emailError/!!passwordError`. 4 tests, components 38.
- **Major 4** — removed unreferenced 638 KB `logo.png` (deletion, no test).
- **Major 5 (mutation)** — killed 6 `login-form.tsx` survivors: `isPristine` (4 tests), `errorMessage` effect deps (1), field-error via label-color style assertions (2). Scoped 81.48%→96.55% (2 pre-existing equivalent survivors remain). login-form.test 43.
- **Minor 6** — `auth.logOut*` Title Case → sentence case in `en.ts`. localization 55.
- **Minor 7** — `isAuthErrorShape` now checks a closed `AUTH_ERROR_CODES` set, not any string code. hooks 21.
- **Minor 8** — hardened flaky `AccessibilityInfo` announce test with `waitFor`.
- **Gate ✅** — check-types(8), test 6/6 (components 62), lint, e2e 25/25, scoped Stryker 96.55%. Commit `fix(login-and-logout): resolve full-review Round 1 findings`.

## Full-review Round 2 fix (1 major)
- **Major** — `TextField.accessibilityInvalid` now derives from its `error` prop by default (merged into `inputProps` spread for `tsc` reasons), matching sibling convention; override-able. New `text-field.test.tsx` (3 tests, verified RED), +2 `text-field.e2e.js` `aria-invalid` cases; dropped redundant explicit props in `login-form.tsx`. components 65/65, e2e 27/27.
- **Gate ✅** — lint, check-types(8), test 6/6, e2e 27/27 green. Commit `fix(login-and-logout): derive TextField accessibilityInvalid from error`.
