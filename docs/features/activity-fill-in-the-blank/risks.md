# Risks — activity-fill-in-the-blank

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | R2 generation isn't built yet — real `FillInTheBlankSlide` shape (`content` blank marker, `acceptedAnswers` naming) may drift. | technical | M | M | Additive union; `isFillInTheBlankSlideValid` + organism unavailable degrade malformed/empty payloads (@s11/@s12). Only wrapper mapping changes if fields move. |
| R2 | Normalization bugs (diacritics, multi-space, case) cause false incorrect/correct. | technical | M | H | Pure `normalizeFillInAnswer` + `gradeFillInTheBlank`, TDD-first with outline cases (@s8/@s9); mutation testing on normalize/grade. |
| R3 | Inline `____` split/render breaks on edge content (multiple markers, marker at ends, missing marker). | technical | M | M | Validity = exactly one `____`; organism unavailable if unrenderable (@s12); unit tests for leading/trailing/mid blank. |
| R4 | Enter-submit vs button-submit diverge (double-fire, lock bypass). | technical | L | H | Single `handleSubmit` path; ignore when already answered (@s5/@s7); wrapper + organism tests. |
| R5 | `maxLength` formula misread (`* 0.25` vs `* 1.25`) truncates valid answers or allows runaway input. | product | M | M | Pinned as 25% headroom in Open decisions; confirm at gate; derive from `acceptedAnswers[0]` only when valid. |
| R6 | Revealing only `[0]` confuses when learner matched a later synonym but UI never shows it on incorrect. | product | L | L | Documented; incorrect always shows `[0]` as canonical teaching answer; correct path stores matched accepted in answered-state. |
| R7 | a11y of inline TextInput inside sentence (label, live region, touch targets) weaker than MCQ tiles. | product | M | M | `labels.blankInput`, roles, text+icon correctness, live-region announce, ≥44px Submit (@s14). |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/activities` scaffold (Storybook + Jest + Playwright + Stryker) | available | `FillInTheBlank` under `src/organisms/fill-in-the-blank/`. |
| `@helsoft/components` (`Card`, `Icon`, theme tokens) | available | Banner / explanation / surfaces. |
| `@helsoft/localization` (`useLocalization`, en/es/pt/de) | available | New `activity.fillInTheBlank.*` keys, key-aligned. |
| `libs/types` `Slide` + `activity-answer` | available | Extend additively beside Matching/MCQ. |
| Matching / MCQ organism–wiring–grader precedent | available | Reference split. |
| R2 generation | blocked / separate | Payload shape + defensive validation only. |
| R4 player, R7 score, R9 resume | blocked / separate | Answered-state shape only. |
