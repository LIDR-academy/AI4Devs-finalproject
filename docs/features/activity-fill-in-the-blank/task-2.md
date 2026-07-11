---
id: task-2
title: Pure grader normalize + gradeFillInTheBlank + isFillInTheBlankSlideValid
slice: 1
scenarios: [s2, s3, s6, s8, s9, s10, s11, s12]
status: done
paths: [libs/study-buddy/src/grading/grade-fill-in-the-blank.ts, libs/study-buddy/src/grading/grade-fill-in-the-blank.test.ts, libs/study-buddy/src/index.ts]
---

## Goal
Implement pure grading in `@helsoft/study-buddy` (no I/O). `isFillInTheBlankSlideValid(slide)` — non-empty `acceptedAnswers` (every entry non-empty string) AND `content` contains exactly one `____`. `normalizeFillInAnswer(raw)` — trim + lowercase + collapse `/\s+/` + NFD strip combining marks. `gradeFillInTheBlank(slide, submittedAnswer)` — compare normalized input to each normalized accepted; any match → correct; `acceptedAnswerShown` = matched accepted when correct else `acceptedAnswers[0]`; empty raw → incorrect; throws if slide invalid. Export from study-buddy barrel.

## Done criteria
- [ ] Scenarios `@s2`/`@s3`/`@s6`/`@s8`/`@s9`/`@s10`/`@s11`/`@s12` covered TDD-first (correct, incorrect+`[0]`, empty submit, normalize outline, multi-accepted + matched `acceptedAnswerShown`, answer shape with concrete `acceptedAnswerShown` rules, invalid → valid=false for empty list **or** any empty entry / throw)
- [ ] Pure functions, no React, no DAO/service
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Mirrors `grade-multiple-choice` / `grade-matching`. Wrapper uses `isFillInTheBlankSlideValid` for `unavailable` (task-4/5).
