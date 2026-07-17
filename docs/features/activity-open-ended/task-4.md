---
id: task-4
title: OpenEndedActivity wiring — emit answered state once
slice: 1
scenarios: [s2, s4, s6]
status: done
paths: [libs/study-buddy/src/components/open-ended-activity/open-ended-activity.tsx, libs/study-buddy/src/components/open-ended-activity/open-ended-activity.test.tsx, libs/study-buddy/src/index.ts]
---

## Goal
Build `OpenEndedActivity` in `@helsoft/study-buddy`. Props `{ slide, onAnswered? }`. `valid = isOpenEndedSlideValid(slide)`. On organism `onSubmit(text)`: if already answered → ignore; else build `OpenEndedAnswer` (`slideId`, `activityType: 'open-ended'`, `submittedAnswer`), store, `onAnswered` **once**. Inject labels via `t('activity.openEnded.*')` (placeholders OK until task-6). Pass `prompt = slide.content`, `modelAnswer`, `explanation`, `maxLength = 2000`, `unavailable={!valid}`. No grader call. Export via barrel.

## Done criteria
- [x] `@s2`/`@s4`/`@s6` covered by activity tests (reveal path, onAnswered once, shape without `isCorrect`)
- [x] Assert `isSystemCheckedActivity('open-ended') === false` in @s6 coverage (or type-level note + unit)
- [x] Invalid slide ⇒ unavailable, no onAnswered (wired fully in task-5)
- [x] No hook/service/DAO (local useState only for domain answered emission)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [x] No hardcoded user-facing chrome (via `t()`)

## Notes
Validity from task-2; organism from task-3. i18n keys land in task-6.
