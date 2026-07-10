# TDD log — pdf-upload-extraction

`implementator` build log for **Slice 1 (happy path + Loading)**. One block per Red→Green→Refactor
cycle, grouped by task (build order task-1 → task-8, per `tasks.md`'s note: schema → contract
types → Edge Function → DAO → service → hook → presentational panel → wiring/screen/integration).
Every `@s` scenario this slice touches maps to at least one concrete test below.

## Design reconciliation (recorded for reviewers)

- **Two environment-driven adaptations were pre-approved and are documented here as they actually
  played out** (not hypothetically) — see the task-3 and task-1 sections below for the real
  outcomes: the `mupdf`-wasm spike **succeeded** (no `unpdf` fallback needed), and the RLS
  integration test **actually ran** against the local Supabase stack (Docker), 9/9 green.
- **`mupdf` is ESM-only and needs `NODE_OPTIONS=--experimental-vm-modules`.** `mupdf`'s published
  bundle (`dist/mupdf.js`) uses a top-level `await` to feature-detect Node vs. browser at load
  time — top-level `await` cannot be down-leveled to CommonJS (a real ECMAScript constraint, not
  a tooling gap), so it can't be `require()`d or statically `import`ed from a CJS Jest test file.
  Fix: the two adapter modules (`mupdf-extraction-adapter.ts`, `image-downscale.ts`) load it via
  `await import('mupdf')` **and** `libs/services/tsconfig.jest.json` sets `module`/`moduleResolution:
  "node16"` (kept **only** in the Jest-specific tsconfig — the main `tsconfig.json` used by
  `check-types` stays `ESNext`/`bundler`, unaffected) so `tsc` preserves the dynamic `import()` as a
  real one instead of down-leveling it to `require()`. `NODE_OPTIONS=--experimental-vm-modules` is
  wired into `@helsoft/services`' `test`/`test:rls` scripts so Node's real ESM loader is available
  inside the Jest VM context. This only affects `@helsoft/services`; no other workspace changed.
- **pnpm's nested `.pnpm` store defeats the usual `transformIgnorePatterns` trick.** (Dead end,
  abandoned in favor of the dynamic-import approach above — kept here so it isn't re-attempted.)
  `mupdf`'s real path is `node_modules/.pnpm/mupdf@1.28.0/node_modules/mupdf/…`, i.e. it has *two*
  `node_modules` segments; the standard `'/node_modules/(?!(mupdf)/)'` pattern only inspects the
  characters immediately after the *first* one and never reaches the real package folder.
- **Local Supabase needs explicit table-level `GRANT`s, not just RLS.** `config.toml`'s
  `auto_expose_new_tables` is unset (the current cloud default: new tables are not auto-exposed),
  so `anon`/`authenticated`/`service_role` had **zero** access to `documents`/`document_images`
  until the migration ran `grant usage on schema public` + `grant select, insert, update, delete`
  to all three roles — RLS policies alone were silently unreachable (`permission denied for table
  documents`, Postgres `42501`) without them. Found by actually running the RLS test, not by
  inspection.
- **`PdfUploadDao.uploadPdf`'s `filename` param dropped.** task-4's illustrative signature listed
  `uploadPdf({ userId, documentId, bytes, filename })`, but the upload call itself only needs
  bytes + a destination path — `filename` is only used by `insertDocument`. Kept out of
  `uploadPdf` (an unused parameter would need a `void filename` no-op or fail lint) after writing
  its test first and finding it unnecessary.
- **React Native's own ambient `Blob`/`File` types don't declare `arrayBuffer()`.**
  `react-native/src/types/globals.d.ts` declares a slimmer `Blob`/`File` than the real web API
  (no DOM lib is configured for this tsconfig) — but `asset.file` **is** a real web `File` at
  runtime on web (that's the whole point of `expo-document-picker`'s web parity field). Documented
  with a narrow local `WebBlobLike` type + a commented cast in `pdf-upload.tsx`, rather than adding
  the DOM lib project-wide (out of scope / broader blast radius than this feature needs).
- **`PdfUploadPanel` needed a third `'idle'` state value, beyond the literal "Loading + Content"
  scope**, to satisfy a genuine structural requirement: the wiring layer (task-8) has to pass
  *some* valid `state` before any file is picked (`usePdfExtraction`'s `'idle'` stage). Added via
  its own RED (a `pdf-upload-panel.test.tsx` case failing `tsc`'s `state="idle"` type-check) →
  GREEN (widened the union) cycle — **not** the fuller AC7 Empty state (constraints hint, etc.),
  which stays task-11's job behind its own failing tests.
- **`expo-document-picker`/`expo-file-system` added to `@helsoft/study-buddy` as peer + dev deps**,
  mirroring the existing `expo-router` pattern in that same `package.json` (peer for the consuming
  app's real resolution, pinned dev version for this lib's own type-check/test run) — and as real
  `dependencies` of `apps/app-study-buddy` (task-8's explicit requirement).
- **`libs/services/src/pdf-extraction/*` (adapter, downscale, DTO) is deliberately *not*
  re-exported through `@helsoft/services`' main barrel.** These modules pull in `mupdf` (a
  Node/browser-wasm package); the client layers (DAO/service/hook/UI) never import them (task-4's
  "no PDF parsing" requirement) and RN/Hermes almost certainly cannot load `mupdf`'s wasm bundle
  anyway. Barrel-exporting them would risk pulling `mupdf` into the mobile app bundle for no
  reason. They exist purely as (a) the Jest-tested source of truth and (b) the manually-mirrored
  source for the Deno function.

## @s → test map (Slice 1)

| @s | Scenario | Test(s) |
|---|---|---|
| @s1 | Whole document extracted, success returned | `mupdf-extraction-adapter.test.ts`, `extraction-dto.test.ts`, `pdf-upload.dao.test.ts`, `pdf-extraction.service.test.ts`, `use-pdf-extraction.test.ts`, `pdf-upload.test.tsx`, `pdf-extraction.integration.test.ts` |
| @s2 | Images downscaled, stored, associated with page/position | `mupdf-extraction-adapter.test.ts` (page + positionIndex association), `image-downscale.test.ts` (1024px cap, JPEG/PNG, never-upscale, decorative-image floor), migration's `document_images` schema (`page_number`/`position_index`/`storage_path` columns) |
| @s3 | Mixed pages captured in document order | `mupdf-extraction-adapter.test.ts` ("extracts text from every page in document order"), `extraction-dto.test.ts` (pages array shape) |
| @s4 | Extraction is server-side; client never parses | `pdf-upload.dao.test.ts` (DAO only uploads/inserts/invokes), `pdf-extraction.service.test.ts` (service goes through the DAO only), `pdf-upload.test.tsx` (wiring reads bytes but never parses PDF structure), `pdf-extraction.integration.test.ts` |
| @s5 | Loading state while upload+extraction is in flight | `pdf-upload-panel.test.tsx` (Loading render, choose-file control disabled), `use-pdf-extraction.test.ts` (`stage === 'processing'`), `pdf-upload.test.tsx` (stage→Loading wiring), `pdf-extraction.integration.test.ts` |
| @s6 | Successful extraction shows filename/page/image summary | `pdf-upload-panel.test.tsx` (Content summary + continue), `use-pdf-extraction.test.ts` (success result), `pdf-upload.test.tsx` (result→Content wiring) |
| @s14 (partial — cross-user isolation only; `unauthenticated` hook/service wiring is task-12/Slice 2) | Extracted content private to the uploader | `pdf-upload.rls.integration.test.ts` — **real, executed** against the local Supabase stack (see below) |

(@s7–@s13, @s15–@s17 are Slice 2/3 scope — not covered in this slice.)

---

## task-1 — DB migration: schema + storage buckets + RLS (@s2, @s3, @s14)

- Wrote `supabase/migrations/20260710202811_pdf_extraction.sql`: `documents` + `document_images`
  tables, RLS policies (owner-scoped on `documents`, parent-document-ownership on
  `document_images`), private `pdf-uploads`/`pdf-images` buckets, owner-prefixed storage policies.
- Applied to the **local** stack only via `npx supabase db reset` (never `db push`, never
  `--linked` — out of scope per the adaptation).
- **RED** (real, executed): first `pnpm --filter @helsoft/services test:rls` run failed all 9
  cases with `permission denied for table documents` (Postgres `42501`) — even the service-role
  admin client. Root cause: no table-level `GRANT`s (see reconciliation above).
- **GREEN**: added `grant usage on schema public to anon, authenticated, service_role` +
  `grant select, insert, update, delete on public.documents/document_images to …` to the
  migration; `npx supabase db reset` again; **9/9 real RLS tests passed**:
  - own-row select; cross-user select denied (empty, not an error); cross-user update denied (0
    rows affected, verified unchanged via the service-role client); cross-user delete denied (row
    still exists via the service-role client); `document_images` visibility scoped to the parent
    document's owner; anon (no session) select returns empty; anon insert rejected; own-bucket
    upload + download succeeds, a **different** authenticated user's download of that same object
    is denied; anon upload to `pdf-uploads` is denied.
- Command to reproduce manually: `pnpm --filter @helsoft/services test:rls` (Docker/local Supabase
  must already be running — `npx supabase status`). Isolated from the default `pnpm test` via
  `jest.config.js`'s `testPathIgnorePatterns: ['\\.rls\\.integration\\.test\\.ts$']` and its own
  `jest.rls.config.js` + `test:rls` script — the default run stays fully mocked/Docker-independent.
- `pnpm lint` + `pnpm check-types` + `pnpm test` (default, mocked) green — no code churn beyond the
  migration.

## task-2 — Extraction contract types (`@helsoft/types`) (@s1, @s2, @s3)

- Added `libs/types/src/pdf-extraction.ts`: `ExtractedImageRef`, `PdfExtractionResult`,
  `PdfExtractionErrorCode`, `PdfExtractionLimits` — plain types, mirroring `lesson.ts`/
  `auth-error.ts`'s untested-type-file precedent (no dedicated test file; the shape is proven
  transitively by every consumer below, whose tests would fail to compile against a wrong shape).
  Re-exported via `libs/types/src/index.ts`.
- `pnpm check-types` clean for `@helsoft/types` and every consumer once wired.

## task-3 — `extract-pdf` Edge Function: happy path + `mupdf`-wasm spike (@s1, @s2, @s3, @s4)

**Spike outcome: `mupdf`-wasm succeeded** — validated for real under Jest/Node (this sandbox has
no Deno CLI; see the human-approved adaptation). No fallback to `unpdf` was needed.

- Installed `mupdf@1.28.0` + `pdf-lib` (test-only fixture builder) into `@helsoft/services`.
- Manual spike (throwaway `.mjs` scripts, deleted before committing any test): confirmed
  `mupdf.Document.openDocument(bytes, 'application/pdf')` → `page.toStructuredText('preserve-images')`
  gives both `.asText()` (per-page text) and, via `.walk({ onImageBlock })`, embedded images in
  draw order — `preserve-images` is required in the options string or `onImageBlock` never fires.
  Also confirmed `Pixmap.warp(corners, targetW, targetH)` resizes a decoded image (used by the
  downscale module below) and `Pixmap.asJPEG(quality)`/`.asPNG()` encode the result.
- Hit and resolved the ESM-under-Jest problem documented in the reconciliation section above
  (`NODE_OPTIONS=--experimental-vm-modules` + `module: "node16"` in a Jest-only tsconfig +
  `await import('mupdf')`).
- **RED→GREEN, `pdf-extraction-adapter.ts`**: plain interface/types only (no dedicated test, same
  reasoning as task-2).
- **RED→GREEN, `mupdf-extraction-adapter.ts`**:
  1. RED: "extracts text from every page in document order" (3-page mixed fixture — text-only,
     text+image, image-only) failed to compile (`Cannot find module './mupdf-extraction-adapter'`).
     GREEN: `MupdfExtractionAdapter.extract()` — one `Document.openDocument` + per-page
     `toStructuredText().asText().trim()`.
  2. RED→GREEN: "associates an extracted image with the page it came from and its native pixel
     size" — added the `onImageBlock` walk, pushing `{page, positionIndex, bytes, width, height,
     mimeType}` per image (raw re-encode as PNG via `pixmap.asPNG()` — a universally-decodable
     input for the downscale module regardless of the source's original format).
  3. RED→GREEN: "assigns increasing positionIndex values to multiple images on the same page" —
     already passed on the first run (the per-page-scoped `images` array's `.length` at push time
     already gave the right sequence) — confirms rather than adds behavior.
  - **REFACTOR**: extracted `extractPageImages()` as a named helper to keep `extract()` short.
- **RED→GREEN, `image-downscale.ts`** (spec decision #4 — 1024px longest edge, JPEG q80/PNG for
  alpha, drop <100×100px): built a dependency-free `buildSolidPng()` test fixture (raw PNG bytes
  via `node:zlib`, arbitrary W×H, optional alpha) since `mupdf` needs real decodable images, not
  hand-wavy test doubles.
  1. RED→GREEN: oversized opaque image (2000×1000) → 1024×512 JPEG (aspect preserved). Used
     `Pixmap.warp` for the actual resize (confirmed in the spike).
  2. RED→GREEN: an already-in-bounds image (300×200) is never upscaled — dimensions pass through.
  3. RED→GREEN: an image with an alpha channel re-encodes as PNG (not JPEG) after downscale.
  4. RED→GREEN: a decorative image (40×40, and a wide-but-thin 800×4 rule) is dropped (`null`) —
     the 100×100 floor applies per-dimension, not just the longest edge.
  - **REFACTOR**: none needed; `isDecorative`/`computeScale`/`resizePixmap` stayed small,
    single-purpose helpers from the start.
- **RED→GREEN, `extraction-dto.ts`**: `buildPdfExtractionResult()` derives `pageCount`/
  `imageCount` from the actual arrays (never trusts a separately-passed-in count) — two tests
  (full document, and a zero-image document).
- Created `libs/services/src/services/pdf-extraction.constants.ts`: `PDF_EXTRACTION_LIMITS` (10 MB
  / 20 pages — values locked at the gate, consumed for enforcement starting Slice 2/task-9-10 per
  the spec's explicit single-source-of-truth instruction) and `IMAGE_DOWNSCALE_TARGET` (1024px /
  q80 / 100px floor — consumed **now** by `image-downscale.ts`), plus `PDF_UPLOAD_BUCKET`/
  `PDF_IMAGES_BUCKET` bucket-name constants (consumed by the DAO and the Edge Function alike).
- Mirrored every pure module into `supabase/functions/extract-pdf/_shared/` (Deno-flavored: `npm:`
  specifiers, `.ts` extensions on relative imports) and wrote `supabase/functions/extract-pdf/
  index.ts` as the real orchestration glue (JWT-scoped client, storage read → adapter.extract →
  downscale → image upload/insert → `documents` update → typed result; a catch-all sets
  `status='failed'`/`error_code='extraction_failed'` on any unexpected error — the *specific*
  scanned/too-many-pages/corrupt detection is task-9/Slice 2, not this task).
- **Testing boundary (explicit, accepted — risk R4):** `supabase/functions/extract-pdf/index.ts`
  and everything under `_shared/` are **not executed or type-checked in this sandbox** (no Deno
  CLI). A comment block at the top of `index.ts` states this. The logic it calls is Jest-tested
  for real in `libs/services/src/pdf-extraction/*`; verify the Deno glue manually against a real
  PDF after `supabase functions deploy` in a real environment — never run that command from this
  pipeline.
- `pnpm --filter @helsoft/services lint`/`check-types`/`test` green (10 suites, 56 tests).

## task-4 — `PdfUploadDao` (@s1, @s4)

- **RED→GREEN, `uploadPdf`**: uploads bytes to `pdf-uploads` at `{userId}/{documentId}/source.pdf`
  (`contentType: 'application/pdf'`, `upsert: false`); throws the raw supabase error untouched.
- **RED→GREEN, `insertDocument`**: inserts `{id, user_id, filename, size_bytes, status:
  'processing'}` into `documents`, returns the inserted row (`.select().single()`); throws raw on
  failure.
- **RED→GREEN, `invokeExtraction`**: `getSupabase().functions.invoke('extract-pdf', {body:
  {documentId}})`, returns/throws raw.
- **REFACTOR**: none needed — three short, single-purpose static methods, matching `AuthDao`'s
  shape. Not exported through any barrel (DAOs are service-only consumers, `hooks-service-dao.mdc`).
- 6 tests green (`pdf-upload.dao.test.ts`); `check-types` clean.

## task-5 — `PdfExtractionService` (@s1, @s4)

- **RED→GREEN**: `extract(input, userId)` generates a `documentId` (own dependency-free v4-UUID
  generator — `crypto.randomUUID()` isn't universally available on Hermes/React Native, and this
  ID is a row/path identifier, not a security secret, so `Math.random()`-backed randomness is an
  accepted tradeoff), then calls `uploadPdf` → `insertDocument` → `invokeExtraction` in sequence
  with the **same** generated id, returning the DAO's typed result untouched.
- **RED→GREEN**: a second `extract()` call generates a **different** documentId (uniqueness guard
  — concurrent uploads never collide on the same storage path/row).
- **REFACTOR**: none needed. Exported via `libs/services/src/services/index.ts`.
- 2 tests green (`pdf-extraction.service.test.ts`); `check-types` clean.

## task-6 — `usePdfExtraction` hook (@s1, @s5)

- **RED→GREEN**: success path — `extract()` resolves, `stage` flips to `'success'`, `result` is
  set to the service's return value, and the service is called with `(input, session.user.id)`
  (userId resolved internally via `useSession()`, matching `useAuth`'s no-userId-param call-site
  ergonomics).
- **RED→GREEN**: `stage` is `'processing'` while the underlying `extract()` promise is in flight
  (deferred-promise + `act()`, mirroring `use-auth.test.ts`'s pattern).
- **REFACTOR**: none needed. Plain `useState`/`useCallback` (spec's locked hook-style decision);
  exported via `libs/hooks/src/hooks/index.ts`.
- 2 tests green (`use-pdf-extraction.test.ts`); `check-types` clean.

## task-7 — `PdfUploadPanel` organism: Loading + Content (@s5, @s6)

- **RED→GREEN, Loading**: renders `ProgressIndicator` (indeterminate) + `labels.loading` copy;
  disables the choose-file control (`Button disabled={state === 'loading'}`).
- **RED→GREEN, Content**: renders `filename`/`pageCount`/`imageCount` via `labels.*Label` +
  invokes `onContinue` when the continue button is pressed; a negative test pins the loading
  indicator's absence in Content.
- **RED→GREEN, `'idle'`** (see reconciliation above): the panel renders just the enabled
  choose-file control and nothing else — no new branching needed, since "neither loading nor
  content" already fell through to exactly that in the existing implementation; only the type
  union needed widening.
- **REFACTOR**: none needed; composed from `Card`/`Button`/`ProgressIndicator` only, all copy via
  `labels`/props (no hardcoded strings/colors/dimensions — spacing/typography from `theme`).
- 6 tests green (`pdf-upload-panel.test.tsx`); `pdf-upload-panel.stories.tsx` (Loading, Content).
  Exported via `libs/components/src/organisms/index.ts`.

## task-8 — `PdfUpload` wiring + upload screen + slice-1 integration (@s1, @s4, @s5, @s6)

- **RED→GREEN, web read path**: choosing a web-style asset (`asset.file`, a real Blob) reads its
  bytes via `.arrayBuffer()` and calls `usePdfExtraction().extract({filename, sizeBytes, bytes})`.
  Hit the RN-ambient-`Blob`-type gap (reconciliation above); resolved with a narrow, commented
  `WebBlobLike` cast rather than widening the whole tsconfig's `lib`.
- **RED→GREEN, native read path**: an asset with only a `file://` uri (no `.file`) reads bytes via
  `expo-file-system`'s `File` class — the one place platform specifics are isolated (risk R5).
- **RED→GREEN**: canceling the picker never calls `extract()`.
- **RED→GREEN**: `stage === 'processing'` → Loading (choose-file disabled); `stage === 'success'`
  with a `result` → Content summary.
- **REFACTOR**: none needed. `apps/app-study-buddy/src/app/(app)/upload.tsx` reduced to
  `ScreenContainer` + `<PdfUpload />` (mirrors `LanguageSettings`/`SignInForm`'s screen-shell
  pattern), replacing the `upload.intro` placeholder. Added the Slice-1 `upload.*` i18n keys
  (`chooseFile`, `loading`, `filenameLabel`, `pageCountLabel`, `imageCountLabel`, `continue`) to
  **all four** locale bundles now (en/es/pt/de) — required by TypeScript's key-alignment check on
  `TranslationResource`; task-13/Slice 3 completes the rest (error messages, hints).
- **Slice-1 integration test** (`libs/hooks/src/hooks/pdf-extraction.integration.test.ts`):
  `usePdfExtraction` → `PdfExtractionService` → `PdfUploadDao`, exercised for real against one
  shared, mocked Supabase client (mirrors `auth.integration.test.ts`'s pattern) — only
  `storage.from().upload`, `.from().insert().select().single()`, and `functions.invoke` are
  stubbed. Found and fixed a real gotcha: `SupabaseClient.functions` is a **getter** that builds a
  fresh `FunctionsClient` on every access, so `jest.spyOn(client.functions, 'invoke')` spies on a
  throwaway instance; fixed by spying on the `functions` **getter** itself
  (`jest.spyOn(client, 'functions', 'get').mockReturnValue(...)`).
- 5 wiring tests (`pdf-upload.test.tsx`) + 1 integration test green; `check-types` clean for
  `@helsoft/study-buddy` and `app-study-buddy`.

---

## Slice-1 gate — commands run for real

- `pnpm --filter @helsoft/types check-types` — clean.
- `pnpm --filter @helsoft/services test` (mocked, Docker-independent) — 10 suites / 56 tests green.
- `pnpm --filter @helsoft/services test:rls` (live local Supabase, Docker) — 9/9 real tests green.
- `pnpm --filter @helsoft/services check-types` — clean.
- `pnpm --filter @helsoft/hooks test` — 5 suites / 24 tests green.
- `pnpm --filter @helsoft/hooks check-types` — clean.
- `pnpm --filter @helsoft/components test` — 6 suites / 71 tests green.
- `pnpm --filter @helsoft/components check-types` — clean.
- `pnpm --filter @helsoft/study-buddy test` — 4 suites / 30 tests green.
- `pnpm --filter @helsoft/study-buddy check-types` — clean.
- `pnpm --filter @helsoft/localization test` — 8 suites / 55 tests green (new `upload.*` keys,
  key-alignment coverage intact).
- `pnpm --filter app-study-buddy check-types` — clean.
- `pnpm check-types` (whole repo, turbo) — 8/8 packages clean.
- `pnpm test` (whole repo, turbo) — 6/6 testable packages green (types/lib-with-storybook have no
  new-code interaction; lib-with-storybook cache-hit from an unrelated prior run).
- `pnpm lint` (whole repo, turbo) — clean (`app-study-buddy` is the only workspace with a `lint`
  script; the rest have none defined, matching the existing repo convention).
- No Playwright e2e added this slice — task-8's note explicitly scopes the slice-1 integration
  test to hook→service→DAO; full a11y-driven e2e is task-14 (Slice 3).

**Not run / out of scope, by design:** `deno test`, `deno check` (no Deno CLI in this sandbox —
see the task-3 testing-boundary note); `supabase db push`, `supabase functions deploy`, `--linked`
(would target the real hosted project — a manual step later, outside this pipeline).

## Stop condition

Slice 1 gate is green. Per protocol, stopping here for the light `reviewer_code` +
`reviewer_design` pass (orchestrated separately) before Slice 2 begins.
