# review-performance.md — activity-flashcard-recall (round 1)

**Verdict:** PASS — no findings.

Scope: `flashcard.tsx`, `use-flashcard.ts`, `flashcard.helpers.ts`, `flashcard-activity.tsx`; localization diffs (`migration-coverage.test.ts`, `en/es/pt/de.ts`).

Checked (no issues):
1. `renderMarkButton` (`flashcard.tsx:67-90`) — fixed-arity (called twice), not a list `.map`; same shape as accepted `multiple-choice.tsx:57-73`. No memoization warranted.
2. `labels` object recreated per render (`flashcard.tsx:26-35`) — a11y effect dep array uses the destructured primitive `labels.answerHeading`, not the object (`use-flashcard.ts:26-29`), so identity churn doesn't re-fire it. Same pattern as accepted `multiple-choice.tsx:23-28`.
3. `buildFlashcardAnswer`/`isFlashcardSlideValid` (`flashcard.helpers.ts:8-9,15-20`) — O(1), negligible.
4. No unbounded lists/virtualization concern — fixed small node set; `FlashcardActivity` is an un-memoized pass-through, matches sibling wrappers, not yet list-wired.
5. No network I/O — local state + one gated `AccessibilityInfo` effect only.
6. `migration-coverage.test.ts:66-73,155` — one more bounded directory added to an existing table, no new unbounded scan.
7. Localization resource diffs — static string additions only (+10 lines x4 locales), negligible bundle weight.
