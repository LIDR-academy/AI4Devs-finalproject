---
feature: pdf-upload-extraction
story: user-stories/pdf-upload-extraction.md
status: approved
---

# Spec — pdf-upload-extraction

## Summary
A learner uploads a PDF and the **backend** turns it into structured lesson source: the readable text of every page (kept in document order) plus every embedded image (diagram, figure, chart, photo), downscaled/recompressed and persisted to Supabase Storage, each tied to the page and position it came from. Extraction runs entirely in a Supabase **Edge Function** (Deno) — never on the client — so behavior is identical on web, iOS, and Android. The client's job is only to pick a file, validate it cheaply, upload it, trigger the function, and render one of four states (Empty / Loading / Content / Error). This is PRD **R1**, the highest-technical-risk piece of the MVP and the input R2 (AI lesson generation) consumes.

The feature is deliberately narrow: extract and persist text + images and return a typed result or a typed error. It does **not** generate a lesson, call any AI provider, or OCR scanned text — those are out of scope. The presentational upload UI lives in `@helsoft/components`, the feature wiring in `@helsoft/study-buddy`, and the app screen (`apps/app-study-buddy/src/app/(app)/upload.tsx`, already a stub) stays a thin shell — mirroring the established `LanguageSelector` → `LanguageSettings` → screen and `LoginForm` → `SignInForm` → screen splits.

## User stories
- As a **learner**, I want **to upload a PDF and have the backend extract its readable text and embedded images**, so that **I have everything needed to generate a lesson from it, regardless of the device or platform I'm using**.

## Context already in place (this feature builds on, does NOT rebuild)
- **Auth + session** — `useSession()` (`@helsoft/hooks`) and the `Stack.Protected` guards keep `/(app)/upload` behind login. Upload assumes an authenticated user; `auth.uid()` scopes all persisted rows and storage objects (RLS).
- **Upload screen stub** — `apps/app-study-buddy/src/app/(app)/upload.tsx` renders `ScreenContainer` + a placeholder `t('upload.intro')`. This feature replaces the placeholder body with the `PdfUpload` feature component.
- **Reusable UI primitives** — `Card`, `Button`, `Icon`, `ProgressIndicator` (atoms) and `ScreenContainer` (template) already exist and are reused; the upload panel composes them rather than introducing ad-hoc UI.
- **Supabase client** — `getSupabase()` (`@helsoft/supabase-services`) is initialized at startup; DAOs call it for Storage upload and Edge Function invoke.
- **Layering + i18n conventions** — `Component → Hook → Service → DAO`, kebab-case files, `@helsoft/localization` `t()` with `en/es/pt/de` bundles.

What this feature **adds**: a DB migration (schema + storage buckets + RLS), the `extract-pdf` Edge Function, a `pdf-extraction` contract type, `PdfUploadDao` + `PdfExtractionService` + `usePdfExtraction`, the `PdfUploadPanel` presentational organism (4 states), the `PdfUpload` wiring component, the `upload.*` i18n strings, and extraction analytics.

## Processing model (the sequence extraction follows)
1. **Pick** — client picks a PDF (`expo-document-picker`; on web a `File`/`Blob`, on native a file URI read via `expo-file-system`).
2. **Pre-validate (client, fast reject)** — reject non-PDF (`unsupported_file_type`) and over-size files (`file_too_large`) before any network work.
3. **Upload** — `PdfUploadDao` writes the raw PDF to the private `pdf-uploads` bucket at `{user_id}/{document_id}/source.pdf` and inserts a `documents` row with `status = 'processing'`.
4. **Invoke** — the client calls `functions.invoke('extract-pdf', { documentId })` and **awaits the typed result synchronously** (chosen over a storage-trigger; see Resolved decisions).
5. **Extract (server)** — the function reads the PDF from storage, extracts per-page text (in document order) and embedded images, applies the scanned-detection heuristic, downscales/recompresses images, writes them to the `pdf-images` bucket, persists text + image rows, and sets `status = 'extracted'` or `status = 'failed'` with an `error_code`.
6. **Render** — the client maps the typed success/error into the 4 UI states.

## Acceptance criteria (Given/When/Then)
- **AC1** — Given a text+image PDF, When the learner uploads it, Then the backend processes **every page**, extracts both selectable text and embedded images, and returns success to the client. *(→ @s1)*
- **AC2** — Given a PDF containing embedded images, When extraction runs, Then each image is extracted, **downscaled/recompressed**, persisted to Supabase Storage, and **associated with the page and position** it came from so generation can reference it. *(→ @s2)*
- **AC3** — Given a PDF with mixed pages (text-only, text+image, image-only figures), When extraction runs, Then text and images are captured across all pages and kept in **document order**. *(→ @s3)*
- **AC4** — Given any client platform (web/iOS/Android), When the learner uploads, Then extraction is performed by the **Edge Function** and the client receives the result **without parsing the PDF locally** (identical behavior everywhere). *(→ @s4)*
- **AC5** — Given an upload/extraction is in flight, When it has not resolved, Then the UI shows a **Loading** state (progress affordance) and the submit/upload control is disabled until it resolves. *(→ @s5)*
- **AC6** — Given extraction succeeds, When the result returns, Then the UI shows a **Content** state summarizing the source (filename, page count, number of images extracted) with a continue affordance. *(→ @s6)*
- **AC7** — Given no file has been chosen yet, Then the UI shows an **Empty/pristine** state with a "choose a PDF" affordance and the size/page constraints, the upload control disabled, and no error. *(→ @s7)*
- **AC8** — Given an image-only / scanned PDF (text rendered as a scanned image, no extractable text), When extraction runs, Then the learner sees a clear error explaining the file can't be used (OCR is out of scope for v1) and no lesson source is retained as usable. *(→ @s8)*
- **AC9** — Given a file that is not a PDF, When the learner attempts to upload it, Then it is rejected client-side with a clear "PDF only" message before any upload. *(→ @s9)*
- **AC10** — Given a file over the size limit, When the learner attempts to upload it, Then it is rejected client-side with a clear message and no upload occurs. *(→ @s10)*
- **AC11** — Given a PDF whose page count exceeds the limit, When extraction runs, Then the backend rejects it with a clear "too many pages" message. *(→ @s11)*
- **AC12** — Given a corrupt, password-protected, or otherwise unreadable PDF, When extraction runs, Then the learner sees a clear error and no partial/usable source is retained. *(→ @s12)*
- **AC13** — Given a transient network/transport failure during upload or invoke, When it occurs, Then the learner sees a **retryable** error; When they retry and the network is available, Then extraction completes and the Content state is shown. *(→ @s13)*
- **AC14** — Given the learner is authenticated, When extraction persists results, Then the raw PDF, extracted images, and rows are **scoped to `auth.uid()`** and unreachable by other users (RLS); an unauthenticated request cannot upload or extract. *(→ @s14)*
- **AC15** — Given a supported app locale, When the learner views the upload flow, Then all labels, hints, button text, progress copy, and error messages render from the active locale bundle (no hardcoded strings). *(→ @s15)*
- **AC16** — Given the upload UI, Then the picker and upload controls expose accessible labels/roles, the loading progress is announced, and errors are announced to assistive technology. *(→ @s16)*

## UI states (PdfUploadPanel organism)
| State | Trigger | Notes |
|---|---|---|
| Empty | No file chosen (pristine) | "Choose a PDF" affordance; hint shows max size (10 MB) + max pages (20); upload control disabled; no error. *(→ @s7)* |
| Loading | File chosen and upload+invoke in flight | Indeterminate `ProgressIndicator` (server time is unknown); controls disabled; copy like "Extracting…"; resolves to Content or Error. *(→ @s5)* |
| Content | `PdfExtractionService.extract` resolves success | Summary: filename, page count, images extracted; primary CTA to continue (to generation — R2, out of scope here, so the CTA target is a placeholder/next-step hook). *(→ @s6)* |
| Error | Any `PdfExtractionErrorCode` (client pre-check or server result) | Clear message per code; a **retry**/"choose another file" affordance; error announced to assistive tech; panel returns to a usable state. *(→ @s8–@s13)* |

## Error contract
`PdfExtractionService` normalizes every failure — client pre-check, transport, and server result — into a typed `PdfExtractionErrorCode` (discriminated type in `@helsoft/types/pdf-extraction`), so the UI never branches on raw Supabase/function errors.

| Code | Cause | Detected | User-facing message (i18n key) | Retry |
|---|---|---|---|---|
| `unsupported_file_type` | File is not a PDF (mime/extension/magic bytes) | Client pre-check (+ server backstop) | `upload.error.unsupportedType` → "Only PDF files are supported" | Choose a PDF |
| `file_too_large` | File exceeds the size limit | Client pre-check (+ server authoritative) | `upload.error.fileTooLarge` → "This file is too large (max 10 MB)" | Choose a smaller file |
| `too_many_pages` | Page count exceeds the limit | Server (after parse) | `upload.error.tooManyPages` → "This PDF has too many pages (max 20)" | Choose a shorter PDF |
| `scanned_or_image_only` | No extractable text (scanned/image-only) | Server (scanned-detection heuristic) | `upload.error.scannedNotSupported` → "This looks like a scanned PDF; we can't read its text yet" | Choose a text-based PDF |
| `corrupt_or_unreadable` | Damaged, encrypted, or unparseable | Server | `upload.error.corrupt` → "This PDF couldn't be opened" | Choose another file |
| `extraction_failed` | Server/processing failure, timeout, image error | Server / invoke | `upload.error.extractionFailed` → "Something went wrong while reading your PDF" | Retry |
| `network_error` | Transport failure / offline during upload or invoke | Client | `upload.error.network` → "Network error" | Retry when online |
| `unauthenticated` | No active session | Client / server | `upload.error.unauthenticated` → "Please sign in to upload" | Sign in |

> The user-facing copy above shows the max size/pages via the single-source constant (see *Size / page limits*); the localized strings interpolate `{{maxMb}}` / `{{maxPages}}` (task-13) rather than hardcoding "10"/"20".

## Data model & storage (decided)
**Storage buckets (both private):**
- `pdf-uploads` — raw uploaded PDFs. Object path `{user_id}/{document_id}/source.pdf`.
- `pdf-images` — extracted, downscaled images. Object path `{user_id}/{document_id}/p{page}-{index}.{ext}`.
- Storage RLS policies scope objects by the leading `{user_id}` path segment = `auth.uid()`. Client renders images via short-lived **signed URLs** (buckets are private).

**Tables:**
- `documents` — `id uuid pk`, `user_id uuid` (fk `auth.users`), `filename text`, `size_bytes int`, `page_count int`, `status text` (`processing` | `extracted` | `failed`), `error_code text null`, `pages jsonb` (ordered `[{ page:int, text:string }]`), `created_at timestamptz`. *(Per-page text stored as an ordered JSONB array — generation reads it whole; a normalized `document_pages` table is the alternative if per-page querying is later needed.)*
- `document_images` — `id uuid pk`, `document_id uuid` (fk `documents`), `page_number int`, `position_index int` (order on the page), `storage_path text`, `width int`, `height int`, `mime_type text`, `description text null` (for R2 image-placement metadata), `created_at timestamptz`.
- **RLS** on both tables: `user_id = auth.uid()` (documents) / owner-of-parent-document (images), all four commands least-privilege.

## Image downscale/recompress targets (decided)
- Longest edge capped at **1024 px**, aspect ratio preserved, never upscaled.
- Encode as **JPEG quality ~80** (PNG only when the source has an alpha channel).
- **Skip decorative images**: drop any extracted image smaller than **100×100 px** (bullets, rules, icons) to reduce storage and on-slide clutter.
- (WebP would compress better but is deferred — Deno image-encoding WebP support is uncertain; JPEG/PNG is the safe MVP default.)

## Size / page limits (decided)
- **Max file size: 10 MB** (well under the 50 MiB Supabase Storage bucket cap in `config.toml`).
- **Max page count: 20 pages.**
- **Single source of truth:** both live in one constant `PDF_EXTRACTION_LIMITS` (shape typed by `PdfExtractionLimits` in `@helsoft/types/pdf-extraction`, task-2) defined in **`libs/supabase-services/src/services/pdf-extraction.constants.ts`** and re-exported through the `@helsoft/supabase-services` barrel. The client size pre-check (task-10), the UI constraints hint (interpolated `{{maxMb}}`/`{{maxPages}}` via the wiring layer, task-11/task-13), and the server page-count guard all read from it. Because the Edge Function (Deno) cannot import the workspace package, it **mirrors** this constant in `supabase/functions/extract-pdf/_shared/` and is kept in sync — the same mirroring rule as the contract types (task-2/task-3). No scattered magic numbers (per `.agents/rules/tdd.md`).
- These are conservative MVP ceilings, kept tunable so the R1 latency/cost spike can retune the numbers without touching test structure — tests assert the *reject-with-a-clear-message* behavior, not the literal value.

## Analytics events (decided — included)
The PRD's headline metric (generation success rate) starts at upload, so these lightweight, **PII-free** extraction events are included as committed Slice-3 scope (task-15). This is an added, human-approved scope item beyond the story's numbered ACs and maps to scenario **@s17**.

| Event | Trigger | Properties (no PII, no filename, no content) |
|---|---|---|
| `pdf_upload_started` | Upload begins (after client pre-validation passes) | `size_bytes`, `document_id` |
| `pdf_extraction_succeeded` | Server returns success | `document_id`, `page_count`, `image_count`, `duration_ms` |
| `pdf_extraction_failed` | Any typed error | `document_id?`, `error_code`, `stage` (`client` \| `server`) |

## Feature flags
None for MVP (consistent with `login-and-logout`). *(Optional: a `pdf_upload_enabled` kill-switch could gate rollout; not requested — none for MVP.)*

## Out of scope / non-goals
- **AI lesson generation** (R2) and any AI-provider/Vercel-AI-SDK call — this feature only produces the extracted source it consumes.
- **OCR of scanned/image-only text** — explicitly out of scope for v1 (drives the `scanned_or_image_only` error). Note this differs from extracting *embedded figures*, which **is** supported.
- **Page-range selection** (P1), regenerate/adjust, multi-format ingest (DOCX/URL) — future.
- **Rebuilding auth/session/route guards** — already in place; this feature assumes them.
- **The "continue to generation" CTA target** — the Content-state CTA is a placeholder hook; wiring it to R2 belongs to the generation story.

## Resolved decisions (locked at the combined gate — 2026-07-10)
- **[#1 size/page limits] Decided: 10 MB max file size / 20 pages max, as a single-source tunable constant.** — **why:** the human chose conservative MVP ceilings — 10 MB sits well under the 50 MiB Supabase bucket cap and 20 pages keeps synchronous extraction (parse + image work + storage writes) comfortably inside the Edge Function wall-clock. Kept as one constant (`PDF_EXTRACTION_LIMITS`, see *Size / page limits*) so the R1 spike can retune the numbers without touching test structure — tests assert the *reject behavior*, not the literal value.
- **[#2 parsing library / Deno runtime] Decided: `mupdf`-wasm is the Slice-1 implementation target, behind a `PdfExtractionAdapter` interface.** — **why:** `mupdf`-wasm is the most capable single Deno-compatible dependency (per-page text + embedded images + positions + a text-length signal for scanned detection). Its **AGPL license is accepted as a known tradeoff** for this portfolio MVP. The adapter keeps the library an implementation detail — the DAO/service/hook/UI and their tests target the extraction *contract*, so it stays swappable; `unpdf` (pdf.js, MIT-ish) remains the documented fallback behind the same interface. task-3's spike now **validates and implements `mupdf`-wasm specifically** in the real Edge runtime (it is no longer a choose-between-candidates spike). *(Tradeoff to watch: larger WASM bundle → slower cold start — see risk R1/R2.)*
- **[#3 schema + storage layout] Decided: `documents` (+ `pages` JSONB) and `document_images` tables; private `pdf-uploads` and `pdf-images` buckets keyed by `{user_id}/{document_id}/…`; RLS by `auth.uid()`; signed URLs for image render.** — **why:** normalizes individually-referenced images (R2 attaches them to slides) while keeping page text as a single ordered blob that generation reads whole; owner-prefixed paths make storage RLS trivial. *(A normalized `document_pages` table stays the documented alternative if per-page querying is later needed.)*
- **[#4 downscale targets] Decided: 1024 px longest edge, JPEG q80 (PNG for alpha), skip <100×100 px images.** — **why:** 1024 px renders crisply on typical slide sizes incl. retina without hoarding storage; q80 is the standard quality/size sweet spot; the min-size filter drops decorative clutter (bullets, rules, icons).
- **[Analytics] Decided: include the three PII-free extraction events** (`pdf_upload_started`, `pdf_extraction_succeeded`, `pdf_extraction_failed`) as committed Slice-3 scope (task-15). — **why:** the PRD's headline metric (generation success rate) starts at upload, so the funnel needs upload/extraction telemetry from day one. This is an added, human-approved scope item beyond the story's numbered ACs; it maps to scenario @s17.
- **[Invoke vs storage-trigger] Decided: synchronous `functions.invoke`** after the client uploads + inserts the `documents` row. — **why:** a single awaited call gives an immediate typed success/error and the simplest 4-state UI + error contract, with no realtime subscription. **Discarded alternative:** a storage-triggered async function (mentioned in the story) — it forces the client to poll/subscribe for completion and complicates the error contract; revisit only if extraction routinely exceeds the Edge Function wall-clock limit (see risk R2).
- **[Persist the raw PDF] Decided: yes, keep `source.pdf` in `pdf-uploads`.** — **why:** enables reprocessing and the P1 page-range feature, and lets the function read bytes from storage instead of receiving them inline. **Discarded alternative:** send bytes straight to the function and discard.
- **[Hook style] Decided: `usePdfExtraction` is a plain-state hook** (`useState` for `stage`/`result`/`error`), not tanstack-query. — **why:** upload+extract is a one-shot mutation with side effects, not a cacheable query; matches the `useAuth`/`useSession` precedent (tanstack-query is reserved for data-fetching "when first needed").
- **[Edge Function testing] Decided: structure the function's logic as pure, Deno-testable modules** (adapter, downscale, scanned-detection, DTO shaping); the client layers (DAO/service/hook/UI) get the Jest/RTL coverage and the integration test mocks `functions.invoke`. — **why:** the Jest+Stryker workspace stack can't run Deno; keeping function logic pure makes it independently testable and keeps the mutation threshold meaningful on the JS layers. **Known boundary:** the Deno function sits outside Stryker's changed-line scope — documented here for reviewers/`mutation_tester` (see risk R4).
- **[Mutation gate exceptions] Human risk-accepted, 2026-07-10 — three categories left as documented survivors after the 2-round full-review + mutation loop closed every other gap:** (1) 16 styling mutations in `pdf-upload-panel.tsx`'s `StyleSheet.create` — presentation concern, guarded by Playwright e2e, not unit tests; (2) 1 `PDF_IMAGES_BUCKET` constant survivor — genuinely unreachable from Jest (Deno-only); (3) 211 translation-value mutations across `libs/localization/src/resources/{en,es,pt,de}.ts`'s new `upload.*` keys — translation-content accuracy is outside unit-test scope, key existence/alignment is guaranteed by the existing coverage test + build-time `TranslationResource` typing. **Why:** all three are content/presentation concerns, not logic gaps; every other survivor (of an original 39 in round 2) was closed with a real killing test. See `mutation.md`'s "Human risk-acceptance" section and `dod.md`.
