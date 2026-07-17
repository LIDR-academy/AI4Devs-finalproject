---
id: task-14
title: a11y pass + Storybook stories (4 states) + Playwright e2e
slice: 3
scenarios: [s14]
status: done
paths: [libs/components/src/organisms/api-key-form/api-key-form.tsx, libs/components/src/organisms/api-key-form/api-key-form.test.tsx, libs/components/src/organisms/api-key-form/api-key-form.stories.tsx, libs/components/src/organisms/api-key-required-notice/api-key-required-notice.test.tsx, libs/components/src/organisms/api-key-required-notice/api-key-required-notice.stories.tsx, libs/components/tests/e2e/organisms/api-key-form/api-key-form.e2e.js, libs/components/tests/e2e/organisms/api-key-required-notice/api-key-required-notice.e2e.js]
---

## Goal
Finish the accessibility and delivery surface for the UI components:
- **a11y**: the secure key input exposes an accessible label; Save/Replace/Remove and the notice action expose a button role; save/remove errors are announced to assistive tech (drive `TextField` `error`/`accessibilityInvalid` + a live-region/announcement as login did); touch targets ≥ 44pt.
- **Storybook**: `api-key-form.stories.tsx` covering all **4 states** (Empty, Content/masked, Loading, Error) + `api-key-required-notice.stories.tsx`.
- **Playwright e2e** (via the `storybook-e2e-tests` skill; `.e2e.js` under `libs/components/tests/e2e/` mirroring `src/`): render + interaction checks for the form's states and the required-notice action.

## Done criteria
- [x] Scenario @s14 (account-screen context): `api-key-form.test.tsx` asserts the accessible label on the key input, button roles on Save/Replace/Remove, and save/removal error announcement to assistive tech.
- [x] Scenario @s14 (generation-entry-guard context): `api-key-required-notice.test.tsx` asserts the guard notice's action exposes a button role (re-verifying the assertion introduced in task-12); Playwright e2e verifies the rendered states/interactions across both components.
- [x] `api-key-form.stories.tsx` covers Empty / Content / Loading / Error; `api-key-required-notice.stories.tsx` present.
- [x] `.e2e.js` files live under `libs/components/tests/e2e/organisms/<component>/` (per-component subfolder mirroring `src/`, not co-located) per the skill — `.../organisms/api-key-form/api-key-form.e2e.js` and `.../organisms/api-key-required-notice/api-key-required-notice.e2e.js`.
- [x] No color-only signaling for the error/saved states; contrast + touch-target checks pass (WCAG 2.2 AA) — reuses `LoginForm`'s already-reviewed error-banner pattern and the `Button` atom's token-driven 48dp `HIT_SLOP`; no new colors/dims introduced.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` (+ relevant `test:e2e`) green.

## Notes
- Follows the login `LoginForm` a11y + e2e precedent (`login-and-logout/task-9.md` lists `login-form.test.tsx` alongside `login-form.tsx`) and the `storybook-e2e-tests` skill's `.e2e.js` conventions. Stories use demo copy (excluded from the string-migration audit).
- `api-key-required-notice.tsx` itself is not edited here (the action's button role comes free from the `Button` atom, built in task-12); this task edits its `.test.tsx` (a11y assertion) + `.stories.tsx` only.

## Findings / deviations (see `tdd.md` for the full cycle log)
- `api-key-form.tsx`'s error-announcement `useEffect` (`AccessibilityInfo.announceForAccessibility`)
  was already implemented during Slice 2 (task-11), but had **no direct test** asserting the
  `AccessibilityInfo` call itself (only its visual/`accessibilityLiveRegion` side effects were
  covered) — a latent gap not caught by Slice 2's code+design-only per-slice review (accessibility
  is a full-review-only lens per `review-standards.md`). Backfilled here: added
  `announces the error banner via AccessibilityInfo when errorMessage is set` +
  `... again when errorMessage changes to a different value`, and verified genuine RED by
  temporarily removing the effect and confirming both tests failed, then restoring (no production
  diff — `git diff --stat` on `api-key-form.tsx` is empty after this task).
- Storybook auto-generates story IDs by lowercasing the title (no camelCase word-splitting) —
  confirmed via the running dev server's `index.json` before writing the `.e2e.js` slugs
  (`organisms-apikeyform--*`, `organisms-apikeyrequirednotice--default`), since the skill's own
  worked-example table and a pre-existing sibling e2e file (`slide-progress.e2e.js`, which uses
  the wrong slug `molecules-slide-progress--default` against the real
  `molecules-slideprogress--default`) disagree — flagging that pre-existing mismatch for
  reviewers since it's outside this task's scope to fix.
