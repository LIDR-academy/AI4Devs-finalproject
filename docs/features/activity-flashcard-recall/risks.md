# Risks — activity-flashcard-recall

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | R2 generation isn't built yet, so the real `FlashcardSlide` shape (front in `content`, answer field name `back`, optional `explanation`) may drift from this spec. | technical | M | M | Additive union change; `isFlashcardSlideValid` degrades a missing front/back to the unavailable notice instead of crashing (@s8); field names flagged for R2 coordination. |
| R2 | The self-mark is recorded as answered state but must not leak into the R7 score — a wrong `activityType` or a future edit to `SYSTEM_CHECKED_ACTIVITY_TYPES` would silently inflate scores. | product | L | H | This story doesn't touch `score-lesson.ts`/`activity-type.ts`; flashcard is already excluded and asserted by `score-lesson.test.ts`; the literal `activityType: 'flashcard'` keeps the exclusion self-enforcing (@s6). |
| R3 | The reveal/self-mark state machine (one-way reveal, one-time locked mark, no re-mark) is easy to get subtly wrong. | technical | M | M | Pinned in the spec and covered scenario-by-scenario (@s2–@s5); unit + Playwright e2e drive each transition; `onAnswered` emit-once guarded and mutation-tested. |
| R4 | `FlashcardAnswer` carrying both `recalled` and a mirrored `isCorrect` could read as a code smell or tempt a future caller to treat "recalled" as "scored-correct". | technical | L | M | Preserves the shipped structural `ActivityAnswer ⊆ GradedAnswer` invariant (task-1 extends `graded-answer.test.ts`); doc-comment states it's never scored; human confirmed the shape at the gate (spec.md Open decisions). |
| R5 | Accessibility of a reveal→self-mark flow (announcing the revealed answer, conveying the locked mark without color, adequate touch targets) can regress. | product | M | M | `accessibilityRole`/labels on reveal/self-mark, `accessibilityState` for revealed/locked, text+icon (not color) for the confirmed mark, live-region announce on reveal, ≥ touch-target-min sizes (@s10); RNTL + Playwright coverage. |
| R6 | Scope creep — adding grading, spaced-repetition, or persistence to "make it useful". | product | L | M | Non-goals restated; self-mark only, no grader; R7/R9 are separate stories this only feeds/exposes. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `@helsoft/activities` scaffold (Storybook + Jest + Playwright + Stryker) | available | Hosts `multiple-choice/`, `fill-in-the-blank/`, `matching/`; `flashcard/` lands beside them. |
| `@helsoft/components` (`Card`, `Icon`, theme tokens) | available | Reused for card surface, reveal/self-mark controls, answer + explanation surfaces. |
| `@helsoft/localization` (`useLocalization`, en/es/pt/de bundles) | available | New `activity.flashcard.*` keys added key-aligned; organism dir registered in `migration-coverage.test.ts` (task-6). |
| `libs/types` `Slide` union + `activity-answer` | available | Extended additively (`FlashcardSlide`, `FlashcardAnswer`, `ActivityAnswer` union). |
| `libs/types` `activity-type.ts` (`SYSTEM_CHECKED_ACTIVITY_TYPES`, `isSystemCheckedActivity`) | available — unchanged | Already includes `flashcard` in `ActivityType` and excludes it from scoring. |
| R7 scorer (`score-lesson.ts`) | available — unchanged | Already excludes flashcard (existing tests prove it); out of scope here. |
| Shipped activity precedent (`Matching`/`MatchingActivity`, `FillInTheBlank`) | available | Reference pattern for organism/hook/helpers split + thin study-buddy wiring + wrapper story. |
| R2 generation (constructs flashcard slides) | blocked / separate story | This story only defines + defensively validates the payload shape. |
| R4 player, R9 resume | blocked / separate stories | This story only renders one slide and exposes the answered-state R9 will persist. |
