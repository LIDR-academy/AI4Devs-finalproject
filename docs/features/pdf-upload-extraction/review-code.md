# reviewer_code — Slice 3 (Analytics + a11y + i18n) — pdf-upload-extraction

**Verdict: APPROVED**

Scope: commit `d760a23` only (`git diff 2a81b59 d760a23`), per slice-mode instructions.

## Checks performed
- `pnpm --filter @helsoft/services test` → 11/11 suites, 78/78 tests green (matches tdd.md).
- `pnpm --filter @helsoft/components test` → 6/6 suites, 83/83 tests green (matches tdd.md).
- `pnpm --filter @helsoft/localization test` → 9/9 suites, 94/94 tests green (matches tdd.md).
- `pnpm test` (root, turbo) → 6/6 packages green.
- `pnpm check-types` (root, turbo, forced re-run for the 3 touched libs) → 8/8 packages clean.
- `pnpm lint` (root, turbo) → clean (only `app-study-buddy` has a `lint` script; unrelated to this diff).
- `git status`/`git diff` on `libs/components/playwright.config.js` → confirmed byte-for-byte reverted to its committed (port 6007) state, as tdd.md claims re: the port-6017 e2e workaround.

## `@s → test` map completeness (spot-check across all three slice sections)
`tdd.md`'s cumulative maps (Slice 1 lines 66–76, Slice 2 lines 443–454, Slice 3 lines 763–769) cover `@s1`–`@s17` with no gaps: `@s1`–`@s6` (Slice 1), `@s7`–`@s14` (Slice 2, `@s14` split RLS/Slice-1 + client-unauth/Slice-2, both halves concretely referenced), `@s15`–`@s17` (Slice 3). Each entry names concrete test files/describe blocks, not vague pointers. No finding.

## Focus area 1 — PII in analytics payloads
Verified `libs/services/src/analytics/pdf-extraction-analytics.ts:6-15` (the closed `PdfExtractionAnalyticsEvent` union) and all three call sites in `libs/services/src/services/pdf-extraction.service.ts:103-144`. Every payload is scoped to `document_id`/`size_bytes`/`page_count`/`image_count`/`duration_ms`/`error_code`/`stage` — no `filename`, no bytes, no user id/email ever constructed into a property. The dedicated test `pdf-extraction.service.test.ts:300-315` ("never includes filename, bytes, or any field beyond the locked PII-free payload shape") asserts this both by value-membership and stringified-substring match, so a future refactor that spreads `input`/`result` wholesale would fail immediately. No finding.

## Focus area 2 — i18n parity
`libs/localization/src/resources/{es,pt,de}.ts` diffs replace the Slice-2 verbatim-English stubs with genuine, distinct native translations (e.g. `de.ts:38` `'Es werden nur PDF-Dateien unterstützt'`, `es.ts:38` `'Solo se admiten archivos PDF'`, `pt.ts:38` `'Apenas arquivos PDF são aceitos'` — three different sentences, not copy-paste). `libs/localization/src/coverage/upload-locale-parity.test.ts:41-56` genuinely asserts non-equality per key per locale (`expect(localeValues[key]).not.toBe(enValues[key])`) across all 10 previously-stubbed keys × 3 locales, plus a documented "detector sanity" check (`upload-locale-parity.test.ts:59-62`) proving the comparison itself is meaningful. Confirmed green in the actual test run (94/94). No finding.

## Focus area 3 — a11y test/e2e quality
`pdf-upload-panel.test.tsx`'s 5 new tests (lines 60-85, 151-203) assert real behavior: live-region props read off actual rendered `Text` nodes, `AccessibilityInfo.announceForAccessibility` spy assertions on real state transitions (idle→loading, error-message-changes), including a mutation-kill guard for the re-announce-on-change case. Not vacuous. `pdf-upload-panel.e2e.js`'s 7 tests assert real rendered Storybook markup per state plus an actual click-through interaction (`InteractiveRetry` story) — not just "iframe is visible." `tdd.md:811` and `:864-866` document the e2e was run non-interactively with `playwright test --reporter=list`, per the `storybook-e2e-tests` skill's hard rule against the blocking HTML-reporter default. No finding.

## Craftsmanship / TDD discipline
- Red→Green→Refactor evidence present and specific for all three tasks (`tdd.md:775-850`): each RED describes the actual failing assertion/import, GREEN describes the minimal production change, REFACTOR is either "none needed" (justified) or names the concrete duplication removed (`trackExtractionFailure`, extracted once a third call site existed — `pdf-extraction.service.ts:86-88`).
- No console.log/debug leftovers introduced by this diff (checked the full `+` lines of `git show d760a23`).
- No orphan TODOs introduced.
- Functional React only; `PdfUploadPanelProps` type present and unchanged in shape (`pdf-upload-panel.tsx:30-53`); kebab-case filenames throughout (`pdf-extraction-analytics.ts`, `pdf-upload-panel.e2e.js`, `upload-locale-parity.test.ts`).
- No magic numbers introduced; the two new `useEffect`s in `pdf-upload-panel.tsx:80-86` are short, single-purpose, and mirror `login-form.tsx`'s already-reviewed pattern exactly (verified by grep — same `AccessibilityInfo`/`accessibilityLiveRegion` shape).
- `trackPdfExtractionEvent` correctly not exported through `@helsoft/services`'s barrel (`libs/services/src/index.ts` — confirmed via grep, zero hits) — matches the documented, intentional scope limit.
- Scope not inflated: no production changes to `libs/study-buddy/src/components/pdf-upload/` even though task-15.md's `paths:` frontmatter lists it — correctly justified in `tdd.md:845-848` (every event fires from the service layer already called unconditionally; no test demands touching the wiring layer).

No findings of any severity. All lint/check-types/test gates green for the touched packages.
