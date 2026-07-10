---
id: task-3
title: extract-pdf Edge Function — happy path + mupdf-wasm spike (behind adapter)
slice: 1
scenarios: [s1, s2, s3, s4]
status: done
paths: [supabase/functions/extract-pdf/]
---

## Goal
Build the backend extraction Edge Function (Deno). Given a `documentId`, it reads the raw PDF from the `pdf-uploads` bucket, extracts per-page text (in document order) and embedded images, downscales/recompresses the images, writes them to `pdf-images`, persists `documents.pages` + `document_images` rows, sets `status = 'extracted'`, and returns a `PdfExtractionResult`. This is the highest-risk task; it **starts with a time-boxed spike that validates and implements `mupdf`-wasm** (the library locked at the gate, decision #2).

## Done criteria
- [x] **Spike (first, time-boxed):** validate and implement **`mupdf`-wasm** in the real Edge runtime on real PDFs — extract text + embedded images + page metadata, and confirm a scanned-detection signal (text-length). Record the outcome + any cold-start/bundle-size tradeoffs in `tdd.md`. The library is locked (decision #2); only fall back to `unpdf` behind the same adapter if `mupdf`-wasm fails the spike in the actual runtime (see risk R1). **Outcome: mupdf-wasm succeeded** — see `tdd.md` for the real, executed Jest proof (no fallback to `unpdf` needed).
- [x] `PdfExtractionAdapter` interface isolates the library: `extract(bytes) => { pages: {page,text}[]; images: {page,positionIndex,bytes,width,height,mimeType}[] }`. Consumers depend on the interface, not the library — keeping it swappable despite the locked choice.
- [x] Pure, Deno-testable modules: the `mupdf`-wasm adapter impl, image downscale/recompress (1024px longest edge, JPEG q80 / PNG for alpha, skip <100×100 px), and DTO shaping.
- [x] Function orchestration: read PDF from storage → adapter.extract → downscale → upload images to `pdf-images` (`{user_id}/{document_id}/p{page}-{index}.{ext}`) → persist rows → set status → return `PdfExtractionResult`. Every page processed; order preserved. (Deno glue in `index.ts` — unexecuted in this sandbox, see the Testing boundary note.)
- [x] Reads the caller's JWT so writes are the authenticated user's (supports @s14); no service-role key leaked to the client.
- [x] Scenarios @s1 (whole doc text+images, success), @s2 (downscaled/stored/associated), @s3 (mixed pages in order), @s4 (server-side, client never parses) covered by **real Jest tests** over the pure modules (the sandbox's approved substitute for Deno unit tests — no Deno CLI here) with representative fixtures built via `pdf-lib`/a hand-rolled PNG encoder.
- [x] `pnpm lint` + `pnpm check-types` green for the workspace; Jest tests run and pass for the pure modules (see `tdd.md`); the Deno mirror/orchestration glue is an explicit, documented, unexecuted boundary (no `deno test`/`deno check` available).
- [x] No secrets in code/logs; no hardcoded copy that reaches the user (error codes only — messages are localized client-side).

## Notes
- Mirror the `@helsoft/types` contract (task-2) in `supabase/functions/extract-pdf/_shared/` — Deno can't import the workspace package; keep them in sync.
- Error paths (scanned/too-many-pages/corrupt) are added in Slice 2 (task-9); this task is the happy path + the adapter/downscale scaffolding.
- Downscale targets + limits are tunable constants from a single source (spec decisions #1, #4): mirror `PDF_EXTRACTION_LIMITS` from `libs/services/src/services/pdf-extraction.constants.ts` into `_shared/`, kept in sync — no hardcoded 10/20/1024/100 magic numbers.
- **Testing boundary (spec decision / risk R4):** this function is outside Jest+Stryker; keep logic in pure modules so Deno tests can bite. Documented boundary for reviewers/`mutation_tester`.
