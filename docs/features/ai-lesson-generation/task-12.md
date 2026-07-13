---
id: task-12
title: Server error contract + vision fallback + image degradation
slice: 2
scenarios: [s10, s12, s15]
status: done
paths:
  - supabase/functions/generate-lesson/
  - libs/supabase-services/src/services/lesson-generation.placement.ts
  - libs/supabase-services/src/services/lesson-generation.schema.ts
---

## Goal
Make the Edge Function fail cleanly and place hard-to-place images. Add: (a) the server error contract — map every failure to a typed `{ errorCode }` body: `missing_key` (no row from `get_api_key`), `invalid_key` (Groq 401/403), `rate_limited` (429), `timeout`, `generation_failed` (schema/invariant/composition validation failure or other processing error), `document_not_ready` (missing/unowned/`status != 'extracted'`); (b) the **vision fallback** — for images with no anchoring text/metadata, call the vision model (`meta-llama/llama-4-scout-17b-16e-instruct`) with the image bytes to decide placement or drop (@s10); (c) **image degradation** — a missing/unresolvable image ref never fails a slide or the request; the slide is emitted text-only (@s12).

## Atomicity (@s15)
The function is transactional in its *return*: it validates the full deck (schema + composition + invariants) before responding; on any failure it returns a typed error and **no deck** — nothing partial/corrupt is produced or persisted (there is no `lessons` table to half-write, Open decision #5), and the R1 `documents`/`document_images` rows are untouched.

## Done criteria
- [x] Scenario @s15 (each failure variant → typed code, atomic, source intact) covered by unit tests on the pure modules + the function's mapping; @s10 (vision fallback) + @s12 (degradation to text-only) covered by placement-module tests
- [x] Raw Groq/Supabase errors never leak — always a typed `errorCode` (@s8 redaction preserved: no key in any error/log)
- [x] Vision call is invoked **only** for un-anchorable images (bounds cost, risks.md R4/R8)
- [x] Mirror updated into `_shared/`; `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- `missing_key` is the call-time backstop; the primary "no key" UX is R6's `ApiKeyGate`. The client maps `missing_key` to a "add a key" message linking to Settings (task-13).
- Because R6 no longer validates keys on save (task-1 note), `invalid_key` genuinely surfaces here for the first time.
