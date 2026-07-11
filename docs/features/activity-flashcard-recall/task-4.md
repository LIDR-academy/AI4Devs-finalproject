---
id: task-4
title: FlashcardActivity wiring — thin study-buddy component
slice: 1
scenarios: [s6]
status: todo
paths: [libs/study-buddy/src/components/flashcard-activity/flashcard-activity.tsx, libs/study-buddy/src/components/flashcard-activity/flashcard-activity.test.tsx, libs/study-buddy/src/components/flashcard-activity/flashcard-activity.stories.tsx, libs/study-buddy/src/index.ts]
---

## Goal
Build the feature-wiring `FlashcardActivity` in `@helsoft/study-buddy`, mirroring the shipped thin `MatchingActivity`. Props `{ slide: FlashcardSlide; onAnswered?: (answer: FlashcardAnswer) => void }`; renders `<Flashcard slide={slide} onAnswered={onAnswered} />`. No local state, no grading (self-marked). Export via the study-buddy barrel. Add a `flashcard-activity.stories.tsx` (title `Features/FlashcardActivity`) mirroring the shipped `matching-activity.stories.tsx` — a `Default` (slide with explanation) and a `WithoutExplanation` story — since all three shipped `@helsoft/study-buddy` activity wrappers ship one despite being equally thin.

## Done criteria
- [ ] @s6: self-marking through the wiring emits a `FlashcardAnswer` exactly once with the correct `recalled` / `activityType: 'flashcard'` / `slideId`
- [ ] Component stays thin — organism owns reveal/self-mark/lock; wrapper only forwards props
- [ ] `Component → Hook → Service → DAO` respected (no I/O, no hook/service/DAO)
- [ ] `flashcard-activity.stories.tsx` (title `Features/FlashcardActivity`) renders `Default` + `WithoutExplanation`, mirroring the shipped `matching-activity.stories.tsx`
- [ ] Exported from `libs/study-buddy/src/index.ts`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/study-buddy test` green
- [ ] No hardcoded user-facing strings

## Notes
`Flashcard` from task-3; types from task-1. Mirrors `MatchingActivity` / `FillInTheBlankActivity` (including their `.stories.tsx`). Keeps the app screen a thin shell (`global.mdc`).
