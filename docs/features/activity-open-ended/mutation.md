# Mutation — activity-open-ended (pre-review re-run)

**Base:** `feature-entrega2-HernanLaura`  
**Pass:** PRE-REVIEW (re-run after survivor kill)  
**Threshold:** 100% killed on changed lines in scope  
**Verdict:** PASS

## Scope

`run-mutation.sh` only covers `@helsoft/supabase-services|hooks|components` — feature runtime source is in `@helsoft/activities` + `@helsoft/study-buddy`. Mutated those libs’ changed source manually (excludes: tests, stories, e2e, barrels).

| Lib | Mutated files |
|-----|----------------|
| `@helsoft/activities` | `open-ended.helpers.ts`, `open-ended.tsx`, `use-open-ended.ts` |
| `@helsoft/study-buddy` | `open-ended-activity.tsx`, `is-open-ended-slide-valid.ts` |

**Not mutated:** `open-ended.types.ts` / `@helsoft/types` (type-only), `@helsoft/localization` resource catalogs, barrels / stories / e2e / tests.

## Scores

| Lib | total | killed | timeout | survived | errors | score |
|-----|------:|-------:|--------:|---------:|-------:|------:|
| `@helsoft/activities` | 51 (+1 err) | 51 | 0 | 0 | 1 | **100%** |
| `@helsoft/study-buddy` | 28 (+1 err) | 28 | 0 | 0 | 1 | **100%** |

Per-file:

- `open-ended.helpers.ts` — 100% (16 killed)
- `open-ended.tsx` — 100% (19 killed, 1 error)
- `use-open-ended.ts` — 100% (16 killed)
- `open-ended-activity.tsx` — 100% (17 killed)
- `is-open-ended-slide-valid.ts` — 100% (11 killed, 1 error)

## Surviving mutants

None.

## Notes

- Prior 15 survivors killed by implementer’s follow-up tests (guards, style tokens, label keys, optional `onAnswered`).
- 1 runtime/compile error mutant per lib — Stryker treats as detected; score 100%, 0 survived.

post-review pass skipped — review changed no source
