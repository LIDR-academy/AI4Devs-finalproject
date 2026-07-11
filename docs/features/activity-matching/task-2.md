---
id: task-2
title: Pure grader gradeMatching + isMatchingSlideValid
slice: 1
scenarios: [s9, s10, s12, s15]
status: todo
paths: [libs/study-buddy/src/grading/grade-matching.ts, libs/study-buddy/src/grading/grade-matching.test.ts, libs/study-buddy/src/index.ts]
---

## Goal
Implement the pure grading logic in `@helsoft/study-buddy` (no I/O). `isMatchingSlideValid(slide)` returns whether the slide is renderable/gradable (both columns non-empty, equal length, `correctPairs` a perfect one-per-left matching whose ids all reference distinct items). `gradeMatching(slide, pairs)` returns a `MatchingAnswer`: each learner pair correct iff an identical `{leftId,rightId}` is in `slide.correctPairs`; `correctPairCount`/`totalPairCount` per partial-credit rule; `isCorrect` iff all correct. Throws on an invalid slide or a pair referencing an unknown id. Export from the study-buddy barrel beside `grade-multiple-choice`.

## Done criteria
- [ ] Scenarios `@s9` (all correct), `@s10` (mixed), `@s12` (partial counts + `isCorrect`), `@s15` (invalid slide → `isMatchingSlideValid` false / grader throws) covered by unit tests, TDD-first
- [ ] Grading is order-independent (left-first and right-first pairs grade identically)
- [ ] Defensive throw on unknown-id pair and on invalid slide is tested
- [ ] Pure function, no React, no DAO/service (`hooks-service-dao.mdc`: no I/O ⇒ no layer)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` (study-buddy) green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Mirrors `grade-multiple-choice.ts`. `gradeMatching` is called only with a full pairing (Submit gate); the throw guards R7/R9 callers, not the happy UI path. `isMatchingSlideValid` also drives the wrapper's `unavailable` prop (task-4).
