---
id: task-8
title: Storybook stories for FillInTheBlank
slice: 3
scenarios: [s1, s2, s3, s11, s12]
status: done
paths: [libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.stories.tsx]
---

## Goal
Author `fill-in-the-blank.stories.tsx` covering story-required states plus degradation and Interactive demo: **Unanswered**, **Correct**, **Incorrect** (reveal `[0]`), **Empty/Error** (unavailable), **Interactive** (type → Submit/Enter → feedback) for Playwright.

## Done criteria
- [x] Stories cover `@s1`, `@s2`, `@s3`, `@s11`, `@s12`
- [x] Titles/args mirror Matching/MultipleChoice (`Organisms/FillInTheBlank`)
- [x] Interactive story drives type→submit→lock for e2e
- [x] `pnpm --filter @helsoft/activities dev` renders every story
- [x] `pnpm lint` + `pnpm check-types` green
- [x] No hardcoded colors/dimensions (labels may use demo copy)

## Notes
Story requirement: unanswered / correct / incorrect. Empty/Error for 4-state model.
