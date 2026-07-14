---
id: task-11
title: Responsive layout — web + mobile
slice: 3
scenarios: [s19]
status: done
paths:
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/components/src/molecules/progress-indicator/progress-indicator.tsx
  - libs/study-buddy/src/components/slide-image/slide-image.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.stories.tsx
---

## Goal
Ensure the player renders correctly on a web viewport and a mobile viewport: navigation controls and the progress indicator stay visible and usable at both sizes (including on the results slide), content scrolls when it overflows, and slide images scale appropriately to each viewport. Same Next/Back interaction on both (no swipe).

## Done criteria
- [x] Scenario {s19} covered — nav + progress usable and image scales at web and mobile sizes (Storybook e2e at two viewports where practical)
- [x] Layout uses theme tokens / responsive units — no hardcoded pixel breakpoints or dimensions
- [x] Long content / long titles don't clip the nav or progress
- [x] `pnpm lint` + `check-types` + `test` green

## Notes
- Universal Expo app (web + native from one codebase); use unistyles/theme responsive patterns already used in the components lib.
