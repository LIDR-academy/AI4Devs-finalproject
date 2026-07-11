---
id: task-2
title: Add isOpenEndedSlideValid pure helper
slice: 1
scenarios: [s7]
status: todo
paths: [libs/study-buddy/src/grading/is-open-ended-slide-valid.ts, libs/study-buddy/src/grading/is-open-ended-slide-valid.test.ts, libs/study-buddy/src/index.ts]
---

## Goal
Add pure `isOpenEndedSlideValid(slide)` in `@helsoft/study-buddy` (beside other grading helpers). Returns true iff trimmed `content` (prompt) and trimmed `modelAnswer` are both non-empty. **No** `gradeOpenEnded` — open-ended is not system-checked. Export via barrel.

## Done criteria
- [ ] `@s7` covered: empty/whitespace prompt or modelAnswer → false
- [ ] Valid non-empty trimmed prompt + modelAnswer → true
- [ ] No I/O, no React, no DAO/service
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
TDD-first. Path may sit under `grading/` for consistency with siblings even though this is validity-only (risks R2: do not invent a grader).
