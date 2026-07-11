# review-accessibility — activity-open-ended — FULL review

**Verdict: APPROVED**

Scope: `OpenEnded` organism + `use-open-ended` + tests/e2e + `OpenEndedActivity` wiring. Rubric WCAG 2.2 AA + `@s9`. CI green @ `8a1a773`. Never edited code.

## Findings

*(none open)*

## Rubric spot-check

| Check | Evidence | Severity |
|---|---|---|
| Input accessible name (4.1.2) | `open-ended.tsx:57` `accessibilityLabel={labels.answerInput}`; test `open-ended.test.tsx:245-248`; e2e `getByLabel('Your response')` | — |
| Submit role + name (4.1.2) | `Button` → `accessibilityRole="button"` + children label; test `:53` `getByRole('button', { name: labels.submit })` | — |
| Locked state for AT (4.1.2) | `open-ended.tsx:58` `accessibilityState={{ disabled: locked }}` + `disabled={locked}` on field/button; test `:263-270` | — |
| Model-answer announce (4.1.3) | iOS/web: `use-open-ended.ts:23-26` `announceForAccessibility(labels.modelAnswer)`; Android: `open-ended.tsx:80` `accessibilityLiveRegion="polite"`; tests `:274-314`, `use-open-ended.test.ts:77-123` | — |
| Touch target ≥48dp (2.5.5 / project token) | Submit via `Button` `hitSlop` → `layout.touchTarget` (48); test `:252-259`. TextField shell `minHeight: 56` | — |
| Contrast ≥4.5:1 (1.4.3) | Tokens only: `onSurface`/`onSurfaceVariant` on surface/card (~16.5 / ~8.7 light). No grade colors (ungraded) | — |
| No color-only signaling (1.4.1) | Comparison is labeled text blocks; no correct/incorrect chrome | — |
| Focus / reading order (2.4.3) | Prompt → TextField → Submit → your-answer → model-answer → explanation | — |
| Dynamic type (1.4.4) | Theme typography; no `allowFontScaling={false}` / size clamp on organism text | — |
| Unavailable (non-interactive) | `open-ended.tsx:45-50`; test `:221-231` — notice only, no input/button | — |
| Tests assert roles/labels | `@s9` cases in `open-ended.test.tsx:244-314`; Playwright name queries in e2e | — |
