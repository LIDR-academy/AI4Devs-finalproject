---
id: task-7
title: PdfDocumentListItem molecule (filename/status/date/pages + per-status action + conditional delete)
slice: 2
scenarios: [s1, s2, s3, s4, s5, s6, s7, s11]
status: done
paths: [libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.tsx, libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.types.ts, libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.stories.tsx, libs/components/src/molecules/pdf-document-list-item/pdf-document-list-item.test.tsx, libs/components/src/index.ts]
---

## Goal
Presentational molecule for one PDF row, mirroring `LessonListItem`: shows filename, a pre-formatted
status label, created-date label, and page-count label (all copy arrives as props — never calls
`t`). A single **primary action** whose label + handler depend on status:
`ready → Generate (onGenerate)`, `failed → Retry (onGenerate)`, `generated → Open lesson
(onOpenLesson)`. A **delete** affordance is rendered **only** when the row has no lesson
(`ready`/`failed`) and `onDelete` is provided (@s11).

## Done criteria
- [x] Scenario(s) {s1, s2, s3, s4, s5, s6, s7, s11} covered: all four fields; each status's label+action; delete hidden when `generated`
- [x] Prop-driven (declares a `Props` type); no `t`, no date formatting inside
- [x] Primary action + delete expose accessible names (from props) — feeds @s21
- [x] `.stories.tsx` with ready / failed / generated variants
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [x] No hardcoded strings/colors/dimensions (theme tokens only)

## Notes
Copy `lesson-list-item` structure; add the status line, pageCount line, and the status→action
mapping. Atomic-design: molecule (composes `Button`/atoms). No "selected/highlight" concept — the
old select-as-default model is gone (row acts via its button).
