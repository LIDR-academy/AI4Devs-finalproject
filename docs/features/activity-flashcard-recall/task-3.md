---
id: task-3
title: Flashcard organism — reveal, self-mark, lock (Content states)
slice: 1
scenarios: [s1, s2, s3, s4, s5, s7]
status: todo
paths: [libs/activities/src/organisms/flashcard/flashcard.tsx, libs/activities/src/organisms/flashcard/flashcard.types.ts, libs/activities/src/organisms/flashcard/use-flashcard.ts, libs/activities/src/organisms/flashcard/flashcard.test.tsx, libs/activities/src/organisms/flashcard/use-flashcard.test.ts, libs/activities/src/organisms/index.ts]
---

## Goal
Build the presentational `Flashcard` organism in `@helsoft/activities`, split per `.agents/rules/component-split.mdc` (mirrors `matching/`). Handles the reveal → self-mark → lock flow and the Content substates. Calls `useLocalization()` for chrome (shipped-organism pattern) and `useUnistyles()` for theme.

- **`flashcard.types.ts`** — `FlashcardLabels`, `FlashcardProps` (`slide`, `onAnswered?`, `initialAnswer?`, `initialRevealed?`), `UseFlashcardProps`.
- **`use-flashcard.ts`** — `revealed` state (seed `initialRevealed || !!initialAnswer`), `answer` state (seed `initialAnswer`); derived `locked = !!answer`, `isRevealed = revealed || !!answer`, `isUnavailable = !isFlashcardSlideValid(slide)`; a11y announce effect on reveal (guard `Platform.OS !== 'android'`, mirror the shipped organisms). No handlers here.
- **`flashcard.tsx`** — JSX/styles/a11y attrs + **handlers**: `handleReveal()` (guard `isRevealed`/`isUnavailable`, else `setRevealed(true)`); `handleSelfMark(recalled)` (guard `locked`/`!isRevealed`/`isUnavailable`, else `buildFlashcardAnswer`, `setAnswer`, `onAnswered?.()` once). Hidden state → front + Reveal action, no self-mark actions. Revealed → answer (under `answerHeading`) + explanation when present + two self-mark actions. Marked → locked confirmation (text + icon + `accessibilityState`). Export via the `organisms/index.ts` barrel.

## Done criteria
- [ ] @s1 hidden: only front visible, back hidden, Reveal shown, no self-mark actions
- [ ] @s2 reveal: back becomes visible alongside the front (one-way)
- [ ] @s3 revealed: both "Recalled" and "Not recalled" actions available
- [ ] @s4 self-mark locks the choice + visually confirms (both `recalled` and not-recalled)
- [ ] @s5 no re-mark after lock: tapping the other action does nothing; no new answer
- [ ] @s7 explanation displayed on reveal when present; absent (no heading/body) when the slide has none
- [ ] `onAnswered` fires exactly once on self-mark; never on reveal; repeat taps ignored
- [ ] Split obeys `component-split.mdc` (handlers in `.tsx`, state/derived/effect in the hook, pure transforms already in task-2 helpers); `Component → Hook → Service → DAO` — local `useState` only, no data hook/service/DAO
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded user-facing strings (chrome via `t()`); no hardcoded colors/dimensions (theme tokens)

## Notes
Consumes types (task-1) and helpers (task-2). i18n keys land in task-6 (may use placeholder keys until then); Empty/Error notice hardening in task-5; a11y polish in task-7. Locale-agnostic labels object built from `t('activity.flashcard.*')`.
