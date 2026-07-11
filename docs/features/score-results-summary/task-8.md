---
id: task-8
title: ResultsSummary — completion + error/retry states + completion CTAs
slice: 2
scenarios: [s7, s8, s9, s10]
status: done
paths:
  - libs/components/src/organisms/results-summary/results-summary.tsx
  - libs/components/src/organisms/results-summary/results-summary.test.tsx
  - libs/components/src/organisms/results-summary/results-summary.stories.tsx
---

## Goal
Extend the `ResultsSummary` organism (task-6) with the remaining states, still presentational/props-only:
- **Completion** (`variant="completion"`): renders the completion headline/body (no score), and **both** Retake and Back-to-lessons actions (per Open decision).
- **Error / save-failure**: a `saveFailed?: boolean` prop that, when true, keeps the score visible and shows a non-blocking notice + a `onRetrySave` action (Retake + Back-to-lessons still available).
- Extend `labels` with `completeHeadline`, `completeBody`, `saveFailed`, `retrySave`.

## Done criteria
- [x] @s8 / @s9 — completion variant shows the completion message and no score; offers Retake + Back-to-lessons.
- [x] @s10 — completion variant exposes both actions (`onRetake`, `onBackToLessons`).
- [x] @s7 — with `saveFailed`, the score still renders alongside the notice and a working `onRetrySave`; the notice is non-blocking (does not hide the score or the primary actions).
- [x] `results-summary.stories.tsx` now covers all four states (loading / score / completion / save-failure).
- [x] Tests assert each new branch and action wiring; tokens only; no hardcoded copy.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Mirrors the `locale-save-failure-notice` non-blocking pattern for the error state.
- Still no data/hooks here — `LessonResults` (task-9) supplies `variant`, `saveFailed`, and the callbacks.
