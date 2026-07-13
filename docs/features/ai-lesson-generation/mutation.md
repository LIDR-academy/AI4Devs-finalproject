# Mutation Testing Report — ai-lesson-generation

## Pre-review pass
**Score: 97.92% (188/192 killed)** | 4 survivors, all verified genuine equivalents | **PASS**

| File | Total | Killed | Survived | Score |
|---|---|---|---|---|
| lesson-generation.assembly.ts | 32 | 32 | 0 | 100% |
| lesson-generation.placement.ts | 14 | 14 | 0 | 100% |
| lesson-generation.prompt.ts | 17 | 17 | 0 | 100% |
| lesson-generation.schema.ts | 78 | 78 | 0 | 100% |
| lesson-generation.errors.ts | 24 | 21 | 3 | 87.50% |
| lesson-generation.service.ts | 14 | 13 | 1 | 92.86% |
| **TOTAL** | **192** | **188** | **4** | **97.92%** |

### Survivors
- `lesson-generation.errors.ts:26:3` — final `statusCode` type guard mutated to `true`. Equivalent: downstream numeric comparisons (`=== 401/403/429`) fail identically for `undefined` or a non-numeric value; both fall through to `generation_failed`.
- `lesson-generation.errors.ts:38:7` — `instanceof GenerationSchemaError` mutated to `if (false)`. Equivalent: `GenerationSchemaError` has no `statusCode` property, so the fallthrough path also returns `generation_failed`, same as the explicit return.
- `lesson-generation.errors.ts:38:47` — same `instanceof` block mutated to an empty body. Equivalent for the same reason as `38:7` (falls through to identical path).
- `lesson-generation.service.ts:48:29` — optional chaining (`body?.errorCode`) mutated to unguarded (`body.errorCode`). Equivalent: when `body` is null/undefined the mutant throws `TypeError`, caught by the surrounding `try/catch`, which also returns `generation_failed` — same observable result. Confirmed by explicit tests for null/undefined error bodies.

All 4 survivors are dead-code-equivalent (no observable behavior difference for any real input). Threshold 100% met.

## Post-review pass
**Review fix commit:** `bc4ac00` (7 round-1 findings fixed) · **Base-ref:** `79d86f5` · **Score: 98.18% (162/165 killed)** | 3 survivors, same equivalents as pre-review (line-shifted) | **PASS**

Refactor moved `GenerationErrorMapping` type to `lesson-generation.types.ts`; executable logic unchanged.

| File | Total | Killed | Survived | Score |
|---|---|---|---|---|
| lesson-generation.assembly.ts | 32 | 32 | 0 | 100% |
| lesson-generation.placement.ts | 14 | 14 | 0 | 100% |
| lesson-generation.prompt.ts | 17 | 17 | 0 | 100% |
| lesson-generation.schema.ts | 78 | 78 | 0 | 100% |
| lesson-generation.types.ts | — | — | — | N/A (pure types) |
| lesson-generation.errors.ts | 24 | 21 | 3 | 87.50% |
| **TOTAL** | **165** | **162** | **3** | **98.18%** |

### Survivors (same mechanism as pre-review, lines shifted -6 from type extraction)
- `lesson-generation.errors.ts:20:3` (was `26:3`) — same final-guard equivalence.
- `lesson-generation.errors.ts:32:7` (was `38:7`) — same `instanceof`-fallthrough equivalence.
- `lesson-generation.errors.ts:32:47` (was `38:47`) — same empty-block equivalence.

No test coverage gaps introduced by review fixes.

## Files measured
`libs/supabase-services/src/services/lesson-generation.{assembly,placement,prompt,schema,errors,service,types}.ts`
