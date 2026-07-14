# TDD log — pending-pdfs-generate (PDF list)

## @s → test map

| @s | Test | File |
|---|---|---|
| @s1/@s17/@s18 | migration `user_documents` | `20260714162540_*.sql` |
| @s4/@s19 | migration `lessons.document_id` | same |
| @s2/@s3/@s4 | PdfDocumentSummary | `pdf-document-summary.test.ts` |
| @s1/@s4/@s17/@s18 | DAO list | `pdf-documents.dao.test.ts` |
| @s12/@s19 | DAO delete | `pdf-documents.dao.test.ts` |
| @s1/@s12 | service | `pdf-documents.service.test.ts` |
| @s8/@s9/@s10/@s15/@s16 | hook load/error/refetch | `use-pdf-documents.test.ts` |
| @s12 | hook delete | `use-pdf-documents.test.ts` |
| @s1/@s4/@s16/@s17 | hook→DAO integration | `pdf-documents.integration.test.ts` |
| @s4/@s9/@s3/@s8 | persist | `lesson-generation.persist.test.ts` |
| @s1–@s7/@s11 | list-item | `pdf-document-list-item.test.tsx` |
| @s1/@s12–@s16/@s21 | list | `pdf-document-list.test.tsx` + e2e |
| @s20 | locale parity | `pdf-list-locale-parity.test.ts` |
| @s9 | onGenerated | `lesson-generation.test.tsx` |
| @s5–@s7/@s11–@s13 | PdfDocuments | `pdf-documents.test.tsx` |
| @s1/@s5/@s6/@s9/@s10 | upload glue | `pdf-documents.integration.test.tsx` |

## Slices 1–3
Data → UI → wiring. Gates green.

## Mutation r1
DAO/hook/LG/PdfDocuments/list/Button kill tests. 95→32 survivors.

## Mutation r2 (final pre-review)
- Hook: stable refetch/delete identities; refetch after rerender (kills `["Stryker…"]` deps).
- Button: default variant fg color; all named variants have defined label color.
- List-item: info `flex:1`. List: root/list `flex:1`, errorBanner bg, stable keyExtractor.
- PdfDocuments: null lessonId no throw; root `flex:1`. LG: stable onCompositionChange.
- True equivalents → `mutation.md` (React 19 unmount no-ops; Unistyles variant colors absent in Jest flatten; `++`/`--` requestId; `[load]→[]` when load stable).
