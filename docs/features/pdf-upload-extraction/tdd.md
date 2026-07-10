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
