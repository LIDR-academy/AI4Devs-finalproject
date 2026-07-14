# Mutation Testing Report — lesson-player

## Pre-review pass (final verify, round 3)
**Base-ref:** `418d360` (feature start / merge-base with `feature-entrega2-HernanLaura`)  
**Score: 100.00% (318/318 detected)** | **0 survivors** | **PASS**

Threshold = 100% killed on changed lines. **Met.** Round 1: 72.36%/97 → round 2: 98.43%/5 → **final 100%/0**.

Skipped: `@helsoft/services`, `@helsoft/logging-in-out` (no changed mutate-able source).

| Lib | Killed | Timeout | Survived | No cov | Score |
|---|---|---|---|---|---|
| `@helsoft/supabase-services` | 38 | 0 | 0 | 0 | 100.00% |
| `@helsoft/hooks` | 22 | 5 | 0 | 0 | 100.00% |
| `@helsoft/components` | 12 | 0 | 0 | 0 | 100.00% |
| `@helsoft/activities` | 26 | 0 | 0 | 1 | 100.00%* |
| `@helsoft/study-buddy` | 215 | 0 | 0 | 1 | 100.00%* |
| **TOTAL** | **313** | **5** | **0** | **2** | **100.00%** |

\* Lib “total” column in raw Stryker includes NoCoverage in its own %; policy score = detected / (detected + survived) = **100%** (NoCoverage listed below, not counted as survivors).

Detected = killed + timeout. Score = detected / (detected + survived).

### Per-file (changed source)

#### `@helsoft/supabase-services`
| File | Killed | Survived | Score |
|---|---|---|---|
| `lesson-image.dao.ts` | 1 | 0 | 100% |
| `lessons.dao.ts` | 15 | 0 | 100% |
| `lesson-image.service.ts` | 4 | 0 | 100% |
| `lessons.service.ts` | 18 | 0 | 100% |

#### `@helsoft/hooks`
| File | Killed | Timeout | Survived | Score |
|---|---|---|---|---|
| `next-request-id.ts` | 1 | 0 | 0 | 100% |
| `use-lesson.reducer.ts` | 3 | 1 | 0 | 100% |
| `use-lesson.ts` | 9 | 4 | 0 | 100% |
| `use-slide-image-url.ts` | 9 | 0 | 0 | 100% |

#### `@helsoft/components`
| File | Killed | Survived | Score |
|---|---|---|---|
| `lesson-progress-indicator.tsx` | 12 | 0 | 100% |

#### `@helsoft/activities`
| File | Killed | Survived | No cov | Score |
|---|---|---|---|---|
| `lesson-results.tsx` | 3 | 0 | 0 | 100% |
| `use-lesson-results.ts` | 23 | 0 | 1 | 100%* |

#### `@helsoft/study-buddy`
| File | Killed | Survived | No cov | Score |
|---|---|---|---|---|
| `fill-in-the-blank-activity.tsx` | 1 | 0 | 0 | 100% |
| `flashcard-activity.tsx` | 1 | 0 | 0 | 100% |
| `lesson-player.helpers.ts` | 16 | 0 | 0 | 100% |
| `lesson-player.tsx` | 54 | 0 | 0 | 100% |
| `use-lesson-player.reducer.ts` | 35 | 0 | 0 | 100% |
| `use-lesson-player.ts` | 26 | 0 | 0 | 100% |
| `matching-activity.tsx` | 1 | 0 | 0 | 100% |
| `multiple-choice-activity.tsx` | 1 | 0 | 0 | 100% |
| `open-ended-activity.tsx` | 4 | 0 | 0 | 100% |
| `use-open-ended-activity.ts` | 10 | 0 | 0 | 100% |
| `slide-image.tsx` | 21 | 0 | 1 | 100%* |
| `slide-view.tsx` | 45 | 0 | 0 | 100% |

## Surviving mutants

**None.**

## NoCoverage (not survivors)

| File:line | Mutator | Mutation |
|---|---|---|
| `libs/activities/src/organisms/lesson-results/use-lesson-results.ts:21` | BooleanLiteral | `persistOnMount = true` → `persistOnMount = false` |
| `libs/study-buddy/src/components/slide-image/slide-image.tsx:20` | StringLiteral | `image.alt ?? ''` → `image.alt ?? "Stryker was here!"` |

Default-param / `?? ''` fallback never hit by current tests; no surviving (tests-pass-with-mutant) holes remain.

## Prior rounds (superseded)
- Round 1: 72.36% (254/351) · 97 survivors
- Round 2: 98.43% (313/318) · 5 survivors
