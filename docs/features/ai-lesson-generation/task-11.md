---
id: task-11
title: Composition variants prompt enforcement (instructional-only / activity-only)
slice: 2
scenarios: [s4, s5, s6]
status: done
paths:
  - supabase/functions/generate-lesson/
  - libs/supabase-services/src/services/lesson-generation.prompt.ts
  - libs/supabase-services/src/services/lesson-generation.assembly.ts
---

## Goal
Extend the prompt builder + deck assembly so all three compositions are enforced, not just `both` (task-4). `instructional-only` → the prompt forbids activity slides and the post-parse assembly asserts zero activity slides; `activity-only` → forbids instructional slides and asserts zero instructional slides. Enforcement is **belt-and-suspenders**: instructed in the prompt *and* validated after parsing (an LLM that ignores the instruction fails validation rather than shipping a wrong deck).

## Done criteria
- [x] Scenarios @s4 (instructional-only → only instructional) / @s5 (activity-only → only activity) / @s6 (composition drives the prompt) covered by unit tests on the pure prompt/assembly modules
- [x] A parsed deck that violates the composition → rejected (feeds `generation_failed`, task-12) — no wrong-composition deck returned
- [x] `instructional-only` naturally yields zero activity slides → R7 `ScoreSummary.isScorable === false` (no new flag; risks.md dependency row)
- [x] Mirror updated into `_shared/`; `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Reuses task-4's schema; only the composition constraint + assertion differ per variant.
