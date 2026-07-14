-- signup-and-lesson-persistence (Slice 1, task-1)
--
-- Creates public.lessons (RLS mirrors lesson_attempts) and lands the deferred FK
-- lesson_attempts.lesson_id → lessons.id (on delete cascade).
--
-- Orphan handling: existing lesson_attempts.lesson_id values reference lesson rows that don't
-- exist yet (the FK was soft until this migration). On a dev/MVP DB those rows are test
-- artefacts — we DELETE them, then add the FK. Lowest-risk vs NOT VALID (unenforced forever)
-- or nulling lesson_id (would require a nullable column).

-- Step 1: lessons table
create table public.lessons (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id),
  title      text        not null,
  slides     jsonb       not null,
  created_at timestamptz not null default now()
);

comment on table public.lessons is
  'One row per persisted generated lesson (R5). Inserted by the generate-lesson Edge Function '
  'under the caller auth.uid() before returning success; the client never inserts directly. '
  'Ordered newest-first by created_at; lesson_attempts FK on delete cascade.';

alter table public.lessons enable row level security;

create policy "lessons_select_own" on public.lessons
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "lessons_insert_own" on public.lessons
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "lessons_delete_own" on public.lessons
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.lessons to authenticated;

-- Step 2: delete orphan lesson_attempts rows so the FK validation below can succeed.
-- An orphan is any lesson_attempts row whose lesson_id has no matching lessons.id row.
-- On a dev/MVP database these rows are test artefacts; deleting them is the lowest-risk path
-- (compared to setting them to null, which would require the column to be nullable, or keeping
-- them behind NOT VALID, which leaves the constraint unenforced forever).
delete from public.lesson_attempts
  where lesson_id not in (select id from public.lessons);

-- Step 3: land the FK (now that orphans are gone the constraint will validate immediately)
alter table public.lesson_attempts
  add constraint lesson_attempts_lesson_id_fkey
  foreign key (lesson_id) references public.lessons (id) on delete cascade;
