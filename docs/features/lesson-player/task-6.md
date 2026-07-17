---
id: task-6
title: Restore prior in-session answer on Back (incl. Back from results)
slice: 2
scenarios: [s12, s20]
status: done
paths:
  - libs/activities/src/organisms/lesson-player/lesson-player.tsx
  - libs/activities/src/organisms/slide-view/slide-view.tsx
  - libs/activities/src/organisms/slide-view/slide-view.types.ts
  - libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx
  - libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.types.ts
  - libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.tsx
  - libs/study-buddy/src/components/fill-in-the-blank-activity/fill-in-the-blank-activity.types.ts
  - libs/study-buddy/src/components/matching-activity/matching-activity.tsx
  - libs/study-buddy/src/components/matching-activity/matching-activity.types.ts
  - libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx
  - libs/study-buddy/src/components/flashcard-activity/flashcard-activity.types.ts
  - libs/study-buddy/src/components/open-ended-activity/open-ended-activity.tsx
  - libs/study-buddy/src/components/open-ended-activity/open-ended-activity.types.ts
---

## Goal
When re-rendering a previously-answered activity — whether via Back between content slides or **Back from the results slide** — pass its stored answer (already captured in the deck reducer by task-4) back down so the R3 organism rehydrates locked + revealed instead of resetting. Extend the thin study-buddy activity wrappers to forward the R3 organisms' existing restore props: `initialAnswer` (multiple-choice / fill-in-the-blank / matching / flashcard) and `initialSubmittedAnswer` (open-ended), threaded through `SlideView`. Restoration persists for the remainder of the current session.

## Done criteria
- [x] Scenario {s12} covered — answer an activity, navigate away, return → prior state shown, not reset
- [x] Scenario {s20} answer-restore leg covered — Back from the results slide shows the last content slide with its answer intact (nav mechanics themselves are task-4)
- [x] Each wrapper forwards the organism's restore prop (mapping open-ended's stored `submittedAnswer` → `initialSubmittedAnswer`)
- [x] Restore is derived from the deck's stored `ActivityAnswer` per `slideId`, not duplicated state
- [x] Wrapper + deck tests updated; `pnpm lint` + `check-types` + `test` green; no hardcoded strings/colors/dimensions

## Notes
- Organisms already accept `initialAnswer` / `initialSubmittedAnswer` (Storybook/R9 use) — this task only threads them through the wrappers + `SlideView`.
