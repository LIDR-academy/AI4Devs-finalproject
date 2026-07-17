---
feature: pdf-upload-extraction
reviewer: reviewer_security
round: 2
verdict: APPROVED
---

# Security review — pdf-upload-extraction (OWASP / MASVS)

Scope: full feature diff, `0dfc914..904d06e` (branch `feat/pdf-upload-extraction`), FULL mode
round 2 (hard cap — no round 3). Focus: verify round-1's M1 fix (`76b4be4`) is genuine, and a
fresh pass over everything touched by the four round-1 fix commits (`76b4be4`, `6474a15`,
`2073e65`, `904d06e`).

## Verdict: APPROVED — zero findings

## M1 — RESOLVED

**Claim:** no server-side file-size enforcement; Edge Function only trusted the client-supplied
size (OWASP API4:2023 Unrestricted Resource Consumption / A04:2021 Insecure Design).

**Verification performed:**

1. **Guard runs on the actual downloaded blob's own size, not a client-supplied value —
   confirmed.** `supabase/functions/extract-pdf/index.ts:94` calls
   `isFileTooLarge(sourceBlob.size, PDF_EXTRACTION_LIMITS)`, where `sourceBlob` is the `Blob`
   returned by `supabase.storage.from(PDF_UPLOAD_BUCKET).download(sourcePath)` at
   `index.ts:83-85` — the server's own view of the stored object, not anything read from the
   request body or a client-asserted field. `ExtractPdfRequestBody` (`index.ts:31-33`) only ever
   carries `documentId`; no `sizeBytes` field exists on the request at all, so there is no
   client-supplied size value left in the trust path for this check.

2. **Runs before any parse/image work — confirmed by line order.**
   `index.ts:94` (size guard) precedes `index.ts:99` (`new Uint8Array(await
   sourceBlob.arrayBuffer())`) and `index.ts:107` (`MupdfExtractionAdapter.extract(sourceBytes)`).
   For the oversized case the function never even performs the `.arrayBuffer()` read (the guard
   short-circuits and returns before that line executes), so an oversized upload costs the server
   one Storage download + one size comparison, not a full parse.

3. **Failure path fires correctly.** `index.ts:94-97`:
   ```
   if (isFileTooLarge(sourceBlob.size, PDF_EXTRACTION_LIMITS)) {
     await markDocumentFailed(supabase, documentId, 'file_too_large');
     return jsonResponse({ errorCode: 'file_too_large' }, 422);
   }
   ```
   `markDocumentFailed` (`index.ts:44-48`) sets `status: 'failed', error_code: 'file_too_large'`
   in one atomic update, matching the same status/error_code pairing used by every other guard in
   the function (`too_many_pages`, `corrupt_or_unreadable`, generic `extraction_failed`). HTTP 422
   matches the convention used for every other content-rejection code in this same file
   (`index.ts:110`, `:120`). No Storage/parse work happens after this point for the rejected file.

4. **Deno mirror matches the Jest-tested source — no logic drift.** Diffed
   `libs/supabase-services/src/pdf-extraction/file-size-guard.ts` against
   `supabase/functions/extract-pdf/_shared/file-size-guard.ts` directly: the only differences are
   the import path (`@helsoft/types` vs. local `./types.ts`, expected per the locked Deno-mirror
   convention) and comment placement. The executable logic is byte-identical:
   `sizeBytes > limits.maxSizeBytes` in both files.

5. **Real, non-vacuous test coverage — confirmed and re-run.**
   `libs/supabase-services/src/pdf-extraction/file-size-guard.test.ts:8-24` asserts all four boundary
   cases: well-under-limit (false), well-over-limit (true), **exactly at the limit** (false —
   correctly exclusive upper bound, matching spec.md's "exceeds the size limit" language), and
   **one byte over the limit** (true — mutation-kill-grade boundary test, not just a coarse
   over/under split). Re-ran the suite directly: `PASS
   src/pdf-extraction/file-size-guard.test.ts`, 4/4 green. Also re-ran the full
   `@helsoft/supabase-services` suite (84/84 green), `@helsoft/hooks` (31/31), `@helsoft/components`
   (94/94), and `@helsoft/study-buddy` (55/55) — nothing regressed.

6. **Residual-gap check.** No bypass path found: the guard sits on the one code path every
   `documentId`-driven extraction request must go through (`Deno.serve`'s single handler), keyed
   off the Storage-reported size of the object the server itself downloaded — there is no
   alternate route to `MupdfExtractionAdapter.extract` that skips it. `documents.size_bytes`
   (`libs/supabase-services/src/dao/pdf-upload.dao.ts:50`) is still populated at upload time from the
   client-computed `sizeBytes` and is never re-verified against the real object size — but this
   is a display/analytics metadata field only (grepped every consumer: the upload component, its
   tests, and the analytics `size_bytes` property at `pdf-extraction.service.ts:123`); it is never
   read back for authorization, quota, or resource-allocation decisions anywhere in the codebase,
   so a mismatched value here cannot be used to re-enable the resource-consumption bypass M1
   closed. Not a security finding — noted for completeness only, per the task brief's explicit
   ask about this exact residual.

**M1 verdict: RESOLVED.** No further finding.

## Fresh pass over the four fix commits — no new findings

- **Concurrent `Promise.all` per-image uploads (`index.ts:137-157`, N4 perf fix, re-checked for
  security angle only):** each upload writes to a distinct, non-colliding storage path
  (`{user.id}/{documentId}/p{page}-{positionIndex}.{ext}`), so no race between the concurrent
  writes. Every write still runs under the same forwarded caller JWT via the per-request
  `supabase` client (`index.ts:59-61`) — no privilege escalation introduced by parallelizing.
  `if (uploadError) throw uploadError;` (`index.ts:145`) is not swallowed: it propagates through
  `Promise.all` to the outer `catch` (`index.ts:195-198`), which maps to the generic
  `extraction_failed` code and a bodyless-of-detail `{ errorCode: 'extraction_failed' }` response
  — no raw Supabase/Storage error message reaches the client, consistent with the error-contract
  guarantee verified clean in round 1. (A partially-uploaded-then-failed image set can leave
  orphaned Storage objects with no corresponding `document_images` row — a data-hygiene point, not
  an access-control or injection issue: those objects are still scoped under the failing user's
  own `{user_id}/...` prefix and remain governed by the same per-user RLS/Storage policies as
  every other object in the bucket.)
- **`file-size-guard.ts` itself:** single numeric comparison (`sizeBytes > limits.maxSizeBytes`),
  both operands typed `number`; no string parsing, no dynamic property access, no injection or
  type-confusion surface. `Pick<PdfExtractionLimits, 'maxSizeBytes'>` narrows the accepted shape
  to exactly the one field used.
- **`use-interaction-state.ts` / `button.tsx` / `state-layer.tsx` (focus-tracking, N6 a11y fix):**
  pure `useState` boolean bookkeeping wired to `Pressable`'s `onFocus`/`onBlur`; `stateOpacity`
  feeds a numeric `opacity` style prop, never interpolated into markup, a URL, or any
  `dangerouslySetInnerHTML`-equivalent. No web XSS/DOM-injection surface — confirmed by reading
  `state-layer.tsx:18-31` in full.
- **`PDF_EXTRACTION_ERROR_CODES` derivation (N1 fix, `pdf-extraction.service.ts:34-42`,
  `use-pdf-extraction.ts`):** switched from `Set.has` to `Object.hasOwn(PDF_EXTRACTION_ERROR_CODES,
  code)` — `Object.hasOwn` checks only the object's own enumerable keys (unlike `in`, which also
  walks the prototype chain), so this is if anything a marginally *safer* guard against a crafted
  `{ code: 'toString' }`-style value matching an inherited `Object.prototype` member. No
  type-confusion regression.
- **New env/secret reads:** none introduced by any of the four fix commits (grepped
  `Deno.env`/`process.env`/`EXPO_PUBLIC_` across the full `0dfc914..HEAD` diff — the only hit,
  `index.ts`'s `SUPABASE_URL`/`SUPABASE_ANON_KEY` reads, predates this fix cycle, already verified
  clean in round 1: forwarded-caller-JWT client, never the service-role key).
- **New logging:** none of the four fix commits add any `console.*` call or new analytics
  property; `pdf-extraction-analytics.ts` is untouched since round 1 (confirmed via `git diff
  00cbca3..904d06e` — not in the changed-file list).

## Re-confirmed (not re-litigated, spot-checked for regression)

- **RLS on `documents`/`document_images` + both storage buckets:** migration file
  (`supabase/migrations/20260710202811_pdf_extraction.sql`) is untouched by any of the four fix
  commits (confirmed via `git diff 00cbca3..904d06e --stat` — file not present), so round 1's
  clean verdict stands unchanged.
- **Secrets:** no new hardcoded key/token/secret anywhere in the fix-cycle diff.
- **Analytics PII-safety:** `pdf-extraction-analytics.ts` unchanged since round 1; still only
  `size_bytes`/`document_id`/`page_count`/`image_count`/`duration_ms`/`error_code`/`stage` —
  never filename or content.
- **Error contract:** `toExtractionError`/`normalizeExtractionError` still rebuild a fresh `Error`
  from the closed `PdfExtractionErrorCode` union only; no raw Supabase/Postgres error ever reaches
  the UI or an analytics payload, including through the new concurrent-upload path (see above).

## Not flagged (per task brief — locked decisions, not re-litigated)

Deno-mirror-unexecuted testing boundary; local-only RLS integration test exclusion from default
`pnpm test`/Stryker; no `supabase db push`/`functions deploy` run; AGPL license of `mupdf`;
AC7/@s7 wording-tension carry-forward note; retry suppressed for 6/8 error codes (UX decision);
analytics as this codebase's first implementation of its kind.

## Conclusion

M1 is genuinely and fully resolved: the guard checks the server's own authoritative view of the
uploaded object's size, runs strictly before any parse or image-processing work, fails closed
with the correct status row update and HTTP code, is logic-identical between the Jest-tested
source and its Deno deployment mirror, and is proven by real boundary-level tests (re-run and
green). The three other fix commits introduce no new OWASP/MASVS-relevant surface. **Zero open
findings.**
