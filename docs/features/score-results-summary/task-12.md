---
id: task-12
title: Playwright e2e over the results flow
slice: 3
scenarios: [s1, s7, s8]
status: done
paths:
  - libs/components/tests/e2e/organisms/results-summary/results-summary.e2e.js
---

## Goal
Add a Playwright e2e driving the `ResultsSummary` Storybook stories per the `storybook-e2e-tests` skill (location mirrors `src/` under `libs/components/tests/e2e/`, not co-located). Cover the rendered/interaction checks for the key states.

## Done criteria
- [x] @s1 — score state renders `correct/total` + percentage.
- [x] @s7 — save-failure state shows the score + notice, and the Retry action is present/operable.
- [x] @s8 — completion state shows the completion message (no score) with both actions.
- [x] Follows the `.e2e.js` conventions and location owned by the `storybook-e2e-tests` skill.
- [x] `pnpm lint` + `pnpm check-types` + relevant `test:e2e` green.

## Resolution
Added `libs/components/tests/e2e/organisms/results-summary/results-summary.e2e.js` (6 tests) covering the `Score`/`SaveFailed`/`Completion` stories from `results-summary.stories.tsx` (already in place from slice 2). Verified real story slugs against a running Storybook's `/index.json` rather than guessing from the title-slug convention alone (`organisms-resultssummary--score|loading|completion|save-failed`) — this caught that the sibling `slide-progress.e2e.js` file already in the repo uses a wrong slug (`molecules-slide-progress` vs the real `molecules-slideprogress`) that only "passes" because its assertions are too weak to notice; left untouched as pre-existing, out of this feature's scope. Ran via `pnpm --filter @helsoft/components exec playwright test --reporter=list` (non-interactive) — all 37 e2e tests in the workspace pass, including the 6 new ones.

## Notes
- The e2e exercises the presentational organism via its stories; full cross-route flow (player → results) awaits R4/R9 and is out of scope here (risk R1).
