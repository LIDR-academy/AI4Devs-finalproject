---
feature: activity-open-ended
story: user-stories/activity-open-ended.md
status: approved
---

# Spec — activity-open-ended

## Summary
Open-ended activity slide (PRD R3): multiline free-text → Submit → lock + reveal **model answer** for self-comparison. Not auto-graded; no self-mark; R7-excluded (`isSystemCheckedActivity('open-ended') === false`). Answered = submitted-only for R9.

Scope: `OpenEndedSlide` / `OpenEndedAnswer` in `@helsoft/types`; `isOpenEndedSlideValid` (no grader) in study-buddy; component-split `OpenEnded` in `@helsoft/activities`; thin `OpenEndedActivity` wiring. No analytics/flags. R4/R9/R7 UI out of scope.

## User stories
- As a **learner**, I want **to write a free-text answer and compare it to a model answer**, so that **I can self-assess when it can't be auto-graded**.

## Acceptance criteria
→ [`gherkin-scenarios.md`](./gherkin-scenarios.md) (`@s1`–`@s10`).

## Data contract
- `OpenEndedSlide`: `activityType: 'open-ended'`, `modelAnswer: string`, optional `explanation`; prompt = `SlideBase.content`.
- `OpenEndedAnswer`: `{ slideId, activityType: 'open-ended', submittedAnswer }` — **no** `isCorrect` / not `GradedAnswer`.
- `isOpenEndedSlideValid(slide)`: trimmed `content` + trimmed `modelAnswer` both non-empty.

## Component contract
- **`OpenEnded`** (`libs/activities/.../open-ended/`): split `tsx` / `types` / `use-open-ended` / `helpers` + suites + stories. Props: `prompt`, `modelAnswer`, `explanation?`, `unavailable?`, `initialSubmittedAnswer?`, `maxLength`, `labels`, `onSubmit`.
- Unanswered: editable multiline (`TextField`), Submit enabled, model hidden; Enter = newline only (`@s10`).
- Submitted: locked read-only; stacked `yourAnswer` → `modelAnswer` (+ explanation); AT live-region announce; no grade/self-mark UI.
- Unavailable: notice only, non-interactive.
- **`OpenEndedActivity`**: `valid = isOpenEndedSlideValid`; inject `t('activity.openEnded.*')`; `maxLength=2000`; emit `OpenEndedAnswer` once via `onAnswered`.

## UI states
| State | Notes |
|---|---|
| Loading | N/A (deck loaded before mount) |
| Content | unanswered / submitted |
| Error / Empty | unavailable (invalid prompt or modelAnswer) |

## Analytics / flags
None.

## Out of scope
Auto/AI grading; self-mark UI; R7 score UI; retry; Enter-to-submit; R4/R9/R2; analytics/flags.

## Open decisions (resolved)
- Story-locked: ungraded reveal; empty submit OK; no self-mark; R7 excluded; activities + component-split; `use-open-ended` UI-only.
- Architecture: organism + wiring + validity only (mirrors Matching; no DAO/service/grader).
- Multiline; Submit only; Enter = newline (`@s10`).
- Reveal = stacked labeled blocks (not columns).
- `maxLength=2000`; valid = non-empty trimmed prompt + modelAnswer.
- i18n chrome only; slide text from data.
