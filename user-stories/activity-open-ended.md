# Open-ended / short answer activity slide

**As a** learner
**I want** to write a free-text answer on an open-ended activity slide and compare it against a model answer
**so that** I can self-assess my understanding even when the answer can't be auto-graded

## Context
- Part of PRD R3 (Activity slide types with feedback) — in scope for v1 per Resolved Decisions (not P0 floor, but shipped in v1).
- Scoped to the open-ended/short-answer activity type only — same boundaries as the other R3 stories (R4 navigation, R9 resume are separate stories).
- Slide data (from R2 generation) carries a prompt and a model answer, optionally an explanation.
- Not auto-graded in v1 (PRD, explicit) and excluded from the R7 end-of-lesson score entirely. Product decision: no self-mark either (unlike flashcard) — it's shown purely for the learner's own comparison.
- No analytics events for this story at this time (deferred).
- Component belongs in `@helsoft/activities` (atomic design), not `@helsoft/components` — see `activities-library.md` for the library scaffold (Storybook + Jest + Playwright + Stryker); depends on `@helsoft/components` for shared atoms/molecules/theme.

## Acceptance criteria
- Given an open-ended slide, when it renders, then an empty, editable free-text input is shown with the prompt; the model answer is hidden.
- Given the learner types a response and submits, when the submission registers, then the input is locked (read-only, no further edits) and the model answer is revealed next to the learner's own submitted text.
- Given the slide has an explanation, when the model answer is revealed, then the explanation is displayed alongside it.
- Given the learner submits an empty response, then the model answer is still revealed (submission doesn't require non-empty text) rather than the flow getting stuck.
- This slide never contributes a correct/incorrect result — it's excluded entirely from the R7 score total and carries no self-mark, only "answered" (submitted) state for R9 resume continuity.

## Notes
- Extends the `Slide` activity payload with `modelAnswer` (and stores the learner's own submitted text) in `libs/types/src/lesson.ts` — coordinate with R2.
- Excluded from the R7 score aggregate; no self-mark UI (product decision — differs from flashcard).
- No analytics event for this story at this time.
- `open-ended.stories.tsx` must cover unanswered / submitted-with-model-answer states.
- Future consideration (P1, out of scope here): AI auto-grading of open-ended answers (PRD Nice-to-Have).
