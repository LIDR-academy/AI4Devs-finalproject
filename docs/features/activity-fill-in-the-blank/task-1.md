---
id: task-1
title: Extend Slide union + answered state with fill-in-the-blank types
slice: 1
scenarios: [s10]
status: done

paths: [libs/types/src/lesson.ts, libs/types/src/activity-answer.ts, libs/types/src/index.ts]
---

## Goal
Extend the `Slide` discriminated union with `FillInTheBlankSlide` and grow the answered-state module. Add `FillInTheBlankSlide` to `lesson.ts` (`activityType: 'fill-in-the-blank'`, `acceptedAnswers: string[]`, optional `explanation`; `content` holds prompt with `____`). Grow `ActivitySlide` to include it. Add `FillInTheBlankAnswer` (`slideId`, `activityType`, `submittedAnswer`, `acceptedAnswerShown`, `isCorrect`) and extend `ActivityAnswer`. Additive only.

## Done criteria
- [x] Scenario `@s10` answered-state shape expressed by the types
- [x] `FillInTheBlankSlide` matches the spec data contract; blank-marker convention documented in a doc-comment
- [x] `ActivitySlide` / `ActivityAnswer` unions include the new members; exported via `libs/types` barrel
- [x] `pnpm lint` + `pnpm check-types` green
- [x] No hardcoded strings/colors/dimensions

## Notes
Plain TS, one concern per file (`global.mdc`). Coordinate field names with R2 (risks R1). Mirrors Matching/MCQ shapes.
