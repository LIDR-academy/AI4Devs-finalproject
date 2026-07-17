# Architecture review — activity-flashcard-recall (round 1)

**Verdict: APPROVE** — no findings.

Checked (all pass):
- No-I/O: `use-flashcard.ts:1-40` — `useState`/`useEffect` + a11y announce only; no fetch/DAO/service/tanstack-query.
- File-split (`component-split.mdc`): pure helpers `flashcard.helpers.ts:8-20`; state/derived/effect `use-flashcard.ts:19-39`; handlers `flashcard.tsx:57-65`; types-only `flashcard.types.ts:1-28`.
- Dependency direction: organism imports only `@helsoft/types`/`components`/`localization`; `flashcard-activity.tsx:1-2` imports `Flashcard` from `@helsoft/activities` (correct downstream). No `@helsoft/supabase-services`/`.dao` imports (grep clean). No new package deps.
- Barrels updated: `organisms/index.ts:3-4`, `study-buddy/src/index.ts:4`.
- R7 scorer untouched: `git diff 5ccf8e5..HEAD` empty for `score-lesson.ts` / `activity-type.ts`.
- No DTO leakage — no data layer in this feature; `FlashcardAnswer`/`FlashcardSlide` are plain domain types.
- i18n: `activity.flashcard.*` key-aligned across en/es/pt/de; `migration-coverage.test.ts` registers the flashcard dir.
- Structural invariant: `FlashcardAnswer.isCorrect` mirrors `recalled` for the `GradedAnswer` shape; `graded-answer.test.ts` extended with the flashcard check.
