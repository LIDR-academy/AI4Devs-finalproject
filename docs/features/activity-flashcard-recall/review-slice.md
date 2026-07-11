# Slice review — activity-flashcard-recall — Slice 1 (Round 2)

**Commit:** `3c93135` (branch `feat/activity-flashcard-recall`, fixes round-1 commit `7dccc48`)
**Tasks:** task-1 (types), task-2 (helpers), task-3 (organism), task-4 (wiring)
**Verdict: APPROVED**

## Round-1 findings — verified fixed

### 1. [Major — Design lens] Self-mark icon/container color clash + misleading `error` token — FIXED
`libs/activities/src/organisms/flashcard/flashcard.tsx:73`, `:168`

- `iconColor` is now a single static `theme.colors.onSecondaryContainer` for both "Recalled" and "Not recalled" chosen states (no more `recalled ? tertiary : error` branch) — confirmed no other place in the file branches on `recalled` for color (`markButtonLabel` at `:170-173` branches only on `isChosen`, same value both marks, unchanged since round 1 and never flagged).
- `markButtonChosen.borderColor` changed `tertiary` → `secondary` (`:168`), so icon, background (`secondaryContainer`), and border (`secondary`) are now one coherent, static family for both marks — no internal clash, and `theme.colors.error` is no longer used anywhere in this file, removing the "wrong answer" implication on a non-graded self-report.
- New test (`flashcard.test.tsx:118-135`) is a genuine, non-vacuous regression guard: `it.each` over both marks asserts the *same* `iconColor`/`backgroundColor`/`borderColor` values for both "Recalled" and "Not recalled" — this would fail against the old `recalled ? tertiary : error` code (which produced different icon colors per mark), so it correctly pins the fix.
- Contrast check (design lens, quick pass): `onSecondaryContainer` (`secondary[10]` in light mode) against `secondaryContainer` (`secondary[90]`) is the standard MD3 tonal container/on-container pair (`libs/components/src/theme/colors.ts:143-146`) — same pairing already used for the chosen label text (`flashcard.tsx:172`), so no new/untested pairing was introduced and contrast is materially *higher* than the previous `tertiary`/`error` icon against `secondaryContainer`. Dark-mode pairing (`secondary[30]`/`secondary[90]`) mirrors the same inversion. No regression.

### 2. [Minor] `tasks.md` index Status column stale — FIXED
`docs/features/activity-flashcard-recall/tasks.md:12-15`

Index now reads `done` for tasks 1-4, matching each `task-N.md`'s own `status: done` (verified directly). Tasks 5-9 correctly remain `todo` (Slices 2-3, not yet started).

## Fresh pass (code + design lenses) — no new findings

- **Scope of the fix commit is exact**: `git diff 7dccc48 3c93135 -- libs/` touches only `flashcard.tsx` (production) and `flashcard.test.tsx` (test) — no unrelated production-code drift, no other file in the slice touched.
- **No stray `error`/`tertiary` self-mark coloring remains** anywhere in `flashcard.tsx` (grepped `recalled` usages: all are label/logic/key, none color-branching post-fix).
- **`flashcard.helpers.ts`, `use-flashcard.ts`, `flashcard.types.ts`, `flashcard-activity.tsx`/`.test.tsx`/`.stories.tsx`**: untouched by the fix commit and unchanged since round 1's approved findings — re-checked, still solid (state machine, component-split, hooks-service-dao, atomic-design placement, i18n/tokens, a11y-at-contract-level all as previously verified).
- **`tdd.md`** correctly documents the rework (Red→Green evidence for finding 1, docs-only note for finding 2) under a new "Rework — reviewer_slice CHANGES_REQUESTED" section — consistent with the TDD-evidence requirement.
- No debug leftovers, no TODOs, no dead code, kebab-case filenames throughout; nothing in the fix reopens or contradicts any round-1 "solid" item.

Slice 1 unblocked — proceed to Slice 2.
