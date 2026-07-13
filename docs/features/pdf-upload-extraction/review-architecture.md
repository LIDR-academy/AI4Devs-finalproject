---
feature: pdf-upload-extraction
reviewer: reviewer_architecture
mode: full
round: 2
verdict: APPROVED
---

# Review — pdf-upload-extraction — reviewer_architecture — FULL mode — Round 2 (hard cap)

**APPROVED. Zero blocking findings.**

Scope: entire feature diff, base `0dfc914` → `HEAD` (`904d06e`), with focused re-scrutiny of the
M1/M2/M3 fix commit `76b4be4`'s reshaping of the `PdfExtractionAdapter` seam, plus a fresh pass
over the two later fix commits (`6474a15`, `2073e65`) and the docs commit (`904d06e`).

## 1. The `ExtractedImage.pixmap: Mupdf.Pixmap` exception — scrutinized

**Verdict: acceptable, narrow, well-justified tradeoff. Not a layering violation.** One
documentation-precision gap noted below (non-blocking).

**What changed (confirmed by diffing `55f7caa` → `76b4be4`):** pre-fix, `ExtractedImage` was
`{ bytes: Uint8Array, mimeType: string, width, height }` — a fully library-agnostic DTO, and
`pdf-extraction-adapter.ts` had zero `mupdf` import at all. Post-fix
(`libs/services/src/pdf-extraction/pdf-extraction-adapter.ts:1,28`), the adapter's own public
seam type imports `Mupdf` and embeds `pixmap: Mupdf.Pixmap` directly.

**Where the leak actually reaches (grep-verified, `libs/services/src/pdf-extraction/*.ts` +
`supabase/functions/extract-pdf/**`):**
- `libs/services/src/pdf-extraction/mupdf-extraction-adapter.ts:18-29` — produces the `Pixmap` (expected; this *is* the mupdf-specific adapter implementation).
- `libs/services/src/pdf-extraction/image-downscale.ts:1,8` — `DownscaleImageInput.pixmap: Mupdf.Pixmap` (public contract), and the implementation calls six concrete `Mupdf.Pixmap` methods directly: `getAlpha:56`, `getWidth`/`getHeight:31-32` (inside `resizePixmap`), `.warp():39`, `.asPNG():64`, `.asJPEG():66`. Its own unit test (`image-downscale.test.ts:1,8-11`) now has to manufacture a real `mupdf.Image(...).toPixmap()` to exercise it, versus previously just passing plain `bytes`.
- `supabase/functions/extract-pdf/index.ts:104-107` — only ever destructures `pages`/`images` via `Awaited<ReturnType<...>>` inference, never re-declares or forwards the `Pixmap` type further.
- **Stops there.** Confirmed by grep across `libs/**` and `apps/**` (excluding `pdf-extraction/`/`_shared/`) that `Mupdf`/`Pixmap`/`pixmap` never appears anywhere else — not in `libs/services/src/dao/pdf-upload.dao.ts`, not in `pdf-extraction.service.ts`, not in `use-pdf-extraction.ts`, not in any component. `extraction-dto.ts:1-8` shapes the orchestration's raw pieces into the client-facing `PdfExtractionResult`/`ExtractedImageRef` (`@helsoft/types`) *before* anything crosses back to the client — those DTOs stay plain.

**So:** the concrete-library leak is real, and it is wider than the header comment
(`pdf-extraction-adapter.ts:8-11`, "the one deliberate exception... swapping the parsing library
would need to update this one field's type too") claims — `image-downscale.ts`'s own public
input contract and five of its method calls are equally mupdf-coupled now, not just the one field.
A future `unpdf` swap (risk R1) would need to rework `image-downscale.ts`'s resize/encode logic
too, not only retype one field. That comment overstates the seam's remaining narrowness.

**Why this doesn't rise to a layering violation:**
1. It never crosses the formal `Component → Hook → Service → DAO` boundary — every module
   touching `Mupdf.Pixmap` (`pdf-extraction-adapter.ts`, `mupdf-extraction-adapter.ts`,
   `image-downscale.ts`) is Edge-Function-internal orchestration code, not re-exported through
   `libs/services/src/index.ts` (confirmed: no `export * from './pdf-extraction'` in that
   barrel), and is never imported by `pdf-extraction.service.ts`, any hook, or any component.
2. No DTO crossing the wire to the client is affected — `PdfExtractionResult`/`ExtractedImageRef`
   remain plain, mupdf-free (`extraction-dto.ts`).
3. The swappability promise was already somewhat idealistic pre-fix on this specific axis: image
   *resize/recompress* (`warp`/`asPNG`/`asJPEG`) inherently needs some concrete pixel-manipulation
   library regardless of whether the crossing type is an opaque `Uint8Array` or a `Pixmap` — a
   real `unpdf` swap would need to re-author this step's internals either way. The fix changes
   *how early* the concrete type appears, not whether concrete-library logic is unavoidably
   present in this step.
4. The tradeoff itself is genuine and measured: it removes one full decode+encode round-trip per
   embedded image (confirmed real, not just claimed — `mupdf-extraction-adapter.ts:22` now pushes
   the already-decoded `pixmap` straight into `ExtractedImage`, and `image-downscale.ts:61` no
   longer re-decodes from bytes), which is exactly what M2 (round-1 performance finding) asked for.

**Non-blocking observation (documentation accuracy only, not counted as a finding):**
`libs/services/src/pdf-extraction/pdf-extraction-adapter.ts:8-11` and the mirrored comment at
`supabase/functions/extract-pdf/_shared/pdf-extraction-adapter.ts:10-13` should be corrected to
acknowledge that `image-downscale.ts`'s own contract and implementation — not just this one
field's type — would need rework on a real library swap, so a future engineer attempting the
`unpdf` fallback isn't surprised by the true blast radius.

## 2. Component → Hook → Service → DAO re-verified end-to-end (grep-fresh, not trusted from round 1)

- No component imports a DAO: `grep -rn "PdfUploadDao\|from '.*dao"` across `libs/study-buddy/src`
  and `libs/components/src` — zero hits outside `libs/services/src/dao/` and its own tests.
- No service/DAO imports React: `grep -rln "from 'react'" libs/services/src` — zero hits.
- `libs/hooks/src/hooks/use-pdf-extraction.ts:2` imports only `PdfExtractionService`,
  `generateDocumentId`, `PDF_EXTRACTION_ERROR_CODES` from `@helsoft/services` — never `PdfUploadDao`
  directly. Hook wraps the service, per rule.
- `libs/services/src/dao/pdf-upload.dao.ts` — unchanged since before round 1, still raw
  Supabase access only (`storage.upload`, `.from().upsert()`, `.functions.invoke()`), no
  validation/business logic, returns typed `PdfExtractionResult`/plain rows, no `Mupdf` types.
- `libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx:4` imports `PDF_EXTRACTION_LIMITS`
  (a plain constant) directly from `@helsoft/services` — matches the rule's explicitly-allowed
  `Component → Service` direct-usage pattern (no React/hook-specific need for a constant lookup);
  pre-existing from slice 1, unchanged in this fix cycle.
- `apps/app-study-buddy/src/app/(app)/upload.tsx` — still a 9-line thin screen composing
  `ScreenContainer` + `@helsoft/study-buddy`'s `PdfUpload`; zero business logic in `apps/*`.
- `supabase/functions/extract-pdf/index.ts` — orchestration only; delegates to `_shared/` modules
  for every business rule (size guard, failure detection, extraction, downscale, DTO shaping).

## 3. Barrels re-verified for fix-cycle-introduced exports

- `isFileTooLarge` (`libs/services/src/pdf-extraction/file-size-guard.ts:14`) — correctly **not**
  re-exported through `libs/services/src/index.ts`; it's consumed only inside
  `supabase/functions/extract-pdf/index.ts:18` via the Deno-local `_shared/` copy, matching the
  existing pattern for every other `pdf-extraction/` module (none of which are barrel-exported,
  since none are consumed outside the Edge Function's own orchestration).
- `PDF_EXTRACTION_ERROR_CODES` (`libs/services/src/services/pdf-extraction.service.ts:36`) —
  correctly flows through `services/index.ts` (`export * from './pdf-extraction.service'`) →
  `services/src/index.ts` (`export * from './services'`) → consumed in
  `libs/hooks/src/hooks/use-pdf-extraction.ts:2` via `@helsoft/services`.
- `computeCanRetry` (`libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx:63`) — a
  component-local export (not barrel-facing beyond `libs/study-buddy/src/index.ts`'s existing
  `export * from './components/pdf-upload/pdf-upload'`); pre-existing from the round-1 Part B
  fix cycle, not new to this round — retry-suppression design is a locked decision, not
  re-litigated here.
- `pdf-extraction.constants.ts` — `PDF_EXTRACTION_LIMITS`/`PDF_FILE_EXTENSION`/
  `SCANNED_DETECTION_MIN_TEXT_LENGTH`/`IMAGE_DOWNSCALE_TARGET`/bucket names all still flow through
  `services/index.ts`; unchanged.

## 4. Deno mirror fidelity — diffed, not trusted from comments

Diffed all four fix-touched TS-source/Deno-mirror pairs
(`file-size-guard.ts`, `image-downscale.ts`, `mupdf-extraction-adapter.ts`,
`pdf-extraction-adapter.ts` against their `supabase/functions/extract-pdf/_shared/` counterparts).
Logic is byte-for-byte equivalent; only differences are: JSDoc `/** */` vs. `//` comment style
(pre-existing convention across every mirrored file in this feature, not new), `Mupdf` vs. `mupdf`
namespace import name, the Deno copy correctly omitting the Jest-only `await import('mupdf')`
ESM workaround (Deno's native ESM makes a static `import * as mupdf from 'npm:mupdf@1.28.0'`
sufficient — explained inline), and the Deno copy omitting the `_typeCheck` compile-time-proof
line (redundant there since `MupdfExtractionAdapter.extract`'s own return-type annotation already
structurally enforces the same shape). No logic drift in any of the four pairs.

## 5. Fresh pass — new dependencies, business-logic placement

- No `package.json`/`pnpm-lock.yaml` changes anywhere in the fix cycle (`git diff 00cbca3..HEAD`
  touching dependency manifests is empty) — every dependency (`mupdf`, `expo-document-picker`,
  `expo-file-system`, `pdf-lib`, `@types/node`) was already introduced and justified before round 1
  and is unchanged since.
- No new business logic in `apps/app-study-buddy`; the only `apps/*` file in the whole feature
  diff (`upload.tsx`) stays a thin 9-line composition, unchanged in the fix cycle.
- `pnpm --filter @helsoft/services --filter @helsoft/hooks --filter @helsoft/study-buddy --filter @helsoft/types --filter @helsoft/components --filter app-study-buddy check-types` — clean, zero errors.

## Known, locked decisions — not re-litigated
Deno-mirror-unexecuted testing boundary (risk R4); local-only RLS integration test exclusion
(`jest.config.js`'s `testPathIgnorePatterns`, unchanged); no `supabase db push`/`functions deploy`
run; AGPL license of `mupdf` (risk R6, accepted); AC7/@s7 wording-tension carry-forward note;
retry-suppression design (`computeCanRetry`/`RETRYABLE_ERROR_CODES`); analytics as this codebase's
first implementation of its kind.

## Verdict

**APPROVED.** Zero blocking findings (blocker/major/minor). Layering intact end-to-end,
DTOs clean past the DAO/Edge-Function boundary, barrels correctly wired, Deno mirrors faithful,
no unjustified new dependencies, no business-logic creep into `apps/*`. One non-blocking
documentation-precision observation recorded above (§1) — the adapter's own comment understates
how far the M2 fix's concrete-`Mupdf.Pixmap` typing actually reaches (`image-downscale.ts`'s
contract too, not just one field) — worth a follow-up comment fix whenever `image-downscale.ts`
is next touched, but not a layering violation and not blocking this review.
