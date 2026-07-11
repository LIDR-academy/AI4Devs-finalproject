---
id: task-11
title: Accessibility + Storybook stories (all 4 states)
slice: 3
scenarios: [s13]
status: done
paths:
  - libs/components/src/organisms/results-summary/results-summary.tsx
  - libs/components/src/organisms/results-summary/results-summary.test.tsx
  - libs/components/src/organisms/results-summary/results-summary.stories.tsx
---

## Goal
Make `ResultsSummary` WCAG 2.2 AA compliant and ensure story coverage of every state.
- The score and any state change (loading→score, save-failure) are announced to assistive tech (live region / `accessibilityLiveRegion` + `accessibilityRole`/labels appropriate for RN + web).
- Each action (Retake, Back-to-lessons, Retry) exposes an accessible role and label.
- Correctness/score is not conveyed by color alone (text + the numeric ratio carry the meaning).
- Touch targets ≥ 44pt / 48dp; contrast ≥ 4.5:1 via theme tokens; supports scaled fonts.
- Storybook stories cover all four states (loading / score / completion / save-failure), reused by the e2e task.

## Done criteria
- [x] @s13 — tests assert the announced score/state, the accessible roles/labels on all actions, and that the save-failure notice is announced.
- [x] No color-only signaling; targets meet the size minimum (via existing `button`/atoms).
- [x] Stories present the four states for the e2e harness (task-12).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Resolution
Save-failure announcement + accessible roles/labels on all three actions (Retake/Back-to-lessons/Retry) and no-color-only-signaling were already in place from slice-2's review fix-forward. Added the missing piece: a `loading → !loading` transition effect (mirroring the `saveFailed` effect) that announces the final score (score variant) or completion headline (completion variant) via `AccessibilityInfo.announceForAccessibility` once saving resolves — there's no visual content change to hang a live region off of, so the imperative call is the only way to notify screen-reader users the wait is over. Two cycles: score-variant guard first, then widened to the completion variant (same guard-extension pattern as the earlier `saveFailed` fix). Touch targets/contrast/scaled fonts unchanged — already satisfied via `Button`'s `HIT_SLOP` token and theme typography/colors. Stories already covered all 4 states (Score/Loading/Completion/SaveFailed) from slice 2.

## Notes
- Verify RN a11y props behave on web (react-native-web) as well as native, mirroring the `language-selector`/`dialog` a11y precedent.
- Announcing dynamic state changes addresses the reviewer_accessibility "state changes announced" rubric.
