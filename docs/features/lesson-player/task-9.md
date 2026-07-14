---
id: task-9
title: Error state — lesson fails to load (retry + back)
slice: 3
scenarios: [s16]
status: done
paths:
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.stories.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.test.tsx
  - libs/hooks/src/hooks/use-lesson.ts
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
---

## Goal
When the lesson fetch fails, the player shows an Error state with a Retry action (re-runs the load via `useLesson`'s `refetch`) and a Back affordance. Successful retry proceeds to the first content slide.

## Done criteria
- [x] Scenario {s16} covered by `lesson-player.test.tsx`; story adds the Error state
- [x] `useLesson` exposes a `refetch`; Retry re-invokes it and transitions Error → Loading → Content
- [x] i18n via `t()` (player.error.*); no hardcoded strings/colors/dimensions
- [x] `pnpm lint` + `check-types` + `test` green

## Notes
- Decision (spec Open decisions): load failure is transient network I/O → Retry + Back, mirroring `useLessons.refetch` / `useLessonAttempt.retry`. Distinct from Empty (task-8), which offers Back only.
