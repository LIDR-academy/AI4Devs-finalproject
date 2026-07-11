---
id: task-8
title: Storybook stories for Matching
slice: 3
scenarios: [s1, s7, s8, s9, s10, s13, s14]
status: todo
paths: [libs/activities/src/organisms/matching/matching.stories.tsx]
---

## Goal
Author `matching.stories.tsx` covering the story-required states plus the degradation states and an interactive demo (source of truth for the Playwright e2e): **Unpaired** (all items tappable, Submit disabled), **PartiallyPaired**, **SubmittedAllCorrect** (`result` all correct), **SubmittedMixed** (`result` mixed), **Empty** (a column empty), **Error** (unequal lengths / `unavailable`), and an **Interactive** story wiring real pending/pair/submit state (like `MultipleChoice`'s `Interactive`).

## Done criteria
- [ ] Stories cover `@s1`, `@s7`, `@s8`, `@s9`, `@s10`, `@s13`, `@s14`
- [ ] Story titles/args mirror the `MultipleChoice` stories structure (`Organisms/Matching`)
- [ ] Interactive story drives the select→pair→submit→feedback flow for the e2e
- [ ] `pnpm --filter @helsoft/activities dev` renders every story
- [ ] `pnpm lint` + `pnpm check-types` green
- [ ] No hardcoded colors/dimensions (labels may use demo copy)

## Notes
The story-required set from the user story is unpaired / partially-paired / submitted-all-correct / submitted-mixed; Empty/Error added for the 4-state model.
