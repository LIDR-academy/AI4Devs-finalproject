---
id: task-13
title: Client error normalization + hook retry + Panel Error state + error integration
slice: 2
scenarios: [s12, s15]
status: todo
paths:
  - libs/supabase-services/src/services/lesson-generation.service.ts
  - libs/hooks/src/hooks/use-lesson-generation.ts
  - libs/components/src/organisms/lesson-generation-panel/
  - libs/study-buddy/src/components/lesson-generation/
---

## Goal
Wire the failure path end to end on the client. `LessonGenerationService` normalizes every DAO-thrown cause — the function's typed `{ errorCode }` (read off `FunctionsHttpError.context`) or a transport failure (`FunctionsFetchError`/`FunctionsRelayError` → `network_error`) — into the typed `GenerationErrorCode` union, so the UI never branches on raw errors (mirrors `PdfExtractionService.normalizeExtractionError`). The hook exposes `error` + `retry()`; the `LessonGenerationPanel` gains its **Error** state; the wiring maps each code to its `generation.error.*` message + the right recovery affordance.

## Recovery per code (spec.md error contract)
- `missing_key` / `invalid_key` → message + link to Settings.
- `document_not_ready` → "re-upload".
- `rate_limited` / `timeout` / `generation_failed` / `network_error` → Retry (re-invoke with the same request).
- `unauthenticated` → sign in.

## Done criteria
- [ ] Scenario @s15 (readable error per failure, no crash) + @s12 (a degraded-image deck still succeeds, no error) covered across `lesson-generation.service.test.ts`, `use-lesson-generation.test.ts`, `lesson-generation-panel.test.tsx`, and the error integration test
- [ ] Error state announced to assistive tech (`role="alert"` / assertive live region; mirrors `PdfUploadPanel`) — fuller a11y in task-15
- [ ] Retry reuses the same `documentId`/`composition` (no duplicate side effects)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green; no hardcoded strings/colors/dimensions

## Notes
- Error → i18n key map lives in the wiring layer as a full `Record<GenerationErrorCode, string>` so TS enforces exhaustiveness (mirrors `UPLOAD_ERROR_KEYS`).
