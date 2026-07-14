---
id: task-4
title: LessonList organism (+ LessonListItem molecule) — 4 states
slice: 2
scenarios: [s4, s5, s13, s14, s16]
status: todo
paths: [libs/components/src/organisms/lesson-list/, libs/components/src/molecules/lesson-list-item/]
---

## Goal
Presentational `LessonList` organism in `@helsoft/components` (atomic-design + component-split):
renders the four states — **Loading** (progress indicator), **Content** (list of `LessonListItem`
molecules, each showing pre-resolved title + created-date label + open action), **Empty** (invite to
create a lesson), **Error** (message + retry action). Prop-driven only — receives already-formatted
strings/labels and `onOpenLesson(id)`, `onRetry` callbacks (never self-formats dates or calls `t`,
mirroring `ResultsSummary`/`LoginForm`). Split the folder (`.tsx`/`.types.ts`/`use-*`/`.helpers`) if
non-trivial; add Storybook stories for every state. `LessonListItem` is a reusable molecule.

## Done criteria
- [ ] Scenario(s) {s4, s5, s13, s14, s16} covered by `lesson-list.test.tsx` (+ Playwright e2e per storybook-e2e-tests skill)
- [ ] All four states render from props; retry wired via `onRetry`; open via `onOpenLesson(id)`
- [ ] a11y: item accessible name + open role, states announced (WCAG 4.1.3), retry has a button role
- [ ] `.stories.tsx` for each state; no hardcoded strings/colors/dimensions (tokens + injected labels)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Delete affordance is added in task-6 (Slice 3) — keep the item's API open to an optional
  `onDelete`/delete label so task-6 is additive.
- Newest-first ordering is a data concern (task-3); the list renders in received order.
