---
id: task-5
title: Empty + Error states + grader validation (graceful degradation)
slice: 2
scenarios: [s8, s9]
status: done
paths:
  - libs/components/src/organisms/multiple-choice/multiple-choice.tsx
  - libs/components/src/organisms/multiple-choice/multiple-choice.test.tsx
  - libs/components/src/organisms/multiple-choice/multiple-choice.stories.tsx
  - libs/study-buddy/src/grading/grade-multiple-choice.ts
  - libs/study-buddy/src/grading/grade-multiple-choice.test.ts
---

## Goal
Make the feature robust against malformed/degenerate slide data (a real risk while R2 generation is unbuilt — see risks R1/R7). Add the Empty and Error UI states to the organism and the corresponding validation test to the grader. This slice has no network retry (the feature does no I/O) — "graceful degradation" replaces the generic slice-2 "retry".

## Contract (from spec — UI states)
- **Empty** — `options.length === 0` → render `labels.unavailable`, non-interactive.
- **Error** — `correctOptionId` not among the option ids → render `labels.unavailable`, non-interactive, **no crash**.
- Grader — `gradeMultipleChoice` throws on an unknown `selectedOptionId` (domain guard already introduced in task-2; add/confirm the explicit test here).

## Done criteria
- [x] @s8 — zero options → `unavailable` notice shown, nothing selectable, no result banner
- [x] @s9 — `correctOptionId` ∉ options → `unavailable` notice shown, no crash; grader throws on unknown option id
- [x] `multiple-choice.test.tsx` drives both states (written first, TDD)
- [x] `multiple-choice.stories.tsx` gains Empty + Error (malformed) variants
- [x] Reuses existing tokens/components; no ad-hoc styling
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [x] No hardcoded strings/colors/dimensions

## Notes
- `labels.unavailable` is one localized string (task-6 provides the `activity.mcq.unavailable` key/values).
- These states directly mitigate R1 (R2 shape drift): a mismatch degrades instead of crashing.
- Depends on tasks 1–4.
