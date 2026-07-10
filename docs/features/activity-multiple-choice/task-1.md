---
id: task-1
title: Extend Slide into a discriminated union + add answered-state types
slice: 1
scenarios: [s7]
status: done
paths:
  - libs/types/src/lesson.ts
  - libs/types/src/activity-answer.ts
  - libs/types/src/index.ts
---

## Goal
Turn the flat `Slide` type into a discriminated union so an activity slide can carry a per-type payload, and add the answered-state type consumed by scoring (R7) and resume (R9). Only the `multiple-choice` variant is defined here; the union is designed so sibling activity types (fill-in-the-blank, flashcard, open-ended, matching) extend it later without breaking changes. This is the data contract every other task builds on and the shape R2 generation must eventually satisfy.

## Contract (from spec — data contract)
- `Slide = InstructionalSlide | MultipleChoiceSlide` (union on `kind`; within `activity`, on `activityType`).
- `MultipleChoiceSlide`: `SlideBase & { kind:'activity'; activityType:'multiple-choice'; options: MultipleChoiceOption[]; correctOptionId: string; explanation?: string }`.
- `MultipleChoiceOption = { id: string; label: string }`.
- `MultipleChoiceAnswer = { slideId; activityType:'multiple-choice'; selectedOptionId; correctOptionId; isCorrect }` in `libs/types/src/activity-answer.ts`; `ActivityAnswer = MultipleChoiceAnswer` (union grows later).

## Done criteria
- [ ] Scenario @s7's answered-state shape is defined by `MultipleChoiceAnswer` (exercised at runtime by task-2's grader test and task-4's integration test)
- [ ] `Slide` narrows correctly: `slide.kind==='activity' && slide.activityType==='multiple-choice'` yields `MultipleChoiceSlide` (compile-checked)
- [ ] Common fields stay in `SlideBase`; `Lesson.slides: Slide[]` still type-checks
- [ ] New types exported through `libs/types/src/index.ts`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Types are plain TS (no framework) per `global.mdc`; one concern per file — put the answer shape in its own `activity-answer.ts` so R7/R9 can import it without pulling slide types.
- Keep `SlideKind` and add `ActivityType` exported for reuse.
- Additive-only design mitigates R1/R3 (see risks.md): shape drift with R2 is absorbed by optional fields + the Error UI state, not by breaking changes.
