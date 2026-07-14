---
id: task-5
title: usePdfDocuments hook — reducer state, refetch, deleteDocument
slice: 1
scenarios: [s8, s9, s10, s12, s15, s16]
status: todo
paths: [libs/hooks/src/hooks/use-pdf-documents.ts, libs/hooks/src/hooks/use-pdf-documents.reducer.ts, libs/hooks/src/hooks/use-pdf-documents.types.ts, libs/hooks/src/hooks/use-pdf-documents.test.ts, libs/hooks/src/index.ts]
---

## Goal
React integration over `PdfDocumentsService`, cloning `useLessons` (plain `useReducer` state —
tanstack-query still not installed; mount/refetch request-id guard + `isMounted` ref). Exposes
`{ documents, isLoading, error, refetch, deleteDocument }`. `refetch` re-loads the list — the upload
screen calls it after a new extraction (@s10) and after a generation resolves so the row flips to
"lesson ready" / stays "generation failed" (@s9/@s8). `deleteDocument` delegates to the service and
drops the row from state on success (@s12).

## Done criteria
- [ ] Scenario(s) {s8, s9, s10, s12, s15, s16} covered: Loading→Content/Error, refetch re-loads (row flip @s8/@s9, new doc @s10), delete removes (@s12)
- [ ] `useReducer` (≥3 related fields: documents/isLoading/error) per `state.mdc`
- [ ] Stale-request guard + unmount safety (copy `useLessons` precedent)
- [ ] Uses the service, never the DAO/Supabase directly
- [ ] Barrel export from `@helsoft/hooks`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
`@testing-library/react-native` for the hook test (repo rule). Model on `use-lessons.ts` +
`use-lessons.reducer.ts` + `use-lessons.types.ts` one-to-one.
