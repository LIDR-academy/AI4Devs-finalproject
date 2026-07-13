# Review — performance (`reviewer_performance`)

Feature: `pdf-upload-extraction` — full, all-slices-done review, round 2/2 (hard cap).
Scope: `0dfc914..HEAD` (`904d06e`), verifying the round-1 fix commit `76b4be4` plus everything
touched since (`6474a15`, `2073e65`, `904d06e`).

## Verdict: APPROVED — zero findings

All three round-1 performance findings are genuinely resolved, traced through the actual data
flow (not just the commit message/comments). Nothing newly touched since round 1 introduces a
performance regression. No new findings.

---

## M2 — RESOLVED: one decode + one final encode per image, no PNG-bytes round-trip

Traced the full data flow in both the Jest-tested lib and its Deno mirror:

- **Decode (once, in the adapter):** `libs/supabase-services/src/pdf-extraction/mupdf-extraction-adapter.ts:22`
  — `const pixmap = image.toPixmap();` inside `extractPageImages`. The resulting `Pixmap` is pushed
  straight into `ExtractedImage.pixmap` (`:26`) — no `asPNG()`/serialize step anywhere in this file.
  Mirrored identically at `supabase/functions/extract-pdf/_shared/mupdf-extraction-adapter.ts:18,22`.
- **Seam type change that makes this possible:** `ExtractedImage.pixmap: Mupdf.Pixmap` (was
  `bytes: Uint8Array` + `mimeType: string`) — `libs/supabase-services/src/pdf-extraction/pdf-extraction-adapter.ts:26-31`,
  mirrored at `supabase/functions/extract-pdf/_shared/pdf-extraction-adapter.ts:14-19`. `DownscaleImageInput.pixmap: Mupdf.Pixmap`
  — `libs/supabase-services/src/pdf-extraction/image-downscale.ts:8`, mirrored at `_shared/image-downscale.ts:10`.
- **Final encode (once, in downscale):** `libs/supabase-services/src/pdf-extraction/image-downscale.ts:64`
  (`pixmap.asPNG()`, alpha branch) / `:66` (`pixmap.asJPEG(IMAGE_DOWNSCALE_TARGET.jpegQuality)`,
  opaque branch) — the `pixmap` operated on is either `input.pixmap` directly or `resizePixmap(input.pixmap, ...)`
  (`:61`), never a value re-derived from serialized bytes. `new mupdf.Image(...)` (the re-decode
  call that produced M2 originally) no longer appears anywhere in this file. Mirrored identically
  at `_shared/image-downscale.ts:53,55-62`.

Confirmed **1 decode + 1 final encode per image** in both the lib and its Deno mirror — the
PNG-bytes round-trip is gone.

## M3 — RESOLVED: `structuredText` built exactly once per page

`libs/supabase-services/src/pdf-extraction/mupdf-extraction-adapter.ts:53-61` — the per-page loop:
```
const structuredText = page.toStructuredText(STRUCTURED_TEXT_OPTIONS);   // :58 — once
pages.push({ page: pageNumber, text: structuredText.asText().trim() });   // :59 — reuses it
images.push(...extractPageImages(structuredText, pageNumber));            // :60 — passes it in
```
`extractPageImages` (`:18-33`) now takes `structuredText: Mupdf.StructuredText` as a parameter and
calls `.walk(...)` on it directly (`:20`) — no independent `page.toStructuredText(...)` call
remains inside it. Grepped the whole adapter file: `toStructuredText` appears exactly once
(line 58). Mirrored identically at `supabase/functions/extract-pdf/_shared/mupdf-extraction-adapter.ts:14,48-50`
(one call at `:48`, threaded into `extractPageImages(structuredText, pageNumber)` at `:50`).

Confirmed **1 structured-text build per page** (20 for a 20-page document, not 40) in both the lib
and its mirror.

## Locked downscale targets — not regressed

- `libs/supabase-services/src/services/pdf-extraction.constants.ts:34-41` (`IMAGE_DOWNSCALE_TARGET`) is
  byte-identical to before the fix (`maxLongestEdgePx: 1024`, `jpegQuality: 80`, `minDimensionPx: 100`)
  — `image-downscale.ts:3` still imports it as the single source, unchanged import path.
- `resizePixmap` (`image-downscale.ts:30-40`), `computeScale` (`:27-28`, never-upscale clamp
  unchanged), `isDecorative` (`:23-24`, 100px floor unchanged), and the alpha-branch PNG-vs-JPEG
  split (`:56,63-70`) are logically unchanged — only their input type moved from
  `{ bytes, width, height, mimeType }` to `{ pixmap, width, height }`.
- `image-downscale.test.ts` still exercises all five scenarios: oversized-opaque→1024px/JPEG
  (`:19-35`), never-upscale (`:39-46`), alpha→PNG (`:51-62`), decorative-floor drop (`:66-73`), and
  the wide-but-thin decorative-floor boundary (`:77-84`). Diffed against the pre-fix version
  (`git diff 76b4be4~1..76b4be4`): assertions got **strictly stronger**, not weaker — the oversized
  and alpha cases gained a real decode-and-measure-the-actual-bytes check (`:31-34`, `:58-61`) on
  top of the pre-existing metadata assertions, guarding against a mutant that fakes the returned
  `width`/`height` fields without actually resizing the pixel data.
- Ran the real suite (not trusting the diff alone): `libs/supabase-services` Jest, `pdf-extraction` scope —
  **6 suites / 40 tests, all green** (`image-downscale.test.ts`, `mupdf-extraction-adapter.test.ts`,
  and 4 others). `pnpm --filter @helsoft/supabase-services check-types` — clean, no errors.

No regression to any of the four locked targets.

## N4 — RESOLVED: concurrent uploads, and the partial-persistence ordering still holds

`supabase/functions/extract-pdf/index.ts:137-157` — the per-image loop is now
`const imageRows = await Promise.all(downscaledImages.map(async ({ rawImage, downscaled }) => { ... }))`,
replacing the round-1 sequential `for (const { rawImage, downscaled } of downscaledImages) { await ... }`.
Each mapped async function uploads (`:142-145`) and, on success, returns the row shape for the
batch insert; an `uploadError` still `throw`s (`:145`) into the same rejection path as before.

**Partial-persistence check:** the documented invariant (`tdd.md:396-405`, task-9, AC12/@s12) is
scoped to `document_images` **DB rows** / usable `pages`, not to storage blobs — "no partial
`document_images`/usable `pages` retained". That invariant is unaffected by the `for`→`Promise.all`
change: `imageRows` (`:137`) is only ever assigned if `Promise.all` **resolves**, and the single
batch `.insert(imageRows)` (`:163`) only runs after that assignment — so a rejection from any one
upload still means **zero** `document_images` rows are ever inserted, exactly as before. `Promise.all`
rejecting on the first failure without cancelling in-flight siblings doesn't change this: whether 1
of 4 uploads fails or all 4 do, the DB insert is equally never reached. The one true behavioral
difference — concurrently-*in-flight* sibling uploads may still land in Storage after the
triggering rejection, versus the sequential version's `for`-loop stopping immediately and never
attempting them — is a change in worst-case orphaned-*storage-blob* count (bounded by image count),
not a change in DB-row atomicity. That's outside this feature's documented no-partial-persistence
contract (which is DB-row-scoped) and outside this rubric's round-trip/re-render/bundle concerns;
noting it here for completeness, not as a performance finding.

Confirmed **concurrent** (not sequential) per-image uploads, with the batch-insert-after-all-uploads
ordering intact.

---

## Fresh pass over everything else touched since round 1

- **`use-interaction-state.ts`** (`libs/hooks/src/hooks/use-interaction-state.ts:1-42`, the a11y
  focus-tracking fix, N6 from round 1): adds one more `useState(false)` and two trivial
  `setFocus(true/false)` handlers, same shape/cost as the pre-existing `hover`/`press` state. No
  synchronous work of any weight; still returns a fresh object per render, same as it always did
  for `hover`/`press` — not a new pattern, not a hot-path list item (consumed by `Button`/`Chip`/
  `Card`/`Fab`/`IconButton`, each a single instance per render site).
- **`button.tsx`** (`libs/components/src/atoms/button/button.tsx:59-88`): `stateOpacity`'s
  `useMemo` dependency array correctly extended to include the new `focus` value (`:88`) — no stale
  memo risk, no unnecessary recompute.
- **`pdf-upload-panel.tsx`** (`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.tsx:112-124`,
  the a11y summary-grouping fix, N5 from round 1): adds `accessible`/`accessibilityLabel` props and
  inline template-literal strings to the three existing summary rows — cheap per-render string
  concatenation on a single, non-listed panel; not a re-render or allocation concern.
- **`use-pdf-extraction.ts` / `pdf-extraction.service.ts` / `pdf-upload.tsx`** (N1/N2 code fixes:
  exhaustive `Record<PdfExtractionErrorCode, true>` / `Record<PdfExtractionStage, PdfUploadPanelState>`
  replacing `Set`/loosely-typed `Record`): all module-scope constants built once at import time,
  looked up via `Object.hasOwn`/plain indexing — O(1), no new round-trips, no new per-render
  allocation.
- **`file-size-guard.ts`** (new, M1 security fix): a single `sizeBytes > limits.maxSizeBytes`
  comparison run once per request, before the parse/image work — if anything, this *reduces*
  average-case wall-clock by short-circuiting oversized files before they pay any mupdf cost at
  all, same class of win as the existing guard-ordering note from round 1.
- No new list rendering, no new client→server round-trip, no new synchronous main-thread work, no
  bundle-weight change (all changes are either lib-internal type/logic reshuffling or trivial
  hook/component state additions).

---

## Summary

| Finding | Status |
|---|---|
| M2 — double decode/encode per image | **RESOLVED** |
| M3 — double `toStructuredText()` per page | **RESOLVED** |
| N4 — sequential per-image uploads | **RESOLVED** |

**APPROVED — zero findings.**
