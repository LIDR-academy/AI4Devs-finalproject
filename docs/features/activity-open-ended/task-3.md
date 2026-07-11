---
id: task-3
title: OpenEnded organism — component-split, Content unanswered/submitted
slice: 1
scenarios: [s1, s2, s3, s4, s10]
status: todo
paths: [libs/activities/src/organisms/open-ended/open-ended.tsx, libs/activities/src/organisms/open-ended/open-ended.types.ts, libs/activities/src/organisms/open-ended/use-open-ended.ts, libs/activities/src/organisms/open-ended/open-ended.helpers.ts, libs/activities/src/organisms/open-ended/open-ended.test.tsx, libs/activities/src/organisms/open-ended/use-open-ended.test.ts, libs/activities/src/organisms/index.ts]
---

## Goal
Build presentational `OpenEnded` in `@helsoft/activities` with **component-split from day one** per `component-split.mdc`. `use-open-ended` owns draft text + submitted/locked (and `initialSubmittedAnswer` rehydrate); handlers stay in `.tsx`; pure transforms in `.helpers.ts` when needed. Unanswered: multiline editable input, Submit always enabled, model hidden, Enter = newline (not submit — @s10). Submitted: read-only input, stacked your-answer + model-answer labels, optional explanation, no correct/incorrect, no self-mark. Props per spec. Export via organisms barrel.

## Done criteria
- [ ] Scenarios `@s1`–`@s4`, `@s10` covered by co-located suites
- [ ] Folder has `.tsx` / `.types.ts` / `use-open-ended.ts` / helpers-as-needed + tests per file
- [ ] Handlers in component; state/derived/effects in hook; pure in helpers
- [ ] `use-open-ended` is UI co-location only (not `@helsoft/hooks` data-layer)
- [ ] Enter/return inserts newline and does not call `onSubmit` (@s10)
- [ ] Atomic-design + layering (organism depends only on `@helsoft/components`)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions (labels + theme)

## Notes
Empty/Error + empty-submit polish in task-5. i18n/a11y/stories/e2e in slice 3. Mirror FITB interaction surface but no grade UI; split like flashcard story notes. Inverse of FITB Enter-submit (@s10).
