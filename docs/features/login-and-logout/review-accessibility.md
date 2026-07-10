# review-accessibility — login-and-logout — Round 3 (FINAL, full-feature review)

Scope: this round's only change is the fix for Round 2's sole open finding (raised by
`reviewer_design`, not this lens): `TextField` now derives `accessibilityInvalid` from its own
`error` prop by default (`text-field.tsx:52`, commit `4f47504`), and `login-form.tsx` dropped the
now-redundant explicit `accessibilityInvalid={!!emailError}`/`{!!passwordError}` props it
previously set (Round-1 Major-3 fix). Read in full: `review.md` (Round 2 consolidated),
`tdd.md`'s "Full-review Round 2 fix" section, current `login-form.tsx`, `text-field.tsx`,
`login-form.test.tsx`, `text-field.test.tsx`, `login-form.stories.tsx`, `text-field.e2e.js`,
`login-form.e2e.js`. Confirmed the diff since Round 2's reviewed baseline (`feb4204`) touches
exactly 4 non-doc files — `text-field.tsx`, `text-field.test.tsx`, `text-field.e2e.js`,
`login-form.tsx` (a pure 2-line prop removal, `git diff feb4204 4f47504 --
libs/components/src/organisms/login-form/login-form.tsx`) — nothing else in the feature changed.

**Verdict: APPROVED — 0 findings.**

---

## Required independent verification: live-DOM aria-invalid on `LoginForm` itself

Did not trust "removing redundant props that matched the derived default is safe" from source
reading alone. Built a temporary Playwright spec
(`libs/components/tests/e2e/tmp-a11y-r3/tmp-a11y-r3.e2e.js`, deleted immediately after use — `git
status --porcelain -- libs/components/tests/e2e` confirmed empty afterward) and ran it against the
real `LoginForm` organism's stories (not `TextField` in isolation) via a running Storybook dev
server on port 6007:

- **`ErrorInlineValidation` story (both `emailError`/`passwordError` set)** —
  `input[aria-label="Email"]` and `input[aria-label="Password"]` both render `aria-invalid="true"`.
  **Confirmed green.**
- **`Content` story (no errors)** — both inputs render `aria-invalid="false"`. **Confirmed green.**

**Regression-catch proof (revert→confirm-RED→restore methodology, per this lens's own Round-1/2
precedent):** temporarily replaced `text-field.tsx` with its pre-derivation (`feb4204`) version
while leaving `login-form.tsx` at HEAD (i.e., exactly the combination the task's concern
describes — the simplified `LoginForm` paired with a hypothetically-buggy derivation) and re-ran
the same spec: both assertions genuinely failed — `aria-invalid` was `null`/absent entirely on
both inputs in both stories (`unexpected value "null"`), not merely wrong-valued. Restored
`text-field.tsx` to HEAD and re-ran: both green again. This confirms the derivation is doing real
work and the collateral simplification in `login-form.tsx` does not silently regress the WCAG
4.1.2/1.3.1 fix — verified empirically on the real rendered DOM through `LoginForm`, not assumed
from `TextField`'s own isolated test/e2e coverage.

## Native `accessibilityHint`/`accessibilityInvalid` on the `LoginForm` organism — unregressed

- `login-form.tsx:110,123` — `accessibilityHint={emailError}`/`{passwordError}` are byte-identical
  to their Round-1/2 form; the only change in this file is the 2-line removal of the explicit
  `accessibilityInvalid` props, confirmed via `git diff feb4204 4f47504 --
  libs/components/src/organisms/login-form/login-form.tsx` (a pure 2-deletion diff, zero other
  lines touched).
- `login-form.test.tsx:260-270,309-319` — 4 assertions directly on the `LoginForm` organism (not
  `TextField` in isolation) still pass against the real RN test-renderer props:
  `getByLabelText('Email'/'Password').props.accessibilityInvalid` is `true` when
  `emailError`/`passwordError` is set and `false` when absent — now exercising the *derived*
  value (flowing `LoginForm`'s `error={!!emailError}` → `TextField`'s `accessibilityInvalid =
  error` default) rather than an explicitly-passed one, and the assertions required zero edits to
  keep passing, proving the externally-observable native behavior is identical pre/post-fix.
  `login-form.test.tsx:250-254,302-306` (`accessibilityHint` assertions) are also unchanged and
  green. `pnpm --filter @helsoft/components test` — 65/65 green (up from 62; +3 new
  `text-field.test.tsx` tests), including all these.
- RN-source trace (unchanged from Round 1/2, re-confirmed since `TextInput.js` itself wasn't
  touched): `node_modules/react-native/Libraries/Components/TextInput/TextInput.js` forwards
  whatever `accessibilityInvalid`-bearing `inputProps` spread `TextField` gives it straight onto
  the native accessibility node; `login-form.tsx` no longer needs to supply that value itself since
  `TextField` now supplies it internally from the same `error` prop `LoginForm` already passes.

## Fresh full WCAG 2.2 AA pass (all 3 slices) — no new findings

- **Roles/labels** — unchanged since Round 2 (no files affecting roles/labels touched this round
  besides the `accessibilityInvalid` derivation itself, verified above); `login-form.test.tsx`,
  `sign-in-form.test.tsx`, `sign-out.test.tsx` role/label assertions all still pass.
- **Color contrast ≥ 4.5:1** — `theme/colors.ts` untouched since Round 2 (confirmed via `git diff
  feb4204 HEAD --stat`, not in the changed-file list); ratios stand as independently recomputed
  last round (error banner 12.65:1, error label/supporting text 5.83:1/6.30:1, non-error label
  6.19:1, filled Button 10.57:1) — all clear the floor with margin.
- **Touch targets ≥ 48dp** — `button.tsx` untouched since Round 2; `HIT_SLOP`-derived 48dp total
  tappable height for `medium`/`small`, `large` already ≥48dp, unchanged.
- **Focus/reading order** — `login-form.tsx`'s field/button JSX order untouched by this round's
  2-line removal; `login-form.test.tsx:448-456`'s serialization-order test still passes.
- **Dynamic type** — `text-field.tsx`'s style block (`minHeight: 56`, `:112`) and `button.tsx`'s
  `minHeight`-not-`height` are untouched this round; no fixed-height regressions introduced by a
  props-only diff.
- **No color-only signaling** — `error={!!emailError}`/`{!!passwordError}` (`login-form.tsx:108,
  121`) is still always paired with the same string rendered as visible `supportingText`
  (`text-field.tsx:93`) — the derivation change doesn't touch this pairing at all.
- **State-change announcements** — `AccessibilityInfo.announceForAccessibility` calls for Loading
  (`login-form.tsx:76-80`) and the error banner (`:84-88`) are untouched this round; both still
  fire correctly per `login-form.test.tsx`'s existing assertions (all 65 `@helsoft/components`
  tests green).

## Re-check: previously-flagged-and-fixed flaky test (`AccessibilityInfo` announcement)
`login-form.test.tsx:99-117` (`'announces "Signing in…" via AccessibilityInfo when isSubmitting
becomes true'`), hardened with `await waitFor(...)` since Round 1/Minor 8, re-confirmed applied
(unchanged) and re-confirmed fixed (Round 2). This round: `npx jest -t 'announces "Signing in'` ×
6 runs — 0 failures, consistent with Round 1's ~60-run and Round 2's 32-run zero-reproduction
results. No further hardening needed.

## Cross-check: `<name>.test.tsx` asserts roles/labels
`login-form.test.tsx` (65-suite-total green, `@helsoft/components`) still asserts
`getByLabelText('Email'/'Password')`, `getByRole('button', {name:...})`, and the 4
`accessibilityInvalid` true/false assertions on the organism itself (`:260-270,309-319`) — all
pass against the derived (not explicit) value post-fix, per above. `text-field.test.tsx` (new this
round, 3 tests) independently pins the derivation contract at the component level: derives-from-
`error`, defaults-`false`, explicit-override-wins. `text-field.e2e.js:90-102` locks in
`aria-invalid="true"`/`"false"` on `TextField`'s own `Error`/`Filled` stories on the real DOM.

## Checks run (this round, independently)
- `pnpm turbo run check-types --force` — 8/8 packages green.
- `pnpm turbo run lint --force` — green.
- `pnpm turbo run test --force` — 6/6 workspaces green: `@helsoft/services` 38/38, `@helsoft/hooks`
  21/21, `@helsoft/components` 65/65 (5 suites, up from 62/4 — `text-field.test.tsx` is new),
  `@helsoft/study-buddy` 25/25, `@helsoft/localization` 55/55, `@helsoft/lib-with-storybook` 2/2.
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` (i.e. `npx playwright
  test` from `libs/components`) — 27/27 green (up from 25 — +2 `text-field.e2e.js` aria-invalid
  cases), including all 5 `login-form.e2e.js` and all 12 `text-field.e2e.js` cases.
- Built, ran, and deleted a temporary Playwright spec doing a live-DOM `aria-invalid` check on
  `LoginForm`'s `ErrorInlineValidation`/`Content` stories specifically (not `TextField` in
  isolation) — both green; then reproduced a genuine RED via a revert→confirm→restore of
  `text-field.tsx` only, confirming the check catches the exact regression class described, then
  restored and re-confirmed green. `git status --porcelain -- libs/components/tests/e2e` empty
  afterward.
- Flakiness re-check: `jest -t 'announces "Signing in'` × 6 runs — 0 failures.

## Verdict
**APPROVED.** The Round-2 fix (derive `TextField.accessibilityInvalid` from `error`) is correctly
implemented and does not regress the WCAG 4.1.2/1.3.1 fix on `LoginForm` — confirmed via live DOM
inspection on the organism itself, with an empirical revert→RED→restore proof, not source reading
alone. Native `accessibilityHint`/`accessibilityInvalid` behavior on `LoginForm` is unregressed.
A fresh full WCAG 2.2 AA pass across all 3 slices surfaces zero new findings. The previously-flaky
`AccessibilityInfo` test remains non-reproducible (6/6 clean this round). This is Round 3 (final);
no open findings from this lens across any of the 3 rounds.
