# review.md — activity-multiple-choice

## Slice 1 (happy path, @s1–@s7) — Round 2 — RESOLVED

**Verdict: APPROVED**

Reviewers run (slice mode, per `.agents/rules/review-standards.md`): `reviewer_code`, `reviewer_design`.
No mutation in slice mode. Scope: commit `875c575f415ecb896a2e22e1ee4bc7522149af0b` (parent
`0dfc9140`), @s1–@s7 only; @s8–@s11 (Slice 2/3) correctly out of scope and not flagged.

- `reviewer_code` → `review-code.md`: **APPROVED, zero findings.**
- `reviewer_design` → `review-design.md`: **APPROVED, zero findings** (also clean in Round 1).

One finding raised in Round 1 (untested `accessibilityRole="alert"` / `accessibilityLiveRegion="polite"`
on the result banner, `multiple-choice.tsx:78-79`) was fixed by the `implementator` and confirmed
resolved by both reviewers in Round 2. Slice 1 is closed — not re-reviewed below.

---

## Slice 2 (Empty + Error + grader validation, @s8/@s9, task-5) — Round 3 (final, 3-round cap) — RESOLVED

**Verdict: APPROVED**

Scope: commit `8cf9524200f61322d424b509b6422000ee9aa9db` (`feat(activity-multiple-choice): add
error handling and empty state` — amended twice, on top of Slice 1 `875c575`). Reviewers run
(slice mode): `reviewer_code`, `reviewer_design`. No mutation, no minors-accept in slice mode —
this round has zero open findings.

- `reviewer_code` → `review-code.md`: **APPROVED, zero findings.**
- `reviewer_design` → `review-design.md`: **APPROVED, zero findings.**

Slice 2 closed clean.

---

## Slice 3 (i18n + a11y, @s10/@s11, task-6/task-7) — Round 2 (final) — RESOLVED

**Verdict: APPROVED**

Scope: commit `f4c19a08d6fa0752e4775efe9a9e3bef929dcb18` (`feat(activity-multiple-choice): add
i18n and a11y`, amended once post-Round-1, on top of Slice 2 `8cf9524`). Reviewers run (slice
mode): `reviewer_code`, `reviewer_design`. Both APPROVED, zero findings.

**All three vertical slices closed clean. Feature entered the FULL review phase (all six
reviewers + mutation) below.**

---

## FULL review — Round 1 — RESOLVED

**Verdict at the time: CHANGES_REQUESTED** (1 blocker + 1 major + 4 minor)

Scope: entire feature diff, `git diff 0dfc914..HEAD` — commits `875c575` (happy path), `8cf9524`
(error/empty), `f4c19a0` (i18n/a11y), reviewed as one coherent whole for the first time. All six
reviewers ran in parallel; mutation testing ran alongside (`mutation.md`, `mutation_tester`),
surfacing 2 additional logic-gap survivors folded into the same fix pass.

| Reviewer | Verdict | Findings |
|---|---|---|
| `reviewer_code` | CHANGES_REQUESTED | 3 minor (m1, m2, m3) |
| `reviewer_design` | APPROVED | 0 |
| `reviewer_architecture` | APPROVED | 0 |
| `reviewer_security` | APPROVED | 0 |
| `reviewer_accessibility` | CHANGES_REQUESTED | 1 blocker (B1), 1 major (M1), 1 minor (m4) |
| `reviewer_performance` | APPROVED | 0 |

All 6 review findings + 2 mutation survivors were fixed by `implementator` in one consolidated
TDD pass, commit `5dd0161` (on top of `f4c19a0`), documented in `tdd.md`'s "Full-review Round 1 —
fix pass" section. Verified resolved in Round 2 — **B1, M1, m1, m2, m3 all confirmed fixed by
independent re-verification; m4 was not fully resolved and carried forward to Round 2.**

---

## FULL review — Round 2 — RESOLVED (as literally scoped)

**Verdict at the time: CHANGES_REQUESTED** (1 minor, m4 carried over from Round 1)

Scope: entire feature diff, `git diff 0dfc914..HEAD` (fresh, not just the Round 1 fix-pass delta).

| Reviewer | Verdict | Findings |
|---|---|---|
| `reviewer_code` | APPROVED | 0 |
| `reviewer_design` | APPROVED | 0 |
| `reviewer_architecture` | APPROVED | 0 |
| `reviewer_security` | APPROVED | 0 |
| `reviewer_accessibility` | CHANGES_REQUESTED | 1 minor (m4, carried over) |
| `reviewer_performance` | APPROVED | 0 |

**m4 — possible duplicate Android TalkBack announcement** (`multiple-choice.tsx:82-96` composed
with the banner's `accessibilityLiveRegion` at `:127-133`). Fixed by `implementator` in commit
`38c450b`: scoped the imperative `AccessibilityInfo.announceForAccessibility` call with
`Platform.OS !== 'android'`, since the banner's own Android-only `accessibilityLiveRegion` was
argued to already cover Android — with new tests proving the call is skipped on Android and still
fires on iOS/web (`multiple-choice.test.tsx`, `it.each(['ios','web'])`). A separate mutation
survivor in `answer-option.tsx:50` (RTL's child-text fallback masking a string-literal mutant) was
also fixed with a direct-prop assertion. Both re-verified below in Round 3 — **m4 as literally
raised is resolved by construction and by test** (see Round 3). A narrower, new finding (m4-b)
surfaced from the fix itself and is documented in Round 3 below.

---

## FULL review — Round 3 (FINAL, 3-round cap reached) — CHANGES_REQUESTED → 1 MINOR OPEN

**Scope:** entire feature diff, `git diff $(git merge-base feature-entrega2-HernanLaura HEAD)..HEAD`
(merge-base `0dfc914`), fresh — not just the Round 2→3 fix delta (`5dd0161..38c450b`). All six
reviewers re-ran over the whole diff.

| Reviewer | Verdict | Findings |
|---|---|---|
| `reviewer_code` | APPROVED | 0 (independently reproduced the answer-option mutant locally and confirmed the Round 2 fix kills it) |
| `reviewer_design` | APPROVED | 0 |
| `reviewer_architecture` | APPROVED | 0 |
| `reviewer_security` | APPROVED | 0 |
| `reviewer_accessibility` | CHANGES_REQUESTED | m4 (carried over) **RESOLVED**; 1 new minor (m4-b) |
| `reviewer_performance` | APPROVED | 0 |

### m4 — possible duplicate Android TalkBack announcement — **CONFIRMED RESOLVED**

`libs/components/src/organisms/multiple-choice/multiple-choice.tsx:89-93`:
```ts
useEffect(() => {
  if (!isUnavailable && answered && Platform.OS !== 'android') {
    AccessibilityInfo.announceForAccessibility(resultLabel);
  }
}, [isUnavailable, answered, resultLabel]);
```
`reviewer_accessibility` independently re-confirmed via RN source
(`ViewAccessibility.js:234-239`, `AccessibilityInfo.js:474-480`) that `accessibilityLiveRegion` is
Android-only and that `announceForAccessibility` genuinely fired on Android pre-fix — the original
concern was a real double-trigger, not hypothetical. The `Platform.OS !== 'android'` guard removes
exactly that second trigger while leaving iOS/web (where the live region is a documented no-op)
unaffected. Tests verified load-bearing, not tautological: the reviewer temporarily reverted the
guard and re-ran the suite — exactly one test failed
(`does not call announceForAccessibility on Android once answered`), all 18 others (including
both `ios`/`web` `it.each` cases) stayed green; the file was restored immediately after
(`git diff` on it came back clean). `reviewer_code` separately reproduced the unrelated
`answer-option.tsx:50` mutation-survivor fix the same way and confirmed only the new test fails on
the mutant.

**This closes m4 exactly as scoped in Rounds 1–2. Not open.**

### MINOR (1 open) — m4-b (NEW): Android now depends solely on an unverified live-region trigger

**Severity: minor.** Raised by `reviewer_accessibility`.
`libs/components/src/organisms/multiple-choice/multiple-choice.tsx:90` (the `Platform.OS !==
'android'` guard) composed with `:123-131` (the result banner `View`/`Text`, mounted fresh — not
updated in place — via `answered ? <View>… : null`, carrying
`accessibilityLiveRegion={isCorrect ? 'polite' : 'assertive'}`).

Removing the imperative call from Android trades one unverified risk for a different one, not for
certainty. Android's live-region mechanism is driven by the platform's accessibility-event model
reacting to **content changes on an already-present node**, not necessarily to a node that appears
already carrying its final content in one render pass (the same "fresh mount, not in-place update"
fact that made the *original* m4 duplicate plausible cuts the other way here: it also makes it
plausible the live region may not fire on first appearance at all). If that edge case applies,
Android would now get **zero** announcement on answer — more severe than the original "possible
duplicate" (silence vs. a UX nuisance), which is exactly what WCAG 4.1.3 (Status Messages) exists
to prevent. This is **not confirmed in either direction** — no on-device/emulator TalkBack run has
been performed at any point across all 3 review rounds, for either the "duplicate" or the "silent"
hypothesis.

Kept at minor, not escalated, because: (a) the code satisfies the *letter* of WCAG 4.1.3 — the
banner carries `accessibilityRole`/`accessibilityLiveRegion` properties that make it programmatically
determinable by AT, which is what the SC requires (it does not mandate a delivery mechanism succeed
on every platform/timing); (b) this is a symmetric, unverified-either-way platform-behavior claim,
the same evidentiary posture that kept the original m4 at minor for two rounds; (c) no regression
in observable, *tested* behavior — iOS/web (the platforms with a working, verified channel) are
unaffected by this round's change.

**Fix options (not required to ship, since only a minor):**
(a) an actual on-device/emulator TalkBack check of first-mount announcement reliability on Android; or
(b) fire the imperative call on Android too but invert which single mechanism Android relies on —
omit `accessibilityLiveRegion` from the banner `Text` on Android and use the imperative call alone
there, instead of combining or fully dropping either mechanism.

### Also re-confirmed out of scope (no action needed)

- Marker-circle clipping under large Dynamic Type (`answer-option.tsx` marker/markerText style
  blocks, `:99-104`/`:114-118`) — re-confirmed unchanged by commit `38c450b` (which only touches
  `answer-option.test.tsx`, not the component's styles). Stays out of this feature's scope, as in
  Rounds 1–2.

### Mutation (Round 3, run alongside this review)

`mutation.md`: **PASS — 100% of feature-changed logic mutants killed** (54/54 across
`answer-option.tsx:50`, `multiple-choice.tsx`'s new `optionAccessibilityLabel` function,
`Platform`-scoped `useEffect`, `options.map` wiring, and conditional a11y banner attributes, plus
`grade-multiple-choice.ts` and `multiple-choice-activity.tsx`, both 100%). Both Round 2 survivors
(`answer-option.tsx:50` string-literal fallback, the earlier `useEffect`/re-selection-guard
survivors) are now killed. Remaining 71 survivors are on pre-existing/unmodified code or pure
`StyleSheet.create` styling mutations (documented as equivalent, non-blocking per the mutation
skill's scope rules) — not feature logic.

### Gates (independently re-run by multiple reviewers this round)
`pnpm lint`, `pnpm check-types` (full monorepo), `pnpm test` (full monorepo: components 87/87,
study-buddy 35/35, services 38/38, hooks 21/21, localization 56/56), and
`pnpm --filter @helsoft/components exec playwright test` (31/31) all green. No gate failures. No
`console.log`/`debugger`/`TODO`/`FIXME`/`.only`/`.skip` in the feature diff.

---

## Disposition — Round 3 of 3 (cap reached)

Per `.agents/rules/review-standards.md` §5: after the 3rd round, any remaining blocker/major (or
unmet mutation threshold) is hard and blocks; if **only minors** remain, they may ship as
**documented, human-accepted risks**.

**Status: only one minor (m4-b) remains open.** No blocker, no major, mutation threshold met
(100% on changed logic). This is an `ESCALATE_MINORS` situation, not a hard block — m4-b is a
**candidate for documented, human-accepted risk-acceptance**, not grounds for a 4th implementator
round (the cap is 3), and not something to close silently.

**Recommended risk-acceptance record** (human sign-off required before recording, per the rule —
not pre-decided here), to be added to `spec.md`'s Open decisions and `dod.md` if accepted:

> Android's post-answer result announcement relies solely on the result banner's
> `accessibilityLiveRegion` (the imperative `AccessibilityInfo.announceForAccessibility` call is
> intentionally skipped on Android per commit `38c450b`, to avoid a confirmed duplicate-trigger
> risk). On-device/emulator TalkBack verification of first-mount live-region announcement
> reliability on Android was never performed across all 3 review rounds; this is accepted as a
> residual, human-signed-off risk. iOS and web use the imperative call and are fully tested and
> verified.

`review.md` holds only this one unresolved item; everything else from all three rounds is
confirmed resolved above.
