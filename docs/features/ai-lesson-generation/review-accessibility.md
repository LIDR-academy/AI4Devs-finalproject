# Accessibility Review — ai-lesson-generation

**Verdict: CONDITIONAL PASS** (1 critical regression + 1 pre-existing touch-target concern)

## Critical: RadioGroup selection state not exposed
**File**: `libs/components/src/molecules/radio-group/radio-group.tsx:46` — **CRITICAL** — WCAG 4.1.2 (Name, Role, State)
Uses `aria-checked={selected}` (HTML-only attribute; React Native ignores it) instead of `accessibilityState={{ checked: selected, disabled }}`. Test `radio-group.test.tsx:20-25` expects `accessibilityState.checked`, confirming the regression. **Fix**: replace `aria-checked` with `accessibilityState={{ checked: selected, disabled }}`.

## Verified (pass)
- Radiogroup role + group label — `radio-group.tsx:36-37` — WCAG 1.3.1. Tests: `radio-group.test.tsx:40-52`, `lesson-generation-panel.test.tsx:109-122`, `lesson-generation-panel.e2e.js:99-108`.
- Generation progress live region (polite, not assertive) — `generation-progress.tsx:53-59` — WCAG 4.1.3. Test: `generation-progress.test.tsx:47-52`.
- Error state alert role + assertive live region — `lesson-generation-panel.tsx:92-95` — WCAG 4.1.3. Test: `lesson-generation-panel.test.tsx:216-231`.
- Button accessible name + disabled state — `button.tsx:109-125` — WCAG 4.1.2/3.2.1.
- Touch targets: Button 48dp via `hitSlop` (`button.tsx:41-48`, `spacing.ts:35`) — WCAG 2.5.5 AAA.
- Dynamic type: Button uses `minHeight` not `height` (`button.tsx:147-150`); RadioGroup label uses `theme.typography.bodyLarge` — WCAG 1.4.4.
- Color contrast: MD3 theme tokens, precalculated, light+dark (`colors.ts:138-210`) — WCAG 1.4.3.
- Focus & reading order: document-order rendering, semantic sections, error banner last — WCAG 2.4.3/1.3.2.

## Pre-existing concern (not a regression): RadioGroup touch target
**File**: `radio-group.tsx:67-81` — MEDIUM — WCAG 2.5.5 (AA, 44pt min). `styles.option` has no `minHeight`/`hitSlop`; ring hardcoded 20×20. Mitigation: add `minHeight: layout.touchTarget` and/or `hitSlop` to `styles.option` in a future a11y pass.

**Blocking**: RadioGroup selection state not exposed — test-to-code mismatch must be resolved before merge.
