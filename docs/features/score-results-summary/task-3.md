---
id: task-3
title: lesson_attempts migration + LessonAttemptDao
slice: 1
scenarios: [s6]
status: done
paths:
  - supabase/migrations/*_create_lesson_attempts.sql
  - libs/supabase-services/src/dao/lesson-attempt.dao.ts
  - libs/supabase-services/src/dao/lesson-attempt.dao.test.ts
---

## Goal
Introduce the first schema migration and the Supabase DAO for attempt persistence.

Migration `lesson_attempts`:
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null default auth.uid() references auth.users(id)`
- `lesson_id uuid not null` — **soft reference, no FK** (no `lessons` table until R5)
- `score int not null check (score >= 0)`
- `total int not null check (total > 0)` — attempts are only created for scorable lessons
- `check (score <= total)`
- `created_at timestamptz not null default now()`
- RLS **enabled**; policies: `select using (user_id = auth.uid())`, `insert with check (user_id = auth.uid())`. No update/delete policy (insert-only).

`LessonAttemptDao` (`abstract class`, static methods, `getSupabase()`):
- `insertAttempt(input: NewLessonAttempt): Promise<LessonAttempt>` — inserts `{ lesson_id, score, total }` only (never `user_id`; the column default + RLS set/enforce it); returns the inserted row mapped to `LessonAttempt`.
- (Optional, for R9 later) `listAttempts(lessonId)` — **not** in scope now; do not add unless a scenario needs it.

## Done criteria
- [x] @s6 — inserting is additive: each call creates a new row; no update path exists (verified by the DAO test mocking `getSupabase()`).
- [x] DAO inserts only `lesson_id/score/total`; `user_id` is never sent from the client.
- [x] Row → `LessonAttempt` mapping (snake_case DB → camelCase type) covered by a test.
- [x] Migration authored via `npx supabase migration new create_lesson_attempts`; RLS enabled with the two policies above.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Per Open decisions (security/R3): `user_id default auth.uid()` + RLS `with check` means the client cannot spoof another user's attempt.
- Per R2: add the `lesson_id → lessons(id)` FK in R5 when that table exists.
