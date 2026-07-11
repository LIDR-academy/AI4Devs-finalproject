---
id: task-5
title: Empty submit reveal + Error unavailable
slice: 2
scenarios: [s5, s7]
status: todo
paths: [libs/activities/src/organisms/open-ended/open-ended.tsx, libs/activities/src/organisms/open-ended/open-ended.test.tsx, libs/study-buddy/src/components/open-ended-activity/open-ended-activity.tsx, libs/study-buddy/src/components/open-ended-activity/open-ended-activity.test.tsx]
---

## Goal
Graceful degradation + empty-submit path. Organism shows `labels.unavailable` (non-interactive, no crash) when `unavailable === true`. Wrapper passes `unavailable={!isOpenEndedSlideValid(slide)}` for empty/whitespace prompt or modelAnswer. Empty-submit: unlocked empty value → Submit → model answer revealed + lock + `submittedAnswer: ''` via `onAnswered`.

## Done criteria
- [ ] `@s7` covered (empty/whitespace prompt or modelAnswer → unavailable, no submission)
- [ ] `@s5` covered (empty submit → reveal + lock + empty answered state)
- [ ] Content path (task-3/4) unchanged for valid slides
- [ ] `pnpm lint` + `pnpm check-types` + activities/study-buddy tests green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Early-return unavailable branch. Mirrors FITB task-5 Empty+Error; empty grades differently (reveal, not incorrect).
