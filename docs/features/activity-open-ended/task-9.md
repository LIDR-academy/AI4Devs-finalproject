---
id: task-9
title: Playwright e2e for OpenEnded (Storybook)
slice: 3
scenarios: [s1, s2, s4, s5, s10]
status: todo
paths: [libs/activities/tests/e2e/organisms/open-ended/open-ended.e2e.js]
---

## Goal
Playwright e2e against Storybook (per `storybook-e2e-tests` skill) on the Interactive story: unanswered input visible, model hidden; type → Submit → model revealed + lock; empty submit → still reveals; post-submit edit/resubmit blocked; Enter/return inserts newline and does **not** submit (@s10).

## Done criteria
- [ ] E2E covers `@s1`, `@s2`, `@s4`, `@s5`, `@s10`
- [ ] Green: `pnpm --filter @helsoft/activities test:e2e`
- [ ] Selectors/interaction in test only (contract stays declarative)
- [ ] No flakiness (await state, not bare timeouts)

## Notes
Mirror `fill-in-the-blank.e2e.js` / `matching.e2e.js`. Assert reveal by labeled model-answer text, not color. No correct/incorrect assertions. @s10 is the inverse of FITB Enter-submit.
