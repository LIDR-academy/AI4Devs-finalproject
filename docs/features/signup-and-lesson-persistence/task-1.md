---
id: task-1
title: Migration — lessons table + RLS + FK on lesson_attempts
slice: 1
scenarios: [s10, s11, s12]
status: todo
paths: [supabase/migrations/]
---

## Goal
Add the `public.lessons` table (mirroring `lesson_attempts`' security model): `id uuid pk default
gen_random_uuid()`, `user_id uuid not null default auth.uid() references auth.users(id)`, `title
text not null`, `slides jsonb not null`, `created_at timestamptz not null default now()`. Enable RLS
with `select`/`insert`/`delete` policies scoped `user_id = auth.uid()` (client never sets `user_id`);
grant `select, insert, delete` to `authenticated`. Then land the deferred FK:
`lesson_attempts.lesson_id` → `lessons.id` (with `on delete cascade`, so deleting a lesson removes
its attempts). Handle any pre-existing orphan `lesson_attempts.lesson_id` rows so the FK can be added
(see risks.md).

## Done criteria
- [ ] Scenario(s) {s10, s11, s12} covered — RLS read/delete isolation + FK verified (migration review + DAO tests in task-3/task-6)
- [ ] `lessons` RLS mirrors `lesson_attempts` (default `auth.uid()`, `with check`/`using` = `auth.uid()`)
- [ ] FK `lesson_attempts_lesson_id_fkey` references `lessons(id)` `on delete cascade`
- [ ] Migration created via `npx supabase migration new`; no schema edits outside migrations
- [ ] `pnpm lint` + `pnpm check-types` green

## Notes
- No new lib code here — this is schema only; the client `lessons` table typing surfaces in task-3.
- Orphan handling: existing `lesson_attempts` rows carry soft `lesson_id`s with no matching `lessons`
  row; the migration must not fail on them (delete orphans or add FK `not valid` then validate — pick
  the lowest-risk path for an MVP dev DB; document the choice in the migration comment).
