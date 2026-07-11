# Mutation Testing Report: activity-matching — PRE-REVIEW Round 2 (re-run)

**Status: PASS** (threshold 100% met)

**Threshold:** 100% of mutants killed on changed/feature lines (per `.agents/skills/mutation-testing/SKILL.md`).

**Mutated (scoped):**
- `@helsoft/activities` → `src/organisms/matching/matching.tsx`
- `@helsoft/study-buddy` → `src/grading/grade-matching.ts`, `src/components/matching-activity/matching-activity.tsx`

**Skipped (out of scope):**
- `libs/types` — type-only
- `libs/localization/src/resources/*` — string data, not logic
- `*.test.*`, `*.stories.tsx`, `*.e2e.js`, barrel `index.ts`

---

## Summary

| Library | File | Total | Killed | Survived | NoCov | Errors | Score |
|---------|------|-------|--------|----------|-------|--------|-------|
| @helsoft/activities | matching.tsx | 220 | 219 | 0 | 0 | 1 | **100%** |
| @helsoft/study-buddy | grade-matching.ts | 59 | 59 | 0 | 0 | 0 | **100%** |
| @helsoft/study-buddy | matching-activity.tsx | 19 | 19 | 0 | 0 | 0 | **100%** |
| **Overall** | **3 files** | **298** | **297** | **0** | **0** | **1** | **100%** |

RuntimeError (1): `StyleSheet.create` callback → `undefined` — throws at module init; counted killed (Stryker score 100%).

**Survivors:** none.

**Verdict: PASS** — ready for full review.
