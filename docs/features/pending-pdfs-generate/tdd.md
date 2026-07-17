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

## Full-review CI r1
- RED: LG test `onErrorAction` required vs optional prop; coverage dirs for open-ended/lesson-results/api-key-gate pointed at wrappers with 0 `t()` keys.
- GREEN: optional `onErrorAction?` + `?.()`; retarget dirs → activities/open-ended, components/results-summary, components/api-key-required-notice.

## Full-review CI r1 e2e
- RED: api-key-form/results-summary e2e stale copy; study-buddy MCQ e2e click-to-grade.
- GREEN: e2e → Error `"Couldn't reach the server…"`, saveFailed `"Couldn't save…"/"Try again"`; MCQ select→Submit→assert.

## Full-review r1 fixes
- @s1/@s3/@s4 arch: RED service maps raw rows→status; GREEN move `deriveStatus` DAO→Service; DAO returns `UserDocumentRow[]`.
- @s12 security: RED paginated `storage.list` (>100); GREEN loop list/remove until empty (page 100).
- WCAG 4.1.3: RED PdfDocuments delete banner+announce; GREEN `pdfList.delete.failed` + live region + `announceForAccessibility` (SavedLessons mirror).
- persist minor: RED clear `generation_error_code` on success; GREEN persist (+ edge twin).
- @s21: RED row `accessibilityLabel`; GREEN info View label `filename, statusLabel`.
- perf: RED stable `renderItem`; GREEN memo `PdfDocumentListRow` + `useCallback` handlers.

## Post-review mutation (4 survivors)
- DAO `?? []`: null data → `[]`. List row: latest `onOpenLesson`; delete uses current `item.id` after replace. PdfDocuments: announce on content→content+error transition.
