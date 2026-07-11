---
id: task-1
title: Extend Slide union + answered state with flashcard types
slice: 1
scenarios: [s6]
status: done
paths: [libs/types/src/lesson.ts, libs/types/src/activity-answer.ts, libs/types/src/graded-answer.test.ts]
---

## Goal
Extend the `Slide` discriminated union with `FlashcardSlide` and grow the answered-state module — the type foundation every other task builds on. Add `FlashcardSlide` (`kind: 'activity'`, `activityType: 'flashcard'`, `back: string`, optional `explanation`; front/prompt = `SlideBase.content`) to `lesson.ts` and grow `ActivitySlide`. Add `FlashcardAnswer` (`slideId`, `activityType: 'flashcard'`, `recalled: boolean`, `isCorrect: boolean`) and grow the `ActivityAnswer` union in `activity-answer.ts`. Additive only; no existing type changes shape. **Do not** touch `activity-type.ts` or `score-lesson.ts` — `flashcard` is already in `ActivityType` and already excluded from `SYSTEM_CHECKED_ACTIVITY_TYPES`.

## Done criteria
- [x] `FlashcardSlide` matches the spec data contract (`back`, optional `explanation`; front reuses `content`); the front=content convention documented in a doc-comment
- [x] `FlashcardAnswer` shape (`slideId`, `activityType: 'flashcard'`, `recalled`, `isCorrect`) is expressed; doc-comment states `isCorrect` mirrors `recalled` and is never scored by R7 (@s6)
- [x] `FlashcardAnswer` structurally satisfies `GradedAnswer`; add a flashcard type-level assignment in `libs/types/src/graded-answer.test.ts` mirroring the existing `MultipleChoiceAnswer` check (that file currently asserts the invariant only for `MultipleChoiceAnswer`)
- [x] `ActivitySlide` and `ActivityAnswer` unions include the flashcard members and are exported via the `libs/types` barrel
- [x] `pnpm lint` + `pnpm check-types` green (unions stay exhaustive; scorer untouched still compiles)
- [x] No hardcoded strings/colors/dimensions

## Notes
Types are plain TS, one concern per file (`global.mdc`). No runtime code. Coordinate field names with R2 (risks R1). Mirrors the existing `MatchingSlide` / `FillInTheBlankAnswer` shapes.
