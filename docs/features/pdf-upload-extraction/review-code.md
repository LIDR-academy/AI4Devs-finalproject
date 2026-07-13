# reviewer_code — FULL feature review — pdf-upload-extraction

**Verdict: APPROVED** (round 2 of 2, cap round — no round 3)

Scope: entire feature diff, base `0dfc914` → `HEAD` (`904d06e`), i.e. `git diff 0dfc914..HEAD` (all
3 slices + both review fix cycles + chore commits). This replaces the round-1 `review-code.md`
(CHANGES_REQUESTED, 3 findings: N1-N3), which `implementator` addressed in commits `76b4be4` /
`6474a15` / `2073e65` / `904d06e` (base `00cbca3` → `HEAD`).

## Commands run for real, this round (not trusted from tdd.md/mutation.md)
- `pnpm --filter @helsoft/services test` → **12/12 suites, 84/84 tests green.**
- `pnpm --filter @helsoft/hooks test` → **6/6 suites, 31/31 tests green.**
- `pnpm --filter @helsoft/components test` → **6/6 suites, 94/94 tests green.**
- `pnpm --filter @helsoft/study-buddy test` → **4/4 suites, 55/55 tests green.**
- `pnpm --filter @helsoft/localization test` → **9/9 suites, 94/94 tests green.**
- `pnpm turbo run check-types --force` (whole repo, cache bypassed) → 8/8 packages clean.
- `pnpm turbo run lint --force` (whole repo, cache bypassed) → clean (`app-study-buddy` is the only
  workspace with a `lint` script).
- `git diff 00cbca3..HEAD -- '*.ts' '*.tsx'` grepped for `console.log/warn/debug` and
  `TODO/FIXME/XXX` → zero hits. The `console.error` lines in the services test run are `mupdf`'s own
  internal WASM warnings during the deliberate corrupt-PDF test (unchanged from round 1), not a
  debug leftover.
- Confirmed `libs/localization`'s `.stryker-tmp` sandbox artifact (surfaced by jest-haste-map's
  collision warning during the run) is `.gitignore`d (`git check-ignore -v` confirms
  `.gitignore:49:**/.stryker-tmp/`), not a committed leftover.

All five test counts match `tdd.md`'s "Full-workspace re-run (post-fix)" section exactly (services
+6 tests/+1 suite, hooks +2, components +11, study-buddy +6, localization unchanged) — the narration
is not inflated.

## N1/N2/N3 (my round-1 findings) — verified against current code, not the commit message

**N1 — RESOLVED.** `libs/services/src/services/pdf-extraction.service.ts:36-45` now exports
`PDF_EXTRACTION_ERROR_CODES: Record<PdfExtractionErrorCode, true>` — an exhaustive-by-construction
map (all 8 codes), replacing the old unchecked `KNOWN_ERROR_CODES: Set`. `grep -rn
"KNOWN_ERROR_CODES"` across the repo returns nothing — the old name is fully gone, not just
shadowed. `libs/hooks/src/hooks/use-pdf-extraction.ts:27-30`'s `isPdfExtractionErrorShape` now
derives its guard via `Object.hasOwn(PDF_EXTRACTION_ERROR_CODES, code)` against the single
`@helsoft/services`-exported source, instead of re-declaring an independent `Set` — the duplication
is gone. `libs/hooks/src/hooks/use-pdf-extraction.test.ts:4-13`'s `jest.mock('@helsoft/services',
…)` mock was updated to the same `Record<…, true>` shape, and the hook suite is green (31/31).
TDD evidence: `tdd.md:937-945` documents this as a same-shape refactor (no new failing test needed
beyond the existing suite, which already exercises every code) — appropriately, since this was a
type/structure tightening, not new behavior.

**N2 — RESOLVED.** `libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx:45-50` now types
`stageToPanelState` as `Record<PdfExtractionStage, PdfUploadPanelState>` (imported from
`@helsoft/hooks`), exhaustive by construction, four lines below `UPLOAD_ERROR_KEYS`'s identical
pattern. The call site at `pdf-upload.tsx:87` is now `state={stageToPanelState[stage]}` — the
previously-required `?? 'idle'` runtime fallback is gone entirely (confirmed by reading the file,
not grepping for its absence: no `?? 'idle'` string anywhere in the file). `pdf-upload.test.tsx`'s
existing 4-stage coverage re-runs green with no test changes needed, matching `tdd.md:947-951`'s
narration.

**N3 — RESOLVED.** `libs/services/src/services/pdf-extraction.service.test.ts:184` is now `const
oversizeBytes = PDF_EXTRACTION_LIMITS.maxSizeBytes + 1;`, importing the constant at line 14 — the
hardcoded `10 * 1024 * 1024 + 1` literal is gone. Mirrors `extraction-failure-detection.test.ts`'s
pre-existing correct pattern exactly (also re-verified: `extraction-failure-detection.test.ts:49`
derives its own boundary from `PDF_EXTRACTION_LIMITS.maxPages + 1`).

## The other 6 findings from round 1 (M1-M3, N4-N6) — spot-verified against current code, since a full-diff review can't selectively ignore majors

**M1 (security) — RESOLVED.** New `libs/services/src/pdf-extraction/file-size-guard.ts` —
`isFileTooLarge(sizeBytes, limits) => sizeBytes > limits.maxSizeBytes`, 4 tests including both exact
boundaries (`file-size-guard.test.ts:8-24`). Wired into
`supabase/functions/extract-pdf/index.ts:94-97`, run against `sourceBlob.size` (the actual
downloaded object, not a client-supplied value) immediately after download and **before**
`sourceBlob.arrayBuffer()` is even read — genuinely cheaper than the pre-existing post-parse guards,
and genuinely closes the "server only trusts client size" gap. Mirrored faithfully into
`_shared/file-size-guard.ts` (byte-identical logic, Deno import syntax only).

**M2/M3 (performance) — RESOLVED.** `mupdf-extraction-adapter.ts:58-60`: `structuredText` is built
once per page and passed into `extractPageImages(structuredText, pageNumber)`, which no longer calls
`page.toStructuredText()` itself (M3). `extractPageImages` (`:18-33`) now pushes the already-decoded
`pixmap` (`image.toPixmap()`) straight onto `ExtractedImage`, and `image-downscale.ts`'s
`downscaleImage` (`:51-71`) takes that `Pixmap` directly — no `new mupdf.Image(bytes).toPixmap()`
re-decode step remains anywhere in the file (M2). Net: 1 decode + 1 final encode per image, verified
by reading both files end-to-end, not just the diff hunks. Test evidence is real, not just
type-level: `mupdf-extraction-adapter.test.ts:43-44` asserts `image.pixmap.getWidth()/getHeight()`
match the recorded fields; `image-downscale.test.ts:31-34,58-61` decode the *returned* bytes back
into a real pixmap and assert actual dimensions — these would fail if the pipeline still round-
tripped incorrectly. Mirrored into both `_shared/mupdf-extraction-adapter.ts` and
`_shared/image-downscale.ts`.

**N4 (performance) — RESOLVED.** `supabase/functions/extract-pdf/index.ts:137-157`: the per-image
storage upload loop is now `Promise.all(downscaledImages.map(async (…) => {…}))`; the single batch
`document_images` insert (`:161-164`) still only runs after every upload resolves, preserving the
no-partial-persistence ordering.

**N5 (accessibility) — RESOLVED.** `pdf-upload-panel.tsx:113,117,121-125`: each summary row
(filename/pageCount/imageCount) is wrapped in a single `accessible` `View` with a composed
`accessibilityLabel`. The image-count row takes an optional `imageCountAnnouncement` prop
(`:43`,`:124`), wired at the call site in `pdf-upload.tsx:92` via `t('upload.imageCount', { count:
result.imageCount })` — genuinely using the task-13 `imageCount_one`/`_other` i18n keys that were
previously built but left unwired. Three new tests in `pdf-upload-panel.test.tsx:105-141` cover the
grouped label, the explicit-announcement path, and the fallback-composed-label path; none are
vacuous (each asserts a specific `getByLabelText` string).

**N6 (accessibility) — RESOLVED.** `use-interaction-state.ts` gained `focus`/`onFocus`/`onBlur`
(additive), tested directly (`use-interaction-state.test.ts:55-71`). `button.tsx:59,76-88`'s
`stateOpacity` now follows `press > focus > hover` precedence and reads
`theme.stateLayerOpacity.focus`. `button.test.tsx:42-68` proves the wash actually renders on focus
and clears on blur via real `fireEvent(buttonElement, 'focus'/'blur')` inside `act(async () => …)` —
the async/await-inside-act detail matters here (an unawaited `fireEvent` would silently no-op the
assertion) and the narration in `tdd.md:989-994` documents catching exactly that trap mid-cycle,
which is a credible, specific TDD anecdote, not generic filler. Regression-checked: `login-form`'s
94 component tests and (per `tdd.md:1052-1053`) its Playwright e2e both stayed green.

## The 9 mutation-driven gaps (Part B) — verified against actual test assertions, not narration

1. **Absence assertions** (`pdf-upload-panel.tsx` conditionals) —
   `pdf-upload-panel.test.tsx:305-330`'s two `it.each` blocks assert the constraints hint and content
   summary are absent in every state that shouldn't render them. Real, non-vacuous (`queryByText(...)`
   `.toBeNull()` against concrete states).
2. **`duration_ms` sign** — `pdf-extraction.service.test.ts:254,269` pins `Date.now()` to two fixed
   sequential values (1000/1050) and asserts `duration_ms: 50` exactly (not `expect.any(Number)`).
   Genuinely kills a `-` → `+` mutant that `expect.any(Number)` couldn't.
3. **File-size boundary, both sides** — client: `pdf-extraction.service.test.ts:202` (exactly at
   `maxSizeBytes` → accepted); server: `file-size-guard.test.ts:18-24` (both exact-boundary and
   `+1` cases). Both real.
4. **`asset.size` null fallback** — `pdf-upload.test.tsx:92,100` picks an asset with `size: null`
   and asserts `extract()` receives `sizeBytes: 4` (the read `bytes.byteLength`), killing a `??` →
   `&&` mutant on that fallback.
5. **`canRetry` idle default** — `computeCanRetry` extracted to a named, exported function
   (`pdf-upload.tsx:63-64`) and unit-tested directly (`pdf-upload.test.tsx:272-284`: null→true,
   retryable→true, non-retryable→false). This is the correct fix for an otherwise
   unreachable-through-rendering default.
6. **`maxMb` interpolation** — `pdf-upload.test.tsx:176-188` swaps in a `t: jest.fn((key) => key)`
   spy and asserts `t` was called with `{ maxMb: expectedMaxMb, maxPages: … }`, where
   `expectedMaxMb` is itself derived from `PDF_EXTRACTION_LIMITS.maxSizeBytes / (1024*1024)` — kills
   a `/` → `*` mutant without hardcoding the expected numeric literal.
7. **Precedence boundary variant** — `extraction-failure-detection.test.ts:48-51` adds a second
   precedence test at `PDF_EXTRACTION_LIMITS.maxPages + 1` pages (the existing test used 25, far
   past the boundary) — this is the correct fix for a `>` → `>=` mutation-kill gap.
8. **`test-utils/` fixture-builder exclusion** — confirmed in
   `.agents/skills/mutation-testing/scripts/run-mutation.sh` and `libs/services/stryker.config.mjs`:
   both now exclude `**/test-utils/**` from the mutation scope/diff filter, with an inline comment
   explaining why (pure fixture builders, only ever imported from `*.test.ts`). Reasonable, not a
   loophole — `build-solid-png.ts`/`build-test-pdf.ts` are genuinely not shipped logic.
9. **Adapter/downscale remaining survivors** — closed as a natural consequence of the M2/M3 refactor
   (the re-decode/re-encode code paths those mutants lived in no longer exist) plus the tightened
   pixmap-dimension assertions already covered above under M2/M3.

All 9 are genuine, concrete test-gap closures — none are vacuous or tautological.

## `@s → test` map (@s1-@s17) — still fully covered, unaffected by the fix commits

The fix commits (`76b4be4`/`6474a15`/`2073e65`) touched only files already covering @s1-@s17 per
round 1's map (`review.md`'s superseded write-up, and `tdd.md`'s Slice 1-3 sections, both
re-verified this round) — no scenario lost coverage, and the new tests documented above are
additive strengthening of already-mapped scenarios (@s2/@s3 for M2/M3, @s8-@s14 for N4-N6/mutation
gaps), not evidence of new, uncovered scope. No gaps found.

## TDD discipline in the fix cycles — real, not narrated

Spot-checked beyond trusting `tdd.md`'s prose: for M2/M3, the actual test files
(`mupdf-extraction-adapter.test.ts`, `image-downscale.test.ts`) now assert on a fundamentally
different shape (`image.pixmap` instead of `image.bytes`/`mimeType`; `DownscaleImageInput` now takes
`{ pixmap, width, height }` instead of `{ bytes, mimeType }`) — this is real evidence of RED (the old
assertions would not compile/would throw against the new types) driving the refactor, not a
same-behavior cosmetic change dressed up as TDD. For N1/N2/N3, the type-only tightenings correctly
required no new failing test (existing suites already exercised every code/stage), which is the
right call, not a shortcut. No production code found that isn't demanded by some test in the diff —
`computeCanRetry`, `isFileTooLarge`, the `focus` state, and the `accessibilityLabel` grouping are all
directly exercised by the tests cited above.

## Craftsmanship — no findings
Short, single-purpose functions throughout the fix commits; revealing names
(`isFileTooLarge`, `computeCanRetry`, `trackExtractionFailure`); no duplication reintroduced (N1's
whole point was removing a duplication); no magic numbers (N3 fixed the one instance); correct
error contract preserved (`PdfExtractionErrorCode` normalization untouched by the fix cycle, only
the guard construction changed); no `console.log`/debug leftovers; no orphan TODOs; functional React
only; `Props` types present and unchanged where components were touched
(`PdfUploadPanelProps`); kebab-case filenames for both new files (`file-size-guard.ts`,
`file-size-guard.test.ts`, plus the Deno mirror `_shared/file-size-guard.ts`).

## Not flagged (per the human-approved, locked decisions — not re-litigated)
Deno-mirror-unexecuted testing boundary (R4); local-only RLS integration test exclusion; no `supabase
db push`/`functions deploy`; AGPL `mupdf` license (R6); AC7/@s7 wording-tension carry-forward note;
retry suppression for 6 of 8 error codes (deliberate Slice-2 design, unchanged by this round);
analytics module judged on its own merits (unchanged).

## Verdict rationale
All three of my round-1 findings (N1, N2, N3) are genuinely resolved in the current code, not just
in commit messages. Spot-verifying the other 6 round-1 findings (M1-M3, N4-N6) against current code
also shows real fixes, each with test-first evidence. All 9 mutation-driven gaps I checked close
real gaps with non-vacuous assertions. All five workspaces' test suites are green (12+6+6+4+9 = 37
suites, 84+31+94+55+94 = 358 tests), `check-types` and `lint` are clean across the whole repo, no
debug leftovers, no scope creep, @s1-@s17 remain fully mapped. Zero findings from my lens this
round.

**APPROVED.**
