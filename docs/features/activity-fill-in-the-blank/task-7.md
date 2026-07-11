---
id: task-7
title: FillInTheBlank organism — accessibility
slice: 3
scenarios: [s14]
status: done
paths: [libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx, libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.test.tsx]
---

## Goal
Make the organism accessible: blank TextInput has accessible name (`labels.blankInput`); Submit is a button with adequate touch target; correctness via text + icon (not color); result banner announced on submit (live region, Matching/MCQ platform guard); locked state reflected for AT.

## Done criteria
- [x] `@s14` covered by unit tests: input name, Submit target size, text+icon correctness, result announcement
- [x] Correctness never color-alone
- [x] Result announced once on submit (no duplicate-announcement regression)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [x] No hardcoded strings/colors/dimensions

## Notes
Reuse Matching/MCQ live-region precedent. On-device screen-reader pass recommended, non-blocking (risks R7).
