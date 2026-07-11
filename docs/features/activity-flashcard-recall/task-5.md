---
id: task-5
title: Unavailable state — missing front or back
slice: 2
scenarios: [s8]
status: todo
paths: [libs/activities/src/organisms/flashcard/flashcard.tsx, libs/activities/src/organisms/flashcard/flashcard.test.tsx]
---

## Goal
Harden and test the Empty/Error path: when `isFlashcardSlideValid(slide)` is false (empty front `content` or empty `back`), the organism renders `labels.unavailable` inside the `Card`, shows nothing interactive (no Reveal, no self-mark actions, no answer), and does not crash. Empty (missing front) and Error (missing back) collapse to the one unavailable notice.

## Done criteria
- [ ] @s8: slide with empty front → unavailable notice, nothing interactive, no crash
- [ ] @s8: slide with empty back → unavailable notice, nothing interactive, no crash
- [ ] The unavailable branch renders before any reveal/self-mark affordance; `onAnswered` never fires
- [ ] Covered by `flashcard.test.tsx` (both missing-front and missing-back cases)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded user-facing strings (unavailable via `t()`)

## Notes
`isUnavailable` derives from task-2's `isFlashcardSlideValid` via the task-3 hook. This task adds the dedicated tests + any rendering hardening. Mirrors the matching/fill-in-the-blank unavailable state.
