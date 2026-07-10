# Accessibility review — login-and-logout (Round 1 / Slice 1)

**Verdict: CHANGES_REQUESTED**

Scope: Slice 1 only (happy path + Loading), per `tdd.md`. `@s12` (full accessibility scenario:
error announcement) and `@s13` (i18n) are legitimately deferred to Slice 3 (task-8/task-9) and are
**not** flagged here as missing — they are out of scope for this round. This review covers only
what Slice 1 actually ships: `LoginForm` (Content + Loading states), `SignInForm`, `SignOut` +
confirmation `Dialog`.

## What already works (no finding)
- **Labels present** — `LoginForm` (`libs/components/src/organisms/login-form/login-form.tsx:41-47`,
  `:50-55`) passes matching `label` + `accessibilityLabel` on both `TextField`s; `TextField` forwards
  `accessibilityLabel` through `...rest` onto the underlying `TextInput`
  (`libs/components/src/molecules/text-field/text-field.tsx:43,73`). Confirmed by
  `login-form.test.tsx:17-18` (`getByLabelText('Email'/'Password')`) and
  `sign-in-form.test.tsx:53,56` (`getByLabelText('auth.email'/'auth.password')`). Satisfies WCAG
  4.1.2 / part of AC12, ahead of the Slice-3 pass.
- **Button role present** — `Button` renders `<Pressable accessibilityRole="button" .../>`
  (`libs/components/src/atoms/button/button.tsx:80`), so the submit control, "Log Out" trigger, and
  Dialog confirm/cancel controls all expose `role=button`. Confirmed by
  `login-form.test.tsx:19,42`, `sign-out.test.tsx:43,70,87`. Satisfies the other half of AC12, ahead
  of schedule.
- **Submit-button disabled state IS exposed to assistive tech** — RN's `Pressable` merges its
  `disabled` prop into `accessibilityState.disabled`
  (`node_modules/react-native/Libraries/Components/Pressable/Pressable.js:230,236`), so
  `Button disabled={isSubmitting}` (`login-form.tsx:58`) correctly surfaces the Loading state on the
  submit control to VoiceOver/TalkBack. Confirmed by `login-form.test.tsx:42`
  (`getByRole('button', { name: 'Log in', disabled: true })`).
- **No color-only signaling** — no error/validation UI ships in Slice 1 (deferred to Slice 2), so
  there is nothing color-coded yet to flag.
- **Dynamic type not disabled** — no `allowFontScaling={false}` / `maxFontSizeMultiplier` found
  anywhere in `libs/components/src` (grep clean), so OS text-scaling isn't blocked at the API level
  (see Finding 4 for a real clipping risk this still allows).
- **Reading/focus order** — `LoginForm`'s DOM order (email → password → submit/spinner → sign-up
  link) matches its visual top-to-bottom layout; no custom focus/tab order overrides. Sensible.

## Findings

### 1. [Major] Disabled fields during Loading are not exposed to assistive tech
`libs/components/src/organisms/login-form/login-form.tsx:45` (email `editable={!isSubmitting}`) and
`:54` (password, same). Unlike `Pressable`, RN's `TextInput` does **not** derive
`accessibilityState.disabled` from `editable` — its accessibility state only reads
`aria-disabled`/`accessibilityState`
(`node_modules/react-native/Libraries/Components/TextInput/TextInput.js:634-648`). So while the
fields are correctly made non-editable while `isSubmitting`, a screen-reader user gets no
programmatic signal that the field is disabled (VoiceOver/TalkBack will not announce "dimmed"/
"disabled" the way it does for the submit `Button`). `login-form.test.tsx:47-52` only asserts
`.props.editable === false`, not `accessibilityState`, so this gap isn't caught by the test suite
either. **WCAG 4.1.2 Name, Role, Value (Level A).** Fix: pass `accessibilityState={{ disabled:
isSubmitting }}` (or equivalent) alongside `editable` on both `TextField`s.

### 2. [Major] Loading affordance (spinner) is not perceivable to assistive tech
`libs/components/src/atoms/progress-indicator/progress-indicator.tsx:82-86` (circular variant, the
one `LoginForm` uses) renders a bare `<View accessibilityRole="progressbar" accessibilityValue={...}>`
with no `accessible` prop. Per RN's accessibility model, a plain `View` is not exposed as a discrete
accessibility element to VoiceOver/TalkBack unless `accessible={true}` is set — this is confirmed as
a real runtime gap, not merely an RNTL query limitation (the implementator's own note in `tdd.md:25-29`
independently reaches the same conclusion). The consuming `LoginForm`
(`libs/components/src/organisms/login-form/login-form.tsx:61-65`) wraps it only in a `testID`-bearing
`View` with no compensating live-region text, so during the entire Loading state (@s3, built this
round) an assistive-tech user's only signal that authentication is in progress is the submit button
going "dimmed" (Finding covered separately) — nothing announces *why*, or that it's loading. **WCAG
4.1.2 Name, Role, Value + 4.1.3 Status Messages (Level AA).** Root cause is the shared, pre-existing
`ProgressIndicator` atom; recommend fixing there (add `accessible` + `accessibilityLiveRegion` support)
since other consumers share the same gap, or at minimum have `LoginForm` add an
`accessibilityLiveRegion="polite"` announcement (e.g. a visually-hidden "Signing in…" text) around its
own Loading affordance.

### 3. [Major] Touch targets below the 44pt/48dp bar for every actionable control in this feature
`libs/components/src/atoms/button/button.tsx:26` (`HEIGHTS = { small: 32, medium: 40, large: 56 }`)
and `:122-126` (`size` variant sets a **fixed** `height: HEIGHTS[size]`). None of this feature's
buttons override `size`, so all render at the default `medium` = **40dp** tall, with no `hitSlop` to
compensate:
- `LoginForm` submit button — `libs/components/src/organisms/login-form/login-form.tsx:58`
- `SignOut` "Log Out" trigger — `libs/study-buddy/src/components/sign-out/sign-out.tsx:18`
- `Dialog` cancel/confirm buttons — `libs/components/src/organisms/dialog/dialog.tsx:55,58`

This technically clears the literal WCAG 2.2 **2.5.8 Target Size (Minimum, AA)** floor of 24×24 CSS
px, but misses the 44pt/48dp bar this review was scoped to check — which matches WCAG **2.5.5
Target Size Enhanced (AAA)**, Apple HIG, Material Design, and the project's *own* design-system
token: `layout.touchTarget = 48` (`libs/components/src/theme/spacing.ts:35`) is defined but never
referenced by `Button`. Every tap target a user needs to hit to log in or log out in this feature
(submit, Log Out, and both dialog actions) is undersized against the project's own standard.

### 4. [Major] Button labels can clip under Dynamic Type / large system font sizes
`libs/components/src/atoms/button/button.tsx:109` (`overflow: 'hidden'` on the root `Pressable`
style) combined with the **fixed** `height` from the `size` variant (`:122-126`, see Finding 3) and
`<Text numberOfLines={1} .../>` (`:89`). Because dynamic type isn't disabled anywhere (confirmed
above), a user with an enlarged OS font size will get a taller text line-height for "Log in"/"Log
Out"/"Confirm"/"Cancel" than the button's fixed-height box allows, and `overflow: 'hidden'` will
vertically clip the label rather than let the button grow. Affects the same controls listed in
Finding 3. **WCAG 1.4.4 Resize Text (Level AA).**

## Not flagged (deferred, correctly out of scope this round)
- `@s12` full coverage (roles/labels ✅ already present per above; error announcement — not yet
  built, lands with error UI in Slice 2/3).
- `@s13` i18n coverage — copy currently falls back to raw `t()` keys; expected per `tdd.md:129-130`.
- Inline validation messages / error banner accessibility (`errorMessage`/`emailError`/
  `passwordError` props) — not built this slice.
- `Dialog`'s own internal accessibility semantics (headline not marked as a heading role, scrim
  `Pressable` role) — pre-existing, unmodified shared organism, not part of this feature's diff.
