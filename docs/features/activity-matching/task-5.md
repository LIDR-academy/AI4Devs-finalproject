---
id: task-5
title: Matching organism — Empty + Error (unavailable) states
slice: 2
scenarios: [s13, s14, s15]
status: done
paths: [libs/activities/src/organisms/matching/matching.tsx, libs/activities/src/organisms/matching/matching.test.tsx]
---

## Goal
Add the graceful-degradation branch to the `Matching` organism: render `labels.unavailable` (nothing interactive, no crash, no Submit) when `unavailable === true` (malformed `correctPairs`, forced by the wrapper) **or** either column is empty (Empty) **or** `leftItems.length !== rightItems.length` (invariant/Error). The last two are self-detected from the organism's own props (defense-in-depth); the id-integrity case comes from the wrapper's `isMatchingSlideValid` via the `unavailable` prop.

## Done criteria
- [x] Scenarios `@s13` (empty column), `@s14` (unequal lengths), `@s15` (malformed pairing → `unavailable` prop) covered by `matching.test.tsx`
- [x] Unavailable state is non-interactive and does not crash on any of the three triggers
- [x] Content path (task-3) unchanged for valid slides
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [x] No hardcoded strings/colors/dimensions

## Notes
Mirrors the `MultipleChoice` unavailable notice. Keep the branch early-return so the interaction/render code isn't reached for malformed input.
