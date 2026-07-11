---
id: task-12
title: Playwright e2e over the results flow
slice: 3
scenarios: [s1, s7, s8]
status: todo
paths:
  - libs/components/tests/e2e/organisms/results-summary/results-summary.e2e.js
---

## Goal
Add a Playwright e2e driving the `ResultsSummary` Storybook stories per the `storybook-e2e-tests` skill (location mirrors `src/` under `libs/components/tests/e2e/`, not co-located). Cover the rendered/interaction checks for the key states.

## Done criteria
- [ ] @s1 — score state renders `correct/total` + percentage.
- [ ] @s7 — save-failure state shows the score + notice, and the Retry action is present/operable.
- [ ] @s8 — completion state shows the completion message (no score) with both actions.
- [ ] Follows the `.e2e.js` conventions and location owned by the `storybook-e2e-tests` skill.
- [ ] `pnpm lint` + `pnpm check-types` + relevant `test:e2e` green.

## Notes
- The e2e exercises the presentational organism via its stories; full cross-route flow (player → results) awaits R4/R9 and is out of scope here (risk R1).
