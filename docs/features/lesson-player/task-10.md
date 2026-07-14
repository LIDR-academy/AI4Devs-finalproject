---
id: task-10
title: Image degrade — missing/unresolvable ref → text-only
slice: 3
scenarios: [s9]
status: todo
paths:
  - libs/study-buddy/src/components/slide-image/slide-image.tsx
  - libs/study-buddy/src/components/slide-image/slide-image.test.tsx
  - libs/study-buddy/src/components/slide-image/slide-image.stories.tsx
  - libs/supabase-services/src/services/lesson-image.service.ts
  - libs/supabase-services/src/services/lesson-image.service.test.ts
---

## Goal
Harden the degrade path: a slide that references an image whose ref is missing or whose signed-URL resolution fails renders text-only, with no error, placeholder, or broken-image shown to the learner (mirrors R2's own AC).

## Done criteria
- [ ] Scenario {s9} covered — resolution failure and missing ref both degrade silently to text-only
- [ ] Service maps any signed-URL failure to `null` (no throw reaches the component)
- [ ] `SlideImage` renders nothing when `url` is `null`; story includes the failed/degraded case
- [ ] `pnpm lint` + `check-types` + `test` green

## Notes
- Builds on task-3's stack; this task adds the explicit failure/degrade assertions.
