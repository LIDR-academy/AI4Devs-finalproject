---
id: task-2
title: SlideView renderer — instructional + activity wiring
slice: 1
scenarios: [s5, s6]
status: todo
paths:
  - libs/study-buddy/src/components/slide-view/slide-view.tsx
  - libs/study-buddy/src/components/slide-view/slide-view.types.ts
  - libs/study-buddy/src/components/slide-view/slide-view.stories.tsx
  - libs/study-buddy/src/components/slide-view/slide-view.test.tsx
  - libs/study-buddy/src/index.ts
---

## Goal
A presentational renderer for one **content** `Slide`: an instructional slide shows title + content text; an activity slide shows title + prompt + the matching existing R3 activity wrapper (`MultipleChoiceActivity` / `FillInTheBlankActivity` / `MatchingActivity` / `FlashcardActivity` / `OpenEndedActivity` from `@helsoft/study-buddy`) so the learner answers in place. Switches on `slide.kind` / `slide.activityType`. Forwards an `onAnswered` callback (union `ActivityAnswer`); answer capture is wired by the deck (task-4) and restore in Slice 2.

## Done criteria
- [ ] Scenarios {s5, s6} covered by `slide-view.test.tsx` (instructional renders title+content; each activity type renders its wrapper)
- [ ] Wires the **existing** R3 wrappers — no new activity UI
- [ ] Atomic design + `component-split.mdc`; story covers instructional + every activity type
- [ ] No hardcoded strings/colors/dimensions; i18n via `t()`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Image rendering is composed here via `SlideImage` (task-3) — a content slide of any kind may carry an image.
- The deck's **results slide** is not a `Slide` and is not rendered by `SlideView`; the player renders R7 `LessonResults` for it (task-5).
- Activity prompt = `slide.content` (SlideBase convention).
