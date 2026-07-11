---
id: task-5
title: use-lesson-attempt hook
slice: 1
scenarios: [s5, s6]
status: done
paths:
  - libs/hooks/src/hooks/use-lesson-attempt.ts
  - libs/hooks/src/hooks/use-lesson-attempt.test.ts
  - libs/hooks/src/hooks/index.ts
---

## Goal
Add `useLessonAttempt()` in `@helsoft/hooks`, wrapping `LessonAttemptService` for React (tanstack-query not installed → local state, per Open decisions):
- Returns `{ status: 'idle' | 'saving' | 'saved' | 'error'; attempt: LessonAttempt | null; saveAttempt: (input: NewLessonAttempt) => void; retry: () => void }`.
- `saveAttempt` sets `saving`, calls the service, then `saved` (storing the row) or `error` (retaining the last input for `retry`).
- Guards against overlapping saves (no double-fire while `saving`); safe against unmount (no state update after unmount).

## Done criteria
- [x] @s5 — the hook exposes a `saving` status while the promise is in flight (drives the results Loading state).
- [x] @s6 — a successful save transitions to `saved` with the returned `LessonAttempt`; each `saveAttempt` call is a fresh insert (no overwrite semantics in the hook).
- [x] Error path sets `status: 'error'`; `retry` re-invokes the service with the last input and returns to `saving`.
- [x] Tests mock `LessonAttemptService`; cover success, error, retry, and no-double-fire; no state-update-after-unmount warning.
- [x] Exported via `hooks/index.ts`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- The hook wraps the **service**, never the DAO (layering).
- Single-save-per-completion (dedupe) is enforced at the wiring layer (task-7) via an effect/ref guard — the hook only refuses concurrent duplicates (risk R4/R5).
