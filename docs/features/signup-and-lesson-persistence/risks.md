# Risks — signup-and-lesson-persistence

Gitignored working note (not read back during the run; lead lands it in docs at PR time).

## Technical
- **R1 — FK on orphan `lesson_attempts` rows.** `lesson_attempts.lesson_id` is a soft ref today; any
  existing rows point at no `lessons` row, so adding the FK can fail. **Mitigation:** the migration
  deletes orphan attempts (or adds the FK `not valid` then validates) on an MVP dev DB; document the
  choice inline. (task-1)
- **R2 — Edge/Deno outside the Jest/Stryker harness.** Persist logic can't run in-sandbox.
  **Mitigation:** author pure persist/mapping logic in `_shared` mirrored to `libs/supabase-services`,
  Jest-test the JS mirror; live `functions deploy` verify is a manual pre-merge item (same boundary as
  existing generate-lesson). (task-2)
- **R3 — Persist widens the generation transaction.** A row write after a successful (paid) LLM call
  means a persist failure wastes the generation. **Mitigation:** retry-only per story (@s2); acceptable
  for MVP. Idempotency/dedupe on retry is out of scope (a retry may create a second lesson row) —
  noted, not mitigated.
- **R4 — `slides` stored as `jsonb`.** No per-slide schema enforcement at the DB; malformed decks
  could persist. **Mitigation:** assembly already validates the deck against `deckSchema` before
  persist; DB stays a dumb blob store. (task-2)
- **R5 — `lessonId` semantics change.** `GeneratedLesson.lessonId` becomes the real DB id instead of a
  minted one; downstream (player nav, `lesson_attempts.lesson_id`) must use it. **Mitigation:**
  reopen + attempt insert already key on `lessonId`; covered by tests. (task-2, task-5)

## Product
- **R6 — No pagination, show-all.** A heavy user's Home could grow unbounded. **Mitigation:** accepted
  per story (newest-first, show all); pagination is a future story.
- **R7 — Delete is destructive + cascades attempts.** `on delete cascade` removes attempt history for
  the lesson. **Mitigation:** confirmation dialog (@s9); acceptable — attempts are meaningless without
  their lesson.

## Timeline / dependency states
- **D1 — Player (R4) not built.** Reopen navigates to the existing `/lesson/[id]` placeholder route;
  full slide playback is R4. This story only guarantees reopen enters the flow from the top.
- **D2 — tanstack-query not installed.** Repo precedent defers it; `useLessons` uses plain state +
  `refetch`. Migrating list hooks to `useQuery` is a future cross-cutting task.
