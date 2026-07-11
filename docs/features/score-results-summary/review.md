# review — score-results-summary (slice 3)

Scope: `git diff 0a65cb1..0b7801d` (slice 3 — a11y + i18n + Storybook e2e, commit `0b7801d`) plus the round-1 fix (applied on top, uncommitted at review time). Reviewers: `reviewer_code`, `reviewer_design`.

## Round 1 (commit `0b7801d`)
- **Major** (`reviewer_code`) — `results-summary.tsx:69-87` the pre-existing `saveFailed` announcement effect and the new loading-transition effect fired independently but landed in the **same commit** on the real production transition (`use-lesson-attempt.ts`'s single `setStatus('saving')→setStatus('error')` update), announcing the score right after the failure notice, untested. **Resolved** — a `resolvedIntoSaveFailure` guard added; when `loading:true→false` and `saveFailed:false→true` land together, only the failure notice announces. Pinned by a new test asserting `toHaveBeenCalledTimes(1)`; original successful-resolution announcements re-verified with no regression.
- **Major** (`reviewer_design` + `reviewer_code`) — `results-summary.tsx:83` composed `` `${labels.score}, ${labels.percent}` `` with a hardcoded, non-localized `", "` separator inside the presentational organism, contradicting its own "never self-formats" contract and diverging from every other `announceForAccessibility` call in the codebase. **Resolved** — added `labels.scoreAnnouncement: string`; the organism now reads it as-is. `lesson-results.tsx` computes it via `t('results.scoreAnnouncement', { score, percent })`; new key `results.scoreAnnouncement: '{{score}}, {{percent}}'` added key-aligned to en/es/pt/de, consistent interpolation convention with sibling keys. Both organism and wiring tests pin this.
- **Major** (`reviewer_code`) — `results-summary.e2e.js:37-40` `retryLabel.locator('xpath=ancestor::button[1]')` reached for an HTML-tag locator, departing from the `storybook-e2e-tests` skill's "prefer text locators" convention (confirmed non-vacuous but still a skill deviation). **Resolved** — rewritten to a plain `text=Retry` locator + `.click()`; verified live against both a missing action and a genuinely disabled button — still fails correctly in each case.

## Round 2 (fix diff, re-reviewed)
Both reviewers re-ran against the current diff (`0a65cb1` vs. working tree). `reviewer_code` → `APPROVED`, zero findings — re-verified all three fixes directly (traced the real combined transition, verified i18next interpolation and locale-key parity live, reproduced RNW's disabled-button DOM to confirm the rewritten e2e assertion is non-vacuous). `reviewer_design` → `APPROVED`, zero findings — confirmed the organism no longer composes labels locally, the locale key's placeholder convention matches sibling keys, all 4 Storybook states still represented, e2e fixture match still 1:1. Gates green: `check-types` (components/study-buddy/localization), `pnpm --filter @helsoft/components test` (92/92), `pnpm --filter @helsoft/study-buddy test` (52/52), `pnpm --filter @helsoft/localization test` (57/57), `pnpm lint`, `pnpm --filter @helsoft/components exec playwright test --reporter=list results-summary.e2e.js` (6/6).

## Open findings
None.

## Verdict
APPROVED — slice 3, round 2 (of 2-round cap). Zero open findings. This was the final vertical slice; feature moves to the post-slices quality gate (mutation → full 6-reviewer review → mutation).
