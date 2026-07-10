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
