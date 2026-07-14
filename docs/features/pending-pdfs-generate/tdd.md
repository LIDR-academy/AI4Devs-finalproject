# TDD log — pending-pdfs-generate (PDF list)

## @s → test map (slice 1)

| @s | Test | File |
|---|---|---|
| @s1/@s17/@s18 | migration: `user_documents` view (`status='extracted'`, `security_invoker`) | `20260714162540_user_documents_and_lesson_link.sql` |
| @s4/@s19 | migration: `lessons.document_id` FK on delete set null; RLS via invoker | same |
| @s2/@s3/@s4 | PdfDocumentSummary status variants + lessonId | `pdf-document-summary.test.ts`, `index.test.ts` |
| @s1/@s4/@s17/@s18 | getDocuments from view; status derivation; no user_id filter | `pdf-documents.dao.test.ts` |
| @s12/@s19 | deleteDocument purges storage then row by id | `pdf-documents.dao.test.ts` |
| @s1/@s12 | service delegates + validates blank id + normalizes errors | `pdf-documents.service.test.ts` |
| @s8/@s9/@s10/@s15/@s16 | hook Loading/Error/refetch/stale-guard | `use-pdf-documents.test.ts` |
| @s12 | deleteDocument drops row from state | `use-pdf-documents.test.ts` |
| @s1/@s4/@s16/@s17 | integration hook→service→DAO | `pdf-documents.integration.test.ts` |
| @s4/@s9 | persistLesson writes `document_id` | `lesson-generation.persist.test.ts` |
| @s3/@s8 | markDocumentGenerationFailure updates `generation_error_code` | `lesson-generation.persist.test.ts` |

## Slice 1 cycles

### Task-1
- KEEP migration: `document_id` FK, `generation_error_code`, `user_documents` view + GRANTs.

### Task-2
- RED→GREEN PdfDocumentSummary/Status + barrel assertion.

### Task-3
- RED→GREEN PdfDocumentsDao list (derive ready/failed/generated) + delete purge.

### Task-4
- RED→GREEN PdfDocumentsService validate/normalize + barrel.

### Task-5
- RED→GREEN usePdfDocuments reducer/hook + integration chain.

### Task-6
- RED→GREEN persistLesson `document_id`; markDocumentGenerationFailure; Edge + Deno mirror.

### Gate
- Unit suites green; lint + check-types clean. No commit (lead after reviewer_slice).
