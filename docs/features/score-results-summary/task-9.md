---
id: task-9
title: LessonResults — completion/error/retry branches + retake navigation
slice: 2
scenarios: [s7, s8, s9, s10, s11]
status: todo
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
- [ ] @s8 — instructional-only lesson → completion state, `saveAttempt` never called.
- [ ] @s9 — deck with only flashcard/open-ended activities → completion state (not `0/0`), `saveAttempt` never called.
- [ ] @s10 — completion state renders both actions and their callbacks fire.
- [ ] @s7 — a failed save shows the score + notice + retry; retry re-invokes the save.
- [ ] @s11 — retake navigates to the player at slide 1 of the same lesson (`replace`), no regeneration; a subsequent completion creates a new attempt.
- [ ] Tests cover the `isScorable === false` (no-save) branch, the error→retry branch, and the retake navigation callback.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Retake wiring matches the existing route scaffold (`results.tsx` → player `Link ... replace`).
- Live session reset on retake is owned by R9; here `onRetake` triggers navigation and the (stubbed) answers reset.
