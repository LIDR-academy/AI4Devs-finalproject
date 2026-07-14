# Review — signup-and-lesson-persistence (round 1)

**Verdict:** CHANGES_REQUESTED — CI red; reviewer fan-out skipped.

**CI @** `43233912eecf1c38acf01f4f5b52e487aeaac309`

## CI failures (fix before review)

- **blocker** `@helsoft/study-buddy` lint: Biome format fails in `libs/study-buddy/src/components/lesson-generation/lesson-generation.test.tsx` (panel props type layout) and `libs/study-buddy/src/components/saved-lessons/saved-lessons.test.tsx` (collapsed expect/mockReturnValue lines).
- **blocker** `@helsoft/study-buddy` check-types: `lesson-generation.test.tsx:21` — mock `LessonGenerationPanel` args typed as `{ onGenerate; canGenerate }` but `LessonGenerationPanelProps` also requires `state`, `composition`, `onCompositionChange`.

## Passed

- `pnpm test` green
- Reviewer fan-out / e2e: **not run** (protocol: no fan-out on red CI)

## Skipped reviewers

- `reviewer_engineering` — skipped (CI red)
- `reviewer_standards` — skipped (CI red)
