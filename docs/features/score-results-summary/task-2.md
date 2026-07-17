---
id: task-2
title: Pure scoreLesson scorer
slice: 1
scenarios: [s1, s2, s3, s4]
status: done
paths:
  - libs/study-buddy/src/grading/score-lesson.ts
  - libs/study-buddy/src/grading/score-lesson.test.ts
  - libs/study-buddy/src/index.ts
---

## Goal
Add `scoreLesson(slides: ScorableSlide[], answers: GradedAnswer[]): ScoreSummary` — a pure function (no I/O, no React) next to `grade-multiple-choice.ts`. Its slide input is the **decoupled `ScorableSlide[]`** projection (task-1), NOT the full `Lesson`/`Slide` union — so fixtures for any activity type are type-safe today. It:
- Computes `total` = count of `slides` where `isSystemCheckedActivity(slide.activityType)`.
- Computes `correct` = count of those slides that have a matching entry in `answers` (by `slideId`) with `isCorrect === true`.
- Sets `isScorable = total > 0`; when `total === 0`, returns `{ correct: 0, total: 0, isScorable: false }` (completion case — never `0/0` as a score).
- Ignores answers whose `slideId` is not a system-checked slide in `slides` (defensive).

## Done criteria
- [x] @s1 — all system-checked slides answered correctly → `correct === total`.
- [x] @s2 — a `ScorableSlide[]` mixing multiple-choice/fill-in-the-blank with flashcard/open-ended counts only the system-checked entries (fixtures build directly from `ScorableSlide`, no `Slide` union needed).
- [x] @s3 — a matching entry contributes exactly one whole-slide point: `isCorrect === true` → +1, `false` (any wrong pair or unpaired item) → +0. Drive purely off `GradedAnswer.isCorrect` (matching's own grader owns the aggregation).
- [x] @s4 — a system-checked slide with no matching answer counts toward `total` but not `correct`.
- [x] Fixtures cover all three system-checked `activityType`s (incl. `matching`) even though only `multiple-choice` slides exist today (forward-compat, per risk R6).
- [x] `total === 0` returns `isScorable: false`; exported via the study-buddy barrel.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; short functions, revealing names, no duplication.

## Notes
- Type-agnostic by design — it never inspects per-type answer detail, only `slideId` + `activityType` + `isCorrect`, so future answer types plug in without touching it.
- Called by the `LessonResults` wiring (task-7), which projects `lesson.slides` → `ScorableSlide[]` (filter `kind === 'activity'`, map to `{ id, activityType }`) before calling it. This keeps the scorer decoupled from `lesson.ts` and the layering clean (no hooks→study-buddy dependency).
