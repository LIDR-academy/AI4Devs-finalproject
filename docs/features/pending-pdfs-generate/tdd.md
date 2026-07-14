# TDD log — pending-pdfs-generate (PDF list)

## @s → test map

| @s | Test | File |
|---|---|---|
| @s1/@s17/@s18 | migration: `user_documents` view | `20260714162540_*.sql` |
| @s4/@s19 | migration: `lessons.document_id` FK | same |
| @s2/@s3/@s4 | PdfDocumentSummary status + lessonId | `pdf-document-summary.test.ts` |
| @s1/@s4/@s17/@s18 | DAO list + status derivation | `pdf-documents.dao.test.ts` |
| @s12/@s19 | DAO delete purge | `pdf-documents.dao.test.ts` |
| @s1/@s12 | service validate/normalize | `pdf-documents.service.test.ts` |
| @s8/@s9/@s10/@s15/@s16 | hook Loading/Error/refetch | `use-pdf-documents.test.ts` |
| @s12 | hook deleteDocument | `use-pdf-documents.test.ts` |
| @s1/@s4/@s16/@s17 | integration hook→service→DAO | `pdf-documents.integration.test.ts` |
| @s4/@s9 | persistLesson `document_id` | `lesson-generation.persist.test.ts` |
| @s3/@s8 | markDocumentGenerationFailure | `lesson-generation.persist.test.ts` |
| @s1/@s2/@s3/@s4/@s5/@s6/@s7/@s11 | PdfDocumentListItem fields/actions/delete | `pdf-document-list-item.test.tsx` |
| @s1/@s12/@s13/@s14/@s15/@s16/@s21 | PdfDocumentList states/Dialog/a11y | `pdf-document-list.test.tsx` + e2e |
| @s20 | pdfList.* locale parity en/es/pt/de | `pdf-list-locale-parity.test.ts` |
| @s9 | LessonGeneration onGenerated once on success | `lesson-generation.test.tsx` |
| @s5/@s6/@s7/@s11/@s12/@s13 | PdfDocuments raises/delete/reloadToken | `pdf-documents.test.tsx` |
| @s1/@s5/@s6/@s9/@s10 | upload glue + wiring→DAO integration | `pdf-documents.integration.test.tsx` |

## Slice 1 cycles
- T1 KEEP migration. T2–T6 RED→GREEN types/DAO/service/hook/persist. Gate green.

## Slice 2 cycles
- T7 RED→GREEN PdfDocumentListItem (status→action, conditional delete); Button `accessibilityLabel`; stories + e2e.
- T8 RED→GREEN PdfDocumentList (4 states, FlatList, Dialog confirm/dismiss, a11y announce); stories + e2e.
- T9 RED→GREEN `pdfList.*` keys (en/es/pt/de) + locale-parity coverage.
- Gate: unit + e2e + lint + check-types. No commit (lead after reviewer_slice).

## Slice 3 cycles
- T10 RED→GREEN `onGenerated?` (once on content+lessonId; skip idle/error/re-render/omit).
- T11 RED→GREEN helpers + PdfDocuments wiring (t/date → list; onGenerate/onOpenLesson/delete; reloadToken refetch); stories + e2e.
- T12 RED→GREEN integration glue (Generate/Retry set docId; extract/onGenerated bump token) + `upload.tsx` thin shell.
- Gate: unit + e2e + lint + check-types. No commit (lead after reviewer_slice).
