---
id: task-4
title: MultipleChoiceActivity wiring component + slice integration test
slice: 1
scenarios: [s2, s6, s7]
status: done
paths:
  - libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx
  - libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.test.tsx
  - libs/study-buddy/src/index.ts
---

## Goal
Wire the presentational `MultipleChoice` organism to the domain: own the local selection state, call `gradeMultipleChoice` on the first selection, and expose the graded answered-state via `onAnswered` exactly once. This is the feature component the R4 player will mount per activity slide. Mirrors the `SignInForm` (wiring) → `LoginForm` (presentational) precedent.

## Contract (from spec)
```ts
type MultipleChoiceActivityProps = { slide: MultipleChoiceSlide; onAnswered?: (a: MultipleChoiceAnswer) => void };
```
- `useState<string|null>(null)` for the selection (plain local UI state — no hook/service/DAO; no I/O).
- `handleSelect(id)`: if already answered → ignore (lock); else set selection + `onAnswered(gradeMultipleChoice(slide, id))`.
- Passes `question = slide.content`, `options`, `correctOptionId`, `selectedOptionId`, `explanation`, and `labels` (temporary literals until task-6 injects `t()`) to `MultipleChoice`.

## Done criteria
- [ ] @s2 — first select sets the answer and the rendered options lock
- [ ] @s6 — a second select is a no-op: selection unchanged, `onAnswered` fires exactly once
- [ ] @s7 — `onAnswered` receives the correct `MultipleChoiceAnswer` payload (integration across wrapper → grader → component with the real grader, not mocked)
- [ ] One slice integration test across wrapper + grader + organism
- [ ] `Props` type declared; kebab-case filenames; functional React; exported through study-buddy barrel
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions (chrome copy is placeholder here; task-6 replaces with `t()`)

## Notes
- No custom hook / no tanstack-query by decision (spec Open decisions): single local selection, no network/cache.
- `question = slide.content` mapping is the single R1-coordination point; if R2 emits the question elsewhere, change it only here.
- Depends on task-2 (grader) and task-3 (organism).
