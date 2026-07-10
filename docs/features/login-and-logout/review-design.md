# Review — Design system (reviewer_design)

**Round 3 of the full-feature review cycle (final round under the 3-round cap).** Independently
re-verifies the fix for this lens's sole Round-2 finding (`TextField.accessibilityInvalid` not
derived from `error`), fixed in commit `4f47504` ("fix(login-and-logout): derive TextField
accessibilityInvalid from error"), plus a fresh full pass across all 3 slices. This overwrites the
prior `review-design.md` (Round 2).

## Verdict: APPROVED (Round 3, final) — 0 findings

## Verification performed
- Read `review.md` in full (Round 2 finding + its exact required fix) and `tdd.md`'s "Full-review
  Round 2 fix" section (implementator's response).
- `git diff feb4204 4f47504 --stat` — confirmed the fix touches exactly 4 non-doc files:
  `text-field.tsx`, the new `text-field.test.tsx`, `text-field.e2e.js`, and a 2-line deletion in
  `login-form.tsx`. No drive-by changes.
- Read the full diff of `text-field.tsx` and `login-form.tsx` line-by-line (not just the summary).
- Re-read all 6 cited sibling components (`atoms/chip/chip.tsx:63`, `atoms/checkbox/checkbox.tsx:36`,
  `atoms/switch/switch.tsx:30`, `molecules/radio-group/radio-group.tsx:36`,
  `molecules/language-selector/language-selector.tsx:46`, `molecules/answer-option/answer-option.tsx:35`)
  to re-confirm the "derive a11y signal internally from an already-owned prop" convention and
  compare it against `text-field.tsx`'s new shape.
- Ran the full verification gate myself: `pnpm turbo run check-types --force` (8/8 green),
  `pnpm turbo run lint --force` (clean), `pnpm turbo run test --force` (6/6 workspaces green,
  `@helsoft/components` 65/65 — matches `tdd.md`'s claimed count exactly).
- Ran `pnpm --filter @helsoft/components exec playwright test --reporter=list` (non-interactive)
  — 29/29 green (27 permanent + 2 from another reviewer's own temporary, clearly-labeled
  `tmp-a11y-r3` verification file, not part of this feature's permanent suite — not my artifact,
  left untouched for that reviewer's own cleanup).
- **Independent live-DOM check** (not trusting the implementator's summary or the other reviewer's
  temp file): wrote my own scratch Playwright spec, ran it against the live Storybook build via
  `pnpm --filter @helsoft/components exec playwright test`, then deleted it. All 4 assertions passed:
  - `molecules-textfield--error` (TextField's own canonical `Error` story, `error: true`, **no**
    explicit `accessibilityInvalid` arg) → `<input aria-invalid="true">`.
  - `molecules-textfield--filled` (no error) → `<input aria-invalid="false">`.
  - `organisms-loginform--error-inline-validation` (the story exercising `login-form.tsx`'s two
    `TextField`s **after** the collateral simplification removed their explicit
    `accessibilityInvalid` props) → both the email and password `<input>`s show
    `aria-invalid="true"`.
  - `organisms-loginform--content` (no errors) → both inputs show `aria-invalid="false"`.
  This directly confirms both the `TextField` fix itself and the `login-form.tsx` simplification
  introduce zero regression, from a live rendered DOM, not source-reading.
- Grepped the touched files for hardcoded hex colors — none found; all styling untouched by this
  round's fix.
- Re-ran the full atomic-design/tokens/4-states/story-coverage rubric across all 3 slices (see
  below) — nothing changed since Round 2's clean pass on everything but the one closed finding.

## Round-2 finding re-verification — CLOSED, correctly fixed

### `TextField.accessibilityInvalid` now derives from `error`, matches sibling convention
`libs/components/src/molecules/text-field/text-field.tsx:52` — `accessibilityInvalid = error` is
now a destructured default, so any consumer that only passes `error` (as every existing consumer
already does) gets the correct `aria-invalid` for free; an explicit `accessibilityInvalid` prop
still overrides it (`text-field.test.tsx`'s third test proves the override path). This is the same
*convention* as the 6 cited siblings — internal derivation from an already-owned prop, no
consumer-side duplication required — even though the concrete mechanism necessarily differs
(a destructured-default + merged-into-`...rest` object, vs. an inline `accessibilityState={{...}}`
JSX object) because `accessibilityInvalid` is a distinct, RN-typings-unsupported prop
(`TextInputProps` doesn't declare it in this RN version, forcing the `...rest`-merge approach to
keep `tsc` clean, exactly as documented in `text-field.tsx:61-63` and `tdd.md`). The difference in
mechanism is a typing necessity, not a convention departure — the design intent (no duplicate prop
required from the consumer) is fully satisfied.

### `text-field.stories.tsx`'s `Error` story now genuinely demonstrates `aria-invalid="true"` — confirmed live
No story change was needed (correctly — `{ error: true }` alone now derives the correct default).
Confirmed directly via the live-DOM check above, independent of `text-field.e2e.js`'s own new
assertions (`text-field.e2e.js:90-95,97-102`), which also pass.

### `login-form.tsx`'s simplification — no regression, confirmed live
`login-form.tsx:99-123` — the two now-redundant `accessibilityInvalid={!!emailError}` /
`accessibilityInvalid={!!passwordError}` props are gone; `error={!!emailError}` /
`error={!!passwordError}` remain, and `TextField`'s new default derives the identical value.
Confirmed both by the pre-existing `login-form.test.tsx` assertions (unchanged, still green) and by
my own independent live Playwright DOM check against the `ErrorInlineValidation`/`Content` stories
above — no visual or accessibility regression.

### New `text-field.test.tsx` — no convention violation
First unit test file this component has ever had; kebab-case filename (`text-field.test.tsx`),
co-located with the component per this repo's convention, `describe`/`it` structure and
`render`/`screen` (RNTL) usage matching every sibling test file in this same lib
(`login-form.test.tsx`, `button.test.tsx`, `language-selector.test.tsx`). No new component/Props
type introduced by this file (it only tests the existing `TextFieldProps`), so nothing in this
lens's purview is implicated beyond what's confirmed above.

## Full rubric re-run across all 3 slices — no findings

- **Tokens**: `login-form.tsx`'s error banner (`theme.colors.errorContainer`/`onErrorContainer`,
  `theme.shape.card`, `theme.spacing.s3/s4`, `theme.typography.bodyMedium`), `TextField`'s
  `disabledOpacity`, and `button.tsx`'s `HIT_SLOP`/`minHeight` (`layout.touchTarget`, `HEIGHTS`) —
  all re-confirmed as existing tokens (`libs/components/src/theme/{colors,spacing,shape}.ts`); zero
  hardcoded hex colors anywhere in the touched files.
- **Atomic-design placement**: `TextField` (molecule), `LoginForm` (organism), `Button` (atom) —
  unchanged, all correctly placed. `SignInForm`/`SignOut`/`LanguageSettings` remain
  presentational-wiring components in `libs/study-buddy` with no `.stories.tsx` — an established,
  previously-approved precedent for feature-wiring components in this codebase, not a gap.
- **4 UI states + Storybook coverage**: `login-form.stories.tsx` still covers all 4 spec.md states
  (`Empty`, `Content`, `Loading`, `Error`) plus the bonus `ErrorInlineValidation`, all 5 exercised by
  `login-form.e2e.js`, all passing. `TextField`'s own 6 stories (`Filled`, `Outlined`, `WithIcons`,
  `Error`, `Multiline`, `Disabled`) unchanged and all passing, now with 2 additional `aria-invalid`
  assertions locking in this round's fix.
- **Sibling consistency**: re-confirmed against the same 6 sibling components; no new inconsistency
  introduced anywhere in this round's diff.

## Verification run (this round, by me)
`pnpm turbo run check-types --force` (8/8), `pnpm turbo run lint --force` (clean),
`pnpm turbo run test --force` (6/6 workspaces: `@helsoft/services` 38/38, `@helsoft/hooks` 21/21,
`@helsoft/components` 65/65, `@helsoft/study-buddy` 25/25, `@helsoft/localization` 55/55,
`@helsoft/lib-with-storybook` 2/2), `pnpm --filter @helsoft/components exec playwright test
--reporter=list` (29/29, including all `text-field.e2e.js`/`login-form.e2e.js` cases), plus my own
independent, deleted-after-use scratch Playwright spec doing 4 live-DOM `aria-invalid` assertions
against the running Storybook build (all 4 passed).

## Next step
Nothing outstanding from this lens. Round-2's sole finding is closed with no new issues found.
