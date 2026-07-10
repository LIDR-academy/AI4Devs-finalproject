---
feature: pdf-upload-extraction
mode: slice
slice: 3
round: 1
verdict: APPROVED
---

# Review — pdf-upload-extraction — Slice 3 (Analytics + a11y + i18n, final slice) — Round 1

**APPROVED**

Findings: none (blocker/major/minor). `review.md` holds zero open findings — Slice 3 clears the light `reviewer_code` + `reviewer_design` gate on round 1.

## Scope

Commit `d760a23` (`feat(pdf-upload-extraction): add analytics, a11y, and i18n`) only, on top of the prior slice-2 chore commit `2a81b59` — i.e. `git diff 2a81b59 d760a23`. This is the last slice: task-13 (i18n `upload.*` parity across en/es/pt/de), task-14 (a11y announcements + Playwright e2e for `PdfUploadPanel`), task-15 (PII-free extraction analytics).

Both `reviewer_code` and `reviewer_design` ran in parallel against this diff and independently returned **APPROVED** with zero findings of any severity. No fix cycle was needed.

## Verification performed (both reviewers independently confirmed)

- **Commands re-run for real**: `pnpm --filter @helsoft/services test` (78/78), `pnpm --filter @helsoft/components test` (83/83), `pnpm --filter @helsoft/localization test` (94/94), root `pnpm test` (6/6 packages), root `pnpm check-types` (8/8 clean, forced re-run), root `pnpm lint` (clean) — all match `tdd.md`'s claimed counts. `libs/components/playwright.config.js` confirmed byte-for-byte reverted to its committed port-6007 state after the documented throwaway-port-6017 e2e workaround.
- **PII in analytics payloads (locked spec requirement, task-15.md)** — `libs/services/src/analytics/pdf-extraction-analytics.ts:6-15` and the three call sites in `libs/services/src/services/pdf-extraction.service.ts:103-144` scope every payload to `document_id`/`size_bytes`/`page_count`/`image_count`/`duration_ms`/`error_code`/`stage` only. No filename, file bytes, or user-identifying text on any event. Backed by a dedicated test (`pdf-extraction.service.test.ts:300-315`) asserting this both by value-membership and stringified-substring match against the filename.
- **i18n parity** — `es`/`pt`/`de` translations replacing the Slice-2 verbatim-English stubs are genuine, distinct native strings (e.g. `de.ts` `'Es werden nur PDF-Dateien unterstützt'` vs. `es.ts` `'Solo se admiten archivos PDF'` vs. `pt.ts` `'Apenas arquivos PDF são aceitos'`). The new `upload-locale-parity.test.ts` genuinely asserts value-level non-equality per key per locale (not just key presence) across all 10 previously-stubbed keys × 3 locales, plus a "detector sanity" check proving the comparison itself is meaningful (not vacuously passing). New/changed keys (`upload.imageCount_one`/`_other`) stay structurally aligned at the same nesting depth across all four bundles — no locale adds or drops a key.
- **a11y** — `pdf-upload-panel.tsx:76-86`'s two new `useEffect`s (live-region announcements via `AccessibilityInfo.announceForAccessibility`, `"polite"` on loading text / `"assertive"` on error text) are a faithful, verified mirror of `login-form.tsx:76-88,94,134`'s already-reviewed pattern — same dependency-array shape, same live-region levels for equivalent states, no ad-hoc styling or `console.*` introduced. Task-14's "already satisfied, no code change needed" claims (role/label on choose-file/continue/retry, touch targets ≥48dp via `Button`'s `HIT_SLOP`/`layout.touchTarget` token, no color-only signaling, scaled-font support via `theme.typography.*`) were spot-checked against the actual code, not taken on faith. `pdf-upload-panel.test.tsx`'s 5 new tests assert real prop/spy behavior including a mutation-kill re-announce-on-change guard. The Playwright e2e (`pdf-upload-panel.e2e.js`, 7 tests) exercises all 4 UI states (Empty, Loading, Content, Error — both Retryable/NonRetryable) plus the retry *interaction* itself via the new `InteractiveRetry` story (a legitimate reuse of the existing `checkbox.stories.tsx`/`switch.stories.tsx` interactive-story pattern), correctly queried through the Storybook iframe per the `storybook-e2e-tests` skill. `tdd.md` documents it was run non-interactively (`--reporter=list`), per the skill's hard rule against the blocking HTML-reporter default.
- **`@s → test` map completeness** — `tdd.md`'s cumulative maps across all three slice sections (Slice 1 lines 66-76, Slice 2 lines 443-454, Slice 3 lines 763-769) cover `@s1` through `@s17` with no gaps; every entry names concrete test files/describe blocks, not vague pointers.
- **TDD discipline / craftsmanship** — Red→Green→Refactor evidence specific per task; no scope inflation (correctly did not touch `libs/study-buddy/src/components/pdf-upload/` despite task-15.md's `paths:` frontmatter listing it, with a documented, verified reason: every analytics event fires from the service layer the hook already calls unconditionally); no console.log/debug leftovers or orphan TODOs introduced; functional React + `Props` types + kebab-case intact; `trackPdfExtractionEvent` correctly not exported through `@helsoft/services`'s barrel (confirmed via grep, zero hits), matching the documented, intentional scope limit.
- **Documented, non-blocking deviation, independently verified as sound** — `gherkin-scenarios.md`'s "primary test kind" table lists a "wiring test" as expected additional @s17 coverage; the implementator did not add one and documented at length why a hook-layer test would be a false test (`use-pdf-extraction.test.ts` mocks `PdfExtractionService.extract` entirely, so the hook test never runs the real `extract()` implementation where analytics fires). Confirmed by reading `libs/hooks/src/hooks/use-pdf-extraction.test.ts`'s `jest.mock('@helsoft/services', ...)` — the reasoning holds. task-15.md's actual done-criteria wording (the operative spec) is satisfied by the service-layer test. Not a finding.

## Verdict

**APPROVED.** Zero findings from either reviewer on round 1. This closes the light per-slice gate for Slice 3, the last slice — the feature moves to the full 6-reviewer round (coupled with mutation testing), not started here.
