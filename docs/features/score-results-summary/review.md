# review.md — score-results-summary (full review)

Scope: `git diff c317a5a..HEAD` (HEAD `758d1c8`) + the round-1 fix diff on top (uncommitted at review time) — the entire feature, all 3 vertical slices, all 13 `@s` scenarios. Supersedes the historical slice-3 note (slices were already reviewed clean and committed; this is the post-slices full 6-reviewer gate, after the pre-review mutation pass PASSED at 91.16%).

CI: green throughout — `pnpm lint`, `pnpm check-types`, fresh forced (non-cached) `pnpm test` across all affected libs (`@helsoft/components`, `@helsoft/study-buddy`, `@helsoft/hooks`, `@helsoft/supabase-services`, `@helsoft/types`, `@helsoft/localization`), and `pnpm --filter @helsoft/components exec playwright test --reporter=list results-summary.e2e.js` (6/6) — re-confirmed green both before round 1 and after the round-1 fix.

Lenses: all six run in round 1 (no skips — diff touches UI components, DAO/service/migration, and hooks/queries).

## Round 1

| Reviewer | Verdict |
|---|---|
| `reviewer_code` | CHANGES_REQUESTED — 1 major, 1 minor |
| `reviewer_design` | APPROVED — 0 |
| `reviewer_architecture` | APPROVED — 0 |
| `reviewer_security` | APPROVED — 0 |
| `reviewer_accessibility` | APPROVED — 0 |
| `reviewer_performance` | APPROVED — 0 |

Findings (both fixed by `implementator` via TDD, see round 2):
1. **Major** — `libs/hooks/src/hooks/use-lesson-attempt.ts:56-59` — `retry()` bypassed the overlapping-save guard that `saveAttempt` had (risk R5, no-double-insert). Fixed: guard consolidated into `runSave` via an `isSaving` ref shared by both call sites; new regression test added.
2. **Minor** — `libs/components/src/organisms/results-summary/results-summary.tsx:76,94,116` — `saveFailed && variant === 'score'` duplicated verbatim three times. Fixed: extracted to a single `showSaveFailure` derived value, referenced at all three sites (pure refactor, all existing tests green unmodified).

## Round 2 (dirty lens only — `reviewer_code`; other five verified by `reviews_lead` via the fix diff, no territory touched)

| Reviewer | Verdict |
|---|---|
| `reviewer_code` | APPROVED — 0 (both round-1 findings verified resolved, no new issues) |

`reviews_lead` verified directly (fix diff scoped only to `use-lesson-attempt.ts`/`.test.ts` and `results-summary.tsx`): no design-token/atomic-design impact, no layering change, no security/RLS surface touched, effect dependency-array change in the a11y-relevant announcement effects is behavior-preserving (primitive-boolean `Object.is` equivalence, confirmed by reading the diff and re-running the full `results-summary.test.tsx` suite — 97/97 `@helsoft/components` tests green, zero test modifications needed), no new re-render/round-trip cost (`isSaving` is a ref, not state).

## Open findings

None.

## Verdict

APPROVED — round 2 of the 2-round cap. Zero open findings across all six lenses.
