---
id: task-7
title: Matching organism — accessibility
slice: 3
scenarios: [s17]
status: todo
paths: [libs/activities/src/organisms/matching/matching.tsx, libs/activities/src/organisms/matching/matching.test.tsx]
---

## Goal
Make the `Matching` organism accessible: each item tile exposes `accessibilityRole="button"` + an accessible label; pending and paired states are conveyed via `accessibilityState` (`selected`) — not color alone; post-submit each pair's correctness is conveyed by text + icon and reflected in the item's accessible label (`labels.correctPair`/`labels.incorrectPair`); the result banner is announced to assistive tech on Submit (live region, mirroring `MultipleChoice`'s platform-aware approach); interactive targets meet the minimum touch-target size via theme spacing.

## Done criteria
- [ ] Scenario `@s17` covered by `matching.test.tsx`: roles, accessible labels, `accessibilityState` for pending/paired, text+icon correctness, result announcement, touch-target size
- [ ] Correctness never conveyed by color alone
- [ ] Result announced once on Submit (no duplicate-announcement regression — follow the `multiple-choice.tsx` platform guard)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Reuse the `MultipleChoice` a11y precedent (live-region + platform guard, icon-not-color). On-device screen-reader verification is recommended but non-blocking (risks R5).
