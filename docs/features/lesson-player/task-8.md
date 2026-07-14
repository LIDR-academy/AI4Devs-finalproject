---
id: task-8
title: Empty state — lesson with 0 slides
slice: 3
scenarios: [s15]
status: todo
paths:
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.stories.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.test.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
---

## Goal
When a lesson loads with `slides.length === 0`, the player shows an Empty state — a short message plus a Back affordance — instead of the deck. No deck, no results slide, no error, no retry (decision 5).

## Done criteria
- [ ] Scenario {s15} covered by `lesson-player.test.tsx`; story adds the Empty state
- [ ] Empty is distinct from Error and Loading; no results slide is created for a slideless lesson; Back returns to the lesson detail / list
- [ ] i18n via `t()` (player.empty.*); no hardcoded strings/colors/dimensions
- [ ] `pnpm lint` + `check-types` + `test` green

## Notes
- Empty is driven by a successfully loaded but slideless lesson (task-1), not a fetch failure.
