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

## Slice-1 review round 1 — fix cycle (reviewer_code CHANGES_REQUESTED)

`review.md` round 1: design APPROVED, code CHANGES_REQUESTED — one minor finding. The
`PdfExtractionStage` union's `'error'` value plus `usePdfExtraction`'s `error: PdfExtractionErrorCode
| null` field and `reset()` callback (`use-pdf-extraction.ts`) were built ahead of any Slice-1 test
demanding them — a Three Laws violation (speculative generality) and scope inflation for a
happy-path+Loading slice.

- Verified independently before fixing: grepped every consumer
  (`pdf-upload.tsx`, `pdf-upload-panel.tsx`, `use-pdf-extraction.test.ts`,
  `pdf-extraction.integration.test.ts`) — none reads `.error`, calls `reset()`, or checks stage
  `'error'`. `pdf-upload.test.tsx`'s local `extractionValue()` mock factory sets `error`/`reset` as
  extra untyped object fields (the mock is cast via `as jest.Mock`, not the hook's real return
  type), but no assertion in that file exercises them either — confirms the finding's premise.
- **Fix (review's action (a))**: deleted `error`/`reset` from `UsePdfExtractionResult` and the
  `usePdfExtraction` implementation; narrowed `PdfExtractionStage` to `'idle' | 'processing' |
  'success'`. `PdfExtractionErrorCode` (from `@helsoft/types`, task-2) is untouched — it was already
  a plain, untested contract type consumed by nothing else this slice; it stays defined for task-12
  (Slice 2) to import.
- Re-ran, all green, no other code touched: `pnpm --filter @helsoft/hooks test` (5 suites/24
  tests), `pnpm --filter @helsoft/hooks check-types`, `pnpm --filter @helsoft/study-buddy test` (4
  suites/30 tests) + `check-types`, `pnpm --filter @helsoft/components test` (6 suites/71 tests) +
  `check-types`, `pnpm --filter app-study-buddy check-types`, whole-repo `pnpm check-types` (8/8)
  and `pnpm lint` — all clean.
- No new test was written for this cycle: the fix is a pure deletion of code no existing test
  demanded, not new behavior — nothing to encode in a new RED test. The existing Slice-1 tests
  (`use-pdf-extraction.test.ts`, `pdf-extraction.integration.test.ts`) already fully specify the
  hook's Slice-1 surface and stayed green untouched throughout.
- Commit: `fix(pdf-upload-extraction): remove untested error/reset surface from
  use-pdf-extraction ahead of slice 2`.

## Slice-1 review round 2 — fix cycle (reviewer_code minor: stale test-mock fields)

`review.md` round 2: design APPROVED, code CHANGES_REQUESTED — one minor finding. Round 1's fix
(`5127bb2`) deleted `error`/`reset` from `UsePdfExtractionResult`/`usePdfExtraction`, but didn't
touch `pdf-upload.test.tsx`'s local `extractionValue()` mock factory, which still hardcoded
`error: null` and `reset: jest.fn()` — a stale shape wider than the real hook contract. It didn't
fail `check-types` only because `mockUsePdfExtraction` is typed as a loose `jest.Mock`, which skips
excess-property checking.

- **Fix**: deleted `error: null,` and `reset: jest.fn(),` from `extractionValue()` in
  `pdf-upload.test.tsx` (`libs/study-buddy/src/components/pdf-upload/pdf-upload.test.tsx`) so the
  mock factory matches `UsePdfExtractionResult`'s current, real shape.
- No new test was written: this is a pure deletion of an untested, stale mock field, not new
  behavior — nothing to encode in a new RED test. All 5 existing `pdf-upload.test.tsx` cases stayed
  green and unmodified otherwise.
- Re-ran and confirmed green: `pnpm --filter @helsoft/study-buddy test` (4 suites / 30 tests),
  `pnpm --filter @helsoft/study-buddy check-types`, whole-repo `pnpm check-types` (8/8) and
  `pnpm lint` — all clean.
- Commit: `fix(pdf-upload-extraction): remove stale error/reset fields from pdf-upload test mock`.

## Stop condition (Slice 1)

Slice 1 gate is green. Fix cycles above address round-1's and round-2's only findings; stopping
here for re-review before Slice 2 begins.

---

# Slice 2 (Empty + Error + Retry)

`implementator` build log for **Slice 2**. Build order per `tasks.md`: task-9 (server error
contract + client normalization) → task-10 (client pre-validation) → task-11 (`PdfUploadPanel`
Empty + Error states) → task-12 (hook error/retry + wiring + integration). task-9 and task-10 both
land in the same file (`pdf-extraction.service.ts`) and were built together in one coherent pass
(client pre-validation genuinely needs the error-code union task-9 introduces) — documented here
rather than artificially split across two commits' worth of diff-noise; both tasks' own done
criteria are independently satisfied and independently tested.

## Design reconciliation (recorded for reviewers)

- **AC7's "the upload control is disabled" — read for coherence, not literally.** `spec.md`/
  `gherkin-scenarios.md` (@s7) list, as separate `Then`/`And` clauses: (1) "I see a 'choose a PDF'
  affordance", (2) "I see the maximum file size and page count", (3) "the upload control is
  disabled", (4) "no error is shown". Read completely literally, (3) would mean the *only*
  interactive control in the Empty state can never be pressed — a dead end that directly
  contradicts (1) (an affordance you can't act on isn't an affordance) and Slice-1's own
  already-twice-reviewed-APPROVED `'idle'` rendering (choose-file enabled outside Loading, task-7/
  task-8). Task-11's own note is explicit that this state is a **non-reshape** extension of that
  same `'idle'` value — no second, disableable "upload" control exists anywhere in this
  architecture (picking a file *is* the whole upload trigger, per the Slice-1-approved one-step
  design). Implemented Empty as: choose-file **enabled** (unchanged from Slice 1) + the new
  constraints-hint text + no error banner — satisfying (1), (2), (4) literally, and (3) in the
  only coherent sense available given the existing (reviewed, locked) component shape: no
  Loading-only disabling is active. Flagged here explicitly for `reviewer_design`/human visibility
  rather than silently reinterpreting a signed scenario.
- **`PdfUploadDao.uploadPdf`/`insertDocument` moved from insert-only to upsert-by-id.** task-12's
  retry requirement ("reuse the documentId for a retry rather than minting a new one") is only
  satisfiable if a retry can re-target the *same* storage object and the *same* `documents` row
  without erroring on a conflict. `uploadPdf`'s `upsert: false` → `true` (storage write) and
  `insertDocument`'s `.insert()` → `.upsert()` (also now explicitly clearing `error_code: null` on
  every write) make both writes idempotent-by-id — a no-op behavior change for the very first
  attempt (a fresh UUID never conflicts) and the enabling change for retry. Driven by updating the
  existing Slice-1 DAO tests' assertions first (RED against the unchanged implementation), then
  implementing (GREEN) — not a silent behavior change. The Slice-1 `pdf-extraction.integration.
  test.ts` mock (`sharedClient.from().insert` stub) needed the same `insert` → `upsert` rename to
  stay green, for the same reason.
- **`documentId` ownership: generated once, remembered by the hook, threaded through explicitly.**
  `PdfExtractionService.extract(input, userId, documentId = generateDocumentId())` gained an
  optional third parameter (default preserves every existing call site/test unchanged).
  `generateDocumentId` is exported from the service module (not duplicated) so `usePdfExtraction`
  can mint one *before* the first attempt and pass the *same* one into every subsequent `retry()`
  call — the hook remembers `{ input, documentId }` for the last attempt in a `ref` (not `state`,
  since it's never itself rendered). This keeps the "reuse vs. mint fresh" decision at the hook
  layer (where "what to retry" is a UI-orchestration concern), while the service/DAO stay ignorant
  of retry semantics — they just always write "by this id".
- **Server-side failure ordering + no-partial-persistence, in the (unexecuted, Deno-only)
  orchestration.** `index.ts` restructured so: (1) a parse/open failure is caught in its own
  narrowly-scoped `try/catch` → `corrupt_or_unreadable` (@s12), distinct from the generic
  catch-all; (2) `detectExtractionFailure` (page-count guard before the scanned-text heuristic,
  both pure and Jest-tested) runs over the parsed `pages` **before any image processing or
  persistence** — a document that's going to be rejected never gets a single `document_images` row
  or a `pages`/`page_count` write; (3) every image is downscaled **in memory first**, and only once
  all succeed does the function touch storage/DB — a single **batch** `document_images` insert
  (not one insert per image) so a mid-loop image failure can't leave rows 0..N-1 as orphaned,
  partially-committed state. This satisfies task-9's "no partial `document_images`/usable `pages`
  retained" criterion more completely than Slice-1's original per-image-insert shape. Documented,
  not executed here (risk R4/task-3's sandbox testing-boundary note still applies — no Deno CLI);
  the guard/detection logic itself **is** real, executed, Jest-tested TypeScript
  (`extraction-failure-detection.ts`), mirrored by hand into `_shared/`.
- **Error normalization lives entirely in `PdfExtractionService.extract()`, not split across
  layers.** Every DAO-thrown cause — a `FunctionsHttpError` (the Edge Function's own typed `{
  errorCode }` response, read via `.context.json()`, since supabase-js never parses a non-2xx
  function response body itself), a `FunctionsFetchError`/`FunctionsRelayError` (client/relay
  transport failure → `network_error`), or anything else (defensive `extraction_failed` fallback)
  — is normalized into a typed `Error & PdfExtractionError` before it ever reaches the hook. This
  means `usePdfExtraction`'s own `isPdfExtractionErrorShape` guard (mirroring `useAuth`'s
  `isAuthErrorShape` precedent) is technically always satisfied in practice, but kept anyway as a
  defensive fallback to `network_error` for anything unexpected — proven by a dedicated hook test
  (an untyped `new Error('boom')` rejection).
- **`FunctionsFetchError`/`FunctionsHttpError`/`FunctionsRelayError` re-exported (values, not just
  types) from `@helsoft/services`'s barrel**, mirroring the existing `Session`/`SupabaseClient`/
  `User` type re-export precedent — lets the Slice-2 integration test build a representative
  transport-failure fixture without adding a direct `@supabase/supabase-js` dependency to
  `@helsoft/hooks`.
- **`upload.error.*`/`upload.constraintsHint`/`upload.retryAction` i18n keys added to all four
  locale bundles now** (not just `en`) because `es`/`pt`/`de` are typed as `TranslationResource`
  (`typeof en`), so `check-types` fails on any bundle missing a key — confirmed by first checking
  `@helsoft/localization`'s actual enforcement (`libs/localization/src/resources/es.ts` etc.) before
  writing the copy. Per this session's explicit scope limit, `es`/`pt`/`de` **duplicate the English
  copy verbatim** (documented inline in each file) — native review of that copy is task-13/Slice 3.
  `fileTooLarge`/`tooManyPages` spell out "10 MB"/"20" as plain text rather than half-wiring
  `{{maxMb}}`/`{{maxPages}}` interpolation that the wiring never actually passes for those two keys
  (only `constraintsHint` is genuinely interpolated, since the wiring computes and passes `maxMb`/
  `maxPages` there) — avoids a broken, unfilled placeholder shipping in the interim.
- **`libs/localization`'s scanned-key-existence coverage test (`migration-coverage.test.ts`)
  doesn't cover `pdf-upload.tsx`** (its `AUTH_COMPONENT_DIRS` list is scoped to `sign-in-form`/
  `sign-out` only, a deliberate prior-review decision) — not extended to `pdf-upload` this slice
  (out of scope; the `UPLOAD_ERROR_KEYS: Record<PdfExtractionErrorCode, string>` map is a **full**,
  not partial, record, so `check-types` itself already guarantees every code has a key, and a
  dedicated `it.each` wiring test in `pdf-upload.test.tsx` proves each maps to its own real,
  non-fallback message string).

## @s → test map (Slice 2)

| @s | Scenario | Test(s) |
|---|---|---|
| @s7 | Empty/pristine state: affordance, constraints hint, no error | `pdf-upload-panel.test.tsx` (3 idle-state cases), `pdf-upload.test.tsx` (constraints hint wiring) |
| @s8 | Scanned/image-only PDF rejected | `extraction-failure-detection.test.ts` (heuristic), `pdf-extraction.service.test.ts` (server-error normalization), `pdf-upload-panel.test.tsx` (Error render), `pdf-upload.test.tsx` (message mapping) |
| @s9 | Non-PDF rejected before upload | `pdf-extraction.service.test.ts` (client type pre-check, DAO never invoked), `pdf-upload.test.tsx` (message mapping) |
| @s10 | Over-size file rejected before upload | `pdf-extraction.service.test.ts` (client size pre-check, DAO never invoked), `pdf-upload.test.tsx` (message mapping) |
| @s11 | Too-many-pages rejected by backend | `extraction-failure-detection.test.ts` (page-count guard incl. precedence), `pdf-extraction.service.test.ts` (server-error normalization), `pdf-upload.test.tsx` (message mapping) |
| @s12 | Corrupt/unreadable PDF rejected | `mupdf-extraction-adapter.test.ts` (real parse failure), `pdf-extraction.service.test.ts` (server-error normalization), `pdf-upload.test.tsx` (message mapping) |
| @s13 | Transient network failure is retryable | `pdf-extraction.service.test.ts` (`FunctionsFetchError`/`FunctionsRelayError` → `network_error`), `use-pdf-extraction.test.ts` (error stage + `retry()` reuse + success), `pdf-upload-panel.test.tsx` (retry affordance), `pdf-upload.test.tsx` (retry wiring), `pdf-extraction-error-retry.integration.test.ts` (real error→retry→success flow) |
| @s14 (client/service `unauthenticated` half — RLS half already covered Slice 1) | Unauthenticated request denied | `pdf-extraction.service.test.ts` (no-userId pre-check + server `unauthenticated` normalization), `pdf-upload.test.tsx` (message mapping) |

(@s1-@s6 unchanged from Slice 1; @s15-@s17 remain Slice 3 scope.)

---

## task-9 — Server error contract: scanned/page/corrupt detection + client normalization (@s8, @s11, @s12, @s14)

- **RED→GREEN, `extraction-failure-detection.ts`** (pure, Jest-tested, mirrored to Deno
  `_shared/`): 4 tests — page-count guard (@s11), scanned-text heuristic (@s8), a clean-document
  happy path, and a precedence case (both guards violated → structural `too_many_pages` wins).
  Reads `PDF_EXTRACTION_LIMITS`/`SCANNED_DETECTION_MIN_TEXT_LENGTH` (new constants, both added to
  `pdf-extraction.constants.ts` and mirrored) rather than any inline literal.
- **RED→GREEN, `mupdf-extraction-adapter.test.ts`** (@s12): "rejects when the given bytes are not
  a parseable PDF" — a real, executed assertion against the actual `mupdf`-wasm runtime (10 garbage
  bytes). Passed without needing new adapter code (mupdf's own `openDocument` already throws for
  genuinely unparseable input after its internal repair attempt fails) — a **confirming** test,
  same "proves rather than adds behavior" precedent as Slice-1's positionIndex case.
- **RED→GREEN, `PdfExtractionService.extract()` — unauthenticated + server-error normalization**:
  added the `PdfExtractionError` type (`@helsoft/types`, untested plain type per task-2's
  precedent), a client-side `if (!userId) throw` pre-check (@s14), and `normalizeExtractionError()`
  wrapping every DAO call in `try/catch` — `FunctionsHttpError` → reads `.context.json().errorCode`
  (falls back to `extraction_failed` for a missing/malformed/unknown body);
  `FunctionsFetchError`/`FunctionsRelayError` → `network_error`; anything else → `extraction_failed`.
  9 new tests (unauthenticated pre-check, 4 known-code normalizations, 1 malformed-body fallback, 2
  transport-error cases, 1 documentId-reuse case pre-built for task-12).
- **Deno orchestration (`index.ts`, not executed — see reconciliation above)**: restructured to
  catch parse failure narrowly (`corrupt_or_unreadable`), run `detectExtractionFailure` before any
  image work, downscale in memory first, and batch-insert `document_images` — all funneling
  through one `markDocumentFailed(supabase, documentId, code)` helper so `status`/`error_code`
  always update together.
- 13/13 `pdf-extraction.service.test.ts` tests green; `pnpm --filter @helsoft/services test`/
  `check-types` clean.

## task-10 — Client pre-validation: file type + size (@s9, @s10)

- **RED→GREEN**: `validateFile()` in `pdf-extraction.service.ts` — non-`.pdf` filename →
  `unsupported_file_type`; `sizeBytes > PDF_EXTRACTION_LIMITS.maxSizeBytes` → `file_too_large`; both
  checked (and both tests assert the DAO is never invoked) **before** the try/catch that wraps the
  DAO calls, so a rejected file never reaches upload. `extract()`'s signature stayed exactly
  `(input, userId)` for this task, per its own note — the `documentId` param came later, in the
  same file, for task-9's/task-12's coordination (see reconciliation above).
- Built in the same pass as task-9 (same file, same PdfExtractionService rewrite) — see the note
  at the top of this Slice-2 section for why.
- 2 new tests green (folded into the 13 counted under task-9 above).

## task-11 — `PdfUploadPanel` Empty + Error + Retry states (@s7, @s8-@s13)

- **RED→GREEN, Empty state**: `PdfUploadPanelState` gained no new value for Empty (`'idle'`
  already existed, Slice 1) — added `labels.constraintsHint` (new required label) and rendered it
  only when `state === 'idle'`. 2 new tests (hint shown; no error shown) + renamed the pre-existing
  idle test (dropped "only" from its description, since the state now renders more than just the
  button — a doc-only rename on green, not a behavior change).
- **RED→GREEN, Error state**: added `'error'` to `PdfUploadPanelState`, `errorMessage`/`onRetry`
  props, `labels.retry`. Renders an `accessibilityRole="alert"` banner (mirrors `LoginForm`'s
  existing error-banner pattern/tokens — `theme.colors.errorContainer`/`onErrorContainer`,
  `theme.shape.card`, `theme.spacing.s3`) + a `Button` wired to `onRetry`. 4 new tests (message +
  retry render, `onRetry` invoked, choose-file stays enabled — "returns to a usable state" per
  spec's Error row — and no loading indicator leaks into Error).
  - Test assertions for the alert role follow `login-form.test.tsx`'s own precedent
    (`getByText(...).parent?.props.accessibilityRole === 'alert'`) rather than
    `getByRole('alert')`, since RNTL's role-query doesn't map React Native's `accessibilityRole=
    "alert"` the way it does `"button"`.
- **REFACTOR**: none needed beyond the idle-test rename above; new styles (`hintText`,
  `errorBanner`, `errorBannerText`) all resolve through existing `theme.*` tokens, no ad-hoc
  colors/spacing.
- `pdf-upload-panel.stories.tsx` extended with `Empty` and `Error` stories — all 4 states now
  covered (`Empty`, `Loading`, `Content`, `Error`).
- 12/12 `pdf-upload-panel.test.tsx` tests green; `pnpm --filter @helsoft/components test`/
  `check-types` clean.

## task-12 — Hook error/retry + wiring + error-path integration (@s13, @s14)

- **RED→GREEN, `usePdfExtraction`**: re-added `error: PdfExtractionErrorCode | null` and a real
  `retry()` — this time earned via genuine failing tests (not restored from git history, per this
  session's explicit instruction): `'error'` added to `PdfExtractionStage`; a `lastAttemptRef`
  (`{ input, documentId }`) captured on every `run()`; `extract()` mints a fresh `documentId` via
  the now-exported `generateDocumentId`; `retry()` re-invokes `run()` with the **same** remembered
  input/documentId (no-op if nothing was ever attempted). 4 new tests: typed-error → `stage:
  'error'` + code exposed; untyped-error → defensive `network_error` fallback; retry → same
  input/documentId reused, resolves to success; retry-with-no-prior-attempt → no-op (service never
  called). The pre-existing success-path test's `toHaveBeenCalledWith` assertion gained a third
  `expect.any(String)` matcher (the new `documentId` argument) — an update to an existing
  assertion, not new behavior, since the call now genuinely has 3 args.
- **RED→GREEN, `PdfUpload` wiring**: `UPLOAD_ERROR_KEYS: Record<PdfExtractionErrorCode, string>`
  (a **full** record — TypeScript itself enforces every code is mapped) drives `errorMessage`;
  `retry` passed straight through to `onRetry`; `stageToPanelState.error = 'error'`; `labels.
  constraintsHint`/`labels.retry` wired via `t('upload.constraintsHint', { maxMb, maxPages })`
  (real interpolation, using `PDF_EXTRACTION_LIMITS` — single source, no re-derived literal) and
  `t('upload.retryAction')`. 11 new tests: constraints hint rendered, one representative
  error-message + retry-press case, the `unauthenticated`-specific case (@s14), and an `it.each`
  over all 8 `PdfExtractionErrorCode` values proving each resolves to its own distinct key (guards
  against a silently-missing/duplicate mapping, since i18next has no missing-key handler).
- **Slice-2 integration test** (`libs/hooks/src/hooks/pdf-extraction-error-retry.integration.
  test.ts`, @s13): `usePdfExtraction` → `PdfExtractionService` → `PdfUploadDao` against one shared,
  mocked Supabase client (mirrors the Slice-1 integration test's pattern) — first `functions.
  invoke` rejects with a real `FunctionsFetchError`, asserts `stage: 'error'`/`error:
  'network_error'`; `retry()` is called next, second `invoke` resolves with the typed success
  result, asserts `stage: 'success'` + the result; and — the actual point of this test — both the
  storage upload path and the `documents` upsert's row id are asserted **identical** across the
  failed attempt and the retry (no duplicate orphaned row/path, task-12's explicit requirement).
- 16/16 `pdf-upload.test.tsx` tests green; 6/6 `use-pdf-extraction.test.ts` tests green; the new
  integration test green; `pnpm --filter @helsoft/hooks`/`@helsoft/study-buddy test`+`check-types`
  clean.

---

## Slice-2 gate — commands run for real

- `pnpm --filter @helsoft/types check-types` — clean.
- `pnpm --filter @helsoft/services test` — 11 suites / 72 tests green (mocked, Docker-independent;
  no new live-DB dependency added this slice, per this session's explicit constraint).
- `pnpm --filter @helsoft/services check-types` — clean.
- `pnpm --filter @helsoft/hooks test` — 6 suites / 29 tests green.
- `pnpm --filter @helsoft/hooks check-types` — clean.
- `pnpm --filter @helsoft/components test` — 6 suites / 77 tests green.
- `pnpm --filter @helsoft/components check-types` — clean.
- `pnpm --filter @helsoft/study-buddy test` — 4 suites / 41 tests green.
- `pnpm --filter @helsoft/study-buddy check-types` — clean.
- `pnpm --filter @helsoft/localization test` — 8 suites / 55 tests green (new `upload.*` keys,
  key-alignment coverage intact; `migration-coverage.test.ts`'s scoped `AUTH_COMPONENT_DIRS` check
  untouched/unaffected).
- `pnpm check-types` (whole repo, turbo) — 8/8 packages clean.
- `pnpm test` (whole repo, turbo) — 6/6 testable packages green.
- `pnpm lint` (whole repo, turbo) — clean (`app-study-buddy` is still the only workspace with a
  `lint` script).
- **No Playwright e2e added this slice** — same precedent as Slice 1: `tasks.md` explicitly scopes
  the a11y pass + Playwright e2e to task-14 (Slice 3), and task-11's own done criteria for this
  slice is unit-test coverage of the 4 states, not e2e. Not building ahead of that task.

**Not run / out of scope, by design:** `deno test`/`deno check` (still no Deno CLI in this sandbox
— task-3's testing-boundary note, re-confirmed for the task-9 orchestration changes); `supabase db
push`/`supabase functions deploy`/`--linked` (never run from this pipeline); `supabase db reset`/
`test:rls` (no new live-DB dependency this slice, so not re-run — Slice 1's 9/9 RLS pass already
covers the schema/RLS surface, which is unchanged this slice).

## Stop condition (Slice 2)

Slice-2 gate is green (lint/check-types/tests, no hardcoded strings/colors/dimensions introduced).
Stopping here for the light `reviewer_code` + `reviewer_design` pass, per protocol — not
self-reviewing, not starting Slice 3.

---

## Slice-2 review round-1 fix — restrict retry affordance to transient errors (`review.md` §1)

`reviewer_design`'s only round-1 finding (minor): the Error state rendered one generic "Try
again" retry button for all 8 `PdfExtractionErrorCode`s, but spec.md's Error contract table (lines
63-72) gives each code its own distinct recovery action — only `network_error`/`extraction_failed`
genuinely say "Retry"; the other 6 say "Choose a smaller file" / "Choose a text-based PDF" /
"Choose another file" / "Sign in", etc. Since `usePdfExtraction.retry()` re-invokes with the exact
same remembered input/`documentId`, retrying those 6 deterministically reproduces the same
failure. Fixed via option (a) from the review — suppress the retry affordance for the 6
non-transient codes; the panel's persistent "Choose a PDF" control is already the correct recovery
action for them, so no new UI/navigation was added (including for `unauthenticated` — no new
"sign in" action, since the `(app)` route guard already handles the real auth boundary).

- **RED→GREEN, `pdf-upload-panel.tsx`**: added an optional `canRetry?: boolean` prop (default
  `true`, preserving every pre-existing test that doesn't pass it) — the Error state's retry
  `Button` only renders when `canRetry` is true. 1 new test in `pdf-upload-panel.test.tsx`:
  "does not render the retry affordance in the error state when canRetry is false". The panel
  stays a dumb, code-agnostic component — it only obeys the boolean, the classification itself
  lives one layer up.
- **RED→GREEN, `pdf-upload.tsx`**: added `RETRYABLE_ERROR_CODES` (`Set<PdfExtractionErrorCode>`,
  just `network_error`/`extraction_failed`) and wired `canRetry={error ? RETRYABLE_ERROR_CODES.has
  (error) : true}` into the panel. Kept inline in the wiring component (one of the review's
  suggested options) rather than `@helsoft/types` (that lib is plain-type-only, no logic, per
  `global.mdc` and the existing `auth-error.ts`/`pdf-extraction.ts` precedent — no function lives
  there today) or `@helsoft/services` (would've grown a third independently-declared error-code
  set alongside the two already reviewed as intentional trust-boundary guards; this classification
  is a UI/UX rule, not a trust boundary, so it belongs with the component that renders the UX).
  - Updated the pre-existing "shows the mapped error message and wires retry…" test to use
    `network_error` (a genuinely retryable code) instead of `too_many_pages` (now non-retryable),
    so its retry-press assertion stays valid.
  - Added 2 new exhaustive `it.each` blocks in `pdf-upload.test.tsx`, mirroring the file's existing
    `ERROR_CODE_TO_KEY` exhaustive-mapping pattern: all 6 non-transient codes assert the retry
    button is absent; both transient codes (`network_error`, `extraction_failed`) assert it's
    present. 8 new tests total.
- **Stories**: `pdf-upload-panel.stories.tsx`'s single `Error` story split into `ErrorRetryable`
  (a transient message, retry affordance shown) and `ErrorNonRetryable` (`too_many_pages`'s
  message, `canRetry: false`, no retry affordance) — still 4 UI states, now with both Error
  sub-cases visible in Storybook.
- **Verification**: `pnpm --filter @helsoft/components test` — 6/6 suites, 78/78 tests green (+1).
  `pnpm --filter @helsoft/study-buddy test` — 4/4 suites, 49/49 tests green (+8). Both
  `check-types` clean; `pnpm check-types` (8/8 packages) and `pnpm lint` clean repo-wide.

Not re-running Playwright e2e this cycle — no `.e2e.js` exists yet for `PdfUploadPanel` (Slice 2's
own gate note above: e2e is explicitly scoped to task-14/Slice 3, unaffected by this fix).

---

# Slice 3 (Analytics + a11y + i18n) — final slice

`implementator` build log for **Slice 3**, the last slice. Build order per `tasks.md`/this
session's brief: task-13 (i18n parity) → task-14 (a11y + Playwright e2e) → task-15 (analytics).

## Design reconciliation (recorded for reviewers)

- **`upload.imageCount` pluralization (task-13) is a real, tested i18next key — not wired into the
  UI this slice.** The brief asked for "success-summary copy… with i18next `_one`/`_other`
  pluralization mirroring `lessons.count_*`". Rather than restructuring the twice-reviewed-APPROVED
  Content-state layout (a `filenameLabel`/`pageCountLabel`/`imageCountLabel` + value grid, Slices
  1–2), `upload.imageCount_one`/`upload.imageCount_other` was added to all four bundles and proven
  via real `createI18n(locale).t('upload.imageCount', {count})` calls in `i18n.test.ts` — the same
  "resource file proven by its real consumer, not a dedicated per-key test" precedent as task-2's
  plain-type files, except here the *consumer* is i18next itself (a genuinely executable runtime
  contract, not a vacant type). No `PdfUploadPanel`/`PdfUpload` production code was touched for
  this key — nothing in the reviewed layout currently needs a combined "N images extracted"
  sentence, so wiring it in would be code with no test demanding it (Law 1). Left available for a
  future accessible-label use if a reviewer/future task wants one.
- **A new `libs/localization/src/coverage/upload-locale-parity.test.ts` guards the Slice-2 stub
  regression.** Slice 2 deliberately left `upload.constraintsHint`/`upload.retryAction`/
  `upload.error.*` in `es`/`pt`/`de` as verbatim English duplicates (to keep `TranslationResource`'s
  compile-time key-alignment green ahead of native review) — documented inline in each bundle file
  at the time. `TranslationResource` typing alone can't catch "still equals the English stub"; only
  a value-level runtime check can. This new test flattens each bundle and asserts every one of
  those 10 keys differs from its English counterpart in `es`/`pt`/`de` — RED before task-13's
  translations (30 failing assertions), GREEN after.
- **e2e port collision with a concurrent worktree session (environment note, not a code change).**
  `libs/components/playwright.config.js` hardcodes port 6007; another agent's session (a sibling
  git worktree, `activity-multiple-choice`) already had a Storybook dev server bound to that port,
  so Playwright's `reuseExistingServer` transparently attached to *that other worktree's* build —
  `iframe[title="storybook-preview-iframe"]`/URL assertions passed trivially (Storybook renders the
  iframe regardless of whether the story id resolves) while every content assertion timed out
  (the new `PdfUploadPanel` stories simply didn't exist in that other build). Diagnosed via `lsof
  -i :6007`. Fix: started a throwaway Storybook instance for this worktree on port 6017, temporarily
  pointed `playwright.config.js` at it, ran the full e2e suite, then `git checkout --` the config
  back to its committed 6007 value (confirmed via `git diff`/`git status` — zero net diff) and killed
  the throwaway instance. No lasting config change; this is an environment note for future sessions,
  not a fix or workaround baked into the repo.
- **Two pre-existing, unrelated e2e failures (`card.e2e.js`, one `text-field.e2e.js` case) on the
  first full-suite run — confirmed flaky/cold-start, not caused by this slice.** Both passed on an
  immediate re-run once the throwaway Storybook instance had finished its first Vite compile; they
  don't touch `PdfUploadPanel` or any file this slice changed. Not fixed (out of scope, unrelated to
  the feature) — noted here so a reviewer doesn't mistake them for a regression this session caused.
- **`PdfUploadPanel`'s a11y announcements mirror `login-form.tsx`'s already-established, already-
  reviewed pattern exactly** (`accessibilityLiveRegion` on the visible live-region text for
  Android/Web + an imperative `AccessibilityInfo.announceForAccessibility` call for iOS parity,
  since `accessibilityLiveRegion` has no effect on VoiceOver) — chosen over inventing a new pattern,
  and over touching the shared `ProgressIndicator`/`Button` atoms (both already carry the a11y
  properties this feature needs — `accessibilityRole="progressbar"`/`"button"`, and `Button`'s
  `HIT_SLOP` already floors every touch target at the `layout.touchTarget` (48dp) token — see the
  "verified, no change needed" bullet below).
- **Verified, no code change needed (task-14's remaining done-criteria bullets):**
  - *Role/label on the choose-file and continue/retry controls* — already real, tested behavior
    since Slices 1–2 (`Button`'s `accessibilityRole="button"` + its text child as the accessible
    name); `getByRole('button', {name: …})` assertions already exist for all three controls in
    `pdf-upload-panel.test.tsx`/`pdf-upload.test.tsx`. Confirmed, not re-added (a passing-on-first-
    run test proves nothing new — the existing tests already prove this).
  - *No color-only signaling* — the error banner's meaning is carried by its text message
    (`errorMessage`, always rendered), not by `errorContainer`'s background color alone; the color
    is a reinforcing cue, not the only one.
  - *Touch targets ≥ 44pt/48dp* — `Button`'s `HIT_SLOP` (`libs/components/src/atoms/button/
    button.tsx`) already expands every size variant's tappable area to `layout.touchTarget` (48,
    `libs/components/src/theme/spacing.ts:35`) — inherited for free, no new code.
  - *Constraints hint readable at scaled fonts* — `hintText`/`loadingText`/`summaryLabel`/
    `summaryValue`/`errorBannerText` all resolve through `theme.typography.*` tokens on a plain RN
    `Text`; grepped the whole component tree for `allowFontScaling` — zero hits, so RN's default
    (scalable) behavior is untouched.
- **task-15's analytics sink is a plain no-op function, not a pluggable "set the sink" registry.**
  Considered (and rejected) a `setPdfExtractionAnalyticsSink()`/mutable-singleton design and a
  pub-sub `subscribe()` design — both would add an extension point with zero current callers (no
  vendor exists yet, confirmed by grep before starting), which is speculative generality nothing in
  this session's tests demands. Also rejected `console.info`/`console.log` as the sink body — that
  reads exactly like the "no console.log / debug leftovers" finding `reviewer_code` flags, even
  though it would have been deliberate. Landed on the simplest thing that satisfies "thin,
  vendor-agnostic, decoupled, no SDK": one exported function, `trackPdfExtractionEvent`, whose body
  is empty today; wiring a real vendor later means editing this one function, never
  `PdfExtractionService`. Not exported through `@helsoft/services`'s main barrel (`src/index.ts`) —
  nothing outside this package needs to call or reference it yet, and adding the export wasn't
  demanded by any test (added it once, speculatively, then removed it — see below).
- **No separate hook-level "analytics integration test" — and why one that mocked `@helsoft/services`
  would have been a false test.** `usePdfExtraction`/wiring never call `trackPdfExtractionEvent`
  directly; only `PdfExtractionService.extract()` does, via its own **relative** import
  (`../analytics/pdf-extraction-analytics`). A hooks-package test that did
  `jest.mock('@helsoft/services', () => ({...jest.requireActual('@helsoft/services'),
  trackPdfExtractionEvent: jest.fn()}))` would resolve `'@helsoft/services'` to
  `libs/services/src/index.ts` and replace *that* module's exports — a completely different
  resolved file from `libs/services/src/analytics/pdf-extraction-analytics.ts`, which
  `pdf-extraction.service.ts` imports directly and which `jest.requireActual` would still load for
  real (transitively, via the real `PdfExtractionService` class inside the spread). The mocked
  `trackPdfExtractionEvent` property on the synthetic barrel object would sit unread; the real
  no-op would still be the one actually called. Worked this through by tracing Jest's per-resolved-
  path module registry before writing (and discarding) that test, rather than shipping a green test
  that verifies nothing. task-15's "analytics (task-15, @s17)" describe block inside
  `pdf-extraction.service.test.ts` — which mocks only the true external boundary, `PdfUploadDao`,
  exactly like every other test in that file — is this slice's legitimate integration-level coverage
  for the extraction lifecycle → analytics wiring (`tdd.md`'s "always one integration test" rule is
  satisfied per-concern here, since Slice 3 bundles three independent concerns rather than one
  vertical flow: task-13's is `i18n.test.ts`'s real-`createI18n`-against-real-bundles checks,
  task-14's is the Playwright e2e against real rendered Storybook output, task-15's is the
  service-level describe block above).
- **`document_id` is always populated on `pdf_extraction_failed`, even for the very first,
  earliest-possible client rejection (no session at all).** `extract(input, userId, documentId =
  generateDocumentId())`'s default parameter evaluates at call time regardless of where the
  function later branches, so a `documentId` already exists in scope before the `!userId` check
  runs. Since this id is an internal random UUID (never derived from or linked to any user-
  identifying value), attaching it uniformly to every failure — rather than making it
  conditionally present only after upload begins — keeps `trackExtractionFailure`'s shape simple
  (one helper, one call shape) without creating a PII risk; `document_id?` stays optional in the
  type only to leave room for a future call site that genuinely has none.
- **`PdfUploadPanel.stories.tsx` gained one new story, `InteractiveRetry`** (a small
  `useState`-backed wrapper, mirroring the existing `Checkbox`/`Switch` "Interactive" story
  pattern already used elsewhere in this lib) purely so the Playwright e2e could exercise the
  retry **interaction** itself (task-14's explicit "retry interaction" requirement) — pressing "Try
  again" visibly transitions the demo back to the Loading state — not just assert each state's
  static markup like the other 5 stories. Still within "reuse existing patterns": `render: () =>
  <Demo/>` + local `useState` is an established precedent (`checkbox.stories.tsx`), not a new one.

## @s → test map (Slice 3)

| @s | Scenario | Test(s) |
|---|---|---|
| @s15 | All user-facing strings are localized | `i18n.test.ts` (`upload.imageCount` real pluralization, en/es/pt/de), `upload-locale-parity.test.ts` (es/pt/de translations differ from the English stub for every previously-stubbed key), `migration-coverage.test.ts` (no hardcoded `<Text>` literals, unchanged from Slice 1), `pdf-upload-panel.test.tsx`/`pdf-upload.test.tsx` (all copy read via `labels`/`t()`, unchanged from Slices 1–2) |
| @s16 | The upload flow is accessible | `pdf-upload-panel.test.tsx` (polite live region + `AccessibilityInfo` announce on Loading; assertive live region + `AccessibilityInfo` announce, incl. re-announce-on-change, on Error; role/label coverage on choose-file/continue/retry — confirmed via existing Slices 1–2 tests), Playwright e2e (`pdf-upload-panel.e2e.js`: all 4 states' rendered markup + the `InteractiveRetry` story's actual retry click → Loading transition) |
| @s17 | The extraction lifecycle emits PII-free analytics | `pdf-extraction.service.test.ts`'s "analytics (task-15, @s17)" describe block: `pdf_upload_started` fires once validation passes and before the DAO is touched; `pdf_extraction_succeeded` fires with `document_id`/`page_count`/`image_count`/`duration_ms` on success; `pdf_extraction_failed` fires with `stage: 'client'` for both pre-validation and unauthenticated client rejections (and `pdf_upload_started` never fires for either); `pdf_extraction_failed` fires with `stage: 'server'` for a normalized server error; a dedicated PII-free-payload test asserts no emitted event ever contains the filename |

(@s1–@s14 unchanged from Slices 1–2; see those sections above for their maps.)

---

## task-13 — i18n `upload.*` keys across en/es/pt/de (@s15)

- **RED**, `i18n.test.ts`: 8 new `it.each` cases (`upload.imageCount` pluralization × 4 locales ×
  2 counts) failed — the key didn't exist in any bundle (`t()` returned the raw key, i18next's
  missing-key fallback).
- **RED**, new `upload-locale-parity.test.ts`: 30 failing assertions (10 stubbed keys × 3 non-
  English locales) — `es`/`pt`/`de`'s `constraintsHint`/`retryAction`/`error.*` were still verbatim
  copies of the English string (Slice 2's documented, deliberate interim state).
- **GREEN**: added `upload.imageCount_one`/`upload.imageCount_other` to all four bundles (real
  translations, not just `en`); replaced every stubbed `es`/`pt`/`de` value with a real, distinct
  translation. `fileTooLarge`/`tooManyPages` stay plain-text "10 MB"/"20 pages" phrasing per
  locale (Slice 2's decision — only `constraintsHint` is genuinely interpolated by the wiring
  layer; the other two never receive `{{maxMb}}`/`{{maxPages}}` args, so interpolating them now
  would ship an unfilled placeholder).
- **REFACTOR**: none needed — plain data edits, no logic.
- `pnpm --filter @helsoft/localization test` — 9/9 suites, 94/94 tests green. `check-types` clean
  for `@helsoft/localization`, `@helsoft/components`, `@helsoft/study-buddy` (consumers of
  `TranslationResource`).

## task-14 — Accessibility pass + Playwright e2e for `PdfUploadPanel` (@s16)

- **RED**, `pdf-upload-panel.test.tsx`: 5 new tests failed against the unmodified component —
  polite live region on the loading text; `AccessibilityInfo.announceForAccessibility` fired on the
  idle→loading transition; assertive live region on the error banner text;
  `AccessibilityInfo.announceForAccessibility` fired when an error renders; the announcement fires
  again when the error message changes to a different value (mutation-kill guard, mirrors
  `login-form.tsx`'s own precedent for the same dependency-array risk).
- **GREEN**: added two `useEffect`s (loading → announce `labels.loading`; `errorMessage` set →
  announce it) plus `accessibilityLiveRegion="polite"`/`"assertive"` on the respective `Text`
  nodes — a direct mirror of `login-form.tsx`'s already-reviewed pattern for the exact same problem.
- **REFACTOR**: none needed; the two effects stayed short and single-purpose from the start.
- **Playwright e2e** (`libs/components/tests/e2e/organisms/pdf-upload-panel/pdf-upload-panel.e2e.js`,
  via the `storybook-e2e-tests` skill): 7 tests — story-loads smoke test; Empty (affordance + hint,
  no error); Loading (copy + disabled choose-file control); Content (full summary + continue);
  ErrorRetryable (message + retry, choose-file stays enabled); ErrorNonRetryable (message, no retry
  affordance); and the new `InteractiveRetry` story's actual click-through (press "Try again" →
  Loading copy appears). Ran non-interactively (`playwright test --reporter=list`) against a
  throwaway port-6017 Storybook instance (see reconciliation above for why 6007 was occupied by a
  different worktree) — **7/7 new tests green**; 2 pre-existing, unrelated failures on the first
  pass (cold-start flake, confirmed by an immediate green re-run) — not this slice's concern.
- 18/18 `pdf-upload-panel.test.tsx` tests green (+5); `pnpm --filter @helsoft/components
  test`/`check-types` clean.

## task-15 — Extraction analytics events (@s17)

- **RED**, `pdf-extraction.service.test.ts`: added `jest.mock('../analytics/pdf-extraction-
  analytics', …)` + an import — failed immediately at module resolution (`Cannot find module`,
  the file didn't exist yet; per `tdd.md`'s "not compiling / not importing counts as failing").
- **GREEN**: created `libs/services/src/analytics/pdf-extraction-analytics.ts` — the closed,
  discriminated `PdfExtractionAnalyticsEvent` union (mirrors the three locked events exactly) and
  one no-op `trackPdfExtractionEvent` function (see reconciliation above for why not a
  setter/pub-sub, and not `console.*`). Wired `PdfExtractionService.extract()` to call it at three
  points: `pdf_upload_started` right after `validateFile()` passes (before any DAO call);
  `pdf_extraction_succeeded` right after `invokeExtraction()` resolves, with `duration_ms` measured
  from the upload-started instant; `pdf_extraction_failed` (via a new `trackExtractionFailure()`
  helper — single source of truth for that event's PII-free shape) from all three failure paths:
  the `!userId` pre-check (`stage: 'client'`), a `validateFile()` rejection (`stage: 'client'`),
  and the existing `catch` block's `normalizeExtractionError()` result (`stage: 'server'`).
- 6 new tests in a new "analytics (task-15, @s17)" describe block, all green: `pdf_upload_started`
  fires with the right payload before the DAO is touched; `pdf_extraction_succeeded` fires with
  `document_id`/`page_count`/`image_count`/a non-negative `duration_ms`; `pdf_extraction_failed`
  fires with `stage: 'client'` for both the pre-validation and the unauthenticated paths (and
  `pdf_upload_started` never fires for either); `pdf_extraction_failed` fires with `stage: 'server'`
  for a normalized server error; a dedicated test asserts no emitted payload ever contains the
  filename (PII-free, checked both via property-value membership and a stringified-payload
  substring match, so a future refactor that spreads `input`/`result` wholesale into a payload
  would fail this test immediately).
- **REFACTOR**: extracted `trackExtractionFailure(documentId, code, stage)` once the third call
  site (server catch) made the duplication concrete — one place constructs the
  `pdf_extraction_failed` shape.
- No production changes to `libs/study-buddy/src/components/pdf-upload/` — every event fires from
  the service layer, which the hook already calls unconditionally on every `extract()`/`retry()`
  attempt; the wiring component doesn't need to know analytics exists (task-15's own "keep business
  logic decoupled from the sink" goal, satisfied by not touching this layer at all).
- 19/19 `pdf-extraction.service.test.ts` tests green (+6); `pnpm --filter @helsoft/services
  test`/`check-types` clean (78/78 suite tests total, up from 72).

---

## Slice-3 gate — commands run for real

- `pnpm --filter @helsoft/localization test` — 9/9 suites, 94/94 tests green.
- `pnpm --filter @helsoft/services test` — 11/11 suites, 78/78 tests green (mocked, Docker-
  independent — no new live-DB dependency this slice).
- `pnpm --filter @helsoft/hooks test` — 6/6 suites, 29/29 tests green (unchanged from Slice 2 — no
  hook-layer code touched this slice, per the reconciliation note above).
- `pnpm --filter @helsoft/components test` — 6/6 suites, 83/83 tests green (+5).
- `pnpm --filter @helsoft/study-buddy test` — 4/4 suites, 49/49 tests green (unchanged — no wiring
  code touched this slice).
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 7/7 new
  `pdf-upload-panel` tests green (non-interactive, `list` reporter, per the `storybook-e2e-tests`
  skill's hard rule against the blocking HTML-reporter run); run against a throwaway port-6017
  instance for this worktree (see reconciliation above); `libs/components/playwright.config.js`
  confirmed byte-for-byte reverted to its committed (port 6007) state afterward (`git status`/`git
  diff` both empty for that file).
- `pnpm check-types` (whole repo, turbo) — 8/8 packages clean.
- `pnpm lint` (whole repo, turbo) — clean.
- `pnpm test` (whole repo, turbo) — 6/6 testable packages green.

**Not run / out of scope, by design:** `deno test`/`deno check` (no Deno CLI, task-3's testing-
boundary note — unchanged this slice, no Edge Function code touched); `supabase db push`/`supabase
functions deploy`/`--linked`/`db reset`/`test:rls` (no schema/RLS changes this slice, per this
session's brief — Slice 1's 9/9 RLS pass already covers the unchanged schema/RLS surface).

## Stop condition (Slice 3 — final slice)

Slice-3 gate is green (lint/check-types/tests/e2e, no hardcoded strings/colors/dimensions
introduced). This is the **last slice** — the `@s → test` map above, combined with Slices 1–2's
maps earlier in this file, covers `@s1`–`@s17` in full. Stopping here for the light
`reviewer_code`/`reviewer_design` slice review, per protocol — not self-reviewing. Once that's
clean, the feature moves to the full 6-reviewer round + mutation testing (not started here).

---

# Round-1 fix — full review + mutation findings

`implementator` fix cycle for `review.md`'s round-1 consolidated change request (9 findings: 3
major, 6 minor) plus the real (non-equivalent) mutation-testing gaps from `mutation.md`. Every item
below is a genuine RED→GREEN→(REFACTOR) cycle, not narration — `review.md`/`review-*.md`/
`mutation.md` themselves are untouched (out of scope for `implementator`; re-run separately by
`reviews_lead`/`mutation_tester`).

## Part A — review findings

**M1 — [security] no server-side file-size enforcement.**
- **RED**: `libs/services/src/pdf-extraction/file-size-guard.test.ts` (new file) — imports
  `isFileTooLarge` from a module that didn't exist yet (`Cannot find module`).
- **GREEN**: `libs/services/src/pdf-extraction/file-size-guard.ts` (new) — `isFileTooLarge(sizeBytes,
  limits) => sizeBytes > limits.maxSizeBytes`, mirroring `too_many_pages`'s short-circuit pattern.
  4 tests: well-under-limit (false), well-over-limit (true), and the two exact-boundary cases
  (Part B #3): `maxSizeBytes` itself → false (exclusive upper bound), `maxSizeBytes + 1` → true.
- Mirrored into `supabase/functions/extract-pdf/_shared/file-size-guard.ts` (Deno, untested here
  per the task-3/R4 testing boundary) and wired into `index.ts`: right after the source blob
  downloads, `isFileTooLarge(sourceBlob.size, PDF_EXTRACTION_LIMITS)` short-circuits to
  `file_too_large` (422, `markDocumentFailed`) **before** `sourceBlob.arrayBuffer()` is even read —
  cheaper than the pre-existing guards, which only run after a full parse.

**M2 — [performance] each embedded image decoded+encoded twice.**
- **RED**: rewrote `mupdf-extraction-adapter.test.ts`'s two image-assertion tests to expect
  `image.pixmap` (a real, callable `Pixmap`) instead of `image.bytes`/`image.mimeType` — failed
  with `TypeError: Cannot read properties of undefined (reading 'getWidth')` (the field didn't
  exist yet). Rewrote `image-downscale.test.ts` to build a real decoded `Pixmap` via
  `new mupdf.Image(png).toPixmap()` and pass `{ pixmap, width, height }` (no `bytes`/`mimeType`
  input) — failed with `TypeError: expected buffer` (the old code still tried to decode
  `input.bytes`, now `undefined`).
- **GREEN**: `pdf-extraction-adapter.ts`'s `ExtractedImage` now carries `pixmap: Mupdf.Pixmap`
  instead of `bytes`/`mimeType` (the one deliberate, documented exception to this file's
  library-swap-isolation goal). `mupdf-extraction-adapter.ts`'s `extractPageImages` pushes the
  already-decoded `pixmap` straight onto the result instead of `pixmap.asPNG()`.
  `image-downscale.ts`'s `downscaleImage` takes that pixmap directly — the `new mupdf.Image(bytes)
  .toPixmap()` re-decode line is gone entirely, along with the now-unnecessary dynamic `import
  ('mupdf')` inside the function. Net: 1 decode (adapter) + 1 final encode (downscale) per image,
  not 2 of each. Mirrored into both `_shared/pdf-extraction-adapter.ts` and
  `_shared/image-downscale.ts` (Deno).
- Also tightened per Part B #9 (see below) while in these files.

**M3 — [performance] `page.toStructuredText()` built twice per page.**
- Folded into the same M2 RED/GREEN cycle above (same files, same commit-worthy change):
  `MupdfExtractionAdapter.extract()`'s per-page loop now computes `structuredText` once and passes
  it into `extractPageImages(structuredText, pageNumber)`, which no longer calls
  `page.toStructuredText()` itself. Mirrored into `_shared/mupdf-extraction-adapter.ts`.

**N1 — [code] duplicated, unchecked error-code `Set` literals.**
- **GREEN** (no test changes needed beyond the existing suites, which already exercise every
  code): `pdf-extraction.service.ts`'s `KNOWN_ERROR_CODES` is now an exported
  `PDF_EXTRACTION_ERROR_CODES: Record<PdfExtractionErrorCode, true>` (exhaustive by construction,
  matching `UPLOAD_ERROR_KEYS`'s precedent) instead of a private `Set`. `use-pdf-extraction.ts`
  derives its own guard from that single exported source instead of re-declaring an independent
  `Set` — `use-pdf-extraction.test.ts`'s `jest.mock('@helsoft/services', …)` updated to export the
  same shape. `pnpm --filter @helsoft/hooks test` re-run green (31/31) to confirm the mock change
  didn't regress anything.

**N2 — [code] `stageToPanelState` loosely typed, untestable fallback.**
- **GREEN**: `pdf-upload.tsx`'s `stageToPanelState` retyped `Record<PdfExtractionStage,
  PdfUploadPanelState>` (imported from `@helsoft/hooks`); the call site drops `?? 'idle'` — now
  provably exhaustive, `tsc` proves every stage is covered. `pdf-upload.test.tsx`'s 30 existing
  tests (all 4 stages) re-run green with no changes needed to the tests themselves.

**N3 — [code] hardcoded `10 * 1024 * 1024 + 1` in a test.**
- **GREEN**: `pdf-extraction.service.test.ts`'s over-size test now derives
  `PDF_EXTRACTION_LIMITS.maxSizeBytes + 1`, importing the constant — mirrors
  `extraction-failure-detection.test.ts`'s existing correct pattern.

**N4 — [performance] sequential per-image storage uploads.**
- **GREEN** (Edge Function, untested here per R4): `index.ts`'s upload loop replaced with
  `Promise.all(downscaledImages.map(async ({ rawImage, downscaled }) => {…}))`, returning each
  image row; the single batch `document_images` insert still runs only after every upload
  resolves (ordering/no-partial-persistence guarantee unchanged).

**N5 — [accessibility] content summary not grouped for assistive tech.**
- **RED**: `pdf-upload-panel.test.tsx` — 3 new tests (`getByLabelText('File: notes.pdf')`,
  `getByLabelText('Pages: 12')`, `getByLabelText('3 images extracted')` /
  `getByLabelText('Images: 3')` fallback) — failed, no such accessible label existed yet.
- **GREEN**: each summary row (`pdf-upload-panel.tsx`) is now `accessible` with a composed
  `accessibilityLabel` — filename/pageCount rows compose `"{label}: {value}"` inline; the
  image-count row uses a new `imageCountAnnouncement?: string` prop when given, falling back to
  the same composed form otherwise. Wired at the call site: `pdf-upload.tsx` now computes
  `t('upload.imageCount', { count: result.imageCount })` — the task-13 `imageCount_one`/`_other`
  i18n keys, built for exactly this and left unwired until now — and passes it through. New
  `pdf-upload.test.tsx` test confirms the wiring (`t` spy called with `{ count: 2 }`, rendered
  label matches).

**N6 — [accessibility] `Button` has no visible keyboard-focus indicator.**
- **RED**: `use-interaction-state.test.ts` — two new tests reading `result.current.focus` /
  calling `result.current.handlers.onFocus()` — failed to compile (`Property 'focus' does not
  exist`). `button.test.tsx` — two new tests asserting the `StateLayer`'s opacity style is `0`
  before focus and `> 0` after `fireEvent(button, 'focus')` — failed (`getByTestId` found nothing,
  no test ID existed on `StateLayer`).
- **GREEN**: `useInteractionState` gained a `focus` boolean + `onFocus`/`onBlur` handlers
  (additive — existing `hover`/`press`/`handlers` shape unchanged). `StateLayer` gained an optional
  `testID` prop (additive, forwarded to its `View`). `Button` destructures `focus`, spreads
  `handlers` (already includes `onFocus`/`onBlur`) onto its `Pressable` as before, and its
  `stateOpacity` `useMemo` now checks `press > focus > hover` precedence, reading
  `theme.stateLayerOpacity.focus` (already defined, previously unread).
- One real bug found mid-cycle: `fireEvent(...)` from `@testing-library/react-native` is `async`
  and must be `await`ed inside `act(async () => {…})` for the resulting `setFocus` state update to
  flush before the assertion — the existing `login-form.test.tsx` precedent
  (`await act(async () => { fireEvent.changeText(...) })`) confirmed the pattern; without it the
  test passed *only because the assertion silently no-op'd* (a "test that passes on the first run
  proves nothing" case, caught by re-deriving the intent, not by tightening after the fact).
- Regression check (N6 explicitly requires this — shared, pre-existing atom): `pnpm --filter
  @helsoft/components test` (94/94, including `login-form.test.tsx`), `pnpm --filter
  @helsoft/components exec playwright test --reporter=list` (34/34, including
  `login-form.e2e.js`) — both green, confirming the additive change doesn't regress the already-
  shipped `login-form.tsx` consumer.

## Part B — mutation gaps closed

1. **`pdf-upload-panel.tsx` absence assertions** — `pdf-upload-panel.test.tsx`: `it.each(['loading',
   'content', 'error'])('does not show the constraints hint in the %s state', …)` and
   `it.each(['idle', 'loading', 'error'])('does not show the content summary in the %s state', …)`
   — both kill the `state === 'x' ? … : true ? … : null`-shaped conditional-always-true mutants
   reported in `mutation.md`.
2. **`duration_ms` sign** — `pdf-extraction.service.test.ts`'s success-analytics test now mocks
   `Date.now()` with two fixed sequential values (`1_000`/`1_050`) and asserts `duration_ms` is
   exactly `50` (not just `expect.any(Number)`) — deterministic, kills the `Date.now() - startedAt`
   → `+` mutant without relying on real (possibly-0ms) wall-clock timing.
3. **File-size boundary, both sides** — covered above: client pre-check in
   `pdf-extraction.service.test.ts` ("accepts a file exactly at the size limit…") and server-side
   in `file-size-guard.test.ts` (both exact-`maxSizeBytes` and `+1` cases).
4. **`asset.size` null fallback** — `pdf-upload.test.tsx`: new test picks an asset with `size:
   null`, asserts `extract()` is called with `sizeBytes` equal to the read `bytes.byteLength` —
   kills the `??` → `&&` mutant.
5. **`canRetry` idle default** — extracted `computeCanRetry(error): boolean` out of the inline
   ternary in `pdf-upload.tsx` (a small, directly-named refactor — the default is otherwise
   unreachable through any rendered assertion, since the idle/loading/content states never render
   the retry affordance regardless of the value) and unit-tested it directly:
   `computeCanRetry(null) === true`, plus the retryable/non-retryable cases.
6. **`maxMb` interpolation value** — `pdf-upload.test.tsx`: new test swaps in a `t: jest.fn((key) =>
   key)` spy (the shared `localizationValue()` factory's default `t` ignores its second argument
   entirely) and asserts `t` was called with `{ maxMb: 10, maxPages: 20 }` (derived from
   `PDF_EXTRACTION_LIMITS`, not hardcoded) — kills the `/` → `*` mutant on the `maxMb` calculation.
7. **`extraction-failure-detection` precedence, boundary variant** — added a second precedence test
   at the tightest boundary that still violates both guards (`maxPages + 1` pages, empty text) —
   the existing precedence test used 25 pages (far past the 20 limit), which wouldn't catch a
   `>` → `>=` mutation on the page-count guard; the boundary variant does.
8. **`test-utils/` fixture-builder survivors** — confirmed via `grep -rln` that
   `build-solid-png.ts`/`build-test-pdf.ts` are imported **only** from `*.test.ts` files, nowhere in
   shipped production code — genuine test fixtures, not mutation-testable logic. Excluded from
   scope with a one-line documented justification in both `.agents/skills/mutation-testing/scripts/
   run-mutation.sh` (the `git diff`-based file filter) and `libs/services/stryker.config.mjs`'s
   default `mutate` glob (`!src/**/test-utils/**`), rather than left as unexplained survivors.
9. **`mupdf-extraction-adapter.ts`/`image-downscale.ts` remaining survivors** — closed naturally as
   part of the M2/M3 refactor (the old re-decode/re-encode code paths those mutants lived in no
   longer exist) plus tightened assertions: the adapter test now asserts `image.pixmap.getWidth()`/
   `getHeight()` match the recorded `width`/`height` fields (proving the handed-through pixmap is
   internally consistent, not just present); the downscale tests now decode the *returned* bytes
   back into a real pixmap and assert its actual dimensions for both the oversized-opaque and
   alpha-channel cases (verifying the real re-encoded image, not just the metadata object), and the
   "does not upscale" case now also asserts `mimeType: 'image/jpeg'`.

## Full-workspace re-run (post-fix)

- `pnpm --filter @helsoft/services test` — 12/12 suites, 84/84 tests green (+1 suite:
  `file-size-guard.test.ts`; +6 tests net across the touched files).
- `pnpm --filter @helsoft/hooks test` — 6/6 suites, 31/31 tests green (+2:
  `use-interaction-state.test.ts`'s focus tests).
- `pnpm --filter @helsoft/components test` — 6/6 suites, 94/94 tests green (+11 across
  `pdf-upload-panel.test.tsx`/`button.test.tsx`), including the pre-existing `login-form.test.tsx`
  (N6 regression check).
- `pnpm --filter @helsoft/study-buddy test` — 4/4 suites, 55/55 tests green (+6 across
  `pdf-upload.test.tsx`).
- `pnpm --filter @helsoft/localization test` — 9/9 suites, 94/94 tests green (unchanged — confirms
  the `upload.imageCount_*` keys were already locale-complete before this fix).
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 34/34 (all e2e specs,
  not just `pdf-upload-panel`) green, including `login-form.e2e.js` (N6 regression check). Run
  against a throwaway alternate-port Storybook instance for this worktree (port 6007 was held by
  an unrelated concurrent worktree's dev server — same reconciliation as Slice 3's gate);
  `libs/components/playwright.config.js` confirmed reverted to its committed (port 6007) state
  afterward (`git diff` empty for that file).
- `pnpm check-types` (whole repo, turbo) — 8/8 packages clean.
- `pnpm lint` (whole repo, turbo) — clean.

**Not re-run / out of scope, by design (unchanged from the full review's own "known, locked
decisions" list):** `deno test`/`deno check` (no Deno CLI, task-3/R4 testing-boundary note — the
`_shared/` mirror edits for M1–M3/N4 are code-only, faithfulness-checked by hand against their
Jest-tested twins, same as every prior mirror edit this feature has made); `supabase db push`/
`functions deploy`/`test:rls` (no schema/RLS changes this round).

## Stop condition (round-1 fix)

Every Part A finding (3 major, 6 minor) and every Part B mutation gap flagged as a real test gap
(not already justified as equivalent/acceptable in `mutation.md`) has a genuine failing-test-first
fix above. `review.md`/`review-*.md`/`mutation.md` are unchanged — re-run separately by
`reviews_lead`/`mutation_tester` for round 2 of the (reduced) 2-round cap. Feature status/phase
left untouched — that's `orchestrator_lead`'s call, not `implementator`'s.

## Mutation-closure pass (post full-review round 2, pre-DoD)

Context: the full 6-reviewer review is APPROVED with zero findings (round 2, locked — not touched
in this pass). Round 2's `mutation.md` reported 39 survivors (80.86%) across
`@helsoft/{services,hooks,components,study-buddy}`, plus `@helsoft/localization` failing to run
under Stryker at all. Directive for this pass: kill every mutant for real, not narrate it as
acceptable — with at most 1-3 individually-justified, ignore-commented equivalents.

**First finding, before any fix**: both `pnpm --filter <lib> test`'s real counts and several of
`mutation.md`'s own per-mutant rationales were stale/inaccurate (confirmed by re-running Stryker
fresh, scoped per file, rather than trusting the round-2 narrative):

| Workspace | `mutation.md` claimed | Actually measured |
|---|---|---|
| `@helsoft/services` | 78 tests / 10 suites | **84 tests / 12 suites** |
| `@helsoft/hooks` | 29 tests / 5 suites | **31 tests / 6 suites** |
| `@helsoft/components` | 83 tests / 6 suites | **94 tests / 6 suites** |
| `@helsoft/study-buddy` | 49 tests / 4 suites | **55 tests / 4 suites** |
| `@helsoft/localization` | 94 tests / 8 suites | 94 tests / **9 suites** |

Several "acceptable survivor" rationales also didn't match a fresh Stryker run's actual mutants at
that file/line (e.g. `extraction-failure-detection.ts`'s claimed "precedence order" survivors were
really `>`/`<` boundary mutants; `mupdf-extraction-adapter.ts`'s claimed "loop edge cases" were
really an unasserted MIME-type argument and a missing `.trim()` exact-value check;
`pdf-upload-panel.tsx`'s claimed "2 conditional-rendering absence gaps" turned out not to exist —
every conditional gate was already fully killed). Every fix below is against the **real**,
freshly-measured survivor, not the report's prose.

### Scope note — two categories explicitly left untouched per human direction mid-pass

1. **`pdf-upload-panel.tsx` styling mutations** (~15 `StyleSheet`/color/layout survivors) — no
   `toHaveStyle` assertions added; left exactly as round 2 classified them (unit tests don't inspect
   visual styling; the `pdf-upload-panel.e2e.js` Playwright suite guards it). No code/test change.
2. **`PDF_IMAGES_BUCKET`** (`pdf-extraction.constants.ts:48`) — left as an accepted, undocumented
   survivor exactly as before (confirmed via `grep -rn` across every Jest-tested workspace: the only
   other place this exact export name appears is the Deno Edge Function's own independent
   `supabase/functions/extract-pdf/_shared/pdf-extraction.constants.ts` copy — never imported by any
   Jest-tested code path). No `// Stryker disable` comment added — explicitly declined for this one.

### Category 1 — `pdf-extraction.constants.ts` + `PDF_UPLOAD_BUCKET` (`@helsoft/services`)

- Added `src/services/pdf-extraction.constants.test.ts` (new file) asserting every exported
  constant's exact literal value: `PDF_EXTRACTION_LIMITS.maxSizeBytes`/`maxPages`,
  `PDF_FILE_EXTENSION`, `SCANNED_DETECTION_MIN_TEXT_LENGTH`, `IMAGE_DOWNSCALE_TARGET`, and
  `PDF_UPLOAD_BUCKET` — kills all 3 value/string mutations Stryker reported for this file (the
  4th, `PDF_IMAGES_BUCKET`, is the declined exception above).
- `pdf-upload.dao.test.ts`: added a `storageFrom` spy (`storage: { from: storageFrom }`, replacing
  the previously-unasserted inline `jest.fn()`) and `expect(storageFrom).toHaveBeenCalledWith
  ('pdf-uploads')` in the upload test — mirrors the existing `expect(from).toHaveBeenCalledWith
  ('documents')` pattern two lines below it. Kills the `PDF_UPLOAD_BUCKET → ''` survivor.
- Result: `pdf-extraction.constants.ts` + `pdf-upload.dao.ts` scoped Stryker run — 100% (22/22
  killed, 1 declined exception per the scope note above).

### Category 2 — `extraction-failure-detection.ts` boundary guards (`@helsoft/services`)

Fresh Stryker run showed the real survivors were `>` → `>=` (page-count guard) and `<` → `<=`
(scanned-text guard) boundary mutants, not a "precedence order" gap (the existing precedence test
already pinned that). Added two boundary tests:
- `does not report too_many_pages when the page count exactly equals the limit` (pages = 20, i.e.
  `PDF_EXTRACTION_LIMITS.maxPages`) — expects `null`, kills the `>` → `>=` mutant.
- `does not report scanned_or_image_only when the combined extracted text exactly equals the
  threshold` (text length = 40, i.e. `SCANNED_DETECTION_MIN_TEXT_LENGTH`) — expects `null`, kills
  the `<` → `<=` mutant.

Result: 100% (9/9 killed).

### Category 3 — `image-downscale.ts` conditional branches (`@helsoft/services`)

Fresh survivors: the `isDecorative` `||` guard's left/right operands (`ConditionalExpression`+2
`EqualityOperator` boundary mutants) and the `scale === 1 ? input.pixmap : resizePixmap(...)`
no-upscale branch (`ConditionalExpression`). Added:
- `drops a narrow-but-tall decorative image` (width 4, height 800) — the asymmetric mirror of the
  existing "wide-but-thin" case; pins the `width < X` operand independently of `height < X`, which
  the existing test's symmetric-truthiness case couldn't distinguish from `false`.
- `keeps an image exactly at the 100x100 decorative-floor boundary` (100×100, both dimensions at
  the exact floor) — kills both `<` → `<=` boundary mutants in one assertion.
- Extended the existing "does not upscale" test with a `jest.spyOn(mupdf.Pixmap.prototype, 'warp')`
  spy asserting `not.toHaveBeenCalled()` — the real, exported `Pixmap.warp` method (confirmed via
  `mupdf`'s own dist source: `class Pixmap extends Userdata { ... warp(points, width, height) {...}
  }`) is a legitimate collaborator-interaction seam to spy on, same pattern as DAO mock assertions;
  proves the resize path is genuinely skipped, not just that the output dimensions happen to match
  what a same-size resize would also produce.

Result: 100% (26/26 killed).

### Category 4 — `mupdf-extraction-adapter.ts` (`@helsoft/services`)

Fresh survivors: `mupdf.Document.openDocument(bytes, 'application/pdf')`'s MIME-type argument was
never asserted, and `structuredText.asText().trim()`'s `.trim()` call was never proven (only
`stringContaining` assertions, which pass identically with or without the trailing `'\n\n'`
`asText()` empirically returns — confirmed via a throwaway inspection test, then removed). Added:
- `opens the document bytes with the application/pdf MIME type` — spies on the real, static
  `mupdf.Document.openDocument` and asserts `toHaveBeenCalledWith(bytes, 'application/pdf')`.
- Changed the "extracts text from every page" test's assertions from `expect.stringContaining(...)`
  to exact string equality (`'Hello page one'`, not `'Hello page one\n\n'`) — kills the `.trim()`
  removal mutant directly.

Result: 100% (11/11 killed).

### Category 5 — `pdf-extraction.service.ts` (`@helsoft/services`)

Fresh survivors matched `mutation.md`'s claims here. Added:
- `generates each hex digit from Math.random(), with the version fixed at 4 and the variant clamped
  to 8-b at their exact template positions` — mocks `Math.random()` to a fixed `0` and asserts the
  exact resulting UUID string (`'00000000-0000-4000-8000-000000000000'`). The prior uniqueness-only
  assertion couldn't distinguish a mutant that always takes the "clamp to variant" branch (which
  still produces syntactically-valid, unique-looking UUIDs) from the real per-position logic; a
  fixed-random exact match does. Kills both the `ConditionalExpression` and `StringLiteral`
  mutants on line 25 in one test.
- Extended the `unauthenticated`-rejection test with an exact `.message` assertion
  (`'PDF extraction failed: unauthenticated'`) alongside the existing `.code` check — kills the
  `Object.assign(new Error(...), ...)` → `new Error('')` mutant directly.
- Added `falls back to extraction_failed when the server error body itself resolves to null` — a
  direct investigation of the `body?.errorCode` optional-chaining mutant per the dispatch's
  instruction to "investigate hard before accepting as equivalent." Result: **confirmed genuinely
  equivalent**, not just narrated — `readFunctionErrorCode`'s surrounding `try { ... } catch {
  return 'extraction_failed'; }` swallows the `TypeError` that `body.errorCode` throws when `body`
  is `null` (with `?.` removed), producing the *identical* `'extraction_failed'` fallback either
  way; the new null-body test itself doesn't kill the mutant (proving the equivalence empirically,
  not just by code reading). Documented with a `// Stryker disable next-line OptionalChaining:`
  comment directly above the line (this repo's first use of the mechanism) citing the exact reason
  and pointing at the test that confirms it.
- Added `normalizes an unrecognized error type as extraction_failed, not network_error` (rejects
  with a plain `new Error(...)`, none of the three known DAO-thrown shapes) — this was the *real*
  gap behind the `if (cause instanceof FunctionsFetchError || cause instanceof FunctionsRelayError)`
  → `if (true)` survivor: the two existing `network_error` tests only exercised the "true" side; the
  final `extraction_failed` catch-all branch had no test forcing a *non-transport, non-Http* cause
  through it, so the union check was never actually pinned. Not equivalent — a real, closed gap.

Result: 100% (34/34 killed, 1 documented equivalent exclusion).

### Category 6 — `pdf-upload-panel.tsx` conditional-rendering gaps (`@helsoft/components`)

Per the scope note above, styling mutations were left untouched. Investigated the "2
conditional-rendering absence gaps" `mutation.md` claimed: a fresh, scoped Stryker run showed
**zero** surviving `ConditionalExpression` mutants on any state gate (idle/loading/content/error) —
every gate already has both a positive render test and an `it.each`-driven absence test in every
other state. The only two *non-styling* survivors were `PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID`
(a private, non-exported-outside-file constant referenced identically by both the source's
`testID` prop and the test's `getByTestId(...)` lookup — a genuine constant-sync equivalent, same
reasoning as `PDF_MIME_TYPE` below) — no code/test change needed; the claimed absence gaps do not
exist. No fix required for this category beyond confirming there was nothing left to fix.

### Category 7 — `pdf-upload.tsx` (`@helsoft/study-buddy`)

Fresh survivors: `DocumentPicker.getDocumentAsync`'s `type` argument was unasserted; the `labels`
object's `filenameLabel`/`pageCountLabel`/`imageCountLabel`/`continueLabel` i18n keys were never
asserted to render (only their *interpolated values*, e.g. `'notes.pdf'`/`4`/`2`, were checked);
and `PDF_MIME_TYPE`. Added:
- `expect(mockGetDocumentAsync).toHaveBeenCalledWith({ type: 'application/pdf' })` in the existing
  web-picker test.
- Extended "shows the content summary" into "shows the content summary, its field labels, and the
  continue affordance once stage is success", asserting `screen.getByText('upload.filenameLabel')`
  /`'upload.pageCountLabel'`/`'upload.imageCountLabel'` and `getByRole('button', { name:
  'upload.continue' })` — kills all 4 label-key `StringLiteral` mutants.
- `PDF_MIME_TYPE` turned out **not** to be equivalent after all (unlike `mutation.md`'s claim that
  "the constant is both exported and imported by the component and its test" — false: it's a
  module-private, non-exported `const`, and the test file never imports it). It was killed
  incidentally by the `getDocumentAsync` argument assertion above, which hardcodes the literal
  `'application/pdf'` independently rather than referencing the source constant.
- The `network_error`/`unauthenticated` i18n-key mutations `mutation.md` claimed were only "6 of 8"
  killed were, on a fresh run, **already fully killed** by the existing `it.each(Object.entries
  (ERROR_CODE_TO_KEY))` exhaustive test — no additional fix needed there.

Result: 100% (45/45 killed, 0 exclusions).

### Category 8 — `@helsoft/localization` Stryker sandbox failure

Root cause confirmed by inspecting `.stryker-tmp/sandbox-*/` directly: Stryker's per-package
sandbox for this workspace mirrors only `libs/localization`'s own directory tree (nested one level
deeper, under `.stryker-tmp/sandbox-<id>/`), not the whole monorepo. `migration-coverage.test.ts`'s
`REPO_ROOT = resolve(__dirname, '../../../..')` assumed a fixed hop count from `src/coverage/` to
the real repo root; inside the sandbox, that same fixed hop count landed on
`libs/localization` itself instead (one level short), so `readdirSync(APP_SCREENS)` and the two
`AUTH_COMPONENT_DIRS` scans threw `ENOENT`, failing Stryker's *initial dry run* outright — blocking
mutation testing for every file in this workspace, not just the ones `en.ts`/`i18n.ts` proper.

Fix: replaced the fixed-hop `resolve()` with `findMonorepoRoot(startDir)`, which walks upward from
`__dirname` looking for the real repo's `pnpm-workspace.yaml` marker file instead of counting `..`
segments. This is sandbox-safe in a way a different hop count wouldn't be, because Stryker's sandbox
is a real directory on disk (not a chroot) — walking far enough up from it reaches the actual,
unmutated monorepo root and its real sibling packages (`apps/app-study-buddy`, `libs/study-buddy`,
`libs/components`), which this suite's own `mutate` scope never touches. Throws a clear error if no
marker is found in 10 hops (was silently wrong before; now fails loudly, matching Law 2's spirit for
test code).

Verified: `pnpm --filter @helsoft/localization test` — 9/9 suites, 94/94 tests green (unchanged
assertions, same real audit behavior). `pnpm --filter @helsoft/localization exec stryker run
--mutate "src/resources/en.ts"` — dry run now **succeeds** and Stryker completes a full run,
reporting a real score (18.84% on this particular file, all survivors on resource *values* the
key-existence-based suite was never designed to catch — exactly `mutation.md`'s own prediction for
value mutations, not a hidden gap). The structural blocker (workspace failing to run under Stryker
at all) is closed; `mutation_tester` re-runs with the feature's actual scoped file set for a final
number.

## Full-workspace re-run (mutation-closure pass)

- `pnpm --filter @helsoft/services test` — 13/13 suites, 97/97 tests green (+1 suite:
  `pdf-extraction.constants.test.ts`; +13 tests net across the touched files).
- `pnpm --filter @helsoft/hooks test` — 6/6 suites, 31/31 tests green (untouched this pass).
- `pnpm --filter @helsoft/components test` — 6/6 suites, 94/94 tests green (untouched this pass,
  confirmed no regression).
- `pnpm --filter @helsoft/study-buddy test` — 4/4 suites, 55/55 tests green.
- `pnpm --filter @helsoft/localization test` — 9/9 suites, 94/94 tests green.
- `pnpm --filter @helsoft/components exec playwright test tests/e2e/organisms/pdf-upload-panel
  --reporter=list` — 7/7 e2e specs green (no source change in this pass; confirms no regression).
- `pnpm check-types` (whole repo, turbo, `--force`) — 8/8 packages clean.
- `pnpm lint` (whole repo, turbo, `--force`) — clean (only `app-study-buddy` defines a `lint`
  script; pre-existing repo convention, unrelated to this pass).

## Stop condition (mutation-closure pass)

Every category in the dispatch has a real, freshly-measured fix or a specific, individually-argued,
empirically-confirmed exception:
- **1 documented equivalent** (`OptionalChaining`, `pdf-extraction.service.ts:62`) — commented
  in-code with `// Stryker disable next-line`, confirmed via a dedicated null-body test that itself
  doesn't kill it (not just code reading).
- **2 accepted-as-is per explicit human scope reduction, mid-pass** — `pdf-upload-panel.tsx`
  styling survivors (~15) and `PDF_IMAGES_BUCKET` (both left exactly as round 2 classified them, no
  new code/comment).
- **Every other real gap has a genuine, failing-test-first fix** — no narrative-only closures, no
  padding `mutation.md` with more justification prose. `review.md`/`review-*.md` untouched (locked,
  round 2, zero findings). `mutation.md` itself untouched — `mutation_tester` re-runs and reports
  the final consolidated score. Feature status/phase left untouched.
