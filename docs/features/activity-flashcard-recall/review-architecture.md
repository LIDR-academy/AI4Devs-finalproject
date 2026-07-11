# Architecture review — activity-flashcard-recall (round 1)

**Verdict: APPROVE**

No findings.

## Checks performed (all pass)

- **No-I/O decision confirmed** (`libs/activities/src/organisms/flashcard/use-flashcard.ts:1-40`): only `useState`/`useEffect` + `AccessibilityInfo.announceForAccessibility` (a11y side effect, not I/O). No fetch, no DAO/service import, no tanstack-query. `hooks-service-dao.mdc`'s data layering correctly does not apply — this is UI co-location per `component-split.mdc`, not a data hook.
- **File-split conventions** (`component-split.mdc`) followed exactly:
  - `flashcard.helpers.ts:8-20` — pure (`isFlashcardSlideValid`, `buildFlashcardAnswer`), no React/hooks imports.
  - `use-flashcard.ts:19-39` — state (`revealed`, `answer`) + derived (`locked`, `isRevealed`, `isUnavailable`) + one effect; no handlers defined here (confirmed no `onPress`/`onClick`-bound functions in this file).
  - `flashcard.tsx:57-65` — `handleReveal` and `handleSelfMark` (the only two handlers) both live in the component, calling hook setters (`setRevealed`, `setAnswer`) and the pure helper (`buildFlashcardAnswer`); no state machine logic leaked into the component beyond derived label/icon presentation (`renderMarkButton`, itself presentational).
  - `flashcard.types.ts:1-28` — `FlashcardProps`, `FlashcardLabels`, `UseFlashcardProps` only; no runtime logic.
- **Dependency direction** `libs/types → libs/activities → libs/study-buddy` respected:
  - `flashcard.tsx:1-9`, `flashcard.helpers.ts:1`, `flashcard.types.ts:1`, `use-flashcard.ts:4` import only `@helsoft/types`, `@helsoft/components`, `@helsoft/localization` — no import of `@helsoft/study-buddy` or `@helsoft/services`.
  - `libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx:1-2` imports `Flashcard` from `@helsoft/activities` and types from `@helsoft/types` — correct downstream direction, no reverse import.
  - No DAO/service import anywhere under the flashcard organism or `flashcard-activity` (grep for `@helsoft/services`, `.dao`, `Dao.` in both trees returns nothing).
  - No new dependencies added to `libs/activities/package.json` or `libs/study-buddy/package.json` (diff empty).
- **Barrel exports updated correctly**: `libs/activities/src/organisms/index.ts:3-4` exports `flashcard/flashcard` and `flashcard/flashcard.types`; `libs/study-buddy/src/index.ts:4` exports `flashcard-activity/flashcard-activity`. Both alphabetically ordered consistent with existing entries.
- **R7 scorer genuinely untouched**: `git diff 5ccf8e5..HEAD` for `libs/activities/src/organisms/lesson-results/score-lesson.ts` and `libs/types/src/activity-type.ts` is empty — confirmed no modification.
- **DTO leakage**: no DAO/DTO types exist in this feature at all (self-mark, no I/O); `FlashcardAnswer`/`FlashcardSlide` are plain domain types defined in `libs/types`, not data-layer DTOs — nothing leaked across a data boundary.
- **Localization**: new `activity.flashcard.*` keys added consistently to `en.ts`/`es.ts`/`pt.ts`/`de.ts` with matching key sets; `migration-coverage.test.ts` registers the flashcard organism directory in `KEY_EXISTENCE_DIRS`, mirroring the other three shipped activity organisms.
- **Structural invariant**: `FlashcardAnswer` (`libs/types/src/activity-answer.ts`) mirrors `recalled` into `isCorrect` to satisfy `GradedAnswer` structurally; `graded-answer.test.ts` extended with the flashcard type-level assertion, consistent with the existing `MultipleChoiceAnswer` check.
