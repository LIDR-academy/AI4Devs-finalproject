# Fill-in-the-blank activity slide

**As a** learner
**I want** to type an answer into a fill-in-the-blank activity slide and see immediately whether it's correct
**so that** I know if I understood the material without waiting until the end of the lesson

## Context
- Part of PRD R3 (Activity slide types with feedback), P0 floor type.
- Scoped to the fill-in-the-blank activity type only — same boundaries as the multiple-choice story (R4 navigation, R9 resume/persistence are separate stories).
- Slide data (from R2 generation) carries the prompt/blank text and one or more accepted answers, optionally an explanation. Extends the `Slide` type the same way as the multiple-choice story.
- Grading: case-insensitive, trimmed comparison against the accepted answer(s) (PRD R3, exact wording). A match against any one of multiple accepted answers counts as correct.
- Locked after first submit — no retry (same product decision as multiple choice): once the learner submits, the input becomes read-only, and the correct answer is shown if they were wrong.
- System-checked type: contributes to the R7 end-of-lesson score.
- No analytics events for this story at this time (deferred).
- Component belongs in `@helsoft/activities` (atomic design), not `@helsoft/components` — see `activities-library.md` for the library scaffold (Storybook + Jest + Playwright + Stryker); depends on `@helsoft/components` for shared atoms/molecules/theme.
- Organism folder follows `.agents/rules/component-split.mdc` (non-trivial UI with state + pure logic):
  - `fill-in-the-blank.tsx` — JSX, styles, a11y attrs, **event handlers** (submit / `onChangeText` wiring)
  - `fill-in-the-blank.types.ts` — `Props` + related view types (no JSX → `.ts`)
  - `use-fill-in-the-blank.ts` — blank value + graded-answer state, derived flags (`locked`, `isUnavailable`, `maxLength`, `resultLabel`), a11y announce effect
  - `fill-in-the-blank.helpers.ts` — pure helpers (`splitAroundBlank`, `blankMaxLength`, …)
  - co-located suites: one per file above (`.test.ts` / `.test.tsx`)
- Pure grading lives in `@helsoft/activities` (`src/grading/grade-fill-in-the-blank.ts`), co-located with the organism lib — not in `@helsoft/study-buddy`. The `use-fill-in-the-blank` hook is **UI co-location** only (local interaction state); data still follows `Component → Hook → Service → DAO` (`.agents/rules/hooks-service-dao.mdc`) when I/O is needed.

## Acceptance criteria
- Given a fill-in-the-blank slide, when it renders, then an empty, editable text input is shown with the prompt.
- Given the learner types an answer and submits, when the input (trimmed, case-insensitive) matches any accepted answer, then immediate feedback marks it correct.
- Given the learner's trimmed, case-insensitive input does not match any accepted answer, then immediate feedback marks it incorrect and reveals an accepted answer.
- Given the slide has an explanation, when feedback is shown, then the explanation is displayed with the result.
- After submitting, the input is locked (read-only) — no editing or resubmitting on this view.
- Given the learner submits an empty input, then it is graded as incorrect and feedback still resolves rather than the flow getting stuck.
- The correct/incorrect result is exposed as part of this slide's answered state for the R7 score and later R9 persistence.
- Given the organism is implemented, when inspecting `libs/activities/src/organisms/fill-in-the-blank/`, then the folder is split per `.agents/rules/component-split.mdc` (`.tsx` / `.types.ts` / `use-*.ts` / `.helpers.ts` + co-located suites); handlers live in the component, state/derived/effects in the hook, pure transforms in helpers.

## Notes
- Extends the `Slide` activity payload with `acceptedAnswers: string[]` (or similar) in `libs/types/src/lesson.ts` — coordinate with R2.
- Grading (trim + case-insensitive compare against a list) is a pure function in `@helsoft/activities` `src/grading/` — no DAO/service needed (`.agents/rules/hooks-service-dao.mdc`).
- No retry once submitted (same product decision as multiple choice).
- No analytics event for this story at this time.
- `fill-in-the-blank.stories.tsx` must cover unanswered / correct / incorrect states.
