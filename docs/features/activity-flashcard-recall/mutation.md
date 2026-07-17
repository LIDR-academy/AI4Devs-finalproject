# Mutation Testing Report: activity-flashcard-recall

## Pass 1 — pre-review (round 1 rework)

| Library | File | Total | Killed | Survived | Score |
|---|---|---|---|---|---|
| @helsoft/activities | `flashcard.tsx` (scoped) | 53 | 53 | 0 | 100.00% |
| @helsoft/study-buddy | — | 1 | 1 | 0 | 100.00% |

Survivors: none. (Original pre-fix run: 79.05%, 83/105 killed, 22 survived — all resolved below.)

Fixes applied to reach 100%:
- Dead guard clauses in `handleReveal`/`handleSelfMark` (`flashcard.tsx`) — unreachable per render-tree trace (unmounted controls once revealed/locked); deleted rather than tested around. 6 survivors → gone.
- Redundant `key` prop on the two static self-mark `Pressable`s — not list-generated, key served no reconciliation purpose; deleted. 2 survivors → gone.
- 14 style-object survivors killed by added `toHaveStyle` RTL assertions (root/answer/explanation/selfMark/markButton/markButtonLabel), mirroring `matching.test.tsx`'s pattern, using shared `@helsoft/components` tokens.

One `ArrowFunction` mutant on the `StyleSheet.create` factory reports `RuntimeError` (crashes `react-native-unistyles`'s `Object.entries` before any assertion runs) — excluded from Stryker's valid/score denominator, not a survivor.

## Pass 2 — post-review

| Library | File | Total | Killed | Survived | Score |
|---|---|---|---|---|---|
| @helsoft/activities | `use-flashcard.ts` | 26 | 26 | 0 | 100.00% |

Survivors: none. Review round fixed the a11y announcement to include `slide.back` (not just the static heading); strengthened test "announces the answer heading and the revealed answer content when revealed" kills both the string-concat mutant and the dependency-array mutant.

**Status: PASSED both passes, 100%, 0 survivors.**
