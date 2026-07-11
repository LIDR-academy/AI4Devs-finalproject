---
id: task-7
title: OpenEnded organism — accessibility
slice: 3
scenarios: [s9]
status: todo
paths: [libs/activities/src/organisms/open-ended/open-ended.tsx, libs/activities/src/organisms/open-ended/use-open-ended.ts, libs/activities/src/organisms/open-ended/open-ended.test.tsx, libs/activities/src/organisms/open-ended/use-open-ended.test.ts]
---

## Goal
Make the organism accessible: TextInput has accessible name (`labels.answerInput`); Submit is a button with adequate touch target; model-answer reveal announced on submit (live region, Matching/MCQ/FITB platform guard); locked state reflected for AT. No color-alone correctness (there is no correct/incorrect UI).

## Done criteria
- [ ] `@s9` covered by unit tests: input name, Submit target size, reveal announcement, locked state for AT
- [ ] Reveal announced once on submit (no duplicate-announcement regression)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Reuse sibling live-region precedent. Announce comparison reveal, not grade. On-device screen-reader pass recommended, non-blocking (risks R6).
