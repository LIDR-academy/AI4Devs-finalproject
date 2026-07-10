# Review — Performance (runtime & delivery cost) — Round 2

**Feature:** login-and-logout
**Round:** 2 (re-run over commit `7751666` — "fix(login-and-logout): resolve Round 1 review findings")
**Round-1 verdict (this lens):** APPROVED, zero findings
**Round-2 verdict:** **APPROVED**

## Scope reviewed
Full diff of `7751666` (`git show 7751666 --stat`):
- `libs/components/src/atoms/button/button.tsx` (+ new `button.test.tsx`)
- `libs/components/src/organisms/login-form/login-form.tsx` (+ `.test.tsx`, `.stories.tsx`)
- `libs/hooks/src/hooks/auth.integration.test.ts`
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx` (+ `.test.tsx`)
- `libs/study-buddy/src/components/sign-out/sign-out.test.tsx`
- `libs/study-buddy/src/test-utils/auth-test-factories.ts` (new, test-only)
- `libs/hooks/package.json`, `libs/hooks/tsconfig.json`, `pnpm-lock.yaml` (dev-only/type tooling, no runtime bundle impact)

No lists, no new network call sites, no new images/assets introduced by this commit.

## Targeted checks (per orchestrator instructions)

### 1. `HIT_SLOP` lookup table — built once at module load ✅
`libs/components/src/atoms/button/button.tsx:31-39`:
```
type Insets = { top: number; bottom: number; left: number; right: number };
const HIT_SLOP: Record<ButtonSize, Insets> = Object.fromEntries(
  Object.entries(HEIGHTS).map(([size, height]) => { ... }),
) as Record<ButtonSize, Insets>;
```
This sits at module scope, above `export const Button = (...) => {` (`button.tsx:45`). It runs exactly once per JS module evaluation (app startup / bundle load), not per render or per `Button` instance. `HIT_SLOP[size]` (`button.tsx:92`) is then an O(1) object lookup inside render — negligible. Confirmed correct placement; no per-render `Object.entries`/`Object.fromEntries` cost.

### 2. `useVariants({ variant })` + `minHeight` arg on `styles.root(...)` — no extra recomputation, one fewer variant axis ✅
- `button.tsx:59`: `styles.useVariants({ variant })` — `size` was dropped from the variants object entirely (`button.tsx:124-135` no longer declares a `size` variant block, vs. the old 3-way `small/medium/large` height variant). This **reduces**, not increases, the variant-combination surface unistyles has to resolve (previously 5 variants × 3 sizes = 15 combos; now 5 variants only).
- `button.tsx:94`: `style={[styles.root(padLeft, padRight, fullWidth, disabled, HEIGHTS[size]), shadow, style]}` — `styles.root` was already a dynamic style **function** taking 4 primitive args every render (`padLeft, padRight, fullWidth, disabled`); it now takes a 5th (`minHeight`). This is the same calling convention as before (function re-invoked and a fresh style object assembled on every render) — adding one more `number` argument doesn't change that cost class. This pattern is also the established codebase convention for unistyles dynamic style functions — e.g. `libs/components/src/molecules/text-field/text-field.tsx`'s `field(accent, borderColor, focus, multiline, disabled)` (5 args) and `input(multiline, rows, borderColor)` already do the same thing pre-existing this commit. So `button.tsx`'s change is consistent with, not worse than, the rest of the design system.
- `HEIGHTS[size]` (`button.tsx:94`) is a plain object lookup, already computed elsewhere in the same render for `padX` (`button.tsx:79`) — no new allocation.
- Net effect: fewer variant combinations to resolve, one extra cheap number threaded through an already-dynamic style function. No re-render storm, no defeated memoization (no `memo`/`useMemo` existed around `styles.root(...)` before or after — it was never memoized, consistent with its 4-then-5 runtime-computed args).

### 3. `login-form.tsx`'s new live-region `<Text>` — cheap and conditionally mounted ✅
`libs/components/src/organisms/login-form/login-form.tsx:65-72`:
```
{isSubmitting ? (
  <View testID={LOADING_INDICATOR_TEST_ID}>
    <ProgressIndicator variant="circular" size={SUBMIT_SPINNER_SIZE} thickness={SUBMIT_SPINNER_THICKNESS} />
    <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
      {labels.signingIn}
    </Text>
  </View>
) : null}
```
The whole block (spinner + new `<Text>`) is gated by the same `isSubmitting ? … : null` ternary that already existed for the spinner — the `<Text>` is **not** an always-mounted sibling; it is only in the tree while `isSubmitting` is true, and unmounts (not just visually hides) when submission ends. `styles.visuallyHidden` (`login-form.tsx:93-98`) is a static 1×1 `position: absolute` style object (no dynamic function, no per-render allocation beyond what unistyles already does for any static style). One extra `Text` node during a low-frequency state transition (submit start/end, at most a couple of times per session) — no re-render implication worth flagging.

### 4. `auth.integration.test.ts` shared Supabase client — test-only, no hidden timing issue ✅
`libs/hooks/src/hooks/auth.integration.test.ts:20,37-39`: `sharedClient` is built once in `beforeAll` instead of per-test; `buildMockedClient()` (`:22-32`) only re-attaches a fresh `jest.spyOn(sharedClient.auth, 'onAuthStateChange')` mock per test (each call replaces the mock implementation, doesn't stack listeners — `emitAuthStateChange` is a function-local closure variable, re-created fresh per `buildMockedClient()` invocation, so no leaked subscription state carries across tests). Ran the full suite locally: `pnpm --filter @helsoft/hooks test` → 3 suites / 14 tests green in 2.185s, including the new regression guard (`:117-121`) that runs last and reads the accumulated `warnSpy.mock.calls` — correct, since it intentionally asserts over the whole file's history. No flakiness/order-dependency risk beyond what already existed (Jest runs `describe` blocks in declaration order by default; no `test.concurrent` in use). No production-code perf implication either way — test-only file.

## Full fresh pass over everything touched by `7751666`

- **Bundle/dependency weight** — `libs/hooks/package.json`'s only change is a **devDependency** (`@types/node`) and a matching `tsconfig.json` `"types"` addition (`libs/hooks/tsconfig.json:4`) — type-checking only, zero runtime/bundle impact. `pnpm-lock.yaml` changes are all dependency-resolution-hash churn from that same devDependency addition (e.g. `@testing-library/react-native@14.0.1(jest@29.7.0...)` re-hashing) — no new runtime packages, no bundle-size change.
- **Re-renders elsewhere in the diff** — `sign-in-form.tsx:29` adds one more static string field (`signingIn: t('auth.signingIn')`) to the `labels` object literal already passed to `LoginForm`; this object was already freshly created every `SignInForm` render pre-commit (per the Round-1 report's own note that `LoginForm`/`Dialog`/`Button` aren't `memo`-wrapped and render frequency is low), so this is not a new cost class, just one more key on an already-fresh object.
- **`login-form.stories.tsx:10`** — adds `signingIn` to the static `labels` object used by Storybook stories only; no app runtime impact.
- **Test-only files** (`button.test.tsx`, `login-form.test.tsx` additions, `sign-in-form.test.tsx`, `sign-out.test.tsx`, `auth-test-factories.ts`) — none execute in the shipped app; deduping the `authValue`/`localizationValue` factories into `libs/study-buddy/src/test-utils/auth-test-factories.ts` is a pure test-code refactor, ran green (`pnpm --filter @helsoft/study-buddy test` → 3 suites / 14 tests, 1.221s).
- **No new lists, no N+1s, no new network call sites** introduced anywhere in this commit — the only production-code touch points are `button.tsx` and `login-form.tsx`, both covered above.

## Verification run (gate)
- `pnpm --filter @helsoft/components test` → 4 suites / 28 tests green (1.163s), incl. new `button.test.tsx` (2 tests) and strengthened `login-form.test.tsx`.
- `pnpm --filter @helsoft/hooks test` → 3 suites / 14 tests green (2.185s).
- `pnpm --filter @helsoft/study-buddy test` → 3 suites / 14 tests green (1.221s).
- `pnpm turbo run check-types --filter=@helsoft/hooks --filter=@helsoft/components --filter=@helsoft/study-buddy --filter=app-study-buddy` → all green (cached/full-turbo).
- `pnpm lint` → green.

## Findings
None. Zero blocker/major/minor findings for this round.

## Conclusion
The Round-1 fix commit (`7751666`) does not regress runtime or delivery cost. The new `HIT_SLOP` table is module-scope/build-once; narrowing `useVariants` to `{ variant }` reduces the variant surface unistyles resolves per render while `minHeight` rides along an already-per-render-recomputed dynamic style function (same pattern already used elsewhere in the design system, e.g. `text-field.tsx`); the new live-region `<Text>` in `login-form.tsx` is cheap and conditionally mounted only during `isSubmitting`; the shared-client test refactor is test-only and verified not to hide any timing/order issue (full suite green). **APPROVED**.
