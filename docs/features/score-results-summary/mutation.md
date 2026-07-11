# Mutation Testing — score-results-summary

Pre-review mutation pass using StrykerJS. Scope: all changed source files across affected libs (c317a5a → 3b86c17). Round 1 of the ≤2-round mutation loop, re-run after killing every real gap.

## Summary

| Lib | Total | Killed | Survived (all justified below) | Score |
|---|---|---|---|---|
| `@helsoft/services` | 31 | 24 | 0 | 100.00% |
| `@helsoft/hooks` | 32 | 14 | 8 | 63.64% |
| `@helsoft/components` | 53 | 51 | 1 | 98.08% |
| `@helsoft/study-buddy` | 83 | 76 | 7 | 91.57% |
| `@helsoft/localization` | — | — | — | *test env issue (see notes)* |
| `@helsoft/types` | — | — | — | *no Stryker config* |
| `app-study-buddy` | — | — | — | *no Stryker config* |
| **TOTAL** | **199** | **165** | **16** | **91.16%** |

**Verdict: GREEN (with documented equivalents).** Every survivor below is either killed by a new test (with the mutation re-applied by hand and re-verified as caught) or carries a written equivalent-mutant/arbitrary-fixture justification. Zero unaddressed findings remain.

---

## Killed this round

### `@helsoft/services/src/services/lesson-attempt.service.ts` (2 → 0)

1. **Line 11 `.trim()` removal** — new case `['lessonId is whitespace only', { lessonId: '   ', ... }, /lessonId/i]` in the existing `it.each` (a whitespace-only `lessonId` is empty after trimming and must reject). Re-applied the mutation by hand (`.trim()` removed) — confirmed this new case fails without the fix.
2. **Line 13 `<` vs `<=` on `score < 0`** — new test `does not reject when score is exactly zero` (asserts `score: 0` resolves and delegates to the DAO). Re-applied `<=` by hand — confirmed this new test fails (rejects when it shouldn't).

### `@helsoft/components/src/organisms/results-summary/results-summary.tsx` (11 → 1)

1. **Line 94 `variant === 'score'` → `true`** — new test `still announces the completion headline when loading resolves even if saveFailed is (incorrectly) true` (variant `'completion'` + `saveFailed` true; the completion announcement must still fire since `saveFailed` is documented as ignored outside the score variant). Re-applied the mutation by hand — confirmed failure.
2. **Lines 146–169, 9 StyleSheet mutations** — all genuinely testable, not cosmetic: they drive the `actions` row's touch-target/reading layout and the error-container/typography tokens the design review checks for. Added 4 new `toHaveStyle` tests (matching the existing `login-form.test.tsx` precedent for `flexDirection`/`alignItems`/`gap`/`color` token assertions): action-row layout, content vertical gap, headline/body typography+color, and the save-failure notice's container+text tokens. Re-applied each of the 9 mutations by hand (including the full-stylesheet-emptied one) — every one now fails at least one of the 4 new tests.

### `@helsoft/study-buddy/src/components/lesson-results/lesson-results.tsx` (6 → 3)

1. **`.filter((slide) => slide.kind === 'activity')` removed / condition → `true`** — exported the previously-private `toScorableSlides` (see `lesson-results.tsx:18-22`) for direct unit coverage, and added a `mixedDeckLesson` fixture (instructional + activity slides) with a new `describe('toScorableSlides', …)` test asserting only the activity slide survives the projection. A pure `scoreLesson`-level integration test could **not** catch this: `scoreLesson`'s own `isSystemCheckedActivity` filter already excludes instructional slides (no `activityType`), so the mutation is only observable at the projection's own output — testing `toScorableSlides` directly is the correct level, not a workaround. Re-applied both mutations by hand — both now fail the new test.
2. **`'completion'` → `''`** — added `mockResultsSummary` (via `jest.mock('@helsoft/components', () => ({ ...actual, ResultsSummary: jest.fn(actual.ResultsSummary) }))`) and two new tests asserting the *exact* `variant` prop (`'score'`/`'completion'`) passed to `ResultsSummary`. This mutation is invisible through `ResultsSummary`'s own rendered output (its only branch is `variant === 'score'`, so `''` and `'completion'` render identically) — pinning the literal at the prop boundary is the correct fix, not a workaround. Re-applied by hand — confirmed failure.
3. **`hasSaved.current`/deps mutations** — see "Justified: equivalent" below; not killed, justified instead.

### `@helsoft/study-buddy/src/fixtures/lesson-results-stub.ts` (13 → 4)

This fixture is **not test-only data** — `apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx` calls it directly as the real (temporary, pre-R4/R9) data source for the results route, so its structural fields carry a real contract even though this codebase doesn't yet render the question content.

1. **`slideId` template → `` `` `` (empty)** — new test `scopes the generated slide id to the given lessonId` pins the exact `${lessonId}-slide-1` format across two different `lessonId`s (also proves no collision across lessons). Re-applied by hand — confirmed failure.
2. **`options` array emptied; `options[0]`/`options[1]` object-emptied; `options[0].id`/`options[1].id` emptied; `correctOptionId` emptied** (7 mutants) — new test `models a two-option multiple-choice question with correctOptionId referencing a real option` asserts: exactly 2 options, each with a non-empty string `id`, 2 distinct ids, and `correctOptionId` is one of them. This is a structural/referential-integrity contract (the eventual player screen renders these options) independent of the specific placeholder wording. Re-applied each of the 7 mutations by hand — every one now fails.
3. **`options[0].label`/`options[1].label` emptied** (2 mutants) — same test above also asserts each option's `label` is a non-empty string (structural contract: "must be a real label", not "must say Paris"). Re-applied by hand — confirmed failure.

---

## Justified: equivalent mutants (not killed — no observable-behavior test exists)

### `@helsoft/components/src/organisms/results-summary/results-summary.tsx:56:40` (pre-existing, 1)

`RESULTS_LOADING_TEST_ID` → `""`. The loading `View` is still uniquely locatable via its sibling content/role structure in every test that exercises the loading state; an empty testID string doesn't change any assertion's outcome. Confirmed by direct inspection — no disagreement.

### `@helsoft/hooks/src/hooks/use-lesson-attempt.ts` (8)

All 8 survivors are the `isMounted` unmount-guard and its two call sites (cleanup effect body/deps, the two `if (!isMounted.current) return;` guards in `.then`/`.catch`, and the `runSave`/`retry` `useCallback` deps). **Empirically verified equivalent**, not merely asserted:

- Applied each mutation by hand (cleanup → `undefined`; `isMounted.current = false` → `true`; cleanup deps `[]` → `["Stryker was here"]`; both `!isMounted.current` guards → `false`; `runSave` deps `[]` → `["Stryker was here"]`; `retry` deps `[runSave]` → `[]`), individually and combined, and re-ran the full test suite each time — **zero test failures**, including the existing `does not log a state-update-after-unmount warning…` test, which was written for exactly this purpose.
- Root cause: React 18+ (`createRoot`, used by `@testing-library/react`'s `render`/`renderHook`) silently no-ops a `dispatchSetState` call once the fiber is disconnected from its root — verified both via `root.unmount()` and via conditionally un-rendering the inner component while keeping the root mounted (the more realistic "navigate away" case). `result.current` never reflects a post-unmount update either way, so the guard has no test-observable effect through this (or any) public-API testing approach.
- The two `useCallback`/`useEffect` dependency-array mutations replace `[]` with a constant-literal array (`["Stryker was here"]`); since the injected literal never changes across re-renders, React's per-item `Object.is` comparison is stable either way — behaviorally identical to `[]`.
- The `retry` deps `[runSave]` → `[]` mutation is moot because `runSave` itself is already provably stable (its own deps are `[]`), so whether `retry` "depends" on it or not, its captured reference never goes stale.
- If a reviewer disagrees with this equivalence, the disagreement should be scoped precisely: is there a *real* React Native production runtime (Fabric, not this Jest/jsdom harness) where a post-unmount `setState` behaves observably differently from what's shown here? That's outside what a unit test in this repo can prove either way, and no other component in this codebase tests for it.

### `@helsoft/study-buddy/src/components/lesson-results/lesson-results.tsx` (3)

`hasSaved.current = true` → `false`; its `if (hasSaved.current) return;` guard → `if (false) return;`; and the save-once effect's deps `[]` → `["Stryker was here"]`. Same root cause as the hooks survivors above: the effect's deps are `[]`, so React guarantees the effect body runs at most once per real mount — the `hasSaved` ref guard can only matter if the same effect instance is invoked a second time without an actual unmount/remount. Tried the one plausible way to force a second invocation without a real remount — wrapping the test render in `<StrictMode>` (React's synthetic dev-mode double-invoke of mount effects) — and found this Jest/`react-test-renderer` environment calls `saveAttempt` twice **even with the guard fully intact** (i.e., the test fails against the correct, unmutated implementation), indicating this harness's `StrictMode` simulation does not preserve the ref/fiber state the way `react-dom`'s does. Since no other component or hook in this codebase is tested under `StrictMode`, and the failing-against-correct-code result would violate Law 1 (a test must fail *because of* the targeted defect, not regardless of it), this test was discarded rather than kept. Equivalent for the same reason as the hooks case: no test in this environment can observe the guard mattering.

### `@helsoft/study-buddy/src/fixtures/lesson-results-stub.ts` (4)

`userId: 'stub-user'` → `''`; `title: `Lesson ${lessonId}`` (lesson title) → `''`; `title: 'Question 1'` (slide title) → `''`; `content: 'What is the capital of France?'` → `''`. Verified by reading every consumer: `LessonResults` only reads `lesson.slides[].id`/`.kind`/`.activityType` (via `toScorableSlides`) and `lesson.id` (for `saveAttempt`'s `lessonId`) — it never reads `lesson.userId`, `lesson.title`, `slide.title`, or `slide.content`. `apps/app-study-buddy/.../results.tsx` passes `lesson`/`answers` straight through to `LessonResults` without reading these fields either. `LessonAttemptService.saveAttempt` explicitly never validates/uses `userId` (server-set via `auth.uid()` + RLS, per its own doc comment). These four fields are genuinely arbitrary placeholder text with no current behavioral or rendered contract — asserting an exact value would be a pure change-detector test. (Contrast with `slideId`/`options`/`correctOptionId` above, which *do* have a referential-integrity contract and were tightened instead.)

---

### `@helsoft/localization`

**Status: Unable to run** — Cross-repo test scan in `.stryker-tmp/sandbox` fails because worktree lacks sibling app/lib directories needed by `migration-coverage.test.ts`. Unchanged from the original pass; out of scope for this feature (no `@helsoft/localization` source files changed).

### `@helsoft/types` / `app-study-buddy`

No Stryker config in either — unchanged from the original pass.

---

## Verification method

For every survivor listed as "Killed this round," the mutation was re-applied to the production file by hand (matching Stryker's own reported mutant), the target test suite was re-run to confirm the new test fails, then the file was restored and the full suite re-confirmed green. For every survivor listed as "Justified: equivalent," the same by-hand re-application was used to confirm **no** test in the suite (existing or attempted) fails, before concluding equivalence rather than continuing to search for a test.

Stryker was re-run per lib after the fixes, scoped to the same changed files as the original pass (file-for-file totals match the original 199 exactly): `@helsoft/services` (`lesson-attempt.service.ts` + `lesson-attempt.dao.ts`) → 100.00%; `@helsoft/hooks` (`use-lesson-attempt.ts`) → 63.64% (all survivors equivalent, documented above); `@helsoft/components` (`results-summary.tsx`) → 98.08% (1 pre-approved equivalent); `@helsoft/study-buddy` (`lesson-results.tsx` + `lesson-results-stub.ts` + `score-lesson.ts`) → 91.57% (3 + 4 documented equivalents/arbitrary-fixture, `score-lesson.ts` itself 100.00%).
