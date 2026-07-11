---
id: task-8
title: Storybook stories for OpenEnded
slice: 3
scenarios: [s1, s2, s7]
status: todo
paths: [libs/activities/src/organisms/open-ended/open-ended.stories.tsx]
---

## Goal
Author `open-ended.stories.tsx` covering story-required states plus degradation and Interactive demo: **Unanswered**, **SubmittedWithModelAnswer**, **Empty/Error** (unavailable), **Interactive** (type → Submit → reveal + lock) for Playwright.

## Done criteria
- [ ] Stories cover `@s1`, `@s2`, `@s7`
- [ ] Titles/args mirror Matching/MultipleChoice/FITB (`Organisms/OpenEnded`)
- [ ] Interactive story drives type→submit→lock for e2e
- [ ] `pnpm --filter @helsoft/activities dev` renders every story
- [ ] `pnpm lint` + `pnpm check-types` green
- [ ] No hardcoded colors/dimensions (labels may use demo copy)

## Notes
Story requirement: unanswered / submitted-with-model-answer. Empty/Error for 4-state model.
