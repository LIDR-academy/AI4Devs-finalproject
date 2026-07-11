# Risks — activity-multiple-choice

| # | Risk | L/I | Mitigation |
|---|---|---|---|
| R1 | Slide-payload shape drifts from R2 (AI generation, unbuilt) — `MultipleChoiceSlide` shape defined speculatively. | M/M | Additive-only union (new `activityType`, optional fields); the **Error UI state** (`correctOptionId` ∉ options) degrades to an `unavailable` notice, not a crash; field mapping isolated in the wrapper (one-file R2 alignment). Record shape here as the contract R2 must satisfy. |
| R2 | Answered-state shape insufficient for R7 scoring / R9 resume (both unbuilt). | M/M | `MultipleChoiceAnswer` carries `slideId`+`activityType`+`selectedOptionId`+`correctOptionId`+`isCorrect`; `ActivityAnswer` is a union so R7/R9 branch by type; `onAnswered` fires once. Extra fields (timestamp, attempt#) are additive later. |
| R3 | Discriminated-union change breaks existing `Slide` consumers. | L/L | Only consumer today is `Lesson.slides`; no code constructs activity slides yet; common fields stay in `SlideBase`. `pnpm check-types` is the guard. |
| R4 | "No retry" locks a mis-tap permanently — may feel punitive. | M/L | Explicit product decision (correction via whole-lesson retakes, R7); documented in spec Open decisions/non-goals; surface at the human gate. |
| R5 | Reused `AnswerOption` visuals may not cover all needed states / a11y. | L/L | `AnswerOption` already implements `default/selected/correct/incorrect`, non-color-only icons (`check_circle`/`cancel`), `disabled`, `accessibilityState`; organism only composes it. Any gap fixed in the molecule under its own tests. |
| R6 | Result feedback not announced to assistive tech. | M/M | Slice 3 adds a live-region + `AccessibilityInfo.announceForAccessibility` result announcement (LoginForm pattern); correctness conveyed by text + icon, not color. Covered by @s11 + Playwright e2e. (Residual Android-only risk m4-b — see `review.md`/`spec.md`.) |
| R7 | Degenerate option counts (0 or 1). | L/L | Empty state handles 0; Error state covers other malformed payloads; both render `unavailable`, non-interactive. Covered by @s8/@s9. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/types` `Slide`/`Lesson` | available | Extended into a discriminated union; only consumer is `Lesson.slides`. |
| `AnswerOption` molecule | available | Core reused control; states + icons + a11y already implemented. |
| `Card`/`Icon` atoms + theme tokens | available | Question/explanation surfaces; no new tokens. |
| `@helsoft/localization` (`en/es/pt/de`) | available | Adds `activity.mcq.*` keys; wrapper injects `labels`. |
| `@helsoft/study-buddy` feature lib | available | Home for the pure grader + wiring; `LoginForm`/`SignInForm` precedent. |
| R2 AI generation | blocked / not built | This story defines the payload contract R2 must satisfy (R1); no runtime dependency. |
| R4 lesson player | not built | Consumes this component; Loading is its concern. |
| R7 score / R9 resume | not built | Consume `MultipleChoiceAnswer`; this story only exposes the shape. |
