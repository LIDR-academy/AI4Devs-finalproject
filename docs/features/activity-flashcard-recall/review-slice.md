# Slice review — activity-flashcard-recall — Slice 2

**Commit:** `02133b7` (branch `feat/activity-flashcard-recall`)
**Task:** task-5 (Unavailable state — missing front or back)
**Verdict: APPROVED**

## Scope of the diff

`git show 02133b7 --stat`: only `flashcard.test.tsx` (production-adjacent test file) plus
`task-5.md`/`tasks.md`/`tdd.md` (docs) changed. `flashcard.tsx`, `flashcard.helpers.ts`,
`use-flashcard.ts` are byte-identical to Slice 1 — matches the task's own claim that no
production change was needed (Slice 1's `isFlashcardSlideValid`/`use-flashcard`/organism
early-return already implemented the guard; this slice only closes the test gap). No scope
creep.

## Code lens

- **`@s8` fully covered, non-vacuous** (`flashcard.test.tsx:186-199`): the new `it.each`
  replaces the old single missing-*back*-only test with two cases —
  `{ content: '' }` (missing front) and `{ back: '' }` (missing back) — each asserting:
  - the unavailable notice is present (`getByText(I18N.unavailable)`, `:194`);
  - the **other**, non-missing field's own text is also hidden (`hiddenText` is `slide.back`
    for the missing-front case and `slide.content` for the missing-back case, `:195`) — this
    correctly proves the whole card degrades rather than partially rendering the still-valid
    field;
  - zero interactive elements: both a targeted `queryByRole('button', { name: I18N.reveal })`
    (`:196`) and a blanket `queryAllByRole('button')).toHaveLength(0)` (`:197`);
  - `onAnswered` is never called (`:198`).
  - Traced against `isFlashcardSlideValid` (`flashcard.helpers.ts:8`, `content.trim().length >
    0 && back.trim().length > 0`) and the organism's early-return (`flashcard.tsx:44-50`): the
    front-missing case is a genuine new mutation-kill — before this slice only the AND's
    right operand (`back`) was exercised by any test; a mutant weakening the check to
    `back.trim().length > 0` alone (dropping the `content` check) would have survived until
    now and is caught by the new first case. Reported RED verification (temporarily
    neutering the guard, both cases failing) in `tdd.md:87-89` is consistent with this
    analysis.
- No production regression: confirmed via the diff stat above and a full read of
  `flashcard.tsx`/`flashcard.helpers.ts`/`use-flashcard.ts` — unchanged since Slice 1's
  approved round 2.
- Red→Green→Refactor evidence present in `tdd.md:79-92` (Gap check → RED → GREEN → Refactor:
  none needed), consistent with the TDD-evidence requirement; no production code added to
  meet a test that wasn't already required (the task itself frames this as closing a test
  gap, not adding new behavior).
- No debug leftovers, no TODOs, no dead code in the diff. Test file remains kebab-case
  (`flashcard.test.tsx`), no filename changes.
- Docs bookkeeping is accurate: `task-5.md` done-criteria all checked and `status: done`
  (`docs/features/activity-flashcard-recall/task-5.md:6,14-19`); `tasks.md` index row synced
  `todo` → `done` for task-5, matching.

## Design lens

- No hardcoded user-facing strings introduced: the new test uses the existing `I18N` key
  constants (`flashcard.test.tsx:13-22`) against the mocked `t: (key) => key`
  (`flashcard.test.tsx:1-5`); production `labels.unavailable` continues to resolve via
  `t('activity.flashcard.unavailable')` (`flashcard.tsx:34`), unchanged.
- Consistent with the matching/fill-in-the-blank unavailable-state precedent: same
  `t('activity.{feature}.unavailable')` naming (`matching.tsx:43`,
  `fill-in-the-blank.tsx:29`, `flashcard.tsx:34`) and same "whole surface degrades to one
  notice, nothing interactive" shape (`matching.tsx:86`, `fill-in-the-blank.tsx:55`,
  `flashcard.tsx:46-49`). No ad-hoc colors/spacing/typography touched by this slice.
- No `.stories.tsx` change expected or made — story coverage for the unavailable state is
  explicitly task-8 (Slice 3) per `tasks.md`; correctly out of scope here.

## Result

No findings. Slice 2 (task-5) unblocked.
