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
- Retake wiring matches the existing route scaffold (`results.tsx` → player `Link ... replace`).
- Live session reset on retake is owned by R9; here `onRetake` triggers navigation and the (stubbed) answers reset.
- `results.tsx` already wired `onRetake` to `router.replace({ pathname: '/lesson/[id]/player', params: { id } })` in task-7 — same lesson id, no regeneration call, and the stubbed player has no slide-index state, so replacing onto it is already "restart from the first slide" (@s11). No change needed; there's no test runner in `apps/app-study-buddy` to add a route-level test, so @s11's callback-threading is proven at the `LessonResults` level instead (`calls onRetake when the retake action is pressed for a scorable lesson`).
- `Lesson`/`Slide` only has a `multiple-choice` `ActivitySlide` variant so far (flashcard/open-ended slide payloads are a non-goal here per spec.md) — @s9's "only flashcard/open-ended" deck can't be constructed as a real `Lesson` fixture yet. Its `isScorable: false` semantics are already unit-tested directly against `ScorableSlide[]` in `score-lesson.test.ts` (task-2); this task exercises the identical `LessonResults` branch via the instructional-only fixture (@s8), which is real-`Lesson`-constructible today.
