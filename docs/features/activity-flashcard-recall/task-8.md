---
id: task-8
title: Storybook stories — flashcard states
slice: 3
scenarios: [s1, s2, s3, s4, s7, s8]
status: done
paths: [libs/activities/src/organisms/flashcard/flashcard.stories.tsx]
---

## Goal
Author `flashcard.stories.tsx` (title `Organisms/Flashcard`) covering the required states, mirroring `matching.stories.tsx`. Use `initialRevealed` / `initialAnswer` to seed states without interaction, plus an interactive story for e2e.

Stories:
- **Hidden** — default; front only, Reveal available (@s1).
- **RevealedUnmarked** — `initialRevealed: true`; answer + self-mark actions, no mark yet (@s3).
- **RevealedRecalled** — `initialAnswer` with `recalled: true`; locked recalled confirmation (@s4). *(story-required)*
- **RevealedNotRecalled** — `initialAnswer` with `recalled: false`; locked not-recalled confirmation (@s4). *(story-required)*
- **WithoutExplanation** — revealed slide with no `explanation`; explanation heading/body absent (@s7).
- **UnavailableMissingBack** — slide missing `back` (answer); unavailable notice (@s8, second Example). *(mirrors `matching.stories.tsx` splitting Empty/Error into separate stories)*
- **UnavailableMissingFront** — slide missing `content` (front/prompt); unavailable notice (@s8, first Example).
- **Interactive** — no seed; drives reveal → self-mark live (consumed by task-9 e2e) (@s2).

## Done criteria
- [x] All stories above render; the three story-required states (hidden / revealed-recalled / revealed-not-recalled) present
- [x] Explanation-present vs -absent both demonstrated (@s7)
- [x] Both `@s8` Examples demonstrated as separate stories — `UnavailableMissingBack` (missing answer) and `UnavailableMissingFront` (missing front/prompt) — each showing the notice, nothing interactive
- [x] Stories use `initialRevealed` / `initialAnswer` seeds (no test-only props leaking into the runtime contract)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities build-storybook` (or the lib's storybook build) green
- [x] No hardcoded colors/dimensions; slide fixture content is representative

## Notes
Mirrors `matching.stories.tsx` seeding patterns (which likewise splits its two unavailable cases — Empty and Error — into separate stories). Story slug `organisms-flashcard--<name>` is what the Playwright e2e (task-9) navigates to.
