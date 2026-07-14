---
id: task-5
title: Results slide — build GradedAnswer[] on entry + render LessonResults inline (save once)
slice: 1
scenarios: [s13, s14, s21]
status: done
paths:
  - libs/study-buddy/src/components/lesson-player/lesson-player.helpers.ts
  - libs/study-buddy/src/components/lesson-player/lesson-player.helpers.test.ts
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.types.ts
  - libs/study-buddy/src/components/lesson-player/use-lesson-player.ts
  - libs/study-buddy/src/components/lesson-player/use-lesson-player.reducer.ts
  - libs/study-buddy/src/components/lesson-player/lesson-player.stories.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.test.tsx
  - libs/activities/src/organisms/lesson-results/lesson-results.tsx
  - libs/activities/src/organisms/lesson-results/lesson-results.types.ts
  - libs/activities/src/organisms/lesson-results/use-lesson-results.ts
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
---

## Goal
Render R7 `LessonResults` **inline as the deck's terminal slide** (index `M`), fed from the deck's in-memory state — no route change, no stub fixture. Pure helper `buildLessonGradedAnswers(lesson, answersBySlideId)` → `GradedAnswer[]`: for **every** activity slide emit `{ slideId, activityType, isCorrect }` — the stored answer's `isCorrect` when present (open-ended, which has no `isCorrect`, maps to `false` and is non-system-checked anyway), and `isCorrect: false` for any activity slide left unanswered; instructional slides emit nothing. Graded answers are finalized when the learner **enters** the results slide.

**Save once per session.** Because leaving results (Back, @s20) unmounts `LessonResults` and returning remounts it, the deck must control save cadence. Add an `attemptSaved` flag to the deck reducer (+ a `markAttemptSaved` action); on the **first** entry to the results slide it renders `LessonResults` allowed to persist and dispatches `markAttemptSaved`; on re-entry it renders the same score UI with persistence **disabled** so R7 does not save a second attempt. Gate R7's save-on-mount behind a new optional `persistOnMount?: boolean` prop on `LessonResults` (default `true`, preserving existing R7 behavior/tests); `useLessonResults` skips `saveAttempt` when it is `false`. `onBackToLessons` comes from the screen (router → home); `onRetake` dispatches the deck `reset` (task-7, which also clears `attemptSaved`).

## Done criteria
- [ ] Scenario {s13} covered — advancing into results renders `LessonResults` inline with the real lesson + session answers; stub fixture not used; no results route opened; attempt persisted exactly once
- [ ] Scenario {s14} covered by `lesson-player.helpers.test.ts` — unanswered system-checked activity → `isCorrect:false`; answered → its own result; instructional → excluded
- [ ] Scenario {s21} covered — Back then re-enter results shows the score for current answers and does **not** persist a second attempt (`saveAttempt` not called again this session)
- [ ] Graded answers built/finalized on entry to the results slide; score recomputed each entry (pure), persistence gated by `attemptSaved`
- [ ] `LessonResults`/`useLessonResults` gain a backward-compatible `persistOnMount` (default `true`); existing R7 tests still pass
- [ ] Story adds the results-slide state; `pnpm lint` + `check-types` + `test` green

## Notes
- `scoreLesson` already treats an unanswered system-checked slide as not-correct via the denominator; emitting an explicit `isCorrect:false` keeps the answers array complete and R9-friendly (decision, see spec Open decisions).
- Results is in-deck: `LessonResults` reads the deck's in-memory state directly — no cross-route module store (decision, see spec).
- The `attemptSaved` flag brings the deck reducer to 3 coordinated fields (`currentIndex` + `answers` + `attemptSaved`) — firmly a `useReducer` per `state.mdc`.
