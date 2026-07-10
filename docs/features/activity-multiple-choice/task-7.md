---
id: task-7
title: Accessibility pass + Playwright e2e for the MultipleChoice organism
slice: 3
scenarios: [s11]
status: done
paths:
  - libs/components/src/organisms/multiple-choice/multiple-choice.tsx
  - libs/components/src/organisms/multiple-choice/multiple-choice.test.tsx
  - libs/components/tests/e2e/organisms/multiple-choice.e2e.js
---

## Goal
Harden accessibility and add an end-to-end interaction check. Ensure options expose button roles + accessible labels, correctness is conveyed by text and icon (not color alone), and the correct/incorrect result is announced to assistive technology when the learner answers (mirroring `LoginForm`'s `accessibilityLiveRegion` + `AccessibilityInfo.announceForAccessibility` pattern). Add a Playwright e2e over the rendered Storybook stories via the `storybook-e2e-tests` skill.

## Contract (from spec — AC11 / UI states)
- Each option: `accessibilityRole="button"` + accessible label (marker + option text); `accessibilityState.disabled` reflects locking (already provided by `AnswerOption`).
- Result feedback: announced to AT on the unanswered→answered transition; not color-only (icon + text).
- Touch targets ≥ 44pt (AnswerOption padding already satisfies; verify).

## Done criteria
- [x] @s11 — component test asserts roles/labels, non-color-only feedback (icon + result text present), and the result announcement on answer
- [x] Playwright e2e (`multiple-choice.e2e.js`) drives select → correct feedback and select → incorrect + reveal, over the stories; located under `libs/components/tests/e2e/` mirroring `src/` (per the `storybook-e2e-tests` skill), not co-located
- [x] Color contrast ≥ 4.5:1 and target sizes verified against existing tokens (no new tokens)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` + relevant `test:e2e` green
- [x] No hardcoded strings/colors/dimensions

## Notes
- The live-region announcement uses the localized result label from task-6.
- Reuses `AnswerOption`'s existing roles/states; this task adds the organism-level result announcement + the e2e.
- Depends on tasks 3, 5, 6.
