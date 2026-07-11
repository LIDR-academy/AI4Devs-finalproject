# Matching activity slide

**As a** learner
**I want** to pair related items by tapping one and then its match on a matching activity slide, and see which pairs I got right on submit
**so that** I know which relationships I understood without needing drag-and-drop

## Context
- Part of PRD R3 (Activity slide types with feedback) — in scope for v1 per Resolved Decisions (not P0 floor, but shipped in v1).
- Scoped to the matching activity type only — same boundaries as the other R3 stories (R4 navigation, R9 resume are separate stories).
- Interaction is explicitly **tap-to-select-two-items-to-pair, not drag-and-drop** (PRD Non-Goals #7 / Resolved Decisions) — the learner taps one item, then taps the item they believe matches it, forming a pair; this repeats until all items are paired or the learner submits with pairs still outstanding.
- Feedback is deferred to an explicit submit, unlike multiple choice/fill-in-the-blank's immediate-per-answer feedback (PRD wording: "correctness shown on submit") — the learner forms all pairs first, then taps Submit to see which pairs are correct/incorrect.
- Slide data (from R2 generation) carries the left-side items, right-side items, and the correct pairing.
- Locked after submit — no retry (same product decision as the other system-checked types): once submitted, all pairings and their correct/incorrect result are shown and no longer editable.
- System-checked type: contributes to the R7 end-of-lesson score.
- No analytics events for this story at this time (deferred).
- Component belongs in `@helsoft/activities` (atomic design), not `@helsoft/components` — see `activities-library.md` for the library scaffold (Storybook + Jest + Playwright + Stryker); depends on `@helsoft/components` for shared atoms/molecules/theme.
- Organism folder follows `.agents/rules/component-split.mdc` (non-trivial UI with state + pure logic):
  - `matching.tsx` — JSX, styles, a11y attrs, **event handlers** (item tap / submit wiring)
  - `matching.types.ts` — `Props`, pair/result view models, labels (no JSX → `.ts`)
  - `use-matching.ts` — pending selection + formed pairs, derived flags (`locked`, `allPaired`, `itemState`, …), a11y announce effect
  - `matching.helpers.ts` — pure helpers (`findPairForItem`, `itemAccessibilityLabel`, …)
  - co-located suites: one per file above (`.test.ts` / `.test.tsx`)
- Pure grading lives in `@helsoft/activities` (`src/grading/grade-matching.ts`). The `use-matching` hook is **UI co-location** only (local tap-to-pair state); not a data-layer hook (`.agents/rules/hooks-service-dao.mdc`).

## Acceptance criteria
- Given a matching slide, when it renders, then both the left-side items and right-side items are visible, unpaired, and tappable; no drag interaction exists.
- Given the learner taps a left item then a right item (in either order), when both taps register, then that pair is formed and visually marked as paired (not yet graded).
- Given the learner taps an already-paired item before submitting, when the tap registers, then that item's existing pair is released so it can be re-paired.
- Given the learner taps Submit, when it registers, then every formed pair is graded against the correct pairing and each pair's correct/incorrect result is shown; the activity is then locked (no further re-pairing).
- Given the learner taps Submit with some items still unpaired, then those unpaired items are graded as incorrect for their expected pairing (submission is not blocked).
- Given the slide has an explanation, when results are shown, then the explanation is displayed alongside them.
- The correct/incorrect result (aggregated across pairs) is exposed as part of this slide's answered state for the R7 score and later R9 persistence.
- Given the organism is implemented, when inspecting `libs/activities/src/organisms/matching/`, then the folder is split per `.agents/rules/component-split.mdc` (`.tsx` / `.types.ts` / `use-*.ts` / `.helpers.ts` + co-located suites); handlers live in the component, state/derived/effects in the hook, pure transforms in helpers.

## Notes
- Extends the `Slide` activity payload with left/right item lists and the correct pairing (e.g. matching IDs) in `libs/types/src/lesson.ts` — coordinate with R2.
- No retry after submit (same product decision as multiple choice/fill-in-the-blank).
- Exact scoring granularity (whole-slide correct/incorrect vs. per-pair partial credit toward R7's correct/total) isn't pinned down in the PRD — resolve with `spec_partner` before/during implementation.
- Grading is a pure function in `@helsoft/activities` `src/grading/` — no DAO/service needed.
- No analytics event for this story at this time.
- `matching.stories.tsx` must cover unpaired / partially-paired / submitted-all-correct / submitted-mixed-results states.
- Reiterates PRD Non-Goal #7 — no drag-and-drop; tap-to-select-two only.
