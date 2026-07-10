---
id: task-15
title: Extraction analytics events
slice: 3
scenarios: [s17]
status: todo
paths: [libs/services/src/services/pdf-extraction.service.ts, libs/study-buddy/src/components/pdf-upload/]
---

## Goal
Emit lightweight, PII-free extraction telemetry so the PRD's funnel (generation success rate starts at upload) is measurable. **Committed Slice-3 scope** — the three events were confirmed at the combined gate (spec Resolved decisions → [Analytics]); they map to scenario @s17.

## Done criteria
- [ ] Emit `pdf_upload_started` (`size_bytes`, `document_id`), `pdf_extraction_succeeded` (`document_id`, `page_count`, `image_count`, `duration_ms`), `pdf_extraction_failed` (`document_id?`, `error_code`, `stage`).
- [ ] **No PII** in any payload: no filename, no file contents, no user email/text — reviewer_security checks this.
- [ ] Events fire from the appropriate layer (service/wiring) without coupling business logic to a specific analytics vendor (thin sink/util).
- [ ] Scenario @s17 covered by tests asserting each event fires at the right lifecycle point (started / succeeded / failed with `error_code`) and that every payload is PII-free.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Confirmed scope (spec Resolved decisions → [Analytics]); the three events are locked, not optional.
- No analytics vendor is installed yet; add a minimal sink to `@helsoft/services` (or reuse whatever the project standardizes on) — do not pull a heavy SDK without justification (reviewer_architecture).
