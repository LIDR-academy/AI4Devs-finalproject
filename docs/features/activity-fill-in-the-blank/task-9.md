---
id: task-9
title: Playwright e2e for FillInTheBlank (Storybook)
slice: 3
scenarios: [s1, s2, s3, s5, s6, s7]
status: todo
paths: [libs/activities/tests/e2e/organisms/fill-in-the-blank/fill-in-the-blank.e2e.js]
---

## Goal
Playwright e2e against Storybook (per `storybook-e2e-tests` skill) on the Interactive story: unanswered blank visible; type matching → Submit → correct + lock; type wrong → incorrect + reveal; empty submit → incorrect; Enter submits; post-submit edit/resubmit blocked.

## Done criteria
- [ ] E2E covers `@s1`, `@s2`, `@s3`, `@s5`, `@s6`, `@s7`
- [ ] Green: `pnpm --filter @helsoft/activities test:e2e`
- [ ] Selectors/interaction in test only (contract stays declarative)
- [ ] No flakiness (await state, not bare timeouts)

## Notes
Mirror `matching.e2e.js` / `multiple-choice.e2e.js`. Assert correctness by text/icon, not color.
