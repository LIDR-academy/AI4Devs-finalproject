---
feature: pdf-upload-extraction
mode: slice
slice: 2
round: 2
verdict: APPROVED
---

# Review — pdf-upload-extraction — Slice 2 (Empty + Error + Retry) — Round 2 (final, 2-round cap)

**APPROVED**

Findings: none (blocker/major/minor). `review.md` holds zero open findings — Slice 2 clears the light `reviewer_code` + `reviewer_design` gate.

## Scope

Round 1 (`git diff d571d9d..c834d8a`) found one open item: `reviewer_design`'s minor finding that the Error state rendered one generic retry button for all 8 `PdfExtractionErrorCode`s, contradicting `spec.md`'s per-code Error contract table (only `network_error`/`extraction_failed` genuinely say "Retry"; retrying the other 6 is a guaranteed no-op since `usePdfExtraction.retry()` re-invokes with the same remembered input/`documentId`). `reviewer_code` was APPROVED in round 1 with zero findings.

The implementator fixed this in `a01e92b` (`fix(pdf-upload-extraction): restrict retry affordance to transient errors`): added an optional `canRetry?: boolean` prop (default `true`) to `PdfUploadPanel`, gating the Error-state retry `Button`; added `RETRYABLE_ERROR_CODES` (`{network_error, extraction_failed}`) in the wiring component `pdf-upload.tsx`, wired `canRetry={error ? RETRYABLE_ERROR_CODES.has(error) : true}`; added exhaustive `it.each` coverage over all 8 codes at both the panel and wiring layers; split the `Error` story into `ErrorRetryable`/`ErrorNonRetryable`; documented the RED→GREEN cycle and rationale in `tdd.md`.

This round (2, the cap for this slice), both `reviewer_code` and `reviewer_design` re-ran against:
1. The round-1 fix specifically — verifying it genuinely resolves the finding and introduces nothing new.
2. A fresh full pass over the entire cumulative Slice-2 diff (`d571d9d..a01e92b`, tasks 9-12 + the fix), not just re-trusting round 1's clean bill.
3. Real command runs (not cache-trusted): `test`/`check-types`/`lint` across all affected workspaces.

## Verification performed (both reviewers independently confirmed)

- **Fix genuinely resolves round 1's finding.** `pdf-upload-panel.tsx:46-51,109-114` — `canRetry?: boolean` (default `true`); the Error-state retry `Button` only renders when true. `pdf-upload.tsx:54,84` — `RETRYABLE_ERROR_CODES = new Set(['network_error', 'extraction_failed'])`, wired as `canRetry={error ? RETRYABLE_ERROR_CODES.has(error) : true}` — matches `spec.md`'s Error contract table (lines 63-72) exactly. Exhaustively tested: `pdf-upload-panel.test.tsx:165-177` (component-level `canRetry={false}` suppression) and `pdf-upload.test.tsx`'s two `it.each` blocks over all 8 codes (all 6 non-transient codes assert the button absent, both transient codes assert it present) — read and re-run, not trusted from `tdd.md`'s narrative alone.
- **Error state is not a dead end.** Read the actual render tree (not the commit message): the persistent "Choose a PDF" button (`pdf-upload-panel.tsx:78-80`) sits outside every state-conditional block, `disabled={isLoading}` only when `state === 'loading'` — always enabled in the Error state regardless of `canRetry`, backed by the pre-existing test `pdf-upload-panel.test.tsx:143-149`. `ErrorNonRetryable` demonstrates a genuine recovery path, matching `spec.md`'s "panel returns to a usable state" note.
- **No new issue introduced by the fix.** `a01e92b` touches exactly 6 files scoped to the panel/wiring components, their tests, stories, and `tdd.md` — no drift into other layers. `canRetry` defaults to `true`, preserving every pre-existing call site's behavior. No new magic values/duplication; naming is revealing; classification correctly kept in the wiring layer, not the "dumb" panel. No ad-hoc styling introduced — `errorBanner`/`errorBannerText` are untouched, still token-based. Atomic-design placement unchanged (no new atom/molecule needed for a boolean prop). Stories still read as exactly the 4 UI states (Error split into two named variants, mirroring `LoginForm`'s own `Error`/`ErrorInlineValidation` precedent).
- **Fresh full pass over the cumulative Slice-2 diff (`d571d9d..a01e92b`)** found no additional findings: every @s7-@s14 scenario traces to ≥1 concrete test; Red→Green→Refactor evidence consistent; no unrequested production code; no magic numbers/duplication/console.log/debugger/orphan TODOs; functional React + Props types + kebab-case throughout; the Deno `_shared/*` mirror remains logically faithful; the three independently-declared error-code sets (`KNOWN_ERROR_CODES`, `PDF_EXTRACTION_ERROR_CODES`, `RETRYABLE_ERROR_CODES`) each guard a genuinely distinct concern, not duplication.
- **Commands actually re-run this round** (bypassing turbo cache, from the worktree root): `npx turbo run test --force` across `@helsoft/services|hooks|components|study-buddy|localization` — all green, exactly matching `tdd.md`'s claimed counts (72/29/78/49/55 tests). `npx turbo run check-types lint --force` — 9/9 tasks clean across all 8 workspaces.

## Non-blocking notes carried over from round 1 (unchanged, not findings)

- The AC7/@s7 "upload control is disabled" reconciliation and the future `spec_partner` follow-up recommendation to reword `gherkin-scenarios.md`'s @s7 third clause remain a non-blocking future-touch suggestion, not a defect in this slice.
- `task-9.md`-`task-12.md`'s unchecked in-body `- [ ]` criteria (despite `status: done` frontmatter) remain cosmetic only.

## Verdict

**APPROVED.** Zero findings from either reviewer. Round 1's minor finding is genuinely resolved with real, exhaustive, driving tests on both the panel and wiring layers; the fix introduced no new issue; a fresh full pass over the entire cumulative Slice-2 diff (tasks 9-12 + the fix) found nothing else open. Slice 2 clears the 2-round-cap slice gate clean — ready to commit as clean and move to Slice 3.
