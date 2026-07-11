# Mutation Testing Report: activity-flashcard-recall

## Summary (round 1 rework, post-fix)

| Library | Total (valid) | Killed | Survived | Score |
|---------|---------------|--------|----------|-------|
| @helsoft/activities — `flashcard.tsx` (scoped re-run) | 53 | 53 | 0 | 100.00% |
| @helsoft/study-buddy | 1 | 1 | 0 | 100.00% |

**Status: PASSED — 100% on the scoped re-run.**

One mutant (`ArrowFunction` on the `StyleSheet.create` factory, replacing the whole
theme-builder body with `() => undefined`) reports `RuntimeError`, not `Survived` —
it crashes `react-native-unistyles`'s own `Object.entries` call before any test
assertion runs, so Stryker excludes it from the valid/score denominator. It is not
a survivor and needs no test.

Original pre-review scoped run (before this rework): 79.05% (83/105 killed, 22
survived), all 22 in `libs/activities/src/organisms/flashcard/flashcard.tsx`. See
"History" below for what changed.

---

## History — round 1 fixes

### Category A: dead guard clauses in `handleReveal` / `handleSelfMark` (6 survivors → removed)

Verified reachability by tracing the render tree, not just asserting equivalence:

- `handleReveal`'s original `if (isRevealed || isUnavailable) return;` — the
  component already returns the "unavailable" `Card` above `handleReveal`'s
  definition when `isUnavailable`, so that half was dead. The `isRevealed` half
  looked plausible at first (defensive against double-invocation) but is also
  dead: the `Button` calling `handleReveal` is only rendered inside
  `{!isRevealed ? <Button onPress={handleReveal}>...}` — once `isRevealed`
  flips true, that `Button` unmounts, so there is no UI path left to call
  `handleReveal` a second time.
- `handleSelfMark`'s original `if (locked || !isRevealed || isUnavailable) return;`
  — `isUnavailable` is dead for the same reason as above. `locked` is dead
  because the `Pressable`'s `onPress` is already `locked ? undefined : () => handleSelfMark(recalled)`
  — when locked, `onPress` itself is `undefined`, so `handleSelfMark` is never
  invoked at all. `!isRevealed` is dead because the self-mark row (and its
  `Pressable`s) only render inside the `isRevealed` branch of the component's
  JSX — they don't exist to be pressed otherwise.

Action taken (preferred option (a) — delete rather than test-around dead code):
removed all three guards. `handleReveal` is now `() => setRevealed(true)`;
`handleSelfMark` no longer has a leading guard. Confirmed via a second Stryker
run that the previously-reported survivors are gone (the guarded lines no
longer exist) and no new survivors appeared in their place — the full 24-test
suite stayed green throughout (behavior unchanged, pure dead-code removal).

### Category B: `key` prop on the two static self-mark `Pressable`s (2 survivors → removed)

The two mark buttons are explicit JSX children (`renderMarkButton(true)` then
`renderMarkButton(false)`), not generated from `.map()` over an array — React
only needs `key` to track identity within a dynamically-generated list, which
this isn't. The key served no reconciliation purpose, so it was deleted rather
than kept and left mutation-untestable.

### Category C: style-object mutations (14 survivors → 14 killed)

Added RTL `toHaveStyle` assertions mirroring the pattern already established in
`matching.test.tsx` (e.g. its "lays out columns and items from spacing and
shape tokens" test), using the shared `@helsoft/components` tokens
(`spacing`, `shape`, `layout`, `typography`, `lightColors`) instead of hardcoded
values:

- `root` gap, `prompt` typography+color — new test "lays out root, answer, and
  explanation blocks with spacing and typography tokens".
- `answer`/`explanation` gap, `answerHeading`/`answerBody`/
  `explanationHeading`/`explanationBody` typography+color — same test.
- `selfMark` flexDirection+gap, `markButton` flex/flexDirection/alignItems/
  justifyContent/gap/padding/borderRadius/minHeight/borderWidth/borderColor —
  new test "lays out the self-mark row and buttons from spacing and shape
  tokens".
- `markButtonLabel` typography+color, both the idle state ("styles an idle
  self-mark label from labelLarge and onSurface tokens") and the confirmed
  state ("styles a confirmed self-mark label from labelLarge and
  onSecondaryContainer tokens").

All 14 confirmed killed by the re-run (see Summary above — 0 survivors,
100.00%).

---

## Verification

Re-ran `pnpm --filter @helsoft/activities exec stryker run --mutate "src/organisms/flashcard/flashcard.tsx"` after the fixes:

```
File           |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
flashcard.tsx  | 100.00 |  100.00 |       53 |         0 |          0 |        0 |        1 |
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Also re-ran the full `@helsoft/activities` Jest suite (266 tests, 17 suites,
all green), `pnpm turbo run lint check-types --filter=@helsoft/activities --filter=@helsoft/study-buddy` (clean).
