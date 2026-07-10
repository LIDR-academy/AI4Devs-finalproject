# Design review — login-and-logout (Round 2)

**Verdict: APPROVED**

Round 1 verdict for this lens was `APPROVED` with zero findings (nothing to re-verify there). This
round reviews commit `7751666` (`fix(login-and-logout): resolve Round 1 review findings`), which
touched the shared `Button` atom to resolve **another reviewer's** findings 3/4 (touch target,
Dynamic Type clipping). Design-system impact of that shared-atom change, plus every other
design-relevant file in the commit, is the focus below.

## Files inspected
- `libs/components/src/atoms/button/button.tsx` (full file + `git show 7751666 --` diff)
- `libs/components/src/atoms/button/button.stories.tsx`, `button.test.tsx` (new)
- `libs/components/src/organisms/login-form/login-form.tsx`, `login-form.stories.tsx`, `login-form.test.tsx`
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`
- `libs/components/src/organisms/dialog/dialog.tsx` (Button consumer, spot-check)
- `libs/study-buddy/src/components/sign-out/sign-out.tsx` (Button consumer, spot-check)
- `libs/components/src/theme/spacing.ts`, `libs/components/src/theme/colors.ts`
- `libs/localization/src/resources/{en,es,de,pt}.ts` (consulted only for the `signingIn` label wiring below)

## `Button` atom — design-system contract preserved

`button.tsx:26,31-39,59,92,94,108-123` (see `git show 7751666 -- libs/components/src/atoms/button/button.tsx`):
- `HIT_SLOP` (`:34-39`) is derived from the existing `layout.touchTarget` token
  (`theme/spacing.ts:35`, = 48) minus each size's existing `HEIGHTS` token, halved per edge, clamped
  to `0` via `Math.max` — no new ad-hoc numbers, purely token arithmetic. `hitSlop={HIT_SLOP[size]}`
  (`:92`) is additive (expands the tap area only) and does not touch the visual box.
- `minHeight` (`:109,123`) replaces the fixed `height` that used to live under
  `variants.size` — same `HEIGHTS[size]` token is now passed as a style-function argument instead
  (`:94`). At default OS font scale the rendered height is unchanged (a `View` with only `minHeight`
  set and content that fits already renders at exactly `minHeight`), so this is a non-visual
  refactor for every existing consumer, not a resize. `overflow: 'hidden'` is correctly left in
  place (still needed to clip `StateLayer`'s hover/press wash to the rounded corners) and no longer
  risks clipping the label, since the box can now grow past `minHeight` when Dynamic Type inflates
  the `<Text numberOfLines={1}>` line height (`:99`).
- Removing `size` from `styles.useVariants({ variant })` (`:59`) is consistent — the `size` variant
  branch (formerly `variants.size.{small,medium,large}`) was deleted from the same `StyleSheet.create`
  block (`:124-136` in the current file), so there's no orphaned/unreferenced variant left behind.
- No ad-hoc colors/spacing/typography introduced; `PAD_X`, `PAD_TEXT`, `PAD_ICON*` are untouched and
  still spacing-token-derived.

**Consumer spot-check (no visual regression):**
- `grep -rn "<Button" libs apps` (excluding stories/tests) shows exactly three call sites, none
  passing an explicit `size`: `libs/components/src/organisms/dialog/dialog.tsx:55,58` (cancel/confirm,
  default `medium`) and `libs/components/src/organisms/login-form/login-form.tsx:62,75` (submit,
  sign-up link). All render at `medium` = 40dp before and after — same as this feature's own
  `SignOut` trigger (`libs/study-buddy/src/components/sign-out/sign-out.tsx:18`, also default
  `medium`, also unaffected). `apps/app-study-buddy` has no direct `<Button>` usage today.
- `Dialog`'s action row (`dialog.tsx:101-106`, `gap: 8`) with two adjacent `medium` buttons: each
  button's new `hitSlop` is `4pt` per edge (`(48-40)/2`), so the two tap areas meet exactly at the
  midpoint of the `8px` gap — touching, not overlapping. No mis-tap risk introduced.

## `button.stories.tsx` — still accurate, no update needed
`button.stories.tsx:44-51` (`Sizes` story, three buttons side by side) continues to render the
correct relative heights: since `minHeight` equals the same `HEIGHTS[size]` token the old fixed
`height` variant used, and story content ("Small"/"Medium"/"Large") doesn't inflate under default
font scale, the rendered boxes are pixel-identical to Round 1. No story or doc text anywhere
references the old fixed-`height` mechanism as a promised behavior, so nothing needed updating.

## Other design-relevant files touched by `7751666`

**`login-form.tsx`** (`:47-48,57-58,68-70,93-99`) — `disabled={isSubmitting}` replaces the raw
`editable` prop on both `TextField`s, correctly routing through `TextField`'s own `disabled` prop
(`molecules/text-field/text-field.tsx:59,101`), which is the component's intended way to both stop
input **and** apply `theme.disabledOpacity` — confirmed via `login-form.test.tsx:56-58`, which now
asserts `emailField.parent` / `passwordField.parent` carry `{ opacity: disabledOpacity }` imported
straight from `theme/colors.ts`, not a hardcoded number. This closes the design-system-contract half
of Round 1 finding 1 cleanly (token used, no ad-hoc opacity). The new `visuallyHidden` style
(`login-form.tsx:93-99`, `position:'absolute', width:1, height:1, overflow:'hidden'`) is a standard
sr-only technique, not a visual-layout element — the 1px dimensions aren't a "spacing" concern since
they're deliberately arbitrary/off the 4px grid by design (same pattern any design system's
"visually-hidden" utility uses); no finding here.

**`login-form.stories.tsx:10`** — added `signingIn: 'Signing in…'` to the local hardcoded `labels`
object, matching the existing pattern for every other label in that object (`email`, `password`,
`submit`, `signUpPrompt` are all hardcoded English strings at the story level already) — consistent
with sibling convention, not a new violation.

**`sign-in-form.tsx:29`** — wires `signingIn: t('auth.signingIn')`, preserving the
presentational/wiring split confirmed in Round 1 (`LoginForm` stays translation-agnostic;
`SignInForm` owns `useLocalization()`).

## Minor (non-blocking, out of primary design-system scope — flagged for completeness)

### Missing translation resource for the new `auth.signingIn` key
`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:29` calls `t('auth.signingIn')`, but
`libs/localization/src/resources/en.ts:46-49` (the "authoritative" bundle, per its own file-header
comment) only defines `auth.toSignUp` / `auth.toLogIn` — `signingIn` is absent from `en`, `es`, `de`,
and `pt`. i18next's default missing-key behavior renders the raw key literally, so the Loading
state's new polite live-region (the very accessibility fix this commit ships) would announce the
string `"auth.signingIn"` to a screen-reader user in production instead of real copy — undermining
its own fix. Not a token/atomic-design/story-coverage issue, so it doesn't change this lens's
verdict, and it doesn't block: `t()` isn't type-checked against the resource shape here (confirmed —
`pnpm check-types` is green with the mismatch present), and the identical gap already existed for
`auth.email`/`auth.password`/`auth.submit` before this round (introduced in Slice 1, not flagged by
any reviewer then either) — so this is a pre-existing pattern this commit extended by one key, not a
new class of bug. Recommend `reviewer_code` or the content-completeness owner add the four missing
`auth.*` keys (including `signingIn`) to all four locale bundles; no design-system rework needed.

## Checks run
- `git show 7751666 -- libs/components/src/atoms/button/button.tsx` (diff review) and full current
  read of `button.tsx`.
- `grep -rn "<Button"` across `libs/` and `apps/` (excluding `.stories.tsx`/`.test.tsx`) — 3 call
  sites, all default `size`, all reviewed above.
- `pnpm --filter @helsoft/components exec jest button.test.tsx login-form.test.tsx` — 2 suites,
  11/11 green.
- `pnpm turbo run lint check-types --filter=@helsoft/components --filter=@helsoft/study-buddy
  --filter=@helsoft/hooks` — 6/6 green.
- No Playwright e2e exists yet for `Button`/`LoginForm` (`libs/components/tests/e2e/` only covers
  `card`, `language-selector`, `slide-progress`, `text-field`) — consistent with this feature still
  being Slice 1/Jest-only; nothing to run non-interactively for these files.

## Findings
None (blocker/major) for this lens. One minor, non-blocking, out-of-primary-scope observation noted
above for completeness (missing `auth.signingIn` locale key — recommend routing to `reviewer_code`).

**Verdict: APPROVED** — the shared `Button` atom's `hitSlop`/`minHeight` refactor preserves its
design-system contract (token-derived, no ad-hoc values), introduces no visual regression for any
of its 3 non-feature-story call sites, and `button.stories.tsx` remains accurate. All other
design-relevant files touched by `7751666` stay within existing tokens/patterns and correct
atomic-design placement, and Storybook coverage (`Content`+`Loading`) still matches the approved
Slice-1 contract.
