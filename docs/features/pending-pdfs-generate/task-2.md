---
id: task-2
title: Types — PdfDocumentSummary + PdfDocumentStatus
slice: 1
scenarios: [s2, s3, s4]
status: todo
paths: [libs/types/src/pdf-document-summary.ts, libs/types/src/index.ts, libs/types/src/index.test.ts]
---

## Goal
Add the plain-TS contract for a PDF-list row:
`PdfDocumentStatus = 'ready' | 'failed' | 'generated'` and
`PdfDocumentSummary = { id: string; filename: string; pageCount: number | null; createdAt: string;
status: PdfDocumentStatus; lessonId: string | null }`. `lessonId` is non-null only when
`status === 'generated'` (the Open-lesson target, @s4/@s7). Status is derived in the DAO from the
view (task-3), not computed in the type. One `type-name.ts` file per the `@helsoft/types`
convention; export through the barrel.

## Done criteria
- [ ] Scenario(s) {s2, s3, s4} supported by the shape (status variants + lessonId)
- [ ] One file `pdf-document-summary.ts`; re-exported from `libs/types/src/index.ts`
- [ ] Barrel coverage assertion in `index.test.ts` (mirrors `lesson-summary` precedent)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
Mirrors `lesson-summary.ts` (camelCase client type mapped from a snake_case row in the DAO).
