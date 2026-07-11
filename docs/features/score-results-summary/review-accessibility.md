# Accessibility Review — score-results-summary

## Verdict
APPROVED

## Summary
The feature fully meets WCAG 2.2 AA criteria for accessibility. State transitions (loading→content/error) are properly announced via `AccessibilityInfo.announceForAccessibility`. Interactive elements (buttons) expose roles and labels. No color-only signaling. Touch targets meet 48dp minimum via `hitSlop`. All four UI states (Score/Loading/Completion/SaveFailed) covered in stories and assertions. Dynamic type supported via `minHeight` floor instead of fixed heights.

## Findings
None.

## Coverage
- **@s13 — "The results summary is accessible"**: Score and state changes announced via `AccessibilityInfo.announceForAccessibility` on loading→content/error transitions. Each action (button) exposes `accessibilityRole="button"` and label (children text). Correctness conveyed by text in notice ("We couldn't save this attempt."), not color alone.
- **@s5 — "actions are unavailable until saving resolves"**: Loading state disables buttons via `disabled` prop on `ResultsSummary`'s buttons (lines 134, 137). State perceivable via disabled attribute. Progress indicator has `accessibilityRole="progressbar"` (progress-indicator.tsx:84).
- **Roles/labels**: Button component (button.tsx:89) sets `accessibilityRole="button"` unconditionally. All buttons receive labels as children (results-summary.tsx:134–139, notice retry at 122–124).
- **Contrast**: All colors sourced from Material Design 3 tokens (onSurface, onSurfaceVariant, errorContainer, onErrorContainer, primary). No ad-hoc hex values or low-contrast pairs.
- **Touch targets**: Button component's `HIT_SLOP` (button.tsx:32–39) expands all button sizes to 48dp minimum (project `layout.touchTarget` token).
- **Dynamic type**: Button's `minHeight` (line 123) is a floor, not fixed height; Text grows with `numberOfLines={1}` allowing overflow (button.tsx:99).
- **Announcements**: 
  - Loading→Content transition: `scoreAnnouncement` announced via `AccessibilityInfo` (results-summary.tsx:96).
  - Loading→Completion transition: `completeHeadline` announced via `AccessibilityInfo` (results-summary.tsx:96).
  - Save failure: Announced via `AccessibilityInfo` (results-summary.tsx:77). Guarded by `resolvedIntoSaveFailure` to prevent double-announcement when loading resolves into error (results-summary.tsx:94–95, test coverage lines 213–248).
  - Alert role on notice (results-summary.tsx:117) for error semantics.
- **Test coverage**: 
  - Announcement behavior pinned in `results-summary.test.tsx` lines 166–184 (save failure), 252–270 (score), 313–337 (completion).
  - Guard logic verified lines 213–248 (no double-announce when loading→error).
  - Button roles/names asserted throughout (e.g., lines 41, 53, 66–67).
  - e2e: `results-summary.e2e.js` covers Score, SaveFailed, Completion story states.
