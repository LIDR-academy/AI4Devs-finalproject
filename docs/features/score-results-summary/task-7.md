---
id: task-7
title: LessonResults wiring + app results route (score + loading)
slice: 1
scenarios: [s1, s5, s6]
status: todo
paths:
  - libs/study-buddy/src/components/lesson-results/lesson-results.tsx
  - libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx
  - libs/study-buddy/src/index.ts
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx
---

## Goal
Add the `LessonResults` wiring component in `@helsoft/study-buddy` and mount it in the app results route. This task covers the happy path (scorable lesson → save → show score) + loading.

`LessonResults` props: `{ lesson: Lesson; answers: GradedAnswer[]; onRetake: () => void; onBackToLessons: () => void }`.
- Projects `lesson.slides` → `ScorableSlide[]` (filter `kind === 'activity'`, map to `{ id, activityType }`) and computes `ScoreSummary` via `scoreLesson(scorableSlides, answers)` (task-2).
- Uses `useLessonAttempt()` (task-5) + `useLocalization()`.
- **Pre-formats the score labels via `t(...)`** and passes strings down to `ResultsSummary` (per spec-review Minor 3 / codebase precedent): `labels.score = t('results.score', { correct, total })`, `labels.percent = t('results.scorePercent', { percent: Math.round((correct / total) * 100) })`, plus `labels.retake = t('results.retake')`, `labels.backToLessons = t('results.backHome')`. The rounding lives here, not in the organism (risk R8).
- If `isScorable`: on completion (once — guarded by an effect/ref, risk R5) calls `saveAttempt({ lessonId: lesson.id, score, total })`; renders `ResultsSummary variant="score"` with `loading` bound to the hook's `saving` status.
- Passes `onRetake`/`onBackToLessons` through.

i18n: add the two **score** keys the slice-1 happy path needs to all four bundles — `results.score` = "{{correct}} / {{total}}" and `results.scorePercent` = "{{percent}}%" (`results.retake`/`results.backHome` already exist). The remaining completion/save-failure keys are added in task-10 (slice 3).

App route `results.tsx`: replace the stub to render `LessonResults` inside `ScreenContainer`, supplying the lesson + answers (**stubbed/fixture** until R4/R9 provide the live source — risk R1) and wiring `onRetake` → `router.replace` to the player and `onBackToLessons` → `router.replace('/')`, matching the existing scaffold.

## Done criteria
- [ ] @s1 — a scorable lesson renders the pre-formatted score + percentage via `ResultsSummary`.
- [ ] @s5 — while the attempt is saving, the loading state shows.
- [ ] @s6 — completion triggers exactly one `saveAttempt` (guarded); re-render/re-mount does not double-save.
- [ ] `results.score` + `results.scorePercent` exist in `en`/`es`/`pt`/`de`, key-aligned (the `migration-coverage` parity test stays green); `TranslationResource` still compiles.
- [ ] Integration test (study-buddy → hook → service, mocked Supabase/service) proves compute-then-persist for a scorable lesson.
- [ ] App route composes `LessonResults` and passes navigation callbacks; no business logic in `apps/*`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Completion + error/retry branches are added in task-9; this task keeps to score + loading.
- The scorer is called here (component) on the projected `ScorableSlide[]`, not in the hook, to avoid a hooks→study-buddy dependency and keep the scorer decoupled from `lesson.ts`.
