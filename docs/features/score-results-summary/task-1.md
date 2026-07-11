---
id: task-1
title: Shared score types + system-checked-activity set & guard
slice: 1
scenarios: [s2]
status: todo
paths:
  - libs/types/src/activity-type.ts
  - libs/types/src/scorable-slide.ts
  - libs/types/src/graded-answer.ts
  - libs/types/src/score-summary.ts
  - libs/types/src/lesson-attempt.ts
  - libs/types/src/index.ts
---

## Goal
Add the plain-TS shapes the rest of the feature builds on, in `@helsoft/types`:
- `ActivityType` union (`multiple-choice | fill-in-the-blank | flashcard | open-ended | matching`) — the full v1 set, so the scorer is forward-compatible even though only `multiple-choice` slides exist today.
- `SYSTEM_CHECKED_ACTIVITY_TYPES` (`multiple-choice`, `fill-in-the-blank`, `matching`) + `isSystemCheckedActivity(activityType)` type guard.
- `ScorableSlide { id: string; activityType: ActivityType }` — the **decoupled projection** the scorer consumes (an activity slide reduced to id + type). Independent of `lesson.ts`/`Slide`, so scorer fixtures for any activity type are type-safe today; the wiring (task-7) projects `lesson.slides` into this shape.
- `GradedAnswer { slideId: string; activityType: ActivityType; isCorrect: boolean }` — the minimal answered-state contract (R4/R9 will produce it live).
- `ScoreSummary { correct: number; total: number; isScorable: boolean }`.
- `LessonAttempt { id: string; lessonId: string; score: number; total: number; createdAt: string }` and `NewLessonAttempt { lessonId: string; score: number; total: number }` (no `userId` — set server-side by `auth.uid()`).

## Done criteria
- [ ] @s2's exclusion rule is expressed by `isSystemCheckedActivity` and covered by a test (true for the 3 system-checked types, false for `flashcard`/`open-ended`).
- [ ] Each type in its own `type-name.ts` file per the `@helsoft/types` convention; all exported via the types barrel.
- [ ] `MultipleChoiceAnswer` is (structurally) assignable to `GradedAnswer` — verify with a type-level check; **do not** modify `activity-answer.ts`.
- [ ] `MultipleChoiceSlide` projects cleanly into `ScorableSlide` (its `id` + `activityType`) — verify with a type-level check; **do not** modify `lesson.ts`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions; no magic numbers.

## Notes
- Per Open decisions: `SYSTEM_CHECKED_ACTIVITY_TYPES` is the single source of truth for "counts toward the score"; adding a future system-checked type is one edit here.
- `isSystemCheckedActivity` mirrors the existing `isSupportedLocale` runtime-guard precedent in `@helsoft/types`.
- `lesson.ts` is **not** changed (no new slide types); `ScorableSlide` deliberately decouples the scorer from the `Slide` union so the `@s2`/`@s3` fixtures don't depend on slide types that haven't landed (fixes spec-review blocker #1).
