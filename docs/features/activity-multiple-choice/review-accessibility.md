# review-accessibility — activity-multiple-choice (FULL review, Round 3 — final, 3-round cap)

**Verdict: CHANGES_REQUESTED** (1 minor: m4-b — new, narrower successor to m4; final-round
risk-acceptance candidate per `.agents/rules/review-standards.md` §5, not a request for a 4th
implementator round)

Scope: entire feature diff `git diff $(git merge-base feature-entrega2-HernanLaura HEAD)..HEAD`
(merge-base `0dfc914`), fresh — not just the Round 2→3 fix delta (`5dd0161..38c450b`). Fix commit
`38c450b` inspected line-by-line for the m4 fix and the unrelated `answer-option.test.tsx`
mutation-survivor strengthening.

Gates re-run independently:
- `pnpm --filter @helsoft/components test -- multiple-choice.test.tsx` — **19/19 green.**
- Verified the new Android-scoped tests are load-bearing, not tautological: temporarily reverted
  `multiple-choice.tsx:90` to `if (!isUnavailable && answered) {` (removing the `Platform.OS !==
  'android'` guard) and re-ran the suite — exactly one test failed, `does not call
  announceForAccessibility on Android once answered` (`Expected number of calls: 0, Received
  number of calls: 1`); all 18 others (including both `ios`/`web` `it.each` cases) stayed green.
  Restored the file immediately after (`git diff` on the file confirmed clean).

---

## m4 — possible duplicate Android TalkBack announcement — **RESOLVED (as originally scoped)**

`libs/components/src/organisms/multiple-choice/multiple-choice.tsx:89-93` now reads:
```ts
useEffect(() => {
  if (!isUnavailable && answered && Platform.OS !== 'android') {
    AccessibilityInfo.announceForAccessibility(resultLabel);
  }
}, [isUnavailable, answered, resultLabel]);
```

Independently re-confirmed the two source facts the fix pass's comment (`:82-88`) relies on:
- `node_modules/.../react-native/Libraries/Components/View/ViewAccessibility.js:234-239` —
  `accessibilityLiveRegion`'s doc comment: `@platform android`, "Works for Android API >= 19 only."
  Android-only, confirmed.
- `node_modules/.../react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo.js:474-480`
  — `announceForAccessibility` branches `Platform.OS === 'android' ? NativeAccessibilityInfoAndroid
  : NativeAccessibilityManagerIOS`, i.e. **prior to this fix it genuinely fired on Android too**,
  confirming the original concern was real: before `38c450b`, Android got both the live-region
  announcement (via the banner `Text`'s `accessibilityLiveRegion`) *and* the imperative call in the
  same render pass that first mounts the banner subtree (`answered ? <View>… : null`) — a real
  double-trigger, not a hypothetical one.
- The `Platform.OS !== 'android'` guard removes exactly the second trigger on Android while leaving
  it intact on iOS/web (where the live region is a documented no-op) — this is option (b) from
  Round 2's `review.md`, done correctly: it eliminates the duplicate-announcement mechanism, it does
  not merely suppress a symptom.
- Tests are real, not tautological (see Gates above): `multiple-choice.test.tsx:380-399` sets
  `Platform.OS = 'android'` and asserts the spy is **not** called; `:401-420` (`it.each(['ios',
  'web'])`) sets each and asserts it **is** called with `labels.correct`. Both branches are
  independently exercised and the guard's removal is proven to fail exactly the Android case.

**Conclusion: the literal finding raised in Round 1/2 — that the imperative call could fire
alongside the live region on Android, producing a duplicate TalkBack announcement — is now
eliminated by construction and by test.** This closes m4 as originally scoped. Mark **RESOLVED**.

---

## m4-b (NEW, minor) — Android now depends solely on an unverified live-region trigger; risk shifted, not eliminated

`libs/components/src/organisms/multiple-choice/multiple-choice.tsx:90` (the `Platform.OS !==
'android'` guard) composed with `:123-131` (the banner `View`/`Text`, mounted — not updated in
place — via `answered ? <View>… : null`, carrying `accessibilityLiveRegion={isCorrect ? 'polite' :
'assertive'}`).

Removing the imperative call from Android trades one unverified risk for another, not for
certainty:

- Android's live-region mechanism (`View.setAccessibilityLiveRegion`, which
  `accessibilityLiveRegion` maps to) is driven by the platform's accessibility-event model reacting
  to **content changes on an already-present node** (`TYPE_WINDOW_CONTENT_CHANGED`-style diffing).
  This is the same *mount, not update* fact Round 2's m4 finding relied on to argue a duplicate was
  plausible (the banner subtree appears fresh, already populated, in one render pass) — but that
  same fact cuts the other way for the live-region-alone case: a node that appears already carrying
  its final content, rather than an existing node whose content subsequently *changes*, is a
  documented edge case (mirrored in the ARIA live-region spec/practices for the web: a region
  injected into the DOM already populated is frequently not announced by AT, precisely because
  there is no prior state to diff against) where the platform's own live-region trigger may not
  fire at all.
- If that edge case applies here, Android now gets **zero** announcement on answer (the only
  channel it had was the imperative call, now skipped there), which is a **more severe** failure
  than the original "possible duplicate" — a duplicate is a UX nuisance; silence is a live status
  update (correct/incorrect result) never reaching a TalkBack user, which is the exact case WCAG
  2.2 SC 4.1.3 (Status Messages) exists to prevent.
- This is **not confirmed either direction** in this pass — same evidentiary gap as the original
  m4 across all three rounds: no on-device/emulator TalkBack run has been performed at any point in
  this feature's review history, for either the "duplicate" or the "silent" hypothesis. I am not
  asserting the live region fails to fire; I'm flagging that the fix pass's own reasoning (mount,
  not update) — used correctly to justify why a duplicate was plausible — has an equally plausible
  converse that was not addressed, so "m4 is fixed" should not be read as "Android announcement
  reliability is now verified." It's verified *not to double-fire*; it is not verified *to fire at
  all*.

**Severity: minor.** Rationale for not escalating to major/blocker: (a) the code satisfies the
*letter* of WCAG 4.1.3 — the banner has `accessibilityRole`/`accessibilityLiveRegion` properties
that allow it to be programmatically determined by AT, which is what the SC requires; the SC does
not mandate a specific delivery mechanism succeed on every platform in every timing scenario; (b)
this is a symmetric, unverified-either-way platform-behavior claim, the same evidentiary posture
that kept the original m4 at minor for two rounds rather than escalating it; (c) no regression was
introduced in observable, testable behavior — iOS/web (the platforms with a working, *tested*,
*verified* channel) are unaffected.

**This is Round 3 of the 3-round cap.** Per `.agents/rules/review-standards.md` §5: only
blocker/major findings are "hard" at this point; since this is a minor, it is a **candidate for
documented, human-accepted risk** — not a request to send this back to `implementator` for a 4th
round, and not something to silently close either. Recommend recording in `spec.md`'s Open
decisions / `dod.md`: "Android's post-answer announcement relies solely on
`accessibilityLiveRegion` (imperative `AccessibilityInfo.announceForAccessibility` intentionally
skipped on Android per commit `38c450b`); on-device TalkBack verification of first-mount
announcement reliability was never performed across 3 review rounds and is accepted as a residual,
human-signed-off risk." If the human wants zero residual risk, the two options that would close it
outright are the same as before: (i) an actual on-device/emulator TalkBack check, or (ii) fire the
imperative call on Android too but only once per answer transition guarded so it cannot double with
the live region (e.g. omit `accessibilityLiveRegion` from the banner `Text` on Android and rely on
the imperative call alone there, inverting which single mechanism Android uses instead of
combining/dropping either) — not required to ship, since only a minor.

---

## Marker-circle clipping under large Dynamic Type — confirmed still out of scope

`libs/components/src/molecules/answer-option/answer-option.tsx:99-104` (`marker`, fixed 32×32) and
`:114-118` (`markerText`, fixed `fontSize:15`) — unchanged by commit `38c450b` (that commit only
touches `answer-option.test.tsx`, not `answer-option.tsx`'s styles). Re-confirmed still
pre-existing/unmodified — stays out of this feature's scope, as in Rounds 1–2.

---

## Fresh full pass — remaining rubric checks (all re-verified over the entire diff, no new findings)

- **Roles/labels:** every option is `accessibilityRole="button"` (`answer-option.tsx:49`) with a
  meaningful accessible name in every state, including the answered state where correctness is
  conveyed through wording, not the feedback icon's ligature (B1, resolved in prior rounds,
  re-confirmed unaffected by this round's diff). Result banner and explanation heading/body are
  unhidden `<Text>`, reachable via normal AT navigation.
- **Contrast:** `bannerCorrect`/`bannerIncorrect`/marker/label color-token pairs
  (`multiple-choice.tsx:158-167`, `answer-option.tsx:74-138`) are untouched by this round's diff
  (`38c450b` only touches test files + the `useEffect` condition/comment) — no new colors
  introduced, all still theme token pairs (`tertiaryContainer`/`onTertiaryContainer`,
  `errorContainer`/`onErrorContainer`, etc.), consistent with the ≥4.5:1 AA pairing re-verified in
  Round 2.
- **Touch targets:** `AnswerOption` row (`answer-option.tsx:66-73`: `paddingVertical:14`×2 around a
  32dp marker, full-width) — unchanged, ≈60dp effective height, clears 44pt/48dp.
- **No color-only signaling:** correctness conveyed via icon (`check_circle`/`cancel`,
  `multiple-choice.test.tsx:93-94,113-114`) *and* the accessible-name wording (B1) *and*
  border/background — never color alone. Unaffected by this round.
- **Focus/reading order:** unaffected by this round's diff — options, then banner, then
  explanation, in both visual and DOM order (`multiple-choice.tsx:103-138`); no forced focus into
  the live region, consistent with WCAG 4.1.3 guidance.
- **Dynamic type:** unaffected — no style/layout changes in `38c450b`; question/option/banner/
  explanation text remain unconstrained `<Text>` (no `numberOfLines`, no
  `allowFontScaling={false}`).
- **State changes announced:** re-verified `multiple-choice.test.tsx:308-326` (no announcement
  while unanswered), `:334-366` (announces exactly once on the real unanswered→answered re-render
  transition), and the new `:380-420` (Android-scoped skip / iOS-web-scoped fire) — all assert real
  accessible-tree/spy state (`toHaveAccessibleName`, `props.accessibilityLiveRegion`,
  `props.accessibilityRole`, the real `AccessibilityInfo.announceForAccessibility` spy via
  `jest.spyOn`), not implementation internals or mocked shallow renders.
- **The unrelated `answer-option.test.tsx` change in `38c450b`** (asserting
  `screen.getByRole('button').props.accessibilityLabel` directly, `toBe('A Paris')`) strengthens
  test rigor around B1's fix but changes no accessibility *behavior* — re-confirmed it doesn't
  regress anything: `answer-option.test.tsx` still 3/3 (now with the stronger prop-level assertion
  alongside the existing `toHaveAccessibleName` ones).

---

## Disposition

m4, as literally raised in Round 1 and carried through Round 2 ("possible duplicate Android
TalkBack announcement"), is **resolved** — proven by source inspection and by tests shown to fail
without the fix. No other findings from prior rounds remain open (B1, M1, m1–m3, and both mutation
survivors were independently re-confirmed resolved in Round 2 and untouched by this round's diff).

One new, narrower, minor finding (m4-b) surfaces from the fix itself: Android's post-answer
announcement now depends on a single, still-unverified mechanism (the live region) instead of two
redundant-but-conflicting ones, and the same "fresh mount, not in-place update" fact that made a
duplicate plausible also makes under-announcement plausible on the other side of the same coin.
This is **not a regression in tested, verified behavior** (iOS/web are unaffected and fully
verified) and **not a WCAG SC violation by the letter of 4.1.3** (the requisite role/property is
present) — it is a residual, unverified-either-way platform-behavior risk, same evidentiary class
as the original m4.

This is **Round 3 of the 3-round cap.** Per `.agents/rules/review-standards.md` §5: since only a
minor remains, it is a candidate for **documented, human-accepted risk** in `spec.md`'s Open
decisions / `dod.md`, not grounds for a 4th implementator round, and not something to close
silently. Verdict is `CHANGES_REQUESTED` in the strict rubric sense that a finding is open, but
practically this feature is ready to ship once the human explicitly signs off on m4-b as recorded
risk (or, if preferred, closes it outright via on-device TalkBack verification).
