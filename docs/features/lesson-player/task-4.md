---
id: task-4
title: LessonPlayer deck — nav, progress, results as final slide
slice: 1
scenarios: [s1, s2, s3, s4, s10, s11, s17, s20]
status: todo
paths:
  - libs/components/src/molecules/progress-indicator/progress-indicator.tsx
  - libs/components/src/molecules/progress-indicator/progress-indicator.types.ts
  - libs/components/src/molecules/progress-indicator/progress-indicator.stories.tsx
  - libs/components/src/molecules/progress-indicator/progress-indicator.test.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.types.ts
  - libs/study-buddy/src/components/lesson-player/use-lesson-player.ts
  - libs/study-buddy/src/components/lesson-player/use-lesson-player.reducer.ts
  - libs/study-buddy/src/components/lesson-player/lesson-player.stories.tsx
  - libs/study-buddy/src/components/lesson-player/lesson-player.test.tsx
  - libs/study-buddy/src/index.ts
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
---

## Goal
The `LessonPlayer` organism renders exactly one step at a time with a `ProgressIndicator` (bar + "slide X of N") and Next/Back controls. The deck has **`N = contentSlides.length + 1` steps**: content slides at indices `0..M-1` (rendered via `SlideView`) and a **terminal results slide at index `M`** (its content wired in task-5). `use-lesson-player` owns deck state through a reducer (`currentIndex` + per-slide answers) with named transitions (`next` / `back` / `answer` / `reset`), recording each slide's `onAnswered` into state. Rules:
- Start at index 0 (first content slide).
- Back disabled/hidden on the first slide (index 0); enabled everywhere else, including the results slide (Back → last content slide, index `M-1`).
- Next never gates on an answer (skip allowed); Next on the last content slide (`M-1`) advances into the results slide (`M`); Next is **hidden/disabled on the results slide**.
- Progress shows the current step out of `N`; the results slide is "slide N of N".

The `player.tsx` screen loads via `useLesson(id)` and renders the Loading state and the deck (Content); Empty/Error are Slice 3.

## Done criteria
- [ ] Scenarios {s1, s2, s3, s4, s10, s11, s17, s20} covered by `lesson-player.test.tsx` + `progress-indicator.test.tsx` + a Storybook e2e where interaction matters (s20 here = the Back-from-results navigation; answer-restore on that Back is task-6)
- [ ] Deck state is a `useReducer` per `state.mdc` (`*.reducer.ts`, pure, named actions); `N = content + 1`, results is the last index
- [ ] Back hidden/disabled only on index 0; Next hidden/disabled on the results slide; Next advances without requiring an answer
- [ ] Progress bar + "X of N" update on every navigation, counting the results slide as step N; `ProgressIndicator` ships its story (states)
- [ ] i18n via `t()` (player.* keys); no hardcoded strings/colors/dimensions
- [ ] `pnpm lint` + `check-types` + `test` green

## Notes
- No "Finish" button and no route change — reaching results = navigating to the last deck step (results rendered inline by task-5).
- Reducer holds `currentIndex` + `answers` (Record<slideId, ActivityAnswer>); image-URL resolution lives in `SlideImage`'s own hook, not the deck.
