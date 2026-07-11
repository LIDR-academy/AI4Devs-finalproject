# review-performance — score-results-summary (full review, c317a5a..758d1c8)

**APPROVED — zero findings.**

Checked:
- No unvirtualized lists — feature renders no lists (confirmed, n/a).
- Single Supabase round-trip per completion: `LessonAttemptDao.insertAttempt` (libs/services/src/dao/lesson-attempt.dao.ts:14) is one `insert().select().single()`, no follow-up read. Save-once guard verified as re-render-safe, not just ref-correct: `hasSaved.current` latch in libs/study-buddy/src/components/lesson-results/lesson-results.tsx:38-43 sits behind a mount-only effect (empty deps, lesson-results.tsx:44), so a parent re-render cannot re-fire `saveAttempt` — exercised by test at libs/study-buddy/src/components/lesson-results/lesson-results.test.tsx:191 ("does not call saveAttempt again on a re-render"). `isMounted.current` in libs/hooks/src/hooks/use-lesson-attempt.ts:16-21 only gates post-unmount `setState`, adds no round-trips. `status === 'saving'` guard in use-lesson-attempt.ts:33 is defense-in-depth, doesn't change round-trip count given the caller-side latch.
- `scoreLesson` (libs/study-buddy/src/grading/score-lesson.ts:8-14): builds a `Set` from slides then filters answers with O(1) lookups — O(n+m), no O(n²), no sync heavy work.
- `toScorableSlides` (libs/study-buddy/src/components/lesson-results/lesson-results.tsx:16-19) recomputes on every `LessonResults` render (not memoized), but input is a single lesson's slide list and re-render count is bounded (mount + 1-2 status transitions) — memoizing wouldn't pay off here, not flagged.
- No new runtime deps: the only `package.json` change is `libs/types/package.json` adding `jest`/`ts-jest`/`@types/jest` as devDependencies (test infra, not shipped in the app bundle); large `pnpm-lock.yaml` diff is these transitive dev deps, not runtime weight.
- `ResultsSummary` (libs/components/src/organisms/results-summary/results-summary.tsx) is presentational, not memoized, but nothing in this feature causes a re-render storm through it (parent render count is bounded as above); its two `useEffect`s (results-summary.tsx:75, :87) fire only on `saveFailed`/`loading` transitions, cheap `AccessibilityInfo` calls.
- `apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx`: `buildStubLessonResultsFixture` builds a single trivial fixed-size object, no cost concern.
