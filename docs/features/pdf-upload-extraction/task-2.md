---
id: task-2
title: Extraction contract types in @helsoft/types
slice: 1
scenarios: [s1, s2, s3]
status: done
paths: [libs/types/src/pdf-extraction.ts, libs/types/src/index.ts]
---

## Goal
Define the shared, library-agnostic contract that the client layers, the Edge Function, and R2 (generation) all agree on: the extraction result DTO, the extracted-image reference, and the error-code union. This is the seam that lets the parsing library be swapped without touching consumers.

## Done criteria
- [x] `libs/types/src/pdf-extraction.ts` exports plain TS types (no framework), one file per `.agents/rules/global.mdc`:
  - `ExtractedImageRef` — `{ id, documentId, pageNumber, positionIndex, storagePath, width, height, mimeType, description?: string }`.
  - `PdfExtractionResult` — `{ documentId, filename, pageCount, imageCount, pages: { page: number; text: string }[], images: ExtractedImageRef[] }`.
  - `PdfExtractionErrorCode` — union: `'unsupported_file_type' | 'file_too_large' | 'too_many_pages' | 'scanned_or_image_only' | 'corrupt_or_unreadable' | 'extraction_failed' | 'network_error' | 'unauthenticated'`.
  - `PdfExtractionLimits` — `{ maxSizeBytes: number; maxPages: number }`: the shape of the single-source limits constant.
- [x] Re-exported from `libs/types/src/index.ts` barrel.
- [x] Scenarios @s1/@s2/@s3 are represented in the result shape (per-page ordered text + per-image page/position); no dedicated test file (mirrors the untested `auth-error.ts`/`lesson.ts` precedent — plain types, no runtime behavior) — the shape is exercised transitively by every consumer's tests (DAO/service/adapter/DTO).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [x] No hardcoded strings/colors/dimensions.

## Notes
- Mirror the existing `libs/types/src/lesson.ts` / `auth-error.ts` style (plain exported `type`s).
- This file holds only the **shape** `PdfExtractionLimits`. The locked **values** (10 MB / 20 pages, spec decision #1) live in the constant `PDF_EXTRACTION_LIMITS` in `libs/services/src/services/pdf-extraction.constants.ts` — keep the value out of the types lib (plain types only).
- The Edge Function (Deno) can't import the workspace package directly; it mirrors this contract (and the limits constant) in `supabase/functions/extract-pdf/_shared/` — keep this file the source of truth and keep them in sync (noted in task-3).
