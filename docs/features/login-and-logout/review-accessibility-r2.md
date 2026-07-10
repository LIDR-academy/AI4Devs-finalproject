# review-accessibility — login-and-logout — Round 2

Scope: re-verification of Round-1 findings 1–4 (owned by this lens) against commit `7751666`
("fix(login-and-logout): resolve Round 1 review findings"), plus a fresh WCAG 2.2 AA pass over
every file that commit touched. Read the current full state of every named file (not just the
diff) and confirmed against real RN/`react-native-web` source, not just narrative in `tdd.md`.

**Verdict: CHANGES_REQUESTED — 1 major finding (Round-1 Finding 2, partially resolved).**

`pnpm --filter @helsoft/components test` — 4 suites, 28/28 green (includes `login-form.test.tsx`
and the new `button.test.tsx`). `pnpm --filter @helsoft/components check-types` — green.

---

## Round-1 findings — verification

### Finding 1 (major) — `TextField.disabled` + `accessibilityState` on both fields — **RESOLVED**
`libs/components/src/organisms/login-form/login-form.tsx:47-48` (email) and `:57-58` (password)
now pass `disabled={isSubmitting}` and `accessibilityState={{ disabled: isSubmitting }}` on both
`TextField`s (confirmed on the current file, not just the diff).
- Flow-through confirmed by reading `libs/components/src/molecules/text-field/text-field.tsx`:
  `disabled` is destructured explicitly (`:35`) and drives both `editable={!disabled}` (`:59`, the
  `TextInput`) and `opacity: disabled ? theme.disabledOpacity : 1` on the wrapping `field` `View`
  (`:101`, the `TextInput`'s direct parent per the component's render tree at `:52-78`).
  `accessibilityState` is **not** destructured, so it lands in `...rest` (`:42`) and is spread onto
  the `TextInput` at `:73` verbatim.
- Confirmed at the RN-source level that this actually reaches VoiceOver/TalkBack:
  `node_modules/react-native/Libraries/Components/TextInput/TextInput.js:634-649` computes
  `_accessibilityState.disabled = ariaDisabled ?? accessibilityState?.disabled`, i.e. our explicit
  `{ disabled: isSubmitting }` is exactly what ends up in the native accessibility node.
- Test strengthened as required: `login-form.test.tsx:51-61` now asserts `editable === false`
  **and** `parent` style `opacity === disabledOpacity` (imported from `theme/colors.ts:221`, not a
  hardcoded number), and a new test at `:65-70` asserts `accessibilityState` equals
  `{ disabled: true }` on both fields (Jest's `toEqual` correctly treats the extra
  `busy`/`checked`/`expanded`/`selected: undefined` keys `TextInput.js` also sets as equal to
  absent — verified empirically, both tests pass). No longer just asserting `editable`.
- WCAG 4.1.2 (Name, Role, Value): satisfied — programmatic disabled state now present.

### Finding 2 (major) — perceivable Loading announcement — **STILL PARTIALLY OPEN (major, now iOS-only)**
`libs/components/src/organisms/login-form/login-form.tsx:66-71` adds a visually-hidden
`<Text accessibilityLiveRegion="polite">{labels.signingIn}</Text>` inside the existing
`LOADING_INDICATOR_TEST_ID` wrapper, styled by `styles.visuallyHidden` (`:93-98`:
`position: 'absolute', width: 1, height: 1, overflow: 'hidden'`). The style genuinely keeps the
node mounted and in the accessibility tree (no `display: none`, no
`accessibilityElementsHidden`/`importantForAccessibility="no-hide-descendants"`), so the technique
itself is sound — **but the mechanism it relies on, `accessibilityLiveRegion`, is Android-only in
React Native, and this app ships iOS as a primary target** (per `AGENTS.md`: "ships web + iOS +
Android from one codebase"):
- `node_modules/react-native/Libraries/Components/View/ViewAccessibility.js:231-239` documents the
  prop itself: *"Works for Android API >= 19 only. `@platform android`"*. There is no
  `BaseViewConfig.ios.js` entry for `accessibilityLiveRegion` at all (confirmed —
  `BaseViewConfig.android.js:249` has it; the iOS equivalent file has no such key), so on iOS this
  prop is inert — VoiceOver receives no notification when the node mounts or its text changes.
  - Android (native): works — `BaseViewConfig.android.js:249` wires the prop through to the native
    live-region mechanism.
  - Web (via `react-native-web`, used for this app's web target and Storybook): works —
    `react-native-web/dist/modules/createDOMProps/index.js:460-462` maps
    `accessibilityLiveRegion` to the DOM `aria-live` attribute (`'none'` → `'off'`, otherwise
    passed through), which is the correct, functional web mechanism.
  - **iOS (native): does not work.** No fallback exists anywhere in the codebase — confirmed via
    `grep -rn "announceForAccessibility|AccessibilityInfo" libs/ apps/` returning zero hits outside
    third-party build artifacts (`libs/components/node_modules/.cache/storybook/...`, not app
    source).
- Practical effect: a VoiceOver user on iOS submitting the login form gets **no signal at all**
  that authentication is in progress — the exact WCAG 4.1.3 (Status Messages) gap Round-1 Finding
  2 was raised against — the fix closes it for Android and Web only.
- **Fix:** React Native ships a cross-platform-correct primitive for exactly this —
  `AccessibilityInfo.announceForAccessibility(labels.signingIn)` — confirmed implemented for both
  platforms in the installed RN version:
  `node_modules/react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo.js:474-480`
  dispatches to `NativeAccessibilityInfoAndroid` on Android and `NativeAccessibilityManagerIOS` on
  iOS (and `react-native-web` also implements it for the web target). Call it imperatively (e.g. a
  `useEffect` keyed on `isSubmitting` transitioning to `true` in `login-form.tsx`) instead of, or in
  addition to, the `accessibilityLiveRegion` `<Text>` — the current visually-hidden node can stay
  as a Web/Android reinforcement if desired, but iOS needs the imperative call to be perceivable at
  all.
- Severity kept at **major** (unchanged from Round 1): this is the same root defect — the Loading
  state is not perceivable to assistive tech — merely now scoped to one platform instead of all
  three. Given the project explicitly ships iOS as a first-class target, VoiceOver users are a full
  affected population, not an edge case.

### Finding 3 (major) — 48dp touch targets via `hitSlop` — **RESOLVED**
`libs/components/src/atoms/button/button.tsx:26,31-39,92,94` — `HIT_SLOP` is computed per size as
`Math.max(0, (layout.touchTarget - HEIGHTS[size]) / 2)` per edge and passed to `Pressable`'s
`hitSlop` (`:92`). Verified the math against current tokens (`layout.touchTarget = 48`,
`libs/components/src/theme/spacing.ts:35`; `HEIGHTS = { small: 32, medium: 40, large: 56 }`,
`button.tsx:26`):
- `medium` (default, used by every call site below): slop = `(48-40)/2 = 4` per edge →
  `40 + 4 + 4 = 48` — exactly reaches the token.
- `small`: slop = `(48-32)/2 = 8` per edge → `32 + 8 + 8 = 48` — exactly reaches the token.
- `large`: slop = `max(0, (48-56)/2) = 0` (clamped, no negative slop) → `56` — already ≥48,
  correctly no-ops.
- Applied at the shared `Button` atom, so it reaches all four Round-1 call sites automatically
  without any per-site change, confirmed by re-reading each: `LoginForm`'s submit
  (`login-form.tsx:62`, no `size` override), `SignOut`'s "Log Out" trigger
  (`libs/study-buddy/src/components/sign-out/sign-out.tsx:18`, no `size` override), and `Dialog`'s
  cancel/confirm (`libs/components/src/organisms/dialog/dialog.tsx:55,58`, no `size` override,
  variants `text`/`filled` only). None sets an explicit `style` that would override `hitSlop`.
- Checked adjacent-target overlap risk introduced by the new `hitSlop` (WCAG 2.5.8 spacing
  exception): `dialog.tsx`'s `actions` row (`:96-101`, `gap: 8`) has two adjacent `medium` buttons —
  each contributes `4dp` of `hitSlop` toward the other, so the two tap areas meet exactly at the
  midpoint of the existing `8dp` gap (touching, not overlapping). No accidental mis-tap risk
  introduced. `login-form.tsx`'s submit row / sign-up row are separated by `theme.spacing.s4 = 16dp`
  (`login-form.tsx:85`), well clear of the `8dp` combined slop.
- `button.test.tsx:10-17` asserts `hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT >= layout.touchTarget`
  against the real rendered `Pressable` props — a genuine, non-tautological check (would fail
  against the pre-fix `Button`, which had no `hitSlop` prop at all).

### Finding 4 (major) — Dynamic Type clipping — **RESOLVED**
`libs/components/src/atoms/button/button.tsx:109,123` — the `size`-keyed fixed-`height` variant
block was deleted; `HEIGHTS[size]` is now passed into `styles.root(...)` as a `minHeight` argument
instead (`:94`). Since no explicit `height` is set anywhere else on this style, Flexbox will size
the `Pressable`'s box to its intrinsic content height whenever that exceeds `minHeight` — so a
`<Text numberOfLines={1}>` label (`:99`) whose line-height grows under an enlarged OS font scale
now grows the box instead of being constrained to a fixed height. `overflow: 'hidden'` remains at
`:119` but no longer causes clipping of the label itself, since it clips only what protrudes past
the (now-growable) box, not the label against an artificially fixed one; it's still needed to keep
`StateLayer`'s hover/press wash within the rounded corners.
- `button.test.tsx:19-31` asserts `flat.height === undefined` and `flat.minHeight === 40` against
  the real flattened style array — a genuine, non-tautological check (would fail against the
  pre-fix fixed-`height` variant).
- WCAG 1.4.4 (Resize Text): satisfied — no fixed-height container remains on the label path.

---

## Fresh a11y pass over commit `7751666` — no other new regressions found

- `login-form.tsx:65-72` — the `LOADING_INDICATOR_TEST_ID` wrapper `View` has no `accessible` prop
  or role of its own, so it does not merge its children into one opaque accessibility node; the new
  live-region `Text` remains an independently reachable sibling of `ProgressIndicator`, unaffected
  by that atom's own pre-existing (out-of-scope, per Round 1's explicit fix-scope note) lack of an
  `accessible` prop.
- Removing `size` from `styles.useVariants({ variant })` (`button.tsx:59`) does not silently drop
  any `accessibilityRole`/label — `accessibilityRole="button"` (`:89`) and `disabled={disabled}`
  (`:90`, still separately driving `Pressable`'s own derived `accessibilityState.disabled`) are
  untouched by this refactor.
- `button.test.tsx` additions are meaningful, not tautological — both assert against the real
  rendered `Pressable` props/style, and both are shown above to fail against the pre-fix code.
- No color-only signaling introduced or changed by this commit; no new focus-order changes (no new
  focusable siblings inserted ahead of existing controls — the live-region `Text` is visually
  off-screen and, being a plain `<Text>` with no `accessibilityRole="button"`/link semantics, does
  not enter the tab/VoiceOver-swipe focus order as an actionable stop, only as a passive
  announcement, which is the intended behavior for a status message).
- Cross-reference: `docs/features/login-and-logout/review-design-r2.md` and `review-code-r2.md`
  both independently note that `libs/localization/src/resources/en.ts:46-49` (and `es`/`de`/`pt`)
  is missing the new `auth.signingIn` key, so `t('auth.signingIn')` currently falls back to the
  literal string `"auth.signingIn"` in the real app. This doesn't change this lens's verdict on its
  own — WCAG 4.1.3 requires a status message be programmatically determinable and presented to AT,
  which still technically holds even with placeholder copy — but it does mean the Android/Web half
  of the Finding-2 fix would currently announce nonsense copy in production until the locale keys
  are filled in (same pre-existing, previously-unflagged gap as `auth.email`/`auth.password`/
  `auth.submit`, not newly introduced in kind by this commit). Not re-raised as a separate finding
  here since it's already tracked by the other two lenses; noted for completeness.

## Checks run
- `pnpm --filter @helsoft/components test` — 4 suites, 28/28 green.
- `pnpm --filter @helsoft/components check-types` — green.
- Read current full state of `login-form.tsx`, `login-form.test.tsx`, `login-form.stories.tsx`,
  `button.tsx`, `button.test.tsx`, `text-field.tsx`, `sign-out.tsx`, `dialog.tsx` (not just the
  diff).
- Verified `accessibilityState` flow-through and `accessibilityLiveRegion` platform support by
  reading the installed `react-native@0.86.0` and `react-native-web@0.21.2` source directly (cited
  file:line above), not assumed from memory.

## Action required
`implementator`: add a cross-platform announcement for the Loading state — the imperative
`AccessibilityInfo.announceForAccessibility(labels.signingIn)` (or
`announceForAccessibilityWithOptions`), fired when `isSubmitting` transitions to `true` — so iOS
VoiceOver users get the same "Signing in…" signal Android/TalkBack and Web already receive from the
`accessibilityLiveRegion` `<Text>`. The existing visually-hidden `<Text>` may stay as the
Android/Web mechanism; it just isn't sufficient on its own for iOS.
