---
id: task-1
title: Extend Slide union + answered state with matching types
slice: 1
scenarios: [s12]
status: todo
paths: [libs/types/src/lesson.ts, libs/types/src/activity-answer.ts]
---

## Goal
Extend the `Slide` discriminated union with `MatchingSlide` and grow the answered-state module — the type foundation every other task builds on. Add `MatchingItem`, `MatchingPair`, `MatchingSlide` to `lesson.ts` and grow `ActivitySlide` to `MultipleChoiceSlide | MatchingSlide`. Add `GradedPair`, `MatchingAnswer`, and the `ActivityAnswer = MultipleChoiceAnswer | MatchingAnswer` union to `activity-answer.ts`. Additive only; no existing type changes shape.

## Done criteria
- [ ] Scenario `@s12` answered-state shape (`slideId`, `activityType`, `pairs: GradedPair[]`, `correctPairCount`, `totalPairCount`, `isCorrect`) is expressed by the types
- [ ] `MatchingSlide` matches the spec data contract (left/right items, `correctPairs`, optional `explanation`); invariant documented in a doc-comment
- [ ] `ActivitySlide` and (new) `ActivityAnswer` unions include the matching members and are exported via the `libs/types` barrel
- [ ] `pnpm lint` + `pnpm check-types` green (union stays exhaustive)
- [ ] No hardcoded strings/colors/dimensions

## Notes
Types are plain TS, one concern per file (`global.mdc`). No runtime code. Coordinate field names with R2 (risks R1). Mirrors the existing `MultipleChoiceSlide` / `MultipleChoiceAnswer` shapes.
