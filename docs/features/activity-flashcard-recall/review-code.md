# Code review — activity-flashcard-recall (round 2)

**Verdict: APPROVED**

No findings. Both round-1 items verified resolved against the actual diff:

- `libs/activities/src/organisms/flashcard/use-flashcard.ts:28` — effect now announces `` `${labels.answerHeading}: ${slide.back}` ``; deps `[isRevealed, labels.answerHeading, slide.back]` are primitives, no re-render/effect-loop risk. Test at `use-flashcard.test.ts:97-108` genuinely strengthened (old assertion checked only `labels.answerHeading` verbatim; new one asserts `expect.stringContaining(slide.back)` plus the heading), matching the documented Red→Green in `tdd.md`. No `.skip`/`.only` in the flashcard suite; no other assertions weakened.
- `docs/features/activity-flashcard-recall/task-{1..4}.md` — all Done-criteria checkboxes flipped to `- [x]`; spot-checked against shipped code (`graded-answer.test.ts` flashcard assignment, `flashcard.helpers.ts` purity, `flashcard-activity.stories.tsx` `Default`/`WithoutExplanation`, barrel export in `libs/study-buddy/src/index.ts`) — all true.
