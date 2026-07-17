---
feature: pdf-upload-extraction
mode: full
round: 2
verdict: APPROVED
---

# Review — pdf-upload-extraction — FULL mode — Round 2 (hard cap, no round 3)

**APPROVED.** All six reviewers ran in parallel against the entire feature diff (base `0dfc914` →
`HEAD` `904d06e`), each independently re-verifying that every one of round 1's 9 findings (0
blocker, 3 major: M1 security / M2-M3 performance; 6 minor: N1-N6) is genuinely resolved in the
current code — not merely in commit narration — plus a fresh full pass over everything the four
round-1 fix commits (`76b4be4`, `6474a15`, `2073e65`, `904d06e`) touched. **Zero findings of any
severity from any reviewer this round.**

## Round-1 findings — verification summary

| ID | Severity | Lens | Fix commit | Verified |
|---|---|---|---|---|
| M1 | major | security | `76b4be4` | **RESOLVED** — `isFileTooLarge(sourceBlob.size, PDF_EXTRACTION_LIMITS)` (`supabase/functions/extract-pdf/index.ts:94`) runs on the server's own downloaded-blob size, before `.arrayBuffer()`/parse, fails closed with `markDocumentFailed` + HTTP 422; Deno mirror byte-identical; boundary-tested (exactly-at-limit / one-byte-over) and re-run green. |
| M2 | major | performance | `76b4be4` | **RESOLVED** — traced end-to-end: one decode (`image.toPixmap()`, `mupdf-extraction-adapter.ts:22`) handed straight through `ExtractedImage.pixmap`/`DownscaleImageInput.pixmap` to one final encode (`image-downscale.ts:64/66`); no PNG-bytes round-trip remains in either the lib or its Deno mirror. |
| M3 | major | performance | `76b4be4` | **RESOLVED** — `structuredText` built exactly once per page (`mupdf-extraction-adapter.ts:58`) and threaded into `extractPageImages`; grep-confirmed `toStructuredText` appears once in the file; mirrored identically. |
| N1 | minor | code | `6474a15` | **RESOLVED** — `PDF_EXTRACTION_ERROR_CODES: Record<PdfExtractionErrorCode, true>` (exhaustive by construction) exported from the service; hook derives via `Object.hasOwn`; old unchecked `Set`s fully gone (repo-wide grep). |
| N2 | minor | code | `6474a15` | **RESOLVED** — `stageToPanelState: Record<PdfExtractionStage, PdfUploadPanelState>`; the untestable `?? 'idle'` fallback removed entirely. |
| N3 | minor | code | `6474a15` | **RESOLVED** — oversize-file test now derives from `PDF_EXTRACTION_LIMITS.maxSizeBytes + 1`, matching the sibling pattern. |
| N4 | minor | performance | `76b4be4` | **RESOLVED** — per-image storage uploads now run via `Promise.all`; the single batch `document_images` insert still only runs after all uploads resolve, so the documented no-partial-persistence (DB-row) invariant is unaffected. |
| N5 | minor | accessibility | `2073e65` | **RESOLVED** — each Content-state summary field (filename/pageCount/imageCount) is now one `accessible` node with a composed `accessibilityLabel` (3 coherent announcements instead of 6 disconnected stops); the previously-unwired `upload.imageCount_one/_other` i18n keys are now actually consumed; real `getByLabelText` assertions, not presence-only checks. |
| N6 | minor | accessibility | `2073e65` | **RESOLVED, and the shared `Button` atom's other consumer (`login-form.tsx`) confirmed NOT regressed.** `useInteractionState` gained a genuine `focus` state wired via `Pressable`'s native `onFocus`/`onBlur` (real on all 3 platforms, not a web-only `:focus-visible` shim — confirmed by reading RN 0.86's `Pressability.js` source); `Button` reads the previously-unread `theme.stateLayerOpacity.focus` token with `press > focus > hover` precedence. `login-form.test.tsx` (43/43) and its Playwright e2e (6/6, re-run against an isolated Storybook instance in this worktree after ruling out a stray-port false negative from a concurrent worktree) both pass. |

Also independently verified: all 9 mutation-driven test gaps closed in round 1's fix cycle
(`duration_ms` sign, size/page-count boundaries, `asset.size` null fallback, `computeCanRetry`'s
idle default, `maxMb`/`maxPages` interpolation values, precedence-boundary variant, test-fixture
mutation-scope exclusion) close real, non-vacuous gaps — reviewer_code read the actual assertions,
not the mutation report's narration.

## Fresh full pass — no new findings

- **reviewer_code**: re-ran every workspace's test suite for real this round (services 84/84,
  hooks 31/31, components 94/94, study-buddy 55/55, localization 94/94 — 358 tests total), plus
  forced (non-cached) `check-types` and `lint` across the whole repo — all clean. `@s1`-`@s17`
  remain fully mapped; no scope creep; no debug/`console.log`/orphan-TODO leftovers; TDD evidence
  in the fix commits is real (test assertions changed shape to match the new `Pixmap`-based
  contracts, not cosmetic). Zero findings.
- **reviewer_design**: the `Button` atom's new `focus` state layer reads only the pre-existing
  `theme.stateLayerOpacity.focus` token and extends the codebase's already-established
  single-priority state-layer model (no new blending scheme); `button.stories.tsx`'s lack of an
  interactive-state story matches every sibling atom of the same shape (`fab`, `chip`,
  `icon-button`, `card`), not new staleness. `pdf-upload-panel.tsx`'s N5 fix introduces zero new
  styling values. All 4 UI states + both Error sub-cases still in Storybook; `login-form.tsx`
  re-confirmed unregressed (74/74 Jest across button/login-form/pdf-upload-panel suites). Zero
  findings.
- **reviewer_architecture**: `Component → Hook → Service → DAO` layering re-verified end-to-end
  (grep-fresh, zero cross-layer leaks); barrels correctly wired for every fix-cycle export
  (`isFileTooLarge` intentionally not barrel-exported, `PDF_EXTRACTION_ERROR_CODES` flows through
  correctly); Deno mirrors diffed byte-for-byte logic-identical for all 4 fix-touched file pairs;
  no new dependencies, no business-logic creep into `apps/*`. Scrutinized the M2 fix's
  `ExtractedImage.pixmap: Mupdf.Pixmap` seam-typing exception in depth: confirmed real but narrow —
  never crosses the formal layer boundary, never reaches client-facing DTOs, and is a genuine,
  measured performance tradeoff, not a layering violation. **One explicitly non-blocking
  observation** (not a finding, not counted toward the verdict): the adapter's own code comment
  understates how far the concrete-`Pixmap` typing reaches (it also shapes `image-downscale.ts`'s
  own public contract and 6 of its method calls, not just "one field") — worth a comment fix
  whenever that file is next touched, but not blocking. Zero findings.
- **reviewer_security**: M1 re-verified line-by-line as genuinely closing the gap (see table
  above), with an explicit residual-gap check (no bypass path exists; `documents.size_bytes`
  remains display/analytics-only, never read for authorization/resource decisions). Fresh pass over
  the concurrent-upload change (no race, no privilege escalation, errors still propagate to the
  sanitized error contract), the new `file-size-guard.ts` module (no injection/type-confusion
  surface), and the focus-tracking change (no XSS/DOM-injection surface) found nothing new. RLS,
  secrets, and PII-free analytics all re-confirmed unchanged. Zero findings.
- **reviewer_accessibility**: N5 and N6 both re-verified from source with real assertions (not
  taken on `tdd.md`'s word), including a from-scratch, correctly-isolated re-run of `login-form`'s
  own Jest suite and Playwright e2e after ruling out a stray-Storybook-port false negative from an
  unrelated concurrent worktree. Explicitly judged the "focus wash can persist after a mouse click
  on web" behavior as a real but non-blocking UX nuance — not a WCAG 2.4.7 violation (2.4.7 mandates
  visibility on keyboard focus; it doesn't forbid also showing it on other focus paths) and
  consistent with the project's existing hover/press convention. Contrast, touch targets,
  announcement dependency arrays, color-only signaling, dynamic type, and reading order all
  re-confirmed unchanged. Zero findings.
- **reviewer_performance**: M2, M3, and N4 all re-verified by tracing the actual data flow (not
  trusting commit messages), confirming exactly one decode + one final encode per image and one
  `structuredText` build per page in both the lib and its Deno mirror. Confirmed the locked
  downscale targets (1024px longest edge, JPEG q80, PNG-for-alpha, 100×100 decorative floor) are
  byte-identical and unregressed, with `image-downscale.test.ts`'s assertions strictly
  strengthened (now decode-and-measure actual output bytes, not just metadata). Fresh pass over
  every other file touched since round 1 (focus-tracking hook, a11y summary grouping, exhaustive
  error/stage maps, the new size guard) found nothing performance-relevant. Zero findings.

## Known, locked decisions — not findings, not re-litigated by any reviewer

Deno-mirror-unexecuted testing boundary (risk R4); local-only RLS integration test excluded from
default `pnpm test`/Stryker; `supabase db push`/`functions deploy` never run (out of scope); AGPL
license of `mupdf` (accepted tradeoff, risk R6); AC7/@s7 "upload control disabled" wording tension
(twice-triaged, non-blocking carry-forward note); retry suppressed for 6 of 8 error codes
(deliberate Slice-2 design); analytics as this codebase's first implementation of its kind.

## Verdict

**APPROVED.** Zero findings of any severity from any of the six reviewers in this, the final
(2nd/2) review round. All 9 round-1 findings and all 9 mutation-driven test gaps are genuinely
resolved, verified against current source rather than commit narration, with no regressions
introduced by the fix cycle — including the shared `Button` atom change's other consumer
(`login-form.tsx`), independently confirmed unregressed at both the unit and e2e layers.
