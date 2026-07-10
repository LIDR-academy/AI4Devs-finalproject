---
id: task-3
title: MultipleChoice presentational organism (Content states) + stories
slice: 1
scenarios: [s1, s2, s3, s4, s5, s6]
status: done
paths:
  - libs/components/src/organisms/multiple-choice/multiple-choice.tsx
  - libs/components/src/organisms/multiple-choice/multiple-choice.test.tsx
  - libs/components/src/organisms/multiple-choice/multiple-choice.stories.tsx
  - libs/components/src/organisms/index.ts
---

## Goal
Build the controlled, presentational `MultipleChoice` organism: renders the question, the options (composing the existing `AnswerOption` molecule), the result banner, and the optional explanation — driven entirely by props, reporting selections via `onSelectOption`. This task covers the Content states (unanswered / answered-correct / answered-incorrect) and the selection/lock behavior. Empty/Error states are task-5.

## Contract (from spec — component contract)
Props: `question`, `options: {id,label}[]`, `correctOptionId`, `selectedOptionId?`, `explanation?`, `labels: {correct,incorrect,explanationHeading,unavailable}`, `onSelectOption(id)`.
Render: `status = selectedOptionId ? 'answered' : 'unanswered'`; markers `A/B/C…` by index.
- unanswered → all options `default`, enabled; tap → `onSelectOption(id)`; no banner.
- answered (locked) → all options disabled; per option: `correctOptionId`→`correct`, else `selectedOptionId`→`incorrect`, else `default`; banner = `labels.correct`/`labels.incorrect`; explanation shown with `explanationHeading` if present.

## Done criteria
- [ ] @s1 — unanswered render: all options visible + selectable, none selected, no banner
- [ ] @s2 — once answered, all options are `disabled`/non-interactive (locking)
- [ ] @s3 — selected == correct → selected tile `correct` + correct banner
- [ ] @s4 — selected != correct → selected tile `incorrect` + correct tile revealed `correct` + incorrect banner
- [ ] @s5 — explanation renders with the result when present; absent when not provided
- [ ] @s6 — a locked option does not fire `onSelectOption` on tap
- [ ] `multiple-choice.test.tsx` drives all of the above (written first, TDD)
- [ ] `multiple-choice.stories.tsx` covers unanswered / correct-selected / incorrect-selected (story requirement)
- [ ] Correct atomic-design placement (organism) + exported through organisms barrel
- [ ] Reuses `AnswerOption`, `Card`/`Icon`, and theme tokens — no ad-hoc colors/spacing/typography
- [ ] `Props` type declared; kebab-case filenames; functional React
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions (all copy via `labels`)

## Notes
- Controlled/presentational by decision (spec Open decisions): no selection state, no grading here — the study-buddy wrapper (task-4) owns those. This keeps the component reusable and every state independently render-testable.
- Selection immediately grades+locks upstream, so the `AnswerOption` `selected` (blue) visual is not used in this flow — feedback goes straight to correct/incorrect.
- The result-banner a11y announcement + non-color-only verification is hardened in task-7; wire the banner text here.
- Depends on task-1 types.
