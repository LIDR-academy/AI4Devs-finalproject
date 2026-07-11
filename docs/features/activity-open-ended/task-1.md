---
id: task-1
title: Extend Slide union + answered state with open-ended types
slice: 1
scenarios: [s6]
status: todo
paths: [libs/types/src/lesson.ts, libs/types/src/activity-answer.ts, libs/types/src/index.ts]
---

## Goal
Extend the `Slide` discriminated union with `OpenEndedSlide` and grow the answered-state module. Add `OpenEndedSlide` to `lesson.ts` (`activityType: 'open-ended'`, `modelAnswer: string`, optional `explanation`; `content` holds prompt). Grow `ActivitySlide` to include it. Add `OpenEndedAnswer` (`slideId`, `activityType`, `submittedAnswer` — **no `isCorrect`**) and extend `ActivityAnswer`. Additive only. `ActivityType` already includes `'open-ended'`.

## Done criteria
- [ ] Scenario `@s6` answered-state shape expressed by the types (submitted-only, no grade field)
- [ ] `OpenEndedSlide` matches the spec data contract
- [ ] `ActivitySlide` / `ActivityAnswer` unions include the new members; exported via `libs/types` barrel
- [ ] `OpenEndedAnswer` does not structurally require / claim `GradedAnswer.isCorrect`
- [ ] `pnpm lint` + `pnpm check-types` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Plain TS, one concern per file (`global.mdc`). Coordinate field names with R2 (risks R1). Mirrors FITB/Matching shapes but ungraded.
