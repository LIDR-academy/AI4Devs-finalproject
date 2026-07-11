# Risks — activity-matching

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | R2 generation isn't built yet, so the real `MatchingSlide` shape (item/pair field names, whether the prompt lands in `content`) may drift from this spec. | technical | M | M | Additive union change; `isMatchingSlideValid` + organism self-checks degrade a malformed/empty payload to the unavailable notice instead of crashing (@s13–@s15). Payload shape flagged for R2 coordination; only the wrapper mapping changes if fields move. |
| R2 | Tap-to-pair state machine (pending / retarget / deselect / release) is easy to get subtly wrong — e.g. leaving a stale pending after a pair forms, or allowing a paired item to become a pending target. | technical | M | M | State machine pinned in the spec (Decision 4) and covered scenario-by-scenario (@s2–@s6); organism unit tests + Playwright e2e drive each transition; mutation testing on the reducer/handlers. |
| R3 | Submit-gate regression: enabling Submit before every item is paired, or allowing re-pairing after Submit, would silently break the grading contract. | technical | L | H | Human-locked Decision 6 encoded as @s7/@s8; explicit tests for disabled-until-all-paired and post-submit lock; wrapper ignores repeat submits. |
| R4 | Per-pair grading correctness: order-independence (left-first vs right-first), partial credit counts, and `isCorrect` derivation could be miscomputed. | technical | M | H | Pure `gradeMatching` grader, TDD-first, unit-tested for all-correct / mixed / order variants (@s9/@s10/@s12); defensive throw on unknown ids guards R7/R9 callers. |
| R5 | Accessibility of a two-column tap-to-pair interaction (conveying pending/paired without color, announcing results, adequate touch targets) is harder than a single-column list. | product | M | M | `accessibilityState.selected` for pending/paired, text+icon (not color) for correctness, live-region result announcement, ≥44px targets (@s17); Playwright + RN Testing Library assertions. On-device screen-reader pass recommended (non-blocking, per multiple-choice precedent). |
| R6 | Scope creep toward drag-and-drop. | product | L | M | PRD Non-Goal #7 and Decision (tap-to-select-two) restated in the spec and non-goals; no drag affordance in the contract. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/activities` scaffold (Storybook + Jest + Playwright + Stryker) | available | Hosts the migrated `MultipleChoice`; `Matching` lands beside it under `src/organisms/matching/`. |
| `@helsoft/components` (`Card`, `Icon`, theme tokens) | available | Reused for tiles/columns/banner/explanation surfaces. |
| `@helsoft/localization` (`useLocalization`, en/es/pt/de bundles) | available | New `activity.matching.*` keys added key-aligned across all four bundles. |
| `libs/types` `Slide` union + `activity-answer` | available | Extended additively (`MatchingSlide`, `MatchingAnswer`, `GradedPair`, `ActivityAnswer` union). |
| Multiple-choice precedent (`MultipleChoice` / `MultipleChoiceActivity` / `gradeMultipleChoice`) | available | Reference pattern for organism/wiring/grader split. |
| R2 generation (constructs matching slides) | blocked / separate story | This story only defines + defensively validates the payload shape. |
| R4 player, R7 score, R9 resume | blocked / separate stories | This story only exposes the answered-state they consume. |
