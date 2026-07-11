---
id: task-4
title: MatchingActivity wiring — grade on submit, emit answered state once
slice: 1
scenarios: [s8, s11, s12, s15]
status: done
paths: [libs/study-buddy/src/components/matching-activity/matching-activity.tsx, libs/study-buddy/src/components/matching-activity/matching-activity.test.tsx, libs/study-buddy/src/index.ts]
---

## Goal
Build the feature-wiring `MatchingActivity` in `@helsoft/study-buddy`. Props `{ slide: MatchingSlide; onAnswered?: (answer: MatchingAnswer) => void }`. Computes `valid = isMatchingSlideValid(slide)`; owns `useState<MatchingAnswer | null>(null)`. `handleSubmit(pairs)`: ignore if already answered (lock); else `gradeMatching(slide, pairs)`, store, and call `onAnswered` exactly once. Builds the organism's `result` from the answer (`pairs`, `isCorrect`, `summary`). Injects `labels` via `t('activity.matching.*')` (keys finalized in task-6; may use placeholders until then). Passes `prompt = slide.content`, `unavailable={!valid}`. Export via the study-buddy barrel. Mirrors `MultipleChoiceActivity`.

## Done criteria
- [ ] Scenarios `@s8` (submit grades + locks), `@s11` (explanation forwarded), `@s12` (answered state emitted once with correct partial counts) covered by `matching-activity.test.tsx`
- [ ] `onAnswered` fires exactly once; repeat submits ignored (lock)
- [ ] Scenario `@s15`: invalid slide ⇒ `unavailable` passed, grader never called
- [ ] `Component → Hook → Service → DAO` respected: plain local `useState`, no hook/service/DAO (no I/O)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [ ] No hardcoded user-facing strings (chrome via `t()`)

## Notes
`gradeMatching` + `isMatchingSlideValid` from task-2; `Matching` from task-3. i18n keys land in task-6; a11y polish in task-7.
