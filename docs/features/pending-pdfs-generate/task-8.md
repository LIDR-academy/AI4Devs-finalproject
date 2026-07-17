---
id: task-8
title: PdfDocumentList organism (Loading/Content/Empty/Error, FlatList, Dialog confirm)
slice: 2
scenarios: [s1, s12, s13, s14, s15, s16, s21]
status: done
paths: [libs/components/src/organisms/pdf-document-list/pdf-document-list.tsx, libs/components/src/organisms/pdf-document-list/pdf-document-list.types.ts, libs/components/src/organisms/pdf-document-list/use-pdf-document-list.ts, libs/components/src/organisms/pdf-document-list/pdf-document-list.stories.tsx, libs/components/src/organisms/pdf-document-list/pdf-document-list.test.tsx, libs/components/src/index.ts]
---

## Goal
Presentational organism cloning `LessonList`: renders one of Loading / Content / Empty / Error.
Content = `FlatList` of `PdfDocumentListItem` (windowed), passing through `onGenerate`,
`onOpenLesson`, and `onDelete`. Delete confirms via the shared `Dialog` organism before calling
`onDelete` (@s12/@s13). Error shows a retry `Button` (@s16). A co-located `use-pdf-document-list`
hook owns the delete-confirm open state + a11y announcements for the three non-content states
(@s21), mirroring `useLessonList`.

## Done criteria
- [x] Scenario(s) {s1, s12, s13, s14, s15, s16, s21} covered by `.test.tsx`
- [x] Four states render; Empty invites nothing destructive; Error has a retry action
- [x] Delete uses shared `Dialog`; confirm calls `onDelete`, dismiss does not (@s13)
- [x] Loading/Empty/Error announced to assistive tech; list + controls have roles/labels (@s21)
- [x] `.stories.tsx` covering all four states + mixed-status content
- [x] Prop-driven (row content copy from props; state copy from `t` like `LessonList`)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; no hardcoded colors/dims

## Notes
Structure/tests one-to-one with `lesson-list.tsx` + `use-lesson-list.ts`. `component-split.mdc`:
tsx / types / hook split. Playwright e2e for @s21 per the `storybook-e2e-tests` skill.
