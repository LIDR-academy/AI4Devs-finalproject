---
id: task-2
title: gradeMultipleChoice pure grader in @helsoft/study-buddy
slice: 1
scenarios: [s3, s4, s7]
status: done
paths:
  - libs/study-buddy/src/grading/grade-multiple-choice.ts
  - libs/study-buddy/src/index.ts
---

## Goal
Implement the pure grading function that turns a `MultipleChoiceSlide` + a chosen option id into a `MultipleChoiceAnswer`. No I/O — the correct answer arrives on the slide — so per `hooks-service-dao.mdc` this needs no DAO/Service/Hook. It lives in the feature lib (`@helsoft/study-buddy`) because it is the app's business logic (`global.mdc`) and the answered-state assembly is consumed by R7/R9.

## Contract (from spec)
```ts
gradeMultipleChoice(slide: MultipleChoiceSlide, selectedOptionId: string): MultipleChoiceAnswer
// - throws if selectedOptionId is not one of slide.options (guards malformed/caller-bug input)
// - isCorrect = selectedOptionId === slide.correctOptionId
// - returns { slideId, activityType:'multiple-choice', selectedOptionId, correctOptionId, isCorrect }
```

## Done criteria
- [ ] @s3 covered: a matching selection yields `isCorrect: true`
- [ ] @s4 covered: a non-matching selection yields `isCorrect: false`
- [ ] @s7 covered: returned object matches `MultipleChoiceAnswer` (all five fields, correct values)
- [ ] Pure/deterministic: no imports of React, Supabase, `fetch`, or any I/O
- [ ] Exported through `libs/study-buddy/src/index.ts`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Throw-on-unknown-option is the domain guard for R7/R9 callers; the UI never triggers it (the component only emits ids it rendered). The full malformed-slide *rendering* path is task-5.
- Keep the function short and revealing; no magic values.
- Depends on task-1 types.
