# Flashcard / recall activity slide

**As a** learner
**I want** to reveal the answer on a flashcard and mark for myself whether I recalled it
**so that** I can gauge my own understanding as I study, even though it isn't part of my graded score

## Context
- Part of PRD R3 (Activity slide types with feedback), P0 floor type.
- Scoped to the flashcard/recall activity type only — same boundaries as the other R3 stories (R4 navigation, R9 resume are separate stories).
- Slide data (from R2 generation) carries a prompt (front) and an answer (back), optionally an explanation.
- Unlike multiple choice / fill-in-the-blank / matching, this is self-marked, not system-checked: the learner reveals the answer, then taps "Recalled" or "Not recalled" themselves.
- Product decision: only system-checked types (multiple choice, fill-in-the-blank, matching) count toward the R7 end-of-lesson score. Flashcard self-marks do **not** contribute to that aggregate score — they're for the learner's own signal only — though the mark is still recorded on the slide's answered state (for R9 resume continuity).
- No analytics events for this story at this time (deferred).
- Component belongs in `@helsoft/activities` (atomic design), not `@helsoft/components` — see `activities-library.md` for the library scaffold (Storybook + Jest + Playwright + Stryker); depends on `@helsoft/components` for shared atoms/molecules/theme.

## Acceptance criteria
- Given a flashcard slide, when it renders, then only the front/prompt is visible; the back/answer is hidden.
- Given the learner taps to reveal, when the tap registers, then the back/answer becomes visible alongside the front.
- Given the answer is revealed, then two self-mark actions are available: "Recalled" and "Not recalled."
- Given the learner taps one self-mark action, when it registers, then that choice is locked in for this view (no changing the self-mark afterward) and is visually confirmed.
- The self-mark is stored as this slide's answered state (for R9 resume continuity) but is excluded from the R7 auto-graded score total.
- Given the slide has an explanation, when the answer is revealed, then the explanation is displayed alongside it.

## Notes
- Extends the `Slide` activity payload with front/back fields in `libs/types/src/lesson.ts` — coordinate with R2.
- Explicitly excluded from the R7 score aggregate (product decision) — the R7 score story should only sum multiple-choice, fill-in-the-blank, and matching results.
- No analytics event for this story at this time.
- `flashcard.stories.tsx` must cover hidden / revealed-recalled / revealed-not-recalled states.
