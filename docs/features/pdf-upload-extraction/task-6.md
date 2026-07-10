---
id: task-6
title: usePdfExtraction hook (React integration, plain-state)
slice: 1
scenarios: [s1, s5]
status: done
paths: [libs/hooks/src/hooks/use-pdf-extraction.ts, libs/hooks/src/hooks/index.ts]
---

## Goal
Create `usePdfExtraction`, the React hook that wraps `PdfExtractionService` for components. It exposes the upload+extract action plus the state the UI renders: the processing stage, the success result, and (in Slice 2) the typed error. Plain-state (`useState`), matching the `useAuth`/`useSession` precedent — not tanstack-query.

## Done criteria
- [x] `usePdfExtraction()` returns `{ extract(input), stage: 'idle'|'processing'|'success'|'error', result, error, reset() }`. Internally resolves `userId` via `useSession()` (so call sites just pass the file input, matching `useAuth().signIn(email, password)`'s no-userId-param precedent).
- [x] Wraps `PdfExtractionService` (never the DAO directly); handles React concerns only.
- [x] Scenarios @s1 (success → `stage: 'success'`, `result` set) / @s5 (`stage: 'processing'` while in flight) covered by `use-pdf-extraction.test.ts` mocking the service.
- [x] Exported through `libs/hooks/src/hooks/index.ts`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [x] No hardcoded strings/colors/dimensions.

## Notes
- Mirror `libs/hooks/src/hooks/use-auth.ts` (plain state for a one-shot mutation with a side effect). Plain-state is **locked** (spec Resolved decisions → [Hook style]); tanstack-query stays deferred (`hooks-service-dao.mdc` reserves it for data-fetching "when first needed").
- Error/retry state is fleshed out in task-12 (Slice 2); keep the return shape ready for it.
