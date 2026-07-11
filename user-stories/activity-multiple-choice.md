# Multiple choice activity slide

**As a** learner
**I want** to select an answer on a multiple-choice activity slide and see immediately whether I got it right
**so that** I know if I understood the material without waiting until the end of the lesson

## Context
- Part of PRD R3 (Activity slide types with feedback), P0 floor type.
- Scoped to the multiple-choice activity type only: rendering the question + options, grading, and showing feedback. Slide-to-slide navigation is R4 (separate story); saving/resuming progress is R9 (separate story) — this story just needs to expose answered/correct state in a shape those stories can persist later.
- Slide data comes from AI generation (R2): each multiple-choice slide carries the question text, the list of options, and the correct option, optionally an explanation. The current `Slide` type (`libs/types/src/lesson.ts`) has no per-type payload yet — extending it (e.g. a discriminated union keyed by activity type) to carry `options`/`correctOptionId` is in scope here.
- Once the learner selects an option, the attempt is locked: options become non-interactive, the selected option and the correct option are both visually distinguished, and no re-selection is allowed on that view (product decision: no retry).
- Multiple choice is a system-checked type: its correct/incorrect result feeds into the end-of-lesson score (R7).
- No analytics events for this story at this time (deferred).
- Component lives in `@helsoft/activities` (atomic design) — originally built in `@helsoft/components`; `activities-library.md` scaffolds the new library (Storybook + Jest + Playwright + Stryker) and migrates this component out. Grading is a pure function with no I/O (correct answer already arrives with the slide), so it needs no DAO/service call per `.agents/rules/hooks-service-dao.mdc`.

## Acceptance criteria
- Given a multiple-choice slide with N options, when it renders, then all options are visible and selectable, none pre-selected.
- Given the learner taps an option, when the tap registers, then that option becomes the learner's answer, is locked (no further changes on this view), and all options become disabled.
- Given the learner's selected option matches the correct option, then immediate feedback marks it as correct.
- Given the learner's selected option does not match the correct option, then immediate feedback marks the selected option as incorrect and visually reveals the correct option alongside it.
- Given the slide has an explanation, when feedback is shown, then the explanation is displayed with the result.
- Only one option can be selected per attempt — no multi-select in v1 (matches PRD wording "learner selects an option").
- The correct/incorrect result is exposed as part of this slide's answered state so it can be included in the end-of-lesson score (R7) and later persisted for resume (R9).

## Notes
- Extends `Slide` with a multiple-choice payload in `libs/types/src/lesson.ts` — coordinate with the R2 generation story so the shape matches what the Edge Function returns.
- No retry: once answered, the attempt is final for that lesson view (learning gain is measured via whole-lesson retakes, R7, not per-question retries).
- No analytics event for this story at this time.
- `multiple-choice.stories.tsx` must cover unanswered / correct-selected / incorrect-selected states.
- Follows `.agents/rules/atomic-design.mdc` for component placement and `.agents/rules/hooks-service-dao.mdc` for where grading logic lives.
