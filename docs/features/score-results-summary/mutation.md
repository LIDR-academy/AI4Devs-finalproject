# Mutation Testing — score-results-summary

Scoped to the feature's changed files only (excl. `*.test.*`/`*.stories.tsx`/`*.e2e.js`). Threshold: 100% killed on changed lines, or genuine written equivalence. Both passes independently re-verified (hand-applied every surviving mutation, confirmed no test fails either way).

## Pre-review pass (base `c317a5a` → `758d1c8`)

| Lib | Total | Killed | Survived | Score |
|---|---|---|---|---|
| `@helsoft/supabase-services` | 31 | 24 | 0 | 100.00% |
| `@helsoft/hooks` | 32 | 14 | 8 | 63.64% |
| `@helsoft/components` | 53 | 51 | 1 | 98.08% |
| `@helsoft/study-buddy` | 83 | 76 | 7 | 91.57% |
| **Total** | **199** | **165** | **16** | **91.16%** |

**Verdict: PASS** (40 initial survivors → 24 real gaps killed via TDD; 16 remain, all genuinely equivalent, independently re-verified by a second `mutation_tester` pass).

## Post-review pass (base `c317a5a` → `9954137`, after full-review fixes)

| Lib | Total | Killed | Survived | Score |
|---|---|---|---|---|
| `@helsoft/supabase-services` | 31 | 24 | 0 | 100.00% |
| `@helsoft/hooks` | 34 | 16 | 9 | 64.00% |
| `@helsoft/components` | 42 | 41 | 1 | 97.62% |
| `@helsoft/study-buddy` | 83 | 76 | 7 | 91.57% |
| **Total** | **190** | **157** | **17** | **90.23%** |

**Verdict: PASS.** The review's two changes (new `isSaving` overlap guard in `use-lesson-attempt.ts`; deduped `showSaveFailure` in `results-summary.tsx`) are both fully killed by tests — no new real gaps. The 1 net survivor increase vs. pre-review is an additional equivalent mutant from the guard refactor, not a coverage regression.

## Equivalent mutants (documented, unchanged between passes)

- **`@helsoft/hooks/src/hooks/use-lesson-attempt.ts` (8-9 survivors)** — `isMounted` unmount-guard (cleanup body/deps, both `.then`/`.catch` guards) + stable callback dependency arrays. Root cause: React 18's `createRoot` silently no-ops `setState` on a disconnected fiber, so the guard has no observable effect through any public-API test in this Jest/jsdom harness. Verified by hand-applying every mutation individually and combined — zero test failures.
- **`@helsoft/study-buddy/src/components/lesson-results/lesson-results.tsx` (3 survivors)** — `hasSaved` ref guard + its `[]`-deps effect. The effect's `[]` deps already guarantee at-most-once invocation per mount; the guard is unobservable for the same reason as above. `StrictMode` double-invoke was tried as the one plausible way to force a second call — it double-saves even against the correct, unmutated code in this harness, so a test built on it would fail regardless of the defect (violates Law 1); discarded.
- **`@helsoft/study-buddy/src/fixtures/lesson-results-stub.ts` (4 survivors)** — `userId`, lesson `title`, slide `title`, slide `content` string literals. Verified by reading every consumer (`LessonResults`, `toScorableSlides`, the app route): none of these four fields are ever read. Genuinely arbitrary placeholder text with no behavioral contract. (Contrast: `slideId`/`options`/`correctOptionId` *do* have a referential-integrity contract and were tightened with real tests instead.)
- **`@helsoft/components/src/organisms/results-summary/results-summary.tsx:56` (1 survivor)** — `RESULTS_LOADING_TEST_ID` → `""`. The loading `View` remains uniquely locatable via sibling structure/role; an empty testID changes no assertion's outcome.

## Not run

- `@helsoft/localization` — Stryker's cross-repo `migration-coverage.test.ts` scan fails in the worktree sandbox (missing sibling app/lib dirs); pre-existing environment limitation, unrelated to this feature. Jest suite itself runs fine (57/57 pass, checked in DoD).
- `@helsoft/types`, `app-study-buddy` — no Stryker config (types are compile-time only; app screens are covered via lib tests).
