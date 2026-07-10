# Mutation Testing Report — login-and-logout

**Status: GREEN (100% on all killable, in-scope mutants)** — updated by `implementator` after a
kill-the-survivors pass. Original report (28 addressable survivors across
`@helsoft/services`, `@helsoft/hooks`, `@helsoft/components`, `@helsoft/study-buddy`) preserved
below each section for traceability, followed by the resolution.

---

## `@helsoft/services` — `auth.service.ts`

**Before: 84.62% (22 killed, 4 survived). After: 100.00% (26 killed, 0 survived).**

Scoped run: `pnpm --filter @helsoft/services exec stryker run --mutate "src/services/auth.service.ts"`

| File:Line | Mutation Applied | Resolution |
|---|---|---|
| `auth.service.ts:5:23` | Email regex missing `$` anchor | **Killed.** New test `isValidEmail` rejects `'test@test.com@invalid'` (well-formed prefix + trailing `@junk`; matches without `$`, correctly rejected with it). |
| `auth.service.ts:5:23` | Email regex missing `^` anchor | **Killed.** New test `isValidEmail` rejects `' user@example.com'` (leading disallowed char before an otherwise well-formed tail; matches without `^`, correctly rejected with it). |
| `auth.service.ts:23:39` | `new Error('Invalid email')` → `new Error("")` | **Killed.** `signIn` malformed-email test now asserts `.rejects.toThrow('Invalid email')` (exact message), not just `.rejects.toThrow()`. |
| `auth.service.ts:26:39` | `new Error('Password is required')` → `new Error("")` | **Killed.** `signIn` empty-password test now asserts `.rejects.toThrow('Password is required')` (exact message). |

Both regex boundary cases were verified independently in Node before writing the assertions
(`^`-anchor case: `/^.../ .test(' user@example.com') === false`, `/[^^].../.test(...) === true`;
`$`-anchor case: symmetric). Files: `libs/services/src/services/auth.service.test.ts`.

---

## `@helsoft/hooks` — `use-auth.ts`

**Before: 62.50% (5 killed, 3 survived). After: 62.50% (5 killed, 3 survived) — unchanged; all 3
confirmed equivalent mutants, documented below.**

Scoped run: `pnpm --filter @helsoft/hooks exec stryker run --mutate "src/hooks/use-auth.ts"`

| File:Line | Mutation Applied | Status |
|---|---|---|
| `use-auth.ts:28:6` | `withSubmitting`'s `useCallback` deps `[]` → `["Stryker was here"]` | **Confirmed equivalent — documented, not killable.** |
| `use-auth.ts:35:5` | `signIn`'s `useCallback` deps `[withSubmitting]` → `[]` | **Confirmed equivalent — documented, not killable.** |
| `use-auth.ts:38:82` | `signOut`'s `useCallback` deps `[withSubmitting]` → `[]` | **Confirmed equivalent — documented, not killable.** |

**Why these are equivalent mutants (not a test gap):** `withSubmitting` is memoized with `[]` —
it never captures any value that changes across re-renders of the same hook instance (only the
React-guaranteed-stable `setIsSubmitting` setter), so its identity is constant for the lifetime
of every `useAuth()` call. Given that:
- Mutant 1 (`[]` → `["Stryker was here"]`) replaces the deps array with a *constant string
  literal*. A literal's value never changes between renders (`Object.is` equality on primitives),
  so `useCallback` recomputes the memo comparison identically to `[]` — forever. No sequence of
  renders can produce different behavior between the two.
- Mutants 2 & 3 (`[withSubmitting]` → `[]`) drop the one listed dependency, but that dependency
  (`withSubmitting`) never changes identity in the first place (per the above), so `useCallback`'s
  internal comparison always concludes "unchanged" either way. There is no stale-closure bug to
  observe: `withSubmitting`'s body doesn't close over anything reactive either, so even a
  hypothetically "stale" reference would behave identically to a fresh one.

**What was tried before concluding equivalence** (per this phase's instructions, "kill first,
document only as last resort"): added two new regression tests to
`libs/hooks/src/hooks/use-auth.test.ts` —
`'keeps signIn and signOut referentially stable across re-renders'` (identity check via
`renderHook`/`rerender`) and `'a signIn reference captured on an earlier render still drives the
current isSubmitting state'` (stale-closure probe: calls a `signIn` reference obtained *before* a
`rerender()`, asserts it still correctly toggles `isSubmitting`). Both pass and are valuable
regressions in their own right, but — as predicted by the equivalence analysis above — neither
changes the mutation outcome; re-running Stryker scoped to this file after adding them still shows
the same 3 survivors (`62.50%`, 5 killed / 3 survived), empirically confirming no test-observable
difference exists between the real code and any of these 3 mutants.

**No suppression mechanism applied:** StrykerJS (installed version, `@stryker-mutator/instrumenter
8.7.1`) has no per-line/inline ignore-comment feature (verified against its source — only
Angular-template ignoring exists as a framework-specific ignorer). The only config-level lever is
`mutator.excludedMutations`, which disables an entire mutant *category* (e.g. `ArrayDeclaration`)
package-wide — rejected here as too broad, since it would also blind future, potentially-meaningful
`useCallback`/`useMemo` dependency-array mutants in other `@helsoft/hooks` files.

**Disposition:** documented, accepted risk — no blocker/major, a `62.50%` file-scoped mutation
score driven entirely by 3 proven-equivalent mutants on this one small hook. Human sign-off
requested before Phase 5 (DoD) if a stricter interpretation is wanted; otherwise this matches the
review-standards.md §5 "ESCALATE_MINORS" precedent already used for this same feature at Round 3.

---

## `@helsoft/components`

### `login-form.tsx`

**Before: 50.00% (11 killed, 11 survived). After: 100.00% (22 killed, 0 survived).**

Scoped run: `pnpm --filter @helsoft/components exec stryker run --mutate "src/organisms/login-form/login-form.tsx"`

| File:Line | Mutation Applied | Resolution |
|---|---|---|
| `login-form.tsx:38:38` | Initial email `useState('')` → `useState("Stryker was here!")` | **Killed.** New test asserts `getByLabelText('Email').props.value === ''` on a fresh render. |
| `login-form.tsx:39:44` | Initial password `useState('')` → `useState("Stryker was here!")` | **Killed.** Same test asserts the password field too. |
| `login-form.tsx:29:42` | `LOADING_INDICATOR_TEST_ID = '...'` → `= ""` | **Killed.** New test asserts the literal string value directly: `expect(LOADING_INDICATOR_TEST_ID).toBe('login-form-loading-indicator')`. |
| `login-form.tsx:91:46`–`105` | Whole `StyleSheet.create()` → `{}` | **Killed** (as a side effect of the 3 style assertions below — any of `form`/`submitRow`/`visuallyHidden` becoming `undefined` fails them). |
| `login-form.tsx:92:9` | `form` style → `{}` | **Killed.** New test asserts the form root carries `{ gap: spacing.s4 }`. |
| `login-form.tsx:95:14` | `submitRow` style → `{}` | **Killed.** New test asserts `{ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 }` on the submit row. |
| `login-form.tsx:96:20` | `flexDirection: 'row'` → `''` | **Killed** (same submit-row test). |
| `login-form.tsx:97:17` | `alignItems: 'center'` → `''` | **Killed** (same submit-row test). |
| `login-form.tsx:101:19` | `visuallyHidden` style → `{}` | **Killed.** New test asserts `{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }` on the live-region `<Text>`. |
| `login-form.tsx:102:15` | `position: 'absolute'` → `''` | **Killed** (same live-region test). |
| `login-form.tsx:105:15` | `overflow: 'hidden'` → `''` | **Killed** (same live-region test). |

Files: `libs/components/src/organisms/login-form/login-form.test.tsx` (4 new tests: pristine
initial state, literal testID, submit-row layout, form vertical gap, live-region visual-hiding —
5 tests total added, one doubling as the whole-stylesheet kill).

### `button.tsx`

**Before: 19.35% (12 killed, 40 survived). After: 19.35% (12 killed, 40 survived) — unchanged;
all 40 confirmed out of this feature's scope, documented below.**

Scoped run: `pnpm --filter @helsoft/components exec stryker run --mutate "src/atoms/button/button.tsx"`

Cross-referenced every surviving mutant's line number against `git show 7751666 -- .../button.tsx`
(the Round-1 commit where `login-and-logout` touched this file for the hitSlop/minHeight fixes),
to separate lines this feature actually introduced/changed from pre-existing lines from the
original Material Design 3 library commit (`913e38b`, "feat(components): add Material Design 3
themed component library" — predates this feature and every other feature branched from it).

**This feature's own lines are already at 100%** (zero survivors on any of them):
- `HIT_SLOP` computation (`button.tsx:34-39`), `hitSlop={HIT_SLOP[size]}` (`:92`), threading
  `HEIGHTS[size]` into `styles.root(...)` as `minHeight` (`:94`), the `minHeight` style-function
  parameter and property (`:109`, `:123`) — all covered/killed by the two Round-1
  `button.test.tsx` tests (`'exposes a hitSlop that reaches the 48dp touch-target token'`,
  `'lets the box grow with content instead of clipping the label'`).

**39 of the 40 survivors are pre-existing, untouched lines** (icon/label padding math
`:79-83`, the `elevated`-variant shadow branch `:85`, `alignSelf`/`flexDirection`/`alignItems`/
`justifyContent`/`overflow` on the shared `root` style `:110-119`, the `variant`→background-color
map `:124-138`, `fgByVariant` `:61-70`, `stateOpacity` `:73-77`, size defaults/constants
`:27,47,52`) — none of these were added, removed, or modified by this feature (confirmed via the
Round-1 diff); they were already untested (no `button.test.tsx` existed before this feature added
one, per `tdd.md`'s Round-1 log) and remain out of scope per this phase's own instructions ("if
pre-existing code, document as out-of-scope").

**The 1 remaining survivor *is* on a line this feature edited** —
`button.tsx:59:22`: `styles.useVariants({ variant })` → `styles.useVariants({})` (Round-1 dropped
`size` from this call). Investigated rather than assumed pre-existing: **this is a StrykerJS/tooling-level
equivalent mutant, not a test gap.** `react-native-unistyles`'s own official Jest mock
(`node_modules/react-native-unistyles/src/mocks.ts`, wired in via
`libs/components/jest.config.js`'s `setupFiles: ['react-native-unistyles/mocks', ...]`) implements
`useVariants: () => {}` as a total no-op, **and** its `StyleSheet.create` mock unconditionally
strips the `variants`/`compoundVariants` keys off every resolved style object before returning it
(`stripVariants()` in that file). Concretely: whatever argument `useVariants(...)` is called with,
in this test environment it does nothing, and no variant-conditional style ever reaches a rendered
component. No test — for this line or for the 11 sibling `variant`-driven background-color mutants
at `:124-138`, which fail for the identical reason and were already surviving before this feature
touched the file — can ever observe a difference. Verified by direct inspection of the mock source
(not merely inferred from the empty coverage report).

**Disposition:** all 40 are documented, out-of-scope: 39 pre-existing/untouched by
`login-and-logout`, 1 (`:59:22`) a verified tooling-level equivalent mutant. This feature's own
button.tsx contribution (hitSlop, minHeight) is independently at 100%.

---

## `@helsoft/study-buddy`

### `sign-in-form.tsx`

**Before: 90.00% (9 killed, 1 survived). After: 100.00% (10 killed, 0 survived).**

| File:Line | Mutation Applied | Resolution |
|---|---|---|
| `sign-in-form.tsx:29:22` | `t('auth.signingIn')` → `t("")` | **Killed.** New test renders with `isSubmitting: true` and asserts `getByText('auth.signingIn')` (the test-double `t()` echoes its key, so the literal key string is what's on screen — asserting it pins the exact key passed). |

### `sign-out.tsx`

**Before: 76.92% (10 killed, 3 survived). After: 100.00% (13 killed, 0 survived).**

| File:Line | Mutation Applied | Resolution |
|---|---|---|
| `sign-out.tsx:14:50` | `useState(false)` → `useState(true)` | **Killed.** New test asserts the confirmation dialog body is **not** rendered before the trigger is pressed (`queryByText('auth.logOutConfirmBody')` is `null` on initial render — the mutant, starting `confirmOpen` at `true`, renders it immediately). |
| `sign-out.tsx:24:21` | `t('auth.logOutConfirmHeadline')` → `t("")` | **Killed.** Extended the existing "shows a confirmation dialog" test to also assert `getByText('auth.logOutConfirmHeadline')` (previously only the body copy was asserted). |
| `sign-out.tsx:28:26` | `setConfirmOpen(false)` → `setConfirmOpen(true)` (inside `onConfirm`) | **Killed.** New test presses confirm and asserts the dialog body is gone afterward (`queryByText('auth.logOutConfirmBody')` is `null` — the mutant leaves it open). |

Files: `libs/study-buddy/src/components/sign-in-form/sign-in-form.test.tsx`,
`libs/study-buddy/src/components/sign-out/sign-out.test.tsx`.

---

## `@helsoft/localization`

**Unchanged: 11.36% (11 killed, 117 survived) — out of scope, as originally reported.** All
survivors are individual translation-string literals mutated to `""` in pure data files
(`resources/{en,es,de,pt}.ts`); no test asserts specific translation values by design (only key
resolution/locale-switching/interpolation mechanics are tested). Not actionable without inflating
scope into asserting every literal copy string, which was explicitly out of scope per Round-1/2/3
review findings on this same feature (`review.md` Minor 3).

---

## Final Summary

| Library / file | Before | After | Outstanding |
|---|---|---|---|
| `@helsoft/services` — `auth.service.ts` | 84.62% | **100.00%** | none |
| `@helsoft/hooks` — `use-auth.ts` | 62.50% | 62.50% | 3 confirmed-equivalent mutants (documented above), human sign-off requested |
| `@helsoft/components` — `login-form.tsx` | 50.00% | **100.00%** | none |
| `@helsoft/components` — `button.tsx` | 19.35% | 19.35% | 40 confirmed out-of-scope (39 pre-existing, 1 tooling-level equivalent) — this feature's own hitSlop/minHeight lines are 100% |
| `@helsoft/study-buddy` — `sign-in-form.tsx` | 90.00% | **100.00%** | none |
| `@helsoft/study-buddy` — `sign-out.tsx` | 76.92% | **100.00%** | none |
| `@helsoft/localization` — resources | 11.36% | 11.36% | data-file literals, previously accepted as out of scope |

**All killable, in-scope survivors are killed.** The only mutants still surviving are either (a)
proven equivalent given the current, correct implementation (`use-auth.ts`'s 3, `button.tsx`'s
1 `useVariants` line — all independently verified, not assumed), or (b) pre-existing/out-of-scope
lines this feature never touched (`button.tsx`'s other 39, `localization`'s 117 data-file
literals). No production code was changed in this pass — every fix was a test strengthening
against already-correct implementation.

`pnpm test` (all touched workspaces), `pnpm turbo run check-types` (8 packages), and `pnpm lint`
all green after this pass.

---

Generated: Phase 4 (mutation_tester) → re-verified by `implementator` (kill-the-survivors pass).
