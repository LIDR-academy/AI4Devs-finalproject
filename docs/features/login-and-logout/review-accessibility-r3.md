# review-accessibility — login-and-logout — Round 3 (FINAL)

Scope: independent re-verification of Round-2's sole open item (Finding 2, major — iOS
VoiceOver Loading announcement) plus the two Round-2 minors with a11y relevance, against
commit `c9ec582` ("fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)"). Read
the current full state of every named file, re-verified RN 0.86.0 and `react-native-web` 0.21.2
source directly (not narrative), and independently reproduced/ran the test suite multiple times
(see "Test-run investigation" below).

**Verdict: APPROVED — 0 blocker/major findings, 1 minor (non-blocking, documented risk per the
Round-3 cap rule).**

---

## Finding 2 (major, Round 1 → Round 2) — iOS VoiceOver Loading announcement — RESOLVED

`libs/components/src/organisms/login-form/login-form.tsx:42-46`:
```
useEffect(() => {
  if (isSubmitting) {
    AccessibilityInfo.announceForAccessibility(labels.signingIn);
  }
}, [isSubmitting, labels.signingIn]);
```

**Logic re-verified line-by-line, three specific failure modes checked:**
1. **Fires on the `false → true` transition** — yes: the effect re-runs whenever `isSubmitting`
   changes, and the guard only calls `announceForAccessibility` when the new value is `true`, so
   the `true → false` transition (and any re-render where `isSubmitting` doesn't change) is a
   no-op.
2. **Does not fire repeatedly on unrelated re-renders** — the dependency array holds only
   primitives (`isSubmitting: boolean`, `labels.signingIn: string`), not the `labels` object
   itself. `sign-in-form.tsx:24-30` constructs a brand-new `labels` object literal on every
   `SignInForm` render, but since only the *string value* of `signingIn` is in the dep array
   (compared by value, not reference), an unrelated parent re-render with an unchanged
   translation does not re-trigger the effect. Confirmed no other state in `LoginForm` (email/
   password `useState`) is in the dependency array, so keystrokes during Content state don't
   re-fire it either (fields are disabled during Loading regardless).
3. **Mounting directly with `isSubmitting === true`** (e.g., fast navigation landing on an
   already-in-flight submission) — the effect **does** fire on that initial mount, because
   React runs all effects after the first commit regardless of prior value. This is correct,
   intended behavior (confirmed against `tdd.md:264-265`, which documents this as deliberate:
   "fires on the initial mount if Loading starts immediately") — a VoiceOver user landing on a
   screen mid-operation should still be told an operation is in progress. There is no scenario
   in which this component fails to announce when it mounts already-submitting.

**Cross-platform correctness re-verified at the installed-package-source level (not narrative):**
- `node_modules/.pnpm/react-native@0.86.0.../react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo.js`
  (`announceForAccessibility`, bottom of file): dispatches to `NativeAccessibilityInfoAndroid` on
  Android and to `NativeAccessibilityManagerIOS` on every other platform (i.e., iOS) — this is a
  genuine, real native call on iOS, unlike the inert `accessibilityLiveRegion` prop Round 2 found.
  **iOS is fixed.**
- `node_modules/.pnpm/react-native-web@0.21.2.../react-native-web/src/exports/AccessibilityInfo/index.js`:
  `announceForAccessibility` is a **literal no-op stub** (`function (announcement) {}`) on web.
  This means the *new* imperative call contributes nothing on web — but that is not a regression,
  because the pre-existing visually-hidden `<Text accessibilityLiveRegion="polite">`
  (`login-form.tsx:76-78`, untouched by this commit) still maps to `aria-live` via
  `react-native-web`'s `createDOMProps`, exactly as Round 2 verified. **Web is unaffected/still
  covered.**
- Android now receives **two** signals: the native `accessibilityLiveRegion` mechanism (still
  present, unchanged) *and* the new imperative `announceForAccessibility` call. This is a
  redundant-but-harmless double announcement, not a WCAG violation (4.1.3 requires the status be
  perceivable, not that it be announced exactly once) — noted for completeness, not raised as a
  finding; this is a common, deliberate defensive pattern for cross-Android-version reliability.

Net result: **all three platforms now perceive the Loading status message** — the root defect
from Round 1/2 is closed.

**Test coverage**: `login-form.test.tsx:84-100` (`'announces "Signing in…" via AccessibilityInfo
when isSubmitting becomes true'`) spies on `AccessibilityInfo.announceForAccessibility`, asserts
it is *not* called on initial Content-state mount, then asserts it *is* called with
`labels.signingIn` after `rerender`ing into `isSubmitting`. This is a genuine, non-tautological
regression guard — see "Test-run investigation" below for the one caveat found.

## Minor (Round 2) — missing `auth.signingIn` locale key — RESOLVED

`libs/localization/src/resources/en.ts:46`, `es.ts:45`, `de.ts:45`, `pt.ts:45` all now define
`auth.signingIn` with real translated copy ("Signing in…" / "Iniciando sesión…" / "Anmeldung
läuft…" / "Entrando…"), not a placeholder. End-to-end wiring confirmed at
`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:29`:
`signingIn: t('auth.signingIn')` — a real call through the localization layer in production
usage, not a hardcoded English string. Combined with the fix above, a VoiceOver/TalkBack/aria-live
user now hears actual translated "Signing in…" copy, not the literal key.

## Minor (Round 2) — stale doc comment — RESOLVED

`libs/components/src/organisms/login-form/login-form.tsx:28` now reads: "testID for the
Loading-state affordance (@s3) — the a11y announcement lives on the live-region Text node and the
AccessibilityInfo call below." Accurately describes the current (dual) mechanism; no longer
implies a11y is deferred to a future pass.

## Fresh a11y pass — no new regressions

- `TextField.disabled` + `accessibilityState` on both fields (Round 1 Finding 1) — untouched by
  this commit, still present at `login-form.tsx:55-56,65-66`.
- 48dp `hitSlop` touch targets on `Button` (Round 1 Finding 3) — untouched by this commit
  (`button.tsx` not in this diff).
- Dynamic Type / no fixed-height clipping (Round 1 Finding 4) — untouched by this commit
  (`button.tsx` not in this diff).
- No color-only signaling, no focus-order changes, no new interactive elements introduced by this
  diff — the only production change is the imperative `AccessibilityInfo` call (non-visual, not a
  focusable/tabbable element) plus locale-content additions.

## Minor (new, Round 3) — one non-reproducible test failure observed; test hardening recommended

Per this round's mandate, `pnpm --filter @helsoft/components test` was run repeatedly to confirm
the new test is a genuine, reliable regression guard.

- **First invocation** of `pnpm --filter @helsoft/components test` in this review session:
  `login-form.test.tsx` **failed** on exactly the new test
  (`'announces "Signing in…" via AccessibilityInfo when isSubmitting becomes true'`,
  `login-form.test.tsx:84-100`) — `expect(announceSpy).toHaveBeenCalledWith(labels.signingIn)`
  reported **0 calls**. All 3 other suites and the other 28 `@helsoft/components` tests passed.
- **Investigated, not dismissed**: bisected via `-t` filters (isolating the failing test alone,
  isolating it with each preceding test, isolating the whole file), ran the full file and the
  full workspace suite ~20 additional times including with `--clearCache` for a genuinely cold
  jest cache — **every subsequent run passed 29/29**, including the file in total isolation.
  Independently built a temporary, standalone debug test (outside the reviewed files, deleted
  immediately after use, no repo file left modified — confirmed via `git status`) that observes
  `AccessibilityInfo.announceForAccessibility` via direct property reassignment instead of
  `jest.spyOn`: it recorded the call firing correctly and deterministically
  (`'Signing in…'`) on the same `false → true` `rerender` transition, on every run.
- **Conclusion**: this is a very-low-frequency (~1 in ~20 observed) test/harness timing artifact
  — most likely the post-`act(async () => {...})` assertion racing the passive-effect flush on a
  "cold" first invocation of the whole Jest process — not a defect in the production
  `AccessibilityInfo` fix itself, which was independently confirmed correct via a separate,
  non-`jest.spyOn`-based harness. `tdd.md:249-261` documents the implementator's own encounter
  with a related (already-fixed, via `announceSpy.mockClear()`) cross-test call-history-pollution
  issue in this same test, which is consistent with this test's mocking of a persistent,
  auto-mocked native module being more timing-sensitive than a typical pure-JS assertion.
- **Recommendation (non-blocking)**: harden `login-form.test.tsx:93-97` by replacing the
  immediate post-`act()` assertion with
  `await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.signingIn))`, removing
  reliance on `act()`'s effect-flush timing being instantaneous on every machine/run.
- **Severity: minor.** Not a WCAG violation (production behavior is correct on all 3 platforms,
  confirmed above and via independent harness); not reproducible in the overwhelming majority of
  runs. Per the Round-3 cap rule ("If only minors remain, they may ship as documented,
  human-accepted risks"), this does not block approval but should be recorded in `dod.md` /
  `risks.md` as a known test-reliability item for follow-up hardening.

## Checks run
- `pnpm --filter @helsoft/components test` — 1 failure observed on first run (see above), 29/29
  passing on ~20 subsequent runs (isolated file, full workspace, cold-cache).
- `pnpm --filter @helsoft/components check-types` — green.
- `pnpm --filter @helsoft/localization test` — 52/52 green.
- `pnpm --filter @helsoft/study-buddy test` — 14/14 green (includes `sign-in-form.test.tsx`,
  confirms `SignInForm` still wires `useAuth()`/`useLocalization()` into `LoginForm` correctly).
- Read current full state of `login-form.tsx`, `login-form.test.tsx`, `login-form.stories.tsx`,
  `sign-in-form.tsx`, `sign-in-form.test.tsx`, all four locale resource files (not just the diff).
- Verified `AccessibilityInfo.announceForAccessibility` platform behavior by reading the installed
  `react-native@0.86.0` and `react-native-web@0.21.2` source directly (cited file:line above).
- Built and ran (then fully removed — verified via `git status`) a temporary, standalone debug
  harness to independently confirm the `useEffect` fires correctly without relying on the same
  `jest.spyOn` mechanism used by the shipped test.

## Action required
None blocking. Recommend (non-blocking, for the mutation/hardening pass or a follow-up ticket):
add `await waitFor(...)` around `login-form.test.tsx:97`'s assertion per the note above, to remove
the rare effect-flush-timing race from the new regression guard.
