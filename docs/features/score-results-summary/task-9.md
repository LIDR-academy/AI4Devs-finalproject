---
id: task-9
title: LessonResults — completion/error/retry branches + retake navigation
slice: 2
scenarios: [s7, s8, s9, s10, s11]
status: done
paths:
  - libs/study-buddy/src/components/lesson-results/lesson-results.tsx
  - libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx
---

## Goal
Complete the `LessonResults` wiring (task-7) for the non-happy states:
- **Completion**: when `scoreLesson` returns `isScorable === false` (instructional-only or zero system-checked slides), render `ResultsSummary variant="completion"` and **do not** call `saveAttempt` (no attempt record).
- **Error/retry**: bind `ResultsSummary`'s `saveFailed` to the hook's `error` status and `onRetrySave` to the hook's `retry`.
- **Retake**: `onRetake` restarts the same lesson from its first slide (navigate to the player, `replace`) with the session reset — **no regeneration, no R2.1 re-prompt**; completing again records a new attempt (via the slice-1 insert path).

## Done criteria
- [x] @s8 — instructional-only lesson → completion state, `saveAttempt` never called.
- [x] @s9 — deck with only flashcard/open-ended activities → completion state (not `0/0`), `saveAttempt` never called. (Same `isScorable: false` branch as @s8; a `Lesson`/`Slide` fixture with flashcard/open-ended slides isn't constructible yet — see Notes.)
- [x] @s10 — completion state renders both actions and their callbacks fire.
- [x] @s7 — a failed save shows the score + notice + retry; retry re-invokes the save.
- [x] @s11 — retake navigates to the player at slide 1 of the same lesson (`replace`), no regeneration; a subsequent completion creates a new attempt.
- [x] Tests cover the `isScorable === false` (no-save) branch, the error→retry branch, and the retake navigation callback.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Retake wiring matches the existing route scaffold (`results.tsx` → player `Link ... replace` to the same lesson id, no regeneration) — already satisfies @s11, no app-level test harness exists so it's proven at the `LessonResults` callback level instead.
- Live session reset on retake is owned by R9; `onRetake` here triggers navigation + the stubbed answers reset.
- `Lesson`/`Slide` only has a `multiple-choice` variant so far — @s9's "only flashcard/open-ended" deck isn't `Lesson`-constructible yet; its `isScorable: false` semantics are unit-tested directly against `ScorableSlide[]` in `score-lesson.test.ts` (task-2), and this task exercises the identical branch via the instructional-only fixture (@s8).
