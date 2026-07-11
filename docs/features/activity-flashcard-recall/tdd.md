# TDD log — activity-flashcard-recall

Strict Red→Green→Refactor. Prior-slice detail trimmed to map + one line/cycle (8000-byte budget).

## Slice 1 (tasks 1-4) — types, helpers, `Flashcard` organism, `FlashcardActivity` wiring

| @s | Test |
|---|---|
| s1-s5,s7 | `flashcard.test.tsx` — hidden/reveal/self-mark/lock/re-tap ignored/explanation |
| s6 | `graded-answer.test.ts`, `flashcard.helpers.test.ts`, `flashcard.test.tsx`, `flashcard-activity.test.tsx` |
| s8 (base) | `flashcard.helpers.test.ts` (`isFlashcardSlideValid`), `flashcard.test.tsx` (unavailable base) |

Cycles: types (`FlashcardSlide`/`FlashcardAnswer`) → pure helpers (`isFlashcardSlideValid`,
`buildFlashcardAnswer`) → `use-flashcard` state/effect → `Flashcard` organism scenario-by-scenario
→ `FlashcardActivity` thin wrapper + integration test. Rework (reviewer_slice round 2): chosen
self-mark icon color unified to neutral `onSecondaryContainer`/`secondary` (was tertiary/error
clash) — RED `it.each` on icon+container colors, GREEN in `flashcard.tsx`. Gate: types/activities
/study-buddy unit suites green, check-types clean, no lint script on libs yet, no hardcoded
colors, i18n via placeholder `t()` keys (real bundle entries deferred to task-6). APPROVED.

## Slice 2 (task-5) — unavailable hardening

| @s | Test |
|---|---|
| s8 | `flashcard.test.tsx` `it.each` (missing front / missing back) — notice, other field still hidden, zero buttons, `onAnswered` never called |

Cycle: gap was test-only (Slice 1's guard + early-return already covered both fields); replaced
single back-only case with `it.each` over both; verified non-vacuous by temporarily neutering the
guard (both cases failed), reverted. No production diff. Gate green. APPROVED.

## Slice 3 (tasks 6-9) — i18n, a11y, Storybook, Playwright e2e

| @s | Test |
|---|---|
| s9 | `migration-coverage.test.ts` (`flashcard` key-existence guard); bundles carry full `activity.flashcard.*` set |
| s10 | `flashcard.test.tsx` `accessibility` block — button role/label (reveal + both self-marks), `layout.touchTarget` minHeight; `use-flashcard.test.ts` announce-on-reveal (pre-existing) |
| s1-s4,s7,s8 | `flashcard.stories.tsx` — Hidden, RevealedUnmarked, RevealedRecalled, RevealedNotRecalled, WithoutExplanation, UnavailableMissingBack, UnavailableMissingFront, Interactive |
| s1-s5 | `flashcard.e2e.js` — Interactive reveal→self-mark→lock→ignore-relock; seeded stories' visible text; both unavailable stories |

### Cycles

**task-6 (i18n)** — RED: registered `flashcard` in `KEY_EXISTENCE_DIRS`
(`migration-coverage.test.ts`) before bundle keys existed → failed (8 missing keys). GREEN: added
`activity.flashcard.{reveal,recalled,notRecalled,recalledConfirmed,notRecalledConfirmed,
answerHeading,explanationHeading,unavailable}` to en/es/pt/de (`explanationHeading` = "Why" per
matching/fill-in-the-blank precedent; `unavailable` mirrors shared activity wording).
`flashcard.tsx` already consumed real `t('activity.flashcard.*')` keys from Slice 1 — organism
unchanged. Refactor: none.

**task-7 (a11y)** — gap check: Slice 1 already built `accessibilityRole`/`accessibilityLabel`/
`accessibilityState` on self-mark controls, the announce effect (`use-flashcard.ts`,
`Platform.OS !== 'android'`), and `theme.layout.touchTarget` minHeight (mirrors matching's
Slice-3 finding: a11y lands with the interaction, not deferred). Added an explicit `@s10` test
block (`flashcard.test.tsx`) pinning button role/label for reveal + both self-marks and
`layout.touchTarget` minHeight. Verified non-vacuous: temporarily changed self-mark `minHeight` →
new test failed as expected; reverted (byte-identical). No production change needed.

**task-8 (Storybook)** — `flashcard.stories.tsx` (`Organisms/Flashcard`): `Hidden`,
`RevealedUnmarked` (`initialRevealed`), `RevealedRecalled`/`RevealedNotRecalled`
(`initialAnswer`), `WithoutExplanation`, `UnavailableMissingBack`/`UnavailableMissingFront`
(empty `back`/`content`), `Interactive` (unseeded, drives task-9). `build` (storybook build)
green.

**task-9 (Playwright e2e)** — `flashcard.e2e.js`, mirroring `matching.e2e.js` (frameLocator on
`storybook-preview-iframe`, `getByText` exact). Static-story assertions for all 7 seeded stories +
`Interactive` reveal → both self-marks appear → lock+confirm → re-tap (other/same) ignored.
Corrected a wrong assumption while iterating: only the *chosen* mark's idle label swaps to its
confirmed text; the unchosen mark's idle label stays visible after lock — fixed
`RevealedRecalled`/`RevealedNotRecalled` assertions before green.

## Gate (Slice 3)

- `pnpm --filter @helsoft/localization test`: 8 suites, 60 tests green.
- `pnpm --filter @helsoft/activities test`: 17 suites, 262 tests green.
- `pnpm --filter @helsoft/study-buddy test`: 5 suites, 24 tests green.
- `pnpm --filter @helsoft/types test`: 4 suites, 11 tests green.
- `pnpm check-types` (repo-wide, turbo): clean.
- `pnpm lint` (repo-wide, turbo): clean — no lint script on any lib workspace yet (pre-existing;
  only `app-study-buddy` defines one).
- `pnpm --filter @helsoft/activities exec playwright test --reporter=list`: full lib e2e suite
  (fill-in-the-blank + flashcard + matching + multiple-choice), 38 passed, 0 failed.
- No hardcoded colors/dimensions/strings introduced; all new chrome via
  `t('activity.flashcard.*')` and `theme.*` tokens.
