# TDD log — login-and-logout

`implementator` build log. One block per Red→Green→Refactor cycle, grouped by slice.
Every `@s` scenario in `gherkin-scenarios.md` maps to at least one concrete test below.

## Design reconciliation (recorded for reviewers)

- **Slice 1 is a strictly thin vertical.** Per `spec.md` decisions and task-2/task-3 notes,
  error normalization (`AuthErrorCode`), the `error`/`reset()` members of `useAuth`, and
  `LoginForm`'s `errorMessage`/`emailError`/`passwordError` props are **not** built in this
  slice — they land in task-6/task-7 (Slice 2), driven by their own failing tests. `useAuth`
  in Slice 1 exposes only `{ signIn, signOut, isSubmitting }`.
- **Test infra fix, not feature scope creep**: `@helsoft/components` had no prior Jest test
  that rendered `Button` (which transitively imports `@helsoft/hooks` → `@helsoft/services` →
  `@react-native-async-storage/async-storage`). Under the `jest-expo` preset this resolves the
  *native* AsyncStorage module and crashes outside a real device. Fixed by adding
  `libs/components/jest-setup-after.ts` + `setupFilesAfterEnv`, mirroring the identical,
  pre-existing fix in `libs/study-buddy/jest-setup-after.ts` (same root cause, one workspace
  layer up). No production behavior changed.
- **RNTL + React 19 needs explicit `act()` around `fireEvent` for controlled-input updates**
  (`TextInput.onChangeText` → `setState` → re-render, and `Pressable.onPress` → `setState` →
  `Modal` becoming visible) in this repo's toolchain versions — plain `fireEvent.changeText`/
  `fireEvent.press` without `await act(async () => {...})` reads stale props. Applied
  consistently in `login-form.test.tsx` and `sign-out.test.tsx`.
- **`ProgressIndicator`'s `accessibilityRole="progressbar"` is not exposed to RNTL's `getByRole`**
  query without an explicit `accessible` prop (a real accessibility gap, not just a test
  artifact) — out of scope to fix on a shared, already-shipped atom from this feature. Worked
  around by wrapping the indicator in a `testID`-bearing `View` inside `LoginForm` itself
  (`LOADING_INDICATOR_TEST_ID`), which is fully within this feature's own files.
- **`expo-router` added as a peer/dev dependency of `@helsoft/study-buddy`**: `SignInForm`'s
  "Sign up" link is a plain route push (`router.push('/sign-up')`), unrelated to session state
  — normal navigation, not the session-driven redirect (which stays exclusively in
  `Stack.Protected` guards, untouched).

## @s → test map (Slice 1)

| @s | Scenario | Test(s) |
|---|---|---|
| @s1 | Unauthenticated → routed to login, no protected access | `hooks/auth.integration.test.ts` ("reports no session at startup") — proves the `useSession` state the root guard reads |
| @s2 | Successful login with valid credentials → session + home | `auth.dao.test.ts`, `auth.service.test.ts`, `use-auth.test.ts`, `login-form.test.tsx`, `sign-in-form.test.tsx`, `hooks/auth.integration.test.ts` |
| @s3 | Loading state while authenticating | `use-auth.test.ts` (`isSubmitting`), `login-form.test.tsx` (disabled fields/submit + loading affordance), `sign-in-form.test.tsx` |
| @s4 | Log out with confirmation clears session, returns to login | `auth.dao.test.ts`, `auth.service.test.ts`, `use-auth.test.ts`, `sign-out.test.tsx`, `hooks/auth.integration.test.ts` |
| @s7 | Session persists across app restart | `hooks/auth.integration.test.ts` ("restores a persisted session on a fresh mount") — verifies existing `useSession`/`initSupabase` wiring, no new persistence code |
| @s9 | Malformed email / empty password rejected (validators only; inline UI lands task-7) | `auth.service.test.ts` (`isValidEmail`, `isNonEmptyPassword`, `signIn` rejects before calling the DAO) |
| @s10 | Logout confirmation dialog can be dismissed | `sign-out.test.tsx` ("does not call signOut when the confirmation is dismissed") |
| @s11 | Log out from Home screen with confirmation | `sign-out.test.tsx` (same `SignOut` component, mounted on both Settings and Home screens) |

(@s5, @s6, @s8, @s12, @s13 are Slice 2/3 scope — task-6/7/8/9 — not covered here.)

---

## Slice 1 — Happy path + Loading

### task-1 — AuthDao (@s2, @s4)
- **RED** — `dao/auth.dao.test.ts`: `signInWithPassword` calls `getSupabase().auth.signInWithPassword`
  with `{ email, password }` and returns the raw `{ session, user }`. Compile-failed (no `auth.dao.ts`).
- **GREEN** — `AuthDao` (abstract, static `signInWithPassword`) — `if (error) throw error; return data;`
  (Pattern A, `hooks-service-dao.mdc`).
- **RED** — added the failure-path test (`signInWithPassword` rejects with the raw supabase error)
  and the two `signOut` tests (`Property 'signOut' does not exist` / DAO throws raw error).
- **GREEN** — added `AuthDao.signOut()`.
- **REFACTOR** — none needed (already minimal, single-purpose).
- 4 tests green; `check-types`/`lint` clean for `@helsoft/services`.

### task-2 — AuthService (@s2, @s4, @s9)
- **RED→GREEN** cycles, one at a time: `isValidEmail` (accepts well-formed → stub `return true`
  first, then a malformed-email test forced the real `EMAIL_PATTERN` regex); `isNonEmptyPassword`
  (trim + length check); `signIn` happy path (delegates to `AuthDao.signInWithPassword`); `signIn`
  validation-rejection tests (malformed email / empty password reject **before** any DAO call —
  no network call made); `signOut` (delegates to `AuthDao.signOut`).
- **REFACTOR** — none needed; each method stayed short and single-purpose.
- 13 tests green. Exported via `libs/services/src/services/index.ts`.

### task-3 — useAuth hook (@s2, @s3, @s4)
- **RED→GREEN**: `signIn` calls `AuthService.signIn` with the given credentials (stub hook first);
  `isSubmitting` true during the in-flight call, false after resolve (deferred promise + `act`);
  `signOut` calls `AuthService.signOut`; `isSubmitting` true→false around `signOut`; `isSubmitting`
  also returns to `false` after a **failed** `signIn` (passed immediately — the existing
  `try/finally` already covered it, confirming the design rather than adding new code).
- **REFACTOR** — extracted the duplicated "flip `isSubmitting` around a call" logic from `signIn`/
  `signOut` into a shared generic `withSubmitting<T>()` helper; re-ran tests green after.
- 5 tests green. Exported via `libs/hooks/src/hooks/index.ts`. Plain `useState`/`useCallback` — no
  tanstack-query, per `spec.md` Open decisions.

### task-4 — LoginForm organism (@s2, @s3)
- **RED→GREEN**: renders labelled email/password fields + submit button; submitting reports the
  entered `{ email, password }` up via `onSubmit` (required discovering the `act()`-around-
  `fireEvent.changeText` requirement — see reconciliation above); `isSubmitting` disables the
  submit control and both fields and shows a loading affordance (`LOADING_INDICATOR_TEST_ID`);
  a negative test pins the affordance/disabled state to `isSubmitting` only; the "Sign up" prompt
  (UI-states table, Content state) renders and calls `onNavigateToSignUp` when pressed, and does
  not render when the callback is omitted.
- **GREEN encountered a real accessibility gap**: `ProgressIndicator`'s bare
  `accessibilityRole="progressbar"` View isn't exposed to RNTL's `getByRole` without an explicit
  `accessible` prop — out of scope to change on the shared atom; worked around locally (see
  reconciliation above).
- **REFACTOR** — none needed; component stayed short, all copy via `labels` (no hardcoded strings).
- 7 tests green. Story `login-form.stories.tsx` with `Content` and `Loading` states (Empty/Error
  land in task-7). Exported via `libs/components/src/organisms/index.ts`.

### task-5 — Wiring (SignInForm, SignOut) + screens + integration (@s1, @s2, @s4, @s7, @s10, @s11)
- **RED→GREEN** `sign-in-form.test.tsx` (mocking `useAuth`/`useLocalization`/`expo-router`):
  submitting calls `signIn` with the entered credentials; the sign-up prompt calls
  `router.push('/sign-up')`; `useAuth().isSubmitting` disables the submit control (passed
  immediately — confirms the LoginForm pass-through).
- **RED→GREEN** `sign-out.test.tsx` (mocking `useAuth`/`useLocalization`): renders a "Log Out"
  trigger; pressing it opens a confirmation `Dialog` (required the same `act()`-around-`fireEvent`
  fix as the Loading-state cycle, since opening the Modal is a state update); confirming calls
  `signOut`; **dismissing does not** call `signOut` and closes the dialog (@s10) — both passed
  immediately given the single confirm/cancel wiring already in place.
- **Wiring**: `(auth)/login.tsx` → `<SignInForm/>`; `(app)/settings.tsx` → `<LanguageSettings/>` +
  `<SignOut/>`; `(app)/index.tsx` (the home screen) → adds `<SignOut/>` alongside existing links
  (@s11 — same component, same confirm-dialog behavior, mounted a second place). No manual
  `router.replace`/redirect added anywhere — `Stack.Protected` guards in `_layout.tsx` untouched.
- **Integration test** — `libs/hooks/src/hooks/auth.integration.test.ts`: `useAuth` (→ `AuthService`
  → `AuthDao`) and `useSession`, both exercised for real, against a **mocked Supabase client**
  boundary only (`initSupabase` creates a real `SupabaseClient`; only its `auth.*` methods are
  `jest.spyOn`-stubbed — nothing above the DAO is mocked): no session at startup (@s1), signing in
  establishes a session `useSession` observes (@s2), signing out clears it (@s4), and a
  fresh `useSession` mount restores an already-persisted session without new credentials (@s7,
  verifying the existing `initSupabase`/`getSession` wiring — no persistence code changed).
- 3 unit tests (`sign-in-form`) + 4 unit tests (`sign-out`) + 4 integration tests green.
  Exported via `libs/study-buddy/src/index.ts`.

### Slice-1 gate ✅
`pnpm test` (workspace-wide), `pnpm check-types` (8 packages), `pnpm lint` all green. No
hardcoded colors/dimensions; all `LoginForm`/`SignInForm`/`SignOut` copy flows through
`useLocalization().t(...)` with `auth.*` keys (full copy for those keys lands in task-8, Slice 3 —
until then `t()` falls back to the raw key, which is expected and does not affect any Slice-1
test, none of which assert literal English copy). Business logic lives in `libs/study-buddy`;
`apps/app-study-buddy` screens stay thin composition.

Commit: `feat(login-and-logout): implement happy path`.

---

## Round-1 review fixes

Responds to `docs/features/login-and-logout/review.md` (4 major + 2 minor, zero blockers). One
block per finding, in the same RED→GREEN→REFACTOR log style as Slice 1. Scenarios covered stay
`@s3` (Loading state) throughout, except finding 6 (test-code-only refactor).

### Major 1 — `TextField.disabled` + `accessibilityState` on both fields (@s3)
- **RED** — strengthened the existing `login-form.test.tsx` disabled-fields test into
  `'disables and dims both fields while isSubmitting'` (asserts `editable === false` **and**
  `parent` style `opacity === disabledOpacity`, imported from `theme/colors.ts`), and added a new
  test `'exposes accessibilityState.disabled on both fields while isSubmitting'`
  (`login-form.test.tsx:56-62`). Both failed against the old `editable={!isSubmitting}` prop: no
  opacity dimming, no `accessibilityState`.
- **GREEN** — `login-form.tsx:47-48` (email) and `:57-58` (password): replaced
  `editable={!isSubmitting}` with `disabled={isSubmitting}` (routes through `TextField`'s own
  `disabled` prop, which derives `editable` **and** the dimmed `opacity: theme.disabledOpacity` at
  `text-field.tsx:59,101`) plus an explicit `accessibilityState={{ disabled: isSubmitting }}`,
  passed through `TextField`'s `...rest` spread onto the underlying `TextInput`
  (`text-field.tsx:73`).
- **REFACTOR** — none needed; two one-line prop swaps, no duplication introduced.
- 2 tests strengthened/added, both green; `libs/components` full suite still green.

### Major 2 — perceivable Loading announcement (@s3)
- **RED** — added `'announces a polite live-region while isSubmitting'`
  (`login-form.test.tsx:64-69`, queries `getByText(labels.signingIn)` and asserts
  `accessibilityLiveRegion === 'polite'`) and extended the existing "isSubmitting false" negative
  test with `expect(screen.queryByText(labels.signingIn)).toBeNull()` (`login-form.test.tsx:88`).
  Failed: no `labels.signingIn`, nothing rendered.
- **GREEN** — new `signingIn` field on `LoginFormLabels` (`login-form.tsx:15`); a visually-hidden
  `<Text accessibilityLiveRegion="polite">` rendered next to the spinner inside the existing
  `LOADING_INDICATOR_TEST_ID` wrapper (`login-form.tsx:66-71`), off-screen via a new
  `styles.visuallyHidden` (`login-form.tsx:92-98`: `position: 'absolute'`, `1x1`, `overflow:
  'hidden'` — stays mounted so screen readers still pick up the live-region text, unlike
  `display: 'none'`). Wired `signingIn: t('auth.signingIn')` in `sign-in-form.tsx:29`. Story labels
  updated (`login-form.stories.tsx:10`) so both stories keep rendering with the new required
  field.
- **REFACTOR** — none needed.
- 3 tests (1 new, 1 strengthened, story labels) green.

### Major 3 — 48dp touch target via `hitSlop` (@s3, and every button call site this feature touches)
- **RED** — new file `libs/components/src/atoms/button/button.test.tsx`:
  `'exposes a hitSlop that reaches the 48dp touch-target token'` (asserts
  `hitSlop.top + hitSlop.bottom + 40 >= layout.touchTarget`, imported from `theme/spacing.ts`).
  Failed to compile/pass: no `hitSlop` prop on `Button`'s `Pressable`.
- **GREEN** — `button.tsx:31-39`: a per-size `HIT_SLOP` lookup derived from `layout.touchTarget`
  (existing, previously-unused token) minus each size's fixed `HEIGHTS` entry, halved per edge;
  passed to `Pressable`'s `hitSlop` at `button.tsx:92`. No visual box change — purely expands the
  tappable region, so `LoginForm`'s submit button, `SignOut`'s trigger, and `Dialog`'s
  cancel/confirm buttons all pick it up for free (none override `size`).
- **REFACTOR** — none needed; one small derived constant, no duplication.
- 1 new test green.

### Major 4 — `minHeight` instead of fixed `height` for Dynamic Type (@s3, same call sites as #3)
- **RED** — same new file, `'lets the box grow with content instead of clipping the label'`
  (`button.test.tsx:23-31`): flattens the `Pressable`'s style array and asserts
  `flat.height === undefined` and `flat.minHeight === 40`. Failed against the old fixed
  `height: HEIGHTS[size]` variant.
- **GREEN** — `button.tsx:109,123`: dropped the `size`-keyed `height` variant block entirely,
  passed `HEIGHTS[size]` into `styles.root(...)` as a `minHeight` parameter instead
  (`button.tsx:94`, `:109`); `styles.useVariants` narrowed to `{ variant }` only (`button.tsx:59`)
  since `size` no longer drives a style variant. `overflow: 'hidden'` (`button.tsx:119`)
  deliberately kept — it also clips `StateLayer`'s hover/press wash to the rounded shape, not just
  the label; the label itself can now grow the box via `minHeight` rather than being clipped.
- **REFACTOR** — none needed.
- 1 new test green; `button.test.tsx` totals 2 tests, both green alongside 9 other
  `login-form.test.tsx` tests (11 total in `@helsoft/components` for these two files).

### Minor 5 — silence "Multiple GoTrueClient instances" noise (no behavior/scenario change)
- **RED** — added a regression test,
  `'does not trigger a "Multiple GoTrueClient instances" warning across this file'`
  (`auth.integration.test.ts:114-119`), spying on `console.warn` from `beforeAll` and asserting no
  captured call's message contains that substring. Failed against the old per-test
  `initSupabase()` call (real warning fired from the 2nd test onward).
- **GREEN** — `auth.integration.test.ts:15-34`: hoisted `initSupabase(...)` out of
  `buildMockedClient()` into a single `beforeAll` building one `sharedClient` for the whole file
  (mirrors how the app calls `initSupabase()` exactly once at startup); `buildMockedClient()` now
  only re-attaches the `onAuthStateChange` spy against the shared client per test.
  `warnSpy`/`afterAll(warnSpy.mockRestore())` added around it.
- **REFACTOR** — none needed; the change collapses to fewer real clients, not more code.
- 5 tests green (4 existing + 1 new regression guard); zero `console.warn` noise on a full run.

### Minor 6 — dedupe `authValue`/`localizationValue` test factories (test-code only, no behavior change)
Pure refactor under green tests per `tdd.md`'s own rule for test-code cleanup — no new
RED/GREEN cycle, tests stayed green throughout the extraction.
- **REFACTOR** — extracted the identical `authValue`/`localizationValue` factory pair, previously
  duplicated verbatim in `sign-in-form.test.tsx:23-36` and `sign-out.test.tsx:18-31`, into a new
  shared module `libs/study-buddy/src/test-utils/auth-test-factories.ts`. Both test files now
  `import { authValue, localizationValue } from '../../test-utils/auth-test-factories'` instead of
  declaring their own copy. `language-settings.test.tsx`'s pre-existing, differently-shaped
  `localizationValue` (no `authValue`; plain `string`-typed `Overrides`, not
  `Partial<ReturnType<typeof useAuth>>`) is untouched, per the review's explicit scope note.
  `libs/study-buddy` full suite (14 tests across 3 files) re-ran green after the extraction; no
  test assertions changed.

### Round-1 fixes gate ✅
`pnpm turbo run check-types --filter=@helsoft/services --filter=@helsoft/hooks
--filter=@helsoft/components --filter=@helsoft/study-buddy --filter=app-study-buddy`,
`pnpm --filter @helsoft/hooks test`, `pnpm --filter @helsoft/components test`,
`pnpm --filter @helsoft/study-buddy test`, and repo-wide `pnpm lint` all green. No new hardcoded
strings/colors/dimensions — the `signingIn` label flows through `labels`/`t()` like its siblings,
`HIT_SLOP`/`minHeight` derive from existing tokens (`layout.touchTarget`, `HEIGHTS`). `@s5, @s6,
@s8, @s12, @s13` (Slice 2/3 scope) untouched this round.

---

## Round-2 review fixes

Responds to `docs/features/login-and-logout/review.md` (Round 2 consolidation: 1 major + 2 minor,
zero blockers). One block per finding, same RED→GREEN→REFACTOR log style. Scenario stays `@s3`
(Loading state) throughout.

### Major 1 — iOS VoiceOver gets no announcement during Loading (@s3)
- **RED** — added `'announces "Signing in…" via AccessibilityInfo when isSubmitting becomes
  true'` (`login-form.test.tsx:84-97`): spies on `AccessibilityInfo.announceForAccessibility`,
  renders Content first (asserts not called), then `rerender`s into `isSubmitting` and asserts
  `toHaveBeenCalledWith(labels.signingIn)`. Failed: no such call anywhere in `login-form.tsx`.
  - **Diagnostic detour**: the first RED run failed on the *wrong* assertion
    (`not.toHaveBeenCalled()` before the transition) with 4 stray recorded calls. Traced (via a
    temporary `expect.getState().currentTestName` + `jest.isMockFunction` probe, removed before
    GREEN) to `react-native`'s `jest-expo` preset already auto-mocking
    `AccessibilityInfo.announceForAccessibility` as a persistent `jest.fn()` from module load, so
    call history survives across tests in the same file regardless of when `jest.spyOn` is first
    called on it. Fixed by adding `announceSpy.mockClear()` right after `jest.spyOn(...)` in the
    test, isolating this test's assertions from the other Loading-state tests' own mounts earlier
    in the file (no production-code implication).
- **GREEN** — `login-form.tsx:1-2` (import `AccessibilityInfo` alongside `useEffect`),
  `:40-46`: a `useEffect` keyed on `[isSubmitting, labels.signingIn]` that calls
  `AccessibilityInfo.announceForAccessibility(labels.signingIn)` whenever `isSubmitting` is
  `true` — fires on the initial mount if Loading starts immediately, and again on every
  false→true transition. The existing `accessibilityLiveRegion="polite"` `<Text>` is untouched
  and still drives Android/Web; this is purely additive for iOS, where
  `accessibilityLiveRegion` has no native effect.
- **REFACTOR** — none needed; one small effect, no duplication.
- 1 new test green; `login-form.test.tsx` totals 10 tests, all green.

### Minor 2 — stale doc comment on `LOADING_INDICATOR_TEST_ID` (@s3, content-only)
- No new test (per the review's own note — content-only, `check-types`/`test` staying green is
  the check). `login-form.tsx:28`: dropped the "a11y label lands with the Slice 3 a11y pass"
  clause (no longer true since Round 1), pointed the comment at the live-region Text node and
  the new `AccessibilityInfo` call instead.
  - First wording attempt (`` `<Text>` `` in backticks) accidentally tripped
    `libs/localization/src/coverage/migration-coverage.test.ts`'s plain-text `LITERAL_TEXT_CHILD`
    regex, which scans raw file source (not JSX-aware) for `<Text ...>literal`ed against the
    literal string `<Text>` in the comment. Reworded to avoid the bare `<Text>` token
    (`login-form.tsx:28`); `@helsoft/localization` suite back to 52/52 green.

### Minor 3 — `auth.signingIn` (and `email`/`password`/`submit`) missing from all locale bundles (@s3, @s2)
- No new test — `t()` is loosely typed (`key: string`, `use-localization.ts:11`) so missing keys
  are not mechanically caught; the fix is content-only, scoped to exactly what
  `sign-in-form.tsx:25-29` already calls (`auth.email`, `auth.password`, `auth.submit`,
  `auth.signingIn`) plus their existing `toSignUp`/`toLogIn` siblings. Added all four keys to
  `libs/localization/src/resources/{en,es,de,pt}.ts` under the `auth` namespace, matching each
  bundle's existing style/capitalization. Deliberately did **not** add the unrelated
  `auth.logOut*` keys `sign-out.tsx` also calls — those are task-8/Slice-3 scope per this file's
  own Slice-1 design note and out of this review's stated scope (no test currently asserts their
  literal copy, so nothing regresses).
- `es`/`de`/`pt` are typed as `TranslationResource` (derived from `en`), so all four bundles had
  to gain the same keys together or `check-types` would fail — confirmed green
  (`pnpm check-types`, all 8 packages).

### Round-2 fixes gate ✅
`pnpm --filter @helsoft/components test` (29/29), `pnpm --filter @helsoft/localization test`
(52/52), `pnpm --filter @helsoft/study-buddy test` (14/14), `pnpm --filter @helsoft/hooks test`
(14/14), `pnpm --filter @helsoft/services test` (30/30), `pnpm check-types` (8 packages), `pnpm
lint` all green. No hardcoded strings/colors/dimensions introduced. `@s5, @s6, @s8, @s12, @s13`
(Slice 2/3 scope) untouched this round.

Commit: `fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)`.

---

## Mutation-kill pass (Phase 4 — StrykerJS survivors)

Responds to `docs/features/login-and-logout/mutation.md` (28 addressable survivors across
`@helsoft/services`, `@helsoft/hooks`, `@helsoft/components`, `@helsoft/study-buddy`). No
production code changed anywhere in this pass — every implementation was already correct; every
fix is a strengthened/added test that pins the exact behavior a mutant was allowed to silently
break. One block per file, RED (mutant survives) → GREEN (test added, passes against real code,
re-run of scoped Stryker confirms the kill).

### `auth.service.ts` (@s9, @s2) — 4/4 killed
- **RED** — verified in Node first (not guesswork) that `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(' user@example.com')`
  is `false` but the same pattern minus `^` is `true` (anchor pins the *start*); symmetric for
  `'test@test.com@invalid'` and the `$` anchor (pins the *end*, rejecting trailing `@junk`).
- **GREEN** — `auth.service.test.ts`: two new `isValidEmail` cases (leading-space, trailing-`@junk`);
  `signIn`'s two existing rejection tests tightened from `.rejects.toThrow()` to
  `.rejects.toThrow('Invalid email')` / `.rejects.toThrow('Password is required')` (exact message).
- Scoped Stryker (`--mutate "src/services/auth.service.ts"`): 84.62% → **100.00%** (26/26 killed).

### `use-auth.ts` (@s2, @s3, @s4) — 0/3 killed, all 3 confirmed equivalent
- **RED** — the 3 survivors are all `useCallback` dependency-array mutations
  (`withSubmitting`'s `[]`→`["Stryker was here"]`; `signIn`/`signOut`'s `[withSubmitting]`→`[]`).
- **Analysis before writing tests**: `withSubmitting` closes over nothing that ever changes across
  renders of one hook instance (only the React-stable `setIsSubmitting`), so its identity is
  constant forever — meaning none of these 3 dependency-array mutations can ever produce an
  observable behavior difference (a textbook equivalent mutant).
- **Tried anyway, per this phase's "kill first" instruction** — added
  `'keeps signIn and signOut referentially stable across re-renders'` and
  `'a signIn reference captured on an earlier render still drives the current isSubmitting
  state'` (`use-auth.test.ts`). Both green, both valuable regressions in their own right.
- **GREEN (for the equivalence claim, not the mutants)** — re-ran scoped Stryker
  (`--mutate "src/hooks/use-auth.ts"`) after adding both tests: still 62.50% (5/8), same 3
  survivors, empirically confirming no test can distinguish real code from any of these 3
  mutants. No inline Stryker ignore-comment exists in the installed
  `@stryker-mutator/instrumenter@8.7.1` (verified against its source); the only lever
  (`mutator.excludedMutations`) is a package-wide category disable, rejected as too broad.
  Documented in `mutation.md` as an accepted, human-sign-off-requested risk (same
  ESCALATE_MINORS precedent as this feature's own Round-3 review).

### `login-form.tsx` (@s2, @s3) — 11/11 killed
- **RED→GREEN**, one assertion group at a time: pristine initial state
  (`getByLabelText('Email'|'Password').props.value === ''` on a bare render — kills both
  `useState('')`→`useState("Stryker was here!")` mutants); the literal `LOADING_INDICATOR_TEST_ID`
  string (`expect(LOADING_INDICATOR_TEST_ID).toBe('login-form-loading-indicator')` — kills the
  `= ""` mutant that survived because every query in the file uses the same, now-consistently-empty,
  imported constant); submit-row layout (`toHaveStyle({ flexDirection: 'row', alignItems:
  'center', gap: spacing.s3 })` on the submit button's parent View — kills the `submitRow`
  object-literal mutant plus its two property mutants); form vertical rhythm
  (`toHaveStyle({ gap: spacing.s4 })` two levels up — kills the `form` object-literal mutant, and
  transitively the whole-`StyleSheet.create()`→`{}` mutant since any of the three style objects
  going missing now fails an assertion); live-region visual-hiding
  (`toHaveStyle({ position: 'absolute', width: 1, height: 1, overflow: 'hidden' })` on the
  live-region `<Text>` — kills `visuallyHidden` and its two property mutants).
- **REFACTOR** — none needed; each new test is a single, focused assertion group, no duplication.
- Scoped Stryker (`--mutate "src/organisms/login-form/login-form.tsx"`): 50.00% → **100.00%**
  (22/22 killed). 5 new tests, `login-form.test.tsx` now 15 total, all green.

### `button.tsx` — 0/40 killed this pass, all 40 confirmed out of scope
- **Not a test gap left unaddressed** — investigated every surviving line's origin via
  `git show 7751666 -- .../button.tsx` (this feature's own Round-1 commit that touched the file).
  39 of the 40 sit on lines this feature never added/changed (icon/label padding math, the
  elevated-variant shadow branch, `root`'s non-`minHeight` layout properties, the
  `variant`→background-color map, `fgByVariant`, `stateOpacity`) — pre-existing since
  `913e38b` ("feat(components): add Material Design 3 themed component library"), before
  `button.test.tsx` existed at all (per this file's own Round-1 log entry). This feature's own
  hitSlop/minHeight lines (`:34-39,92,94,109,123`) have **zero** survivors — already 100% from the
  two Round-1 tests.
- The 1 remaining survivor **is** on a line this feature edited
  (`:59:22`, `useVariants({ variant })`→`useVariants({})`, from dropping `size` out of that call).
  Did not assume equivalence — inspected `node_modules/react-native-unistyles/src/mocks.ts`
  directly: the official Jest mock makes `useVariants` a complete no-op and unconditionally strips
  `variants`/`compoundVariants` from every resolved style before returning it. No test, in this
  toolchain, can ever observe a difference from what's passed to `useVariants(...)` — confirmed by
  reading the mock's source, not inferred from the empty coverage line.
- **Disposition** — no new tests added (none would kill anything real); documented in full in
  `mutation.md` with the line-by-line origin trace.

### `sign-in-form.tsx` (@s3) — 1/1 killed
- **RED→GREEN** — `'passes the auth.signingIn i18n key into the Loading affordance'`: renders with
  `authValue({ isSubmitting: true })` and asserts `getByText('auth.signingIn')` (the test-double
  `t()` echoes its key verbatim, so asserting the on-screen text pins the exact key string passed
  to `t(...)`, killing the `t('auth.signingIn')`→`t("")` mutant).
- Scoped Stryker: 90.00% → **100.00%** (10/10 killed).

### `sign-out.tsx` (@s4, @s10, @s11) — 3/3 killed
- **RED→GREEN**: `'does not show the confirmation dialog before the trigger is pressed'`
  (`queryByText('auth.logOutConfirmBody')` is `null` pre-press — kills the initial
  `useState(false)`→`useState(true)` mutant, verified real `Modal`'s `visible` prop genuinely gates
  child rendering at the RN level, not just visually); the existing "shows a confirmation dialog"
  test extended to also assert `getByText('auth.logOutConfirmHeadline')` (previously only body copy
  was checked — kills the headline `t(...)`→`t("")` mutant); `'closes the confirmation dialog after
  confirming'` (`queryByText('auth.logOutConfirmBody')` is `null` after pressing confirm — kills
  the `setConfirmOpen(false)`→`setConfirmOpen(true)` mutant inside `onConfirm`).
- Scoped Stryker: 76.92% → **100.00%** (13/13 killed).

### Mutation-kill pass gate
`pnpm turbo run test` (all workspaces), `pnpm turbo run check-types --filter=@helsoft/services
--filter=@helsoft/hooks --filter=@helsoft/components --filter=@helsoft/study-buddy
--filter=app-study-buddy`, and `pnpm lint` all green. No production code touched — every change is
test-only. Full breakdown, including the two documented-equivalent-mutant exceptions
(`use-auth.ts` ×3, `button.tsx`'s `useVariants` line ×1) and the 39 pre-existing/out-of-scope
`button.tsx` survivors, is in `docs/features/login-and-logout/mutation.md`.

Commit: `test(login-and-logout): kill surviving mutants`.

---

## Slice 2 — Empty + Error + Retry

### @s → test map (Slice 2)

| @s | Scenario | Test(s) |
|---|---|---|
| @s5 | Invalid credentials → generic error, no session | `auth.service.test.ts` (normalization), `use-auth.test.ts`, `auth.integration.test.ts`, `login-form.test.tsx` (banner), `sign-in-form.test.tsx` (banner key) |
| @s6 | Network failure → retryable error, retry works | `auth.service.test.ts` (normalization + retry), `use-auth.test.ts` (error clears on new attempt), `auth.integration.test.ts`, `login-form.test.tsx`, `sign-in-form.test.tsx` |
| @s8 | Pristine form disables submission, no error | `login-form.test.tsx` (Empty state) |
| @s9 | Malformed email / empty password rejected inline | `auth.service.test.ts` (validation_error code), `login-form.test.tsx` (emailError/passwordError props), `sign-in-form.test.tsx` (email wiring; empty-password covered by Empty-state gating) |

### task-6 — Auth error contract: `AuthErrorCode`/`AuthError` + normalization (@s5, @s6)

- **RED** — `auth.service.test.ts`: `'normalizes a Supabase invalid-login error to a sanitized
  invalid_credentials code'`, asserting both `.rejects.toMatchObject({ code:
  'invalid_credentials' })` (passed immediately — a real supabase-js `AuthApiError` already
  carries that raw code) **and** `.rejects.not.toHaveProperty('status')` (failed — the raw
  `AuthApiError` propagated untouched, `status` intact). Confirmed red via a real test run before
  implementing.
- **GREEN** — added `libs/types/src/auth-error.ts` (`AuthErrorCode`, `AuthError`, plain TS,
  exported via `libs/types/src/index.ts`); `auth.service.ts`: a `toAuthError(code, message)`
  helper (`Object.assign(new Error(message), { code })`) and `normalizeAuthError(cause)`
  (`isAuthApiError(cause)` from `@supabase/supabase-js` → `invalid_credentials`; anything else →
  `network_error`, the safe default); `signIn` now `try { … } catch (cause) { throw
  normalizeAuthError(cause); }`.
- **RED→GREEN** — added `'normalizes a Supabase retryable-fetch error to network_error'`
  (`AuthRetryableFetchError`) and `'normalizes an unrecognized thrown exception (e.g. offline
  fetch) to network_error'` (`TypeError`) — both passed immediately against the already-general
  `normalizeAuthError` (the single `else` branch already covered both; confirms the design rather
  than adding new code, same pattern as Slice 1's task-3 note).
- **RED→GREEN** — `'resolves normally on a subsequent call after a prior network_error (retry
  works)'` (@s6): sequential `mockRejectedValueOnce`/`mockResolvedValueOnce` — passed immediately
  (no shared mutable state in `AuthService.signIn` to leak between calls).
- **RED** — strengthened the two existing validation-rejection tests to also assert
  `.rejects.toMatchObject({ code: 'validation_error' })`. To prove this was genuinely red (not a
  trivial pass), temporarily reverted `signIn`'s two validation throws back to bare `new
  Error(...)`, re-ran, confirmed both new assertions failed, then re-applied `throw
  toAuthError('validation_error', …)` — green again.
- **GREEN** — `use-auth.ts`: added `error: AuthErrorCode | null` to `UseAuthResult`; `signIn`
  clears it (`setError(null)`) before the call and sets it from the caught error's `.code` on
  failure. Driven by a new `use-auth.test.ts` test (`'sets error to the failed signIn code, and
  null on a subsequent successful signIn'`) — red on `Property 'error' does not exist` (compile
  failure), green once implemented. A second test (`'clears a previous error immediately when a
  new signIn attempt starts, before it resolves'`, matching spec.md's Loading-state "no error
  yet" note) passed immediately — the `setError(null)`-before-`await` placement already covered
  it.
- **Value export** — `libs/services/src/index.ts` gained a value (not type-only) re-export of
  `AuthApiError` from `@supabase/supabase-js`, so consuming tests can build realistic supabase-js
  error shapes instead of ad-hoc plain objects.
- **Integration** — `auth.integration.test.ts`: new test `'surfaces invalid_credentials on a real
  Supabase auth error, then recovers on a valid retry'` — a real `AuthApiError` returned from a
  mocked `client.auth.signInWithPassword`, exercised through the full `useAuth -> AuthService ->
  AuthDao` stack against the shared mocked-Supabase-client boundary; asserts `useAuth().error ===
  'invalid_credentials'` with no session, then a second call establishing the session and
  clearing `error` (@s6's retry, end-to-end). Passed immediately (confirms the already-correct
  wiring); still valuable as this slice's required integration test.
- **REFACTOR** — none needed beyond the deliberate revert/reapply above; `toAuthError`/
  `normalizeAuthError` stayed short, single-purpose, no duplication.
- `@helsoft/hooks` gained a declared `@helsoft/types` dependency (needed for `AuthErrorCode`).
- 19 tests green in `auth.service.test.ts`, 9 in `use-auth.test.ts`, 6 in
  `auth.integration.test.ts`. `pnpm --filter @helsoft/services check-types` /
  `@helsoft/hooks check-types` / `@helsoft/types check-types` all clean.

### task-7 — LoginForm Empty + Error states, inline validation (@s5, @s6, @s8, @s9)

- **RED** — `login-form.test.tsx`: `'disables the submit control and shows no error on a
  pristine (empty) form'` (@s8) — failed: submit was enabled on a bare render.
- **GREEN** — `login-form.tsx`: `isPristine = !email.trim() || !password.trim()`; `Button
  disabled={isSubmitting || isPristine}`.
- **Collateral fix** — the pre-existing Slice-1 test `'does not show the loading affordance or
  disable controls outside of isSubmitting'` broke once Empty-state gating landed (it asserted
  submit `disabled: false` on a *pristine* render, which is no longer true — Empty and Content are
  now distinct states). Updated it to type both fields first, so it now genuinely exercises the
  Content state it was always meant to describe.
- **RED** — `'renders an error banner and keeps the form editable when errorMessage is given'` and
  `'renders a different error banner string for a network error'` (@s5/@s6) — failed:
  `errorMessage` prop didn't exist.
- **GREEN** — added `errorMessage?: string` to `LoginFormProps`; a banner `View`/`Text` (MD3
  `theme.colors.errorContainer`/`onErrorContainer`, `theme.shape.card`, `theme.spacing.s3`,
  `theme.typography.bodyMedium` — tokens only) rendered above the fields when `errorMessage` is
  set. A third test (`'keeps submit enabled … alongside an errorMessage banner'`) confirms the
  banner never blocks retry, per spec's error-contract table ("Retry: Edit + resubmit").
- **RED** — `'renders emailError as inline supporting text on the email field and blocks submit'`
  and the password equivalent (@s9) — failed: no `emailError`/`passwordError` props.
- **GREEN** — added `emailError?: string`/`passwordError?: string`; wired into each `TextField`'s
  existing `error`/`supportingText` props; `hasFieldError = !!emailError || !!passwordError` added
  to the submit-disabled condition alongside `isSubmitting`/`isPristine`.
- **REFACTOR** — none needed; each new prop is a one-line addition to existing conditions/JSX, no
  duplication introduced.
- **Stories** — rewrote `login-form.stories.tsx`: renamed the old no-args story to `Empty`
  (pristine, matches its actual rendered state now); added `Content` using a Storybook `play`
  function (`userEvent.type`, same pattern as `text-field.stories.tsx`'s `Filled` story) to type
  valid credentials, since the component owns its field state internally; kept `Loading`; added
  `Error` (banner) and `ErrorInlineValidation` (field-level) — all four spec.md UI states plus the
  two Error flavors the task called out explicitly.
- 24 tests green in `login-form.test.tsx` (up from 17); `pnpm --filter @helsoft/components
  check-types` clean; `pnpm --filter @helsoft/components exec playwright test --reporter=list`
  — 19/19 existing e2e tests still green (no new e2e this slice — LoginForm's own e2e is task-9,
  Slice 3, per `tasks.md`).

### Wiring — `SignInForm` (@s5, @s6, @s9)

Not in task-7's own `paths:` list, but required to make @s5/@s6/@s9 observable end-to-end (per
spec.md: "the parent (SignInForm, using AuthService validators) decides validity") — the vertical
slice would otherwise be dead props no wiring ever populates.

- **RED** — `sign-in-form.test.tsx`: `'shows an inline email error and does not call signIn when
  the email is malformed'`, `'renders the invalidCredentials banner …'`, `'renders the network
  banner …'` — all 3 failed (no such wiring existed).
- **GREEN** — `sign-in-form.tsx`: `handleSubmit` calls `AuthService.isValidEmail(email)`; on
  failure sets `emailError` (via `t('auth.error.email')`) and returns without calling `signIn`
  (@s9, no network call made); a small `AUTH_ERROR_KEYS` map (`invalid_credentials` /
  `network_error` → i18n key) turns `useAuth().error` into `LoginForm`'s `errorMessage` (@s5/@s6).
- **Design correction caught before commit**: an initial version also mirrored
  `AuthService.isNonEmptyPassword` into a `passwordError` state in `SignInForm`. Analysis showed
  this branch is **unreachable** — `LoginForm`'s own Empty-state gating (`isPristine`, this same
  slice's @s8 work) already disables the submit control whenever the password is blank/whitespace,
  so `handleSubmit` can never be invoked with one; the "shows an inline password error…" test
  written against it only asserted the submit button was disabled, never actually observing
  `passwordError`. Removed the dead `passwordError` state/branch from `sign-in-form.tsx` (no
  production code without a test that can actually drive it) and renamed the test to
  `'keeps submit disabled (never calling signIn) when the password is cleared back to blank'`,
  asserting `signIn` is never called — documenting that this half of @s9 is fully covered by
  `LoginForm`'s own Empty-state gating, with `AuthService.signIn`'s own `validation_error` throw
  (task-6) as the defensive backstop for any caller that bypasses the form entirely. `LoginForm`'s
  `passwordError` prop itself stays fully specified and tested at the component level (task-7's
  own done-criteria), independent of whether current wiring populates it.
- `auth-test-factories.ts`'s `authValue()` gained `error: null` as its default.
- 9 tests green in `sign-in-form.test.tsx` (up from 4); `pnpm --filter @helsoft/study-buddy
  check-types` clean.

### Slice-2 gate

`pnpm turbo run test` (all workspaces — 6/6 green), `pnpm turbo run check-types` (8/8 packages
green), `pnpm lint` clean, `pnpm --filter @helsoft/components exec playwright test
--reporter=list` (19/19 existing e2e green, non-interactive `list` reporter per the
`storybook-e2e-tests` skill). No hardcoded strings/colors/dimensions — the error banner and every
new prop's copy comes from `errorMessage`/`emailError`/`passwordError`/`labels`, all sourced from
`t()` one layer up in `SignInForm`; the banner's visual tokens are all `theme.colors`/
`theme.shape`/`theme.spacing`/`theme.typography`. `auth.error.*` i18n key **content** (actual
translated strings, currently falling back to the raw key like `signingIn` did before task-8 in
Slice 1) lands in task-8 (Slice 3) — no test in this slice asserts literal translated copy.

Awaiting the per-slice `reviewer_code` + `reviewer_design` review before flipping task-7 to `done`
and committing (`feat(login-and-logout): add error handling and empty state`).

---

## Slice 2, Round 1 review fixes

Responds to `docs/features/login-and-logout/review.md` (Slice 2 per-slice consolidation: 1 major
+ 3 minor from `reviewer_code`; `reviewer_design` approved with zero findings). Slice mode — every
finding fixed, no open minors. One block per finding, same RED→GREEN→REFACTOR log style.

### Major 1 — `normalizeAuthError` over-classified any GoTrue `AuthApiError` as `invalid_credentials` (@s5, @s6)
- **RED** — added `'does not classify a differently-coded AuthApiError (e.g. unconfirmed email)
  as invalid_credentials'` (`auth.service.test.ts`, `signIn error normalization` block):
  constructs `new AuthApiError('Email not confirmed', 400, 'email_not_confirmed')` and asserts
  `signIn` rejects with `{ code: 'network_error' }`. Failed against the old
  `isAuthApiError(cause)`-only check (got `invalid_credentials` instead).
- **GREEN** — `auth.service.ts`: `normalizeAuthError` now requires both
  `isAuthApiError(cause)` **and** `cause.code === INVALID_LOGIN_CODE` (`'invalid_credentials'`,
  the exact code GoTrue returns for a wrong email/password — verified against `@supabase/auth-js`
  error codes) before classifying as `invalid_credentials`; every other `AuthApiError` (and
  everything else, as before) falls through to the safe `network_error` default. Docstring
  updated to state the narrower rule explicitly.
- **REFACTOR** — none needed; one added condition plus a named constant, no duplication.
- 20/20 `auth.service.test.ts` tests green (up from 19 pre-fix), including all pre-existing
  `invalid_credentials`-code tests.

### Minor 2 — undocumented empty-password scope cut (`passwordError` never wired in `SignInForm`) (@s9)
- No new test — this finding is about documentation, not behavior. Re-verified the reachability
  analysis already recorded in this file's Slice-2 "Wiring — SignInForm" section above: `LoginForm`'s
  `isPristine` gate (`!email.trim() || !password.trim()`) uses the identical blank/whitespace rule
  as `AuthService.isNonEmptyPassword`, so the submit control is disabled for any blank password and
  `handleSubmit` can never fire with one — a mirrored `passwordError` branch in `SignInForm` would
  be dead code no test could legitimately drive (Three Laws), which is exactly why it was removed
  during the original build. Chose **option (b)**: promoted this from an implicit code comment to
  an explicit, human-facing **Open decision** in `spec.md` ("Open decisions (confirmed)" section),
  documenting the reasoning and cross-referencing this file. Added a one-line pointer from
  `sign-in-form.tsx`'s docblock to the new spec.md entry.
- Re-ran `@helsoft/study-buddy` suite (comment-only change) — 22/22 green, unaffected.

### Minor 3 — `AuthApiError` re-exported from `@helsoft/services`'s production barrel for test convenience
- **RED** — removed `export { AuthApiError } from '@supabase/supabase-js';` from
  `libs/services/src/index.ts` first, confirming the only consumer,
  `libs/hooks/src/hooks/auth.integration.test.ts`, broke (`TypeError: services_1.AuthApiError is
  not a constructor`) — proving this was the sole reason for the export and it was safe to remove.
- **GREEN** — created `libs/hooks/src/test-utils/auth-error-fixtures.ts` exporting
  `buildAuthApiErrorFixture(message, status, code)`, a duck-typed fixture (`Object.assign(new
  Error(message), { name: 'AuthApiError', status, code, __isAuthError: true })`) matching the exact
  shape `@supabase/auth-js`'s `isAuthError`/`isAuthApiError` check at runtime — without
  `@helsoft/hooks` taking a direct dependency on `@supabase/supabase-js` (confirmed it has none:
  no `@supabase` entry in `libs/hooks/node_modules`) just for test fixtures. Chose a
  package-local `test-utils` module (mirroring `libs/study-buddy/src/test-utils/`'s existing
  pattern) over a cross-package deep import, since `libs/services` has no equivalent test-utils
  directory and no `package.json` "exports" map to support one safely. Updated
  `auth.integration.test.ts` to import `buildAuthApiErrorFixture` instead of `AuthApiError`.
- **REFACTOR** — none needed.
- `@helsoft/hooks` suite 20/20 green (`auth.integration.test.ts` 6/6, including the fixed test);
  `@helsoft/services` and `@helsoft/hooks` `check-types` both clean.

### Minor 4 — unchecked `(cause as AuthError).code` type assertion in `useAuth` (@s5, @s6)
- **RED** — added `'falls back to network_error when the rejected cause has no valid string
  code'` (`use-auth.test.ts`): `service.signIn.mockRejectedValueOnce({ message: 'boom' })` (no
  `.code`), asserts `result.current.error` becomes `'network_error'`. Failed against the old
  unchecked cast (`result.current.error` was `undefined`, not `'network_error'`).
- **GREEN** — `use-auth.ts`: added a narrow runtime guard `isAuthErrorShape(cause): cause is
  AuthError` checking `typeof (cause as { code?: unknown } | null)?.code === 'string'`; the catch
  block now does `setError(isAuthErrorShape(cause) ? cause.code : 'network_error')` instead of the
  bare cast.
- **REFACTOR** — none needed; one small local guard function, no duplication.
- `@helsoft/hooks` suite 20/20 green (up from 19); `check-types` clean.

### Slice-2, Round-1 fixes gate ✅
`pnpm turbo run test` (6/6 workspaces green), `pnpm turbo run check-types --force` (8/8 packages
green), `pnpm lint` clean (only `app-study-buddy` defines a lint script; cache hit, clean). No
components/Storybook files touched this round (all 4 findings are in `@helsoft/services`,
`@helsoft/hooks`, `libs/study-buddy` docblock/comment, and `spec.md`), so the Playwright e2e suite
was not re-run — not relevant to this round's changes. Scope held to exactly the 4 review
findings — no drive-by refactors, no Slice 1/3 files touched.

Awaiting `reviews_lead` re-review before flipping task-7 to `done` and committing.

## Slice 2, Round 2 review fixes

Responds to `docs/features/login-and-logout/review.md` (Slice 2, round 2 consolidation: 2 blockers
from `reviewer_code`'s fresh full pass; `reviewer_design` approved with zero findings both rounds).
Slice mode — both findings fixed, no open items. One block per finding, same RED→GREEN→REFACTOR
log style. Both findings were verified RED first by temporarily reverting just the production fix
(component/prop wiring or the locale-bundle addition) while leaving the new test in place, running
the suite to confirm the exact reported failure reproduced, then restoring the fix — not merely
inferred.

### Blocker 1 — permanent submit deadlock after one malformed-email attempt (@s9)
- **Bug** — `SignInForm.emailError` was only ever set/cleared inside `handleSubmit`.
  `LoginForm`'s submit button disables via `hasFieldError = !!emailError || !!passwordError`.
  Once a malformed email set `emailError`, the only control that could ever re-run
  `handleSubmit` (and thus clear it) was that same now-disabled button — permanently
  deadlocking the form after one typo, with no test driving the "corrected then resubmit" path.
- **RED** — added `'re-enables submit and calls signIn after correcting a malformed email
  post-error'` (`sign-in-form.test.tsx`): submits with `'not-an-email'` (asserts the
  `auth.error.email` text and that `signIn` was not called), then changes the email to
  `'user@example.com'` and asserts the error text is gone, the submit button is enabled, and a
  second press calls `signIn('user@example.com', 'secret1')`. Also added `'calls onEmailChange
  with the new value as the email field changes'` (`login-form.test.tsx`) for the new prop.
  Verified both fail against the pre-fix code (temporarily reverted just the fix, kept the
  tests): `login-form.test.tsx` — 1/25 failing (`onEmailChange` never called, 0 calls recorded);
  `sign-in-form.test.tsx` — 1/10 failing (`auth.error.email` text still present after correcting
  the email, i.e. never cleared).
- **GREEN** — `login-form.tsx`: added an optional `onEmailChange?: (email: string) => void` prop;
  the email `TextField`'s `onChangeText` now goes through a local `handleEmailChange` that updates
  `email` state and forwards the value to `onEmailChange` (LoginForm stays presentational — it only
  reports the change, it doesn't decide validity). `sign-in-form.tsx`: added a `handleEmailChange`
  that re-validates via `AuthService.isValidEmail` **only when `emailError` is already set**
  (`if (!emailError) return;`), setting it to `undefined` once the email becomes valid or to the
  updated message if still invalid, and wired it as `LoginForm`'s `onEmailChange`. Gating on "an
  error already exists" — rather than validating unconditionally on every keystroke — keeps @s9's
  submit-triggered-validation behavior intact for a fresh/first attempt (no premature error while
  the user is still typing their first-ever input) while making the deadlock impossible once an
  error has been shown: the field becomes live-validated exactly from that point on, so correcting
  it re-enables submit without a second submit attempt.
- **REFACTOR** — none needed; one new prop, one new handler on each side, no duplication.
- `@helsoft/components` 25/25 green (up from 24); `@helsoft/study-buddy` 10/10 green (up from 9).
  Both `check-types` clean.

### Blocker 2 — missing `auth.error.*` locale keys (@s5, @s6, @s9)
- **Bug** — `sign-in-form.tsx` calls `t('auth.error.email')`, `t('auth.error.invalidCredentials')`,
  `t('auth.error.network')`, none of which existed in any of the 4 locale bundles. i18next has no
  missing-key handler configured, so a real user would see the literal key string instead of a
  translated message, in every locale.
- **RED** — added an `error` key-existence test to `libs/localization/src/coverage/
  migration-coverage.test.ts` (new `describe('t() key existence coverage (sign-in-form)')`):
  statically scans `sign-in-form.tsx` for quoted, dot-delimited literals (catches both a direct
  `t('auth.error.email')` call and the `AUTH_ERROR_KEYS` lookup-map's literal values later passed
  to `t(variable)`) and asserts each resolves against a flattened `en.translation`. Verified RED by
  temporarily reverting only the `auth.error.*` addition in `en.ts` (keeping the test): 2/4 tests
  failed, reporting the exact 3 missing keys (`auth.error.invalidCredentials`, `auth.error.network`,
  `auth.error.email`).
- **GREEN** — added `error: { email, invalidCredentials, network }` under `auth` in all 4 bundles
  (`en`/`es`/`de`/`pt`), matching `spec.md`'s error-contract table's exact required English copy
  for `invalidCredentials` ("Invalid email or password") and `network` ("Network error"); `email`
  uses "Enter a valid email address" (no literal copy was specified for this one in `spec.md`/
  `gherkin-scenarios.md`, so it follows the existing inline-validation wording already used in
  `login-form.test.tsx`'s own fixtures). Translated the same 3 keys into `es`/`de`/`pt` matching
  each bundle's existing tone/capitalization. Since `es`/`de`/`pt` are typed as `TranslationResource`
  (derived from `en`), `check-types` would fail if any bundle were missing the new keys — confirmed
  by leaving them aligned.
- **Regression guard scope** — deliberately scoped the new coverage check to
  `libs/study-buddy/src/components/sign-in-form/` only, not the whole `study-buddy` lib: a
  lib-wide sweep would also need to account for `sign-out.tsx`'s own **pre-existing** missing
  `auth.logOut`/`auth.logOutConfirm*` keys (confirmed present in `sign-out.tsx`/
  `sign-out.test.tsx`, committed before this slice, not referenced anywhere in `review.md`'s Slice-2
  findings). That component is out of this fix's scope (not touched, per the round-2 brief) —
  flagging it here for `reviews_lead`/a future round's visibility rather than silently fixing or
  silently ignoring it.
- **REFACTOR** — none needed.
- `@helsoft/localization` 54/54 green (up from 52, +2 new tests); `check-types` clean across all
  8 packages (locale-bundle key alignment enforced by `TranslationResource`).

### Slice-2, Round-2 fixes gate ✅
`pnpm turbo run test` (6/6 workspaces green: `@helsoft/services` 37/37, `@helsoft/hooks` 20/20,
`@helsoft/components` 44/44, `@helsoft/study-buddy` 23/23, `@helsoft/localization` 54/54,
`@helsoft/lib-with-storybook` 2/2), `pnpm turbo run check-types --force` (8/8 packages green),
`pnpm lint` clean. `login-form.tsx`'s prop surface changed (`onEmailChange` added), so also ran
`pnpm --filter @helsoft/components exec playwright test --reporter=list` — 19/19 green (no
`login-form.e2e.js` exists yet; unaffected). Scope held to exactly the 2 round-2 findings — no
drive-by refactors, no Slice 1/3 files touched, `AuthService.isValidEmail`'s direct-call-from-
component pattern left untouched per the sanctioned "Direct Service Usage" exception.

Awaiting `reviews_lead` re-review before flipping task-7 to `done` and committing.
