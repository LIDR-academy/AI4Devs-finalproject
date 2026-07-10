---
id: task-9
title: Server error contract — scanned / page-limit / corrupt detection + typed errors
slice: 2
scenarios: [s8, s11, s12, s14]
status: todo
paths: [supabase/functions/extract-pdf/, libs/services/src/services/pdf-extraction.service.ts]
---

## Goal
Make the backend fail cleanly and typed. The `extract-pdf` function detects and rejects the server-side failure modes with a `PdfExtractionErrorCode`, sets `documents.status = 'failed'` + `error_code`, and retains no usable source. `PdfExtractionService` normalizes the function/transport responses into the typed union the UI consumes.

## Done criteria
- [ ] Scanned-detection heuristic: total extracted text below a tunable threshold ⇒ `scanned_or_image_only`. *(→ @s8)*
- [ ] Page-count guard: `page_count > maxPages` ⇒ `too_many_pages`, using the locked **20-page** limit from `PDF_EXTRACTION_LIMITS`. *(→ @s11)*
- [ ] Parse/open failure (damaged/encrypted/unparseable) ⇒ `corrupt_or_unreadable`. *(→ @s12)*
- [ ] Generic processing/timeout/image failure ⇒ `extraction_failed`; missing/invalid session ⇒ `unauthenticated` (supports @s14 denial).
- [ ] On any failure: `status='failed'`, `error_code` set, no partial `document_images`/usable `pages` retained (cleanup or don't-commit).
- [ ] `PdfExtractionService` maps function/transport results into `PdfExtractionErrorCode` so the UI never sees raw errors; unit-tested against representative shapes.
- [ ] Scenarios @s8/@s11/@s12 covered by Deno unit tests (heuristic + guards over fixtures) + `pdf-extraction.service.test.ts` (normalization); @s14 unauthenticated path covered.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green (+ Deno tests for the function).
- [ ] Error **codes** only cross the boundary — user-facing messages are localized client-side (task-13).

## Notes
- The **size/page limits are locked** (10 MB / 20 pages, spec decision #1) and come from the single-source `PDF_EXTRACTION_LIMITS` (mirrored into the function's `_shared/`). The **scanned-detection threshold** is a separate heuristic constant (risk R3) — keep it single-source and tunable; retune after the task-3 spike on real files.
- Keep detection logic in pure Deno-testable modules (risk R4).
- `network_error` (client transport) is handled client-side in the hook/service (task-12); this task owns the server + normalization side.
