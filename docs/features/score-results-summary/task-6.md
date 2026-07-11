---
id: task-6
title: ResultsSummary organism — score + loading states
slice: 1
scenarios: [s1, s5]
status: done
paths:
  - libs/components/src/organisms/results-summary/results-summary.tsx
  - libs/components/src/organisms/results-summary/results-summary.test.tsx
  - libs/components/src/organisms/results-summary/results-summary.stories.tsx
  - libs/components/src/organisms/index.ts
---

## Goal
Add the presentational `ResultsSummary` organism (props-only, no data/hooks, **no business self-formatting**) in `@helsoft/components`, composing existing atoms/theme (`card`, `button`, `progress-indicator`; `ScreenContainer` used by the caller). This task delivers the **score** and **loading** states only (completion + error added in task-8).

Props (initial):
- `variant: 'score' | 'completion'`
- `loading?: boolean`
- `labels: { score: string; percent: string; retake: string; backToLessons: string; /* completion + save-failure labels added in task-8 */ }`
- `onRetake: () => void; onBackToLessons: () => void`

Behavior: the score variant renders the **pre-formatted** `labels.score` (e.g. "3 / 3") and `labels.percent` (e.g. "100%") strings — it does **not** receive `correct`/`total` numbers or compute the ratio/percentage itself (the wiring does that, per codebase precedent `login-form.tsx`/`language-settings.tsx`). `loading` shows the progress indicator and disables the actions. No hardcoded copy — all text via `labels`; all color/spacing/typography via theme tokens.

## Done criteria
- [x] @s1 — score variant renders the `labels.score` and `labels.percent` strings passed in (no numeric props, no self-computed percentage).
- [x] @s5 — `loading` renders the progress indicator and the actions are disabled/unavailable.
- [x] `results-summary.stories.tsx` covers the score and loading states (completion/error added in task-8).
- [x] Test asserts rendering per label prop, the loading branch, and action wiring (`onRetake`/`onBackToLessons`).
- [x] Functional component with a `Props` type; kebab-case files; tokens only; no magic numbers.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

**Implementation note:** `ResultsSummaryVariant` is typed as just `'score'` for this slice, not the eventual `'score' | 'completion'` union — mirroring how `LoginFormProps` grew incrementally slice-by-slice in `login-and-logout` rather than pre-declaring future-slice fields (strict-TDD "don't build ahead" rule). Task-8 widens the union alongside its own failing tests for the completion branch.

## Notes
- Presentational only — mirrors `LoginForm`/`MultipleChoice`, which receive pre-resolved label strings. All wiring (score computation, `correct/total`/percentage formatting via `t(...)`, save, navigation) lives in `LessonResults` (task-7); the ratio/percentage rounding is done there (risk R8), not here.
