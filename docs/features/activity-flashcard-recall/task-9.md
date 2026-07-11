---
id: task-9
title: Playwright e2e — reveal + self-mark + lock
slice: 3
scenarios: [s1, s2, s3, s4, s5]
status: done
paths: [libs/activities/tests/e2e/organisms/flashcard/flashcard.e2e.js]
---

## Goal
Author the Playwright e2e against the Storybook stories (task-8), mirroring `matching.e2e.js`. Story slug base `organisms-flashcard`. Drive the live interaction on the Interactive story and assert the seeded stories.

## Done criteria
- [x] @s1/@s2 pre-reveal: Hidden/Interactive story loads; only the front + Reveal are visible, no answer yet
- [x] @s2: tapping Reveal reveals the answer text alongside the front
- [x] @s3: after reveal, both self-mark actions are visible
- [x] @s4: tapping a self-mark shows the locked confirmation and the actions become non-interactive
- [x] @s5: after locking, tapping the other self-mark does not change the confirmed mark
- [x] Seeded RevealedRecalled / RevealedNotRecalled stories assert their expected visible text
- [x] Both unavailable stories assert the notice text — `UnavailableMissingBack` and `UnavailableMissingFront` — matching the two `@s8` Examples (task-8)
- [x] `pnpm lint` + the lib's Playwright e2e run green
- [x] Selectors live in the test, not the contract (declarative scenarios stay in gherkin)

## Notes
Mirrors `matching.e2e.js` structure (frameLocator on the storybook preview iframe, `getByText` exact matches). Reveal/self-mark labels come from the `en` bundle (task-6).
