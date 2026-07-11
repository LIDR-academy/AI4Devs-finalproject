---
id: task-9
title: Playwright e2e for Matching (Storybook)
slice: 3
scenarios: [s2, s3, s6, s7, s8, s9, s10]
status: todo
paths: [libs/activities/tests/e2e/organisms/matching/matching.e2e.js]
---

## Goal
Write Playwright e2e against the Storybook build (per the `storybook-e2e-tests` skill) driving the `Interactive` story: tap an item → pending; tap opposite column → pair formed; tap a paired item → released; Submit disabled until all paired, then enabled; Submit → per-pair correct/incorrect + lock; assert all-correct and mixed result presentations.

## Done criteria
- [ ] E2E cases cover `@s2`, `@s3`, `@s6`, `@s7`, `@s8`, `@s9`, `@s10`
- [ ] Runs green: `pnpm --filter @helsoft/activities test:e2e` against the Storybook build
- [ ] Selectors/interaction live in the test (contract stays declarative)
- [ ] No flakiness (await rendered state transitions, not timeouts)

## Notes
Mirror `libs/activities/tests/e2e/organisms/multiple-choice/multiple-choice.e2e.js`. Assert paired/pending via visible state + accessible name, correctness by text/icon (not color).
