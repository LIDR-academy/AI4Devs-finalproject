---
id: task-2
title: Pure flashcard helpers — validity + answer builder
slice: 1
scenarios: [s6, s8]
status: todo
paths: [libs/activities/src/organisms/flashcard/flashcard.helpers.ts, libs/activities/src/organisms/flashcard/flashcard.helpers.test.ts]
---

## Goal
Add the two pure, React-free helpers the organism depends on, co-located in the flashcard organism folder (no I/O → no service/DAO; mirrors the shipped graders being pure functions). TDD-first.

- `isFlashcardSlideValid(slide: FlashcardSlide): boolean` — true iff `content` (front) and `back` are both non-empty after trim.
- `buildFlashcardAnswer(slide: FlashcardSlide, recalled: boolean): FlashcardAnswer` — returns `{ slideId: slide.id, activityType: 'flashcard', recalled, isCorrect: recalled }`.

## Done criteria
- [ ] `isFlashcardSlideValid` true for a well-formed slide; false when front or back is empty / whitespace-only (drives @s8 unavailable)
- [ ] `buildFlashcardAnswer` returns the exact answered-state shape with `isCorrect === recalled`, for both `recalled` values (@s6)
- [ ] Helpers are pure — no React, no hooks, no side effects (`component-split.mdc`); unit-tested without RTL
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Consumes the `FlashcardSlide` / `FlashcardAnswer` types from task-1. These helpers replace the "grader" role the system-checked types have — there is deliberately no `grade-flashcard.ts`.
