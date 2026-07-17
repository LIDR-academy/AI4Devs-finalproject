# Risks — activity-open-ended

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | R2 generation isn't built — `modelAnswer` / prompt field naming may drift. | technical | M | M | Additive `OpenEndedSlide`; `isOpenEndedSlideValid` + organism unavailable (@s7). Only wrapper mapping changes if fields move. |
| R2 | Implementator adds auto-grade or self-mark UI (FITB/flashcard muscle memory). | product | M | H | Spec + Gherkin forbid `isCorrect` / self-mark; answered-state has no grade fields; reviewers check against @s2/@s6. |
| R3 | Enter-to-submit copied from FITB breaks multiline (newline vs submit). | technical | M | M | Contract: Enter = newline only; Submit control is the only submit path (@s10); organism + e2e assert. |
| R4 | `OpenEndedAnswer` accidentally treated as `GradedAnswer` / counted in R7. | technical | L | H | No `isCorrect` on type; `isSystemCheckedActivity('open-ended')` already false; @s6 asserts exclusion. |
| R5 | Component-split skipped (monolithic organism) contrary to story. | technical | M | M | Task-3 done criteria require `.tsx` / `.types.ts` / `use-open-ended.ts` / helpers-as-needed + co-located suites; architecture reviewer. |
| R6 | a11y of multiline input + post-submit comparison (labels, live region, touch targets). | product | M | M | `labels.answerInput` / `yourAnswer` / `modelAnswer`; live-region announce on reveal; ≥44px Submit (@s9). |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/activities` scaffold (Storybook + Jest + Playwright + Stryker) | available | `OpenEnded` under `src/organisms/open-ended/`. |
| `@helsoft/components` (`Card`, `Icon`, theme tokens) | available | Surfaces / comparison blocks. |
| `@helsoft/localization` (`useLocalization`, en/es/pt/de) | available | New `activity.openEnded.*` keys, key-aligned. |
| `libs/types` `ActivityType` + `isSystemCheckedActivity` | available | `'open-ended'` already excluded from R7. |
| `libs/types` `Slide` + `activity-answer` | available | Extend additively with `OpenEndedSlide` / `OpenEndedAnswer`. |
| Matching / MCQ / FITB organism–wiring precedent | available | Reference split; open-ended has no grader. |
| R2 generation | blocked / separate | Payload shape + defensive validation only. |
| R4 player, R7 score UI, R9 resume | blocked / separate | Answered-state shape only; R7 already skips type. |
