# PDF upload & backend content extraction (R1)

**As a** learner
**I want** to upload a PDF and have the backend extract its readable text and embedded images
**so that** I have everything needed to generate a lesson from it, without depending on what device or platform I'm using

## Context
Highest-technical-risk piece of the MVP (PRD.md R1) — build first. Extraction runs entirely server-side (Supabase Edge Function / storage-triggered function), never on the client, so behavior is identical across web, iOS, and Android. Extracted images are persisted to Supabase Storage, downscaled/recompressed to control storage cost and clutter, and tied to their source page/position so lesson generation (R2) can reference them. OCR of scanned/image-only text is explicitly out of scope for v1.

Depends on the PRD's open research spike: evaluating [liteparse](https://github.com/run-llama/liteparse) (and alternatives) for extracting text + embedded images + page/position info in the Edge Function's Deno runtime, and confirming it can detect scanned/image-only PDFs to drive the error path below.

## Acceptance criteria
- Given a PDF, when the user uploads it, then the backend processes the whole document — every page — and extracts both its selectable text and its embedded images, returning success to the client.
- Given a PDF that contains embedded images (diagrams, figures, charts, photos), when extraction runs, then those images are extracted, downscaled/recompressed (reduced dimensions + quality to limit storage cost and clutter), persisted to Supabase Storage, and associated with the page/position they came from so generation can reference them.
- Given a PDF with mixed pages (some text-only, some text+image, some image-only figures), when extraction runs, then text and images are captured from across all pages and kept in document order.
- Extraction logic lives server-side (Edge Function), so behavior is identical regardless of platform (web, iOS, Android) — the client never parses the PDF itself.
- Given an unsupported or image-only/scanned PDF (text rendered as a scanned image), when extraction runs, then the user sees a clear error explaining the file can't be used. (OCR of scanned text is out of scope for v1 — this differs from extracting embedded figures, which is supported.)
- Given a file over the size limit, when the user attempts to upload it, then the upload is rejected with a clear message.

## Notes
- Open decision (PRD): the exact max file size / page count is **TBD**, to be set after the extraction research spike based on real latency/cost testing. Non-blocking for spec purposes, but the reject-with-clear-message behavior itself is in scope now.
- Related PRD requirements this unblocks: R2 (AI lesson generation consumes this extracted text + images).
- No analytics event or feature flag specified yet.
