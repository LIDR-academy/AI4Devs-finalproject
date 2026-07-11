---
id: task-5
title: Empty + Error unavailable + empty-submit incorrect resolve
slice: 2
scenarios: [s6, s11, s12]
status: todo
paths: [libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx, libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.test.tsx, libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx, libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.test.tsx]
---

## Goal
Graceful degradation: organism shows `labels.unavailable` (non-interactive, no crash) when `unavailable === true` or content cannot render a single inline blank. Wrapper passes `unavailable={!isFillInTheBlankSlideValid(slide)}` for empty/malformed `acceptedAnswers` or missing `____`. Empty-submit path: unlocked empty value → Submit → incorrect + reveal `[0]` + lock (organism + wiring + grader already support; assert end-to-end here).

## Done criteria
- [ ] `@s11`/`@s12` covered (empty list **or** any empty-string entry in acceptedAnswers / missing blank → unavailable, no grading)
- [ ] `@s6` covered (empty submit → incorrect + resolves + lock)
- [ ] Content path (task-3/4) unchanged for valid slides
- [ ] `pnpm lint` + `pnpm check-types` + activities/study-buddy tests green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Early-return unavailable branch. Mirrors Matching task-5 / MCQ Empty+Error.
