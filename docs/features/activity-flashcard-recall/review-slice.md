# Slice review — activity-flashcard-recall — Slice 1

**Commit:** `7dccc48` (branch `feat/activity-flashcard-recall`)
**Tasks:** task-1 (types), task-2 (helpers), task-3 (organism), task-4 (wiring)
**Verdict: CHANGES_REQUESTED**

## Findings

### 1. [Major — Design lens] Chosen self-mark button: icon color contradicts its own button chrome color
`libs/activities/src/organisms/flashcard/flashcard.tsx:70`, `:79`, `:163-166`

```ts
const iconColor = recalled ? theme.colors.tertiary : theme.colors.error;   // line 70
...
style={[styles.markButton, isChosen && styles.markButtonChosen]}          // line 79
...
markButtonChosen: {                                                       // lines 163-166
  backgroundColor: theme.colors.secondaryContainer,
  borderColor: theme.colors.tertiary,
},
```

`markButtonChosen` is a single, static style applied to whichever mark is chosen (`secondaryContainer` background / `tertiary` border), regardless of whether the learner picked "Recalled" or "Not recalled". But the icon fill color inside that same button *does* switch — `tertiary` for "Recalled", `theme.colors.error` (red) for "Not recalled". The result: choosing "Not recalled" renders a red `cancel` icon inside a teal/tertiary-bordered, secondary-tinted button — the icon and its own container chrome don't agree, which is a real (not cosmetic-nitpick) visual inconsistency, not merely a style preference.

Compare to the sibling `Matching`/`MultipleChoice` organisms (`matching.tsx:229-240`, `multiple-choice.tsx:120-124`), where background/border *and* icon/text color are switched together as one coherent pair (`tertiary*` for correct, `error*` for incorrect) — the flashcard organism only switches half of that pair.

There's a second, underlying issue driving this: `flashcard` is **explicitly not graded** (spec.md Summary: "even though it isn't part of my graded score"; "self-marked, not graded — there is no grader module"). Reusing `theme.colors.error` — the same token `Matching`/`MultipleChoice` use for a *wrong* graded answer — to represent "I didn't recall it" implies a right/wrong judgment on a self-report that the whole feature is designed to not judge. A neutral pairing (e.g. `secondary`/`onSecondaryContainer`, matching the existing `markButtonChosen` background already used for both marks) would fix both the internal color-clash and the misleading semantics in one change.

### 2. [Minor — process/doc consistency] `tasks.md` task-status index not updated to `done`
`docs/features/activity-flashcard-recall/tasks.md:9-12`

Tasks 1-4 each correctly flip their own `status: done` in `task-N.md` (verified: `task-1.md`, `task-2.md`, `task-3.md`, `task-4.md` all diffed `todo` → `done` in this commit), and the `tasks.md` frontmatter `phase` was correctly bumped `approved` → `in_progress`. But the `tasks.md` **index table's own Status column still reads `todo`** for all four completed tasks — stale as of this commit. The prior shipped feature (`docs/features/activity-matching/tasks.md`) keeps this column in sync with actual completion (shows `done`), so this is a regression against established practice, not a template quirk.

## What's solid (no findings)
- **Scope boundary respected**: `libs/types/src/activity-type.ts` and `libs/activities/src/organisms/lesson-results/score-lesson.ts` are untouched by this commit (confirmed via diff) — task-1's explicit out-of-scope constraint honored.
- **`@s` → test map** (tdd.md) matches actual tests: `@s1`-`@s5`, `@s7` in `flashcard.test.tsx`; `@s6` split across `graded-answer.test.ts` (type-level), `flashcard.helpers.test.ts`, `flashcard.test.tsx`, and `flashcard-activity.test.tsx` (integration) — all present and exercising real RTL-rendered behavior, not vacuous/mocked-through assertions.
- **State machine correct**: reveal is one-way (`handleReveal` guards `isRevealed`/`isUnavailable`); self-mark is a one-time lock (`handleSelfMark` guards `locked`/`!isRevealed`/`isUnavailable`); `onAnswered` fires exactly once on self-mark, never on reveal, and repeat taps (same or other mark) are ignored — all directly asserted in `flashcard.test.tsx`'s `it.each` blocks (@s4/@s5) and mirrored end-to-end by `flashcard-activity.test.tsx` (@s6).
- **`component-split.mdc` fully respected**: handlers (`handleReveal`, `handleSelfMark`) live in `flashcard.tsx`; state/derived/effect (`revealed`, `answer`, `locked`, `isRevealed`, `isUnavailable`, the a11y announce effect) live in `use-flashcard.ts`; pure transforms (`isFlashcardSlideValid`, `buildFlashcardAnswer`) live in `flashcard.helpers.ts`, importing no React/hooks. `flashcard.types.ts` holds only types.
- **`hooks-service-dao.mdc` respected**: `use-flashcard` is local `useState`/`useEffect` UI-coordination state only — no service/DAO/data hook, matching the spec's explicit "no grader, no custom data hook" decision.
- **Atomic-design placement correct**: `Flashcard` organism in `@helsoft/activities/src/organisms/`, thin `FlashcardActivity` wiring in `@helsoft/study-buddy`, mirroring the shipped `Matching`/`MatchingActivity` split; exported through both barrels (`organisms/index.ts`, `study-buddy/src/index.ts`).
- **Data contract matches spec exactly**: `FlashcardSlide`/`FlashcardAnswer` shapes, doc-comments (including the `content`-is-front convention, phrased the same way `FillInTheBlankSlide` documents its own `content` reuse), and the `graded-answer.test.ts` type-level check mirroring the existing `MultipleChoiceAnswer` one — all as specified.
- **Tokens/i18n**: no hardcoded colors/hex/dimensions found in the new files; all user-facing chrome routes through `t('activity.flashcard.*')` placeholder keys (correctly deferred to task-6; `migration-coverage.test.ts`'s key-existence guard is not yet wired for this dir, matching the same deferred pattern used by `multiple-choice`/`matching`/`fill-in-the-blank` in their own task-6 equivalents).
- **A11y at organism-contract level present**: `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityState={{ disabled, selected }}` on both self-mark `Pressable`s; confirmation is text + icon + `accessibilityState`, not color alone (per @s4); reveal announce effect guarded `Platform.OS !== 'android'`, mirroring `use-matching`/`use-fill-in-the-blank`. Full a11y polish correctly deferred to task-7.
- **`FlashcardActivity` wiring**: genuinely thin (no local state, no grading), `Props` type declared inline consistent with `MatchingActivityProps`; `flashcard-activity.stories.tsx` (`Features/FlashcardActivity`, `Default` + `WithoutExplanation`) mirrors `matching-activity.stories.tsx` line-for-line in structure.
- No debug leftovers, no TODOs, no dead code, kebab-case filenames throughout.
