---
id: task-3
title: FillInTheBlank organism — Content states, inline blank, Submit + Enter
slice: 1
scenarios: [s1, s2, s3, s4, s5, s7]
status: todo
paths: [libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.tsx, libs/activities/src/organisms/fill-in-the-blank/fill-in-the-blank.test.tsx, libs/activities/src/organisms/index.ts]
---

## Goal
Build presentational `FillInTheBlank` in `@helsoft/activities` (atomic-design organism, `@helsoft/components` tokens via unistyles). Controlled: `value` / `result` / `onChangeValue` / `onSubmit`. Split `content` on `____` for inline TextInput. Unanswered: editable, Submit always enabled, Enter/return → `onSubmit`. Answered: read-only input, non-interactive Submit, correct/incorrect banner (text+icon), reveal `acceptedAnswerShown` when incorrect, optional explanation. Props per spec. Export via organisms barrel.

## Done criteria
- [ ] Scenarios `@s1`–`@s5`, `@s7` covered by `fill-in-the-blank.test.tsx`
- [ ] Controlled/presentational; locks from `result`; no placeholder; respects `maxLength`
- [ ] Enter and Submit invoke the same `onSubmit`
- [ ] Atomic-design + layering (organism depends only on `@helsoft/components`)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions (labels + theme)

## Notes
Empty/Error + empty-submit polish in task-5. i18n/a11y/stories/e2e in slice 3. Mirror Matching/MultipleChoice structure.
