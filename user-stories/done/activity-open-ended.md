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
- Organism folder follows `.agents/rules/component-split.mdc` from day one (non-trivial UI with text + submit/lock state) — mirror existing activity organisms (`multiple-choice`, `fill-in-the-blank`, `matching`):
  - `open-ended.tsx` — JSX, styles, a11y attrs, **event handlers** (change / submit wiring)
  - `open-ended.types.ts` — `Props` + related view types (no JSX → `.ts`)
  - `use-open-ended.ts` — draft text + submitted state, derived flags (`locked`, …), any a11y announce effect
  - `open-ended.helpers.ts` — pure helpers when needed (a11y labels, view-model builders, …)
  - co-located suites: one per file above (`.test.ts` / `.test.tsx`)
- No system grading module in v1 (model answer is revealed, not compared). The `use-open-ended` hook is **UI co-location** only (local interaction state); not a data-layer hook (`.agents/rules/hooks-service-dao.mdc`).

## Acceptance criteria
- Given an open-ended slide, when it renders, then an empty, editable free-text input is shown with the prompt; the model answer is hidden.
- Given the learner types a response and submits, when the submission registers, then the input is locked (read-only, no further edits) and the model answer is revealed next to the learner's own submitted text.
- Given the slide has an explanation, when the model answer is revealed, then the explanation is displayed alongside it.
- Given the learner submits an empty response, then the model answer is still revealed (submission doesn't require non-empty text) rather than the flow getting stuck.
- This slide never contributes a correct/incorrect result — it's excluded entirely from the R7 score total and carries no self-mark, only "answered" (submitted) state for R9 resume continuity.
- Given the organism is implemented, when inspecting `libs/activities/src/organisms/open-ended/` (or equivalent), then the folder is split per `.agents/rules/component-split.mdc` (`.tsx` / `.types.ts` / `use-*.ts` / `.helpers.ts` as needed + co-located suites); handlers live in the component, state/derived/effects in the hook, pure transforms in helpers.

## Notes
- Extends the `Slide` activity payload with `modelAnswer` (and stores the learner's own submitted text) in `libs/types/src/lesson.ts` — coordinate with R2.
- Excluded from the R7 score aggregate; no self-mark UI (product decision — differs from flashcard).
- No analytics event for this story at this time.
- `open-ended.stories.tsx` must cover unanswered / submitted-with-model-answer states.
- Follow the same organism split as shipped activity types in `@helsoft/activities` — don't ship a monolithic single-file organism.
- Future consideration (P1, out of scope here): AI auto-grading of open-ended answers (PRD Nice-to-Have).
