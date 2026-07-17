---
id: task-7
title: Retake — wipe session (answers + attemptSaved), return to first content slide
slice: 2
scenarios: [s18, s22]
status: done
paths:
  - libs/activities/src/organisms/lesson-player/lesson-player.tsx
  - libs/activities/src/organisms/lesson-player/use-lesson-player.ts
  - libs/activities/src/organisms/lesson-player/use-lesson-player.reducer.ts
  - libs/activities/src/organisms/lesson-player/lesson-player.test.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
---

## Goal
Wire `LessonResults`' `onRetake` (rendered on the results slide) to the deck reducer's `reset` action: `currentIndex` → 0 (first content slide), `answers` → empty, and `attemptSaved` → `false`, all in-deck (no navigation, no route change). Clearing `attemptSaved` starts a fresh session, so advancing through to the results slide again persists a **new** attempt (task-5's save-once gate keys off this flag). The results slide remains the final step for the fresh run. `onBackToLessons` maps to the screen's router (→ home).

## Done criteria
- [x] Scenario {s18} covered — from the results slide, Retake returns the deck to the first content slide with no previous in-session answers, results still the final step, session cleared
- [x] Scenario {s22} covered — after a retake, advancing to results again persists a new attempt (fresh session)
- [x] `reset` is a pure named reducer transition clearing `currentIndex` + `answers` + `attemptSaved`; no stale state survives
- [x] Retake performs no navigation/route hop (fully in-deck); `onBackToLessons` routes home
- [x] `pnpm lint` + `check-types` + `test` green

## Notes
- Results-as-last-slide makes retake a reducer reset rather than a route replace (former behavior).
- The standalone `results.tsx` route + `index.tsx` "View results" link are legacy deep-links, out of R4's happy path, deferred to R9 (see spec non-goals) — untouched by this story.
