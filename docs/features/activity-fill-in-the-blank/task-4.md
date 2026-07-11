---
id: task-4
title: FillInTheBlankActivity wiring — grade once, emit answered state
slice: 1
scenarios: [s2, s3, s5, s7, s10]
status: todo
paths: [libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx, libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.test.tsx, libs/study-buddy/src/index.ts]
---

## Goal
Build `FillInTheBlankActivity` in `@helsoft/study-buddy`. Props `{ slide, onAnswered? }`. `valid = isFillInTheBlankSlideValid(slide)`; own `useState` for value + answer. `maxLength = Math.ceil(acceptedAnswers[0].length * 1.25)` when valid. `handleSubmit`: ignore if answered; else `gradeFillInTheBlank(slide, value)`, store, `onAnswered` once. Map answer → organism `result`. Inject labels via `t('activity.fillInTheBlank.*')` (placeholders OK until task-6). Pass `content`, `unavailable={!valid}`. Export via barrel. Mirrors MatchingActivity.

## Done criteria
- [ ] `@s2`/`@s3`/`@s5`/`@s7`/`@s10` covered by activity tests (grade+lock, onAnswered once, Enter path via organism onSubmit)
- [ ] Invalid slide ⇒ unavailable, grader never called (wired fully in task-5)
- [ ] No hook/service/DAO (local useState only)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [ ] No hardcoded user-facing chrome (via `t()`)

## Notes
Grader from task-2; organism from task-3. i18n keys land in task-6.
