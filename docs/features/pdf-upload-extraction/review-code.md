---
feature: pdf-upload-extraction
mode: slice
slice: 2
round: 2
verdict: APPROVED
---

# Review — pdf-upload-extraction — Slice 2 (Empty + Error + Retry) — Round 2 (final, 2-round cap)

**APPROVED**

Findings: none (blocker/major/minor).

## Scope

1. Verify round-1's only open finding (`reviewer_design`, minor — generic retry affordance
   ignored spec.md's per-code recovery-action table) is genuinely resolved by commit `a01e92b`
   (`fix(pdf-upload-extraction): restrict retry affordance to transient errors`).
2. Check for any new issue introduced by that fix.
3. Fresh full code-quality pass over the entire cumulative Slice-2 diff, `git diff d571d9d..a01e92b`
   (tasks 9-12 + the round-1 fix), against the full `reviewer_code` rubric — not re-trusting round
   1's clean bill or `tdd.md`'s narrative.
4. Real command runs (not cached, not claimed) from the worktree root.

## 1. Round-1 finding — verified genuinely resolved

`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.tsx:51,71,112` — new optional
`canRetry?: boolean` prop (default `true`); the Error-state retry `Button` (line 112) only renders
`{canRetry ? <Button onPress={onRetry}>{labels.retry}</Button> : null}`. Confirmed:
- `pdf-upload-panel.test.tsx:165-177` — dedicated case: `canRetry={false}` → `queryByRole('button',
  { name: 'Try again' })` is `null`. Every pre-existing Error-state test (108-158) omits the prop
  and still asserts the button renders — the default-`true` path stays covered too.
- `libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx:54` —
  `RETRYABLE_ERROR_CODES: ReadonlySet<PdfExtractionErrorCode> = new Set(['network_error',
  'extraction_failed'])`, wired at line 84: `canRetry={error ? RETRYABLE_ERROR_CODES.has(error) :
  true}`.
- `pdf-upload.test.tsx:185-206` — two exhaustive `it.each` blocks derived from the same
  `ERROR_CODE_TO_KEY` map used elsewhere in the file: all 6 non-transient codes
  (`unsupported_file_type`, `file_too_large`, `too_many_pages`, `scanned_or_image_only`,
  `corrupt_or_unreadable`, `unauthenticated`) assert the retry button is **absent**; both transient
  codes (`network_error`, `extraction_failed`) assert it's **present**. This is real exhaustive
  coverage, not a sampled subset — ran it myself (see §4) rather than trusting the count in
  `tdd.md`.
- The one pre-existing wiring test that used to exercise `too_many_pages` (now non-retryable) was
  correctly updated to `network_error` (`pdf-upload.test.tsx:134-147`) so its retry-press assertion
  stays meaningful instead of silently asserting a press on a button that would no longer exist for
  that code.
- Stories: `pdf-upload-panel.stories.tsx`'s single `Error` story is now `ErrorRetryable` (transient,
  retry shown) / `ErrorNonRetryable` (`too_many_pages`, `canRetry: false`, retry suppressed) —
  still exactly 4 states, both Error sub-cases visible.

Verdict: the fix removes the exact defect round 1 flagged (retry offered as a no-op for 6 of 8
codes) with real, driving tests on both branches (panel-level default/false, wiring-level
exhaustive per-code). Not just a claim — verified by reading the assertions and re-running them.

## 2. New issues introduced by the fix — none found

- `git show a01e92b --stat` touches exactly 6 files, all within the panel/wiring components, their
  tests, and stories, plus `tdd.md` — no drift into DAO/service/hook/Deno/localization layers that
  didn't need touching for this fix.
- `canRetry` defaults to `true`, so every pre-existing call site/test that doesn't pass it keeps
  its prior behavior unchanged — no silent behavior change for callers outside this feature.
- No new magic values: `RETRYABLE_ERROR_CODES` names the two codes by their real
  `PdfExtractionErrorCode` literals, not by index/count; no new numeric literal introduced.
- No duplication of logic: the panel stays a "dumb" boolean-driven component (classification lives
  only in the wiring layer, per `tdd.md`'s stated rationale for keeping it out of `@helsoft/types`
  and `@helsoft/services` — a UI/UX concern, not a trust boundary. That rationale holds: neither
  types-lib nor services-lib has any other UI-affordance logic today).
- Naming is revealing (`canRetry`, `RETRYABLE_ERROR_CODES`), Props type (`PdfUploadPanelProps`)
  updated in place, kebab-case files unchanged.
- No TDD-law violation: the new prop and constant are each driven by a failing test first per
  `tdd.md`'s round-1-fix log, and I independently confirmed every new line of production code (the
  `canRetry` prop/conditional render, the `RETRYABLE_ERROR_CODES` set + its use) is exercised by a
  test that would fail if that line were reverted.

## 3. Fresh full pass over the cumulative Slice-2 diff (`d571d9d..a01e92b`)

Read every changed production/test file end to end (not just diffed): `pdf-extraction.service.ts`
+ its test, `pdf-upload.dao.ts` + its test, `use-pdf-extraction.ts` + its test,
`pdf-extraction-error-retry.integration.test.ts` (new), `pdf-upload-panel.tsx` + test + stories,
`pdf-upload.tsx` + test, `extraction-failure-detection.ts` + test (new module),
`mupdf-extraction-adapter.test.ts`'s new case, `pdf-extraction.constants.ts`, `pdf-extraction.ts`
(types), `services/index.ts` barrel, the four locale bundles, and `supabase/functions/extract-pdf/
index.ts` + mirrored `_shared/*`.

- **@s7-@s14 scenario coverage**: every scenario traces to >=1 concrete, currently-passing test —
  confirmed against `gherkin-scenarios.md`'s scenario-→test-kind table and by reading each test
  file directly (not just `tdd.md`'s summary): @s7 (`pdf-upload-panel.test.tsx` idle-state cases +
  `pdf-upload.test.tsx` constraints-hint case), @s8/@s9/@s10/@s11/@s12
  (`extraction-failure-detection.test.ts`, `pdf-extraction.service.test.ts`'s normalization suite,
  `mupdf-extraction-adapter.test.ts`'s new parse-failure case, `pdf-upload.test.tsx`'s exhaustive
  `it.each` over all 8 codes), @s13 (service transport-error tests, `use-pdf-extraction.test.ts`'s
  error/retry/no-op-retry tests, the new `pdf-extraction-error-retry.integration.test.ts`), @s14
  (service's no-userId pre-check + server `unauthenticated` normalization + wiring's dedicated
  message-mapping test). No gap.
- **Red→Green→Refactor evidence**: `tdd.md`'s task-9 through task-12 sections and the round-1 fix
  section each state what failed first and the minimal change that passed it; cross-checked several
  claims against the actual diff (e.g. the DAO's insert→upsert switch is reflected in both
  `pdf-upload.dao.test.ts`'s updated assertions and `pdf-extraction.integration.test.ts`'s renamed
  `insert`→`upsert` mock) — consistent, no evidence of code written ahead of a test.
- **No unrequested production code**: every new export (`generateDocumentId`,
  `normalizeExtractionError`/`readFunctionErrorCode`/`toExtractionError`, `validateFile`,
  `detectExtractionFailure`, the hook's `retry()`/`lastAttemptRef`, `UPLOAD_ERROR_KEYS`,
  `RETRYABLE_ERROR_CODES`, `canRetry`) is exercised by a specific test; no dead/orphaned code found.
- **Craftsmanship**: short, single-purpose functions throughout
  (`validateFile`/`normalizeExtractionError`/`readFunctionErrorCode`/`toExtractionError` in
  `pdf-extraction.service.ts`; `detectExtractionFailure` in its own module; `markDocumentFailed` in
  the Deno orchestration). Revealing names. No magic numbers in production code — `10 * 1024 *
  1024` / `20` live only in `PDF_EXTRACTION_LIMITS`; `40` (scanned-detection threshold) lives only
  in `SCANNED_DETECTION_MIN_TEXT_LENGTH`; `1024`/`80`/`100` only in `IMAGE_DOWNSCALE_TARGET`
  (unchanged this slice) — all consumed by name. No duplication of logic (the Deno `_shared/*`
  mirror is a byte-for-byte-equivalent hand-mirror of the Jest-tested source, not a second,
  independently-written implementation — spot-checked `extraction-failure-detection.ts` against its
  `_shared/` twin, logically identical).
- **Error contract**: all 8 `PdfExtractionErrorCode`s are correctly typed
  (`libs/types/src/pdf-extraction.ts`), produced by `normalizeExtractionError`, detected by
  `detectExtractionFailure` (page-count checked before the scanned heuristic, matching spec's
  structural-limit-first framing), and mapped 1:1 to an i18n key via `UPLOAD_ERROR_KEYS` (a full
  `Record`, so a missing mapping is a compile error, not a runtime gap).
- **No console.log/debugger/orphan TODOs**: grepped the full `d571d9d..a01e92b` diff for
  `console.log|console.debug|console.warn|debugger|TODO|FIXME|XXX` — zero hits.
- **Functional React + Props types + kebab-case**: `PdfUploadPanel`/`PdfUpload` stay functional
  components with named Props types (`PdfUploadPanelProps`, no props type needed for `PdfUpload` —
  it takes none, consistent with `SignInForm`'s precedent); every touched/added file is kebab-case.
- **Two independently-declared error-code sets** (`KNOWN_ERROR_CODES` in
  `pdf-extraction.service.ts`, `PDF_EXTRACTION_ERROR_CODES` in `use-pdf-extraction.ts`) plus the
  new, much smaller `RETRYABLE_ERROR_CODES` in the wiring component: re-examined this round now
  that a third set exists. Still not flagging as duplication — each guards a genuinely distinct
  concern (service: validating an external wire body; hook: defensive shape-guard mirroring
  `useAuth`'s precedent; wiring: a 2-item UI/UX retry-affordance classification), and `tdd.md`
  documents why the third one doesn't belong in `@helsoft/types`/`@helsoft/services`. No shared
  behavior is duplicated — they answer three different questions about the same closed type.

No blocker, major, or minor findings from this fresh pass either.

## 4. Commands actually run this round (worktree root, not cache-trusted)

- `npx turbo run test --filter=@helsoft/services --filter=@helsoft/hooks --filter=@helsoft/components --filter=@helsoft/study-buddy --filter=@helsoft/localization --force`
  (bypasses turbo cache): **all green**, matching `tdd.md`'s claimed counts exactly —
  `@helsoft/services` 11 suites/72 tests, `@helsoft/hooks` 6 suites/29 tests (including both
  `pdf-extraction.integration.test.ts` and the new `pdf-extraction-error-retry.integration.test.ts`),
  `@helsoft/components` 6 suites/78 tests, `@helsoft/study-buddy` 4 suites/49 tests,
  `@helsoft/localization` 8 suites/55 tests.
- `npx turbo run check-types lint --force` (bypasses cache): 9/9 tasks successful across all 8
  workspaces — clean.

No claim in `tdd.md` was found inflated; every count was independently reproduced.

## Verdict

**APPROVED.** Round-1's minor finding is genuinely fixed with real, exhaustive, driving tests on
both the panel and wiring layers; the fix introduced no new issue; a fresh full pass over the
entire Slice-2 diff found zero additional findings; lint/check-types/tests were actually re-run
(not cache-trusted) and are green. Slice 2 clears the `reviewer_code` gate at round 2 (the cap)
with a clean result.
