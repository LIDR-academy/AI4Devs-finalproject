-- signup-and-lesson-persistence (Slice 1, task-1)
--
-- Creates public.lessons (RLS mirrors lesson_attempts) and lands the deferred FK
-- lesson_attempts.lesson_id → lessons.id (on delete cascade).
--
-- Orphan handling: existing lesson_attempts.lesson_id values may reference lesson rows that
-- don't exist yet (the FK was soft until this migration). Cleanup is guarded — never wipe all
-- attempts solely because lessons is empty on first apply (see Step 2).

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

-- Step 2: orphan lesson_attempts cleanup before FK validation.
-- An orphan is any lesson_attempts row whose lesson_id has no matching lessons.id.
-- Guard (OWASP A04): with a freshly created empty `lessons` table, an unconditional
-- `DELETE … NOT IN (SELECT id FROM lessons)` would wipe ALL lesson_attempts. Refuse that
-- path — require an explicit operator cleanup when attempts exist but lessons is empty.
-- When lessons already has rows, delete only true orphans so the FK can validate.
do $$
declare
  lesson_count bigint;
  attempt_count bigint;
begin
  select count(*) into lesson_count from public.lessons;
  select count(*) into attempt_count from public.lesson_attempts;

  if lesson_count = 0 and attempt_count > 0 then
    raise exception
      'Refusing to wipe % lesson_attempts row(s) while lessons is empty. Back up or truncate lesson_attempts, then re-run this migration.',
      attempt_count;
  end if;

  if attempt_count > 0 then
    delete from public.lesson_attempts
      where lesson_id not in (select id from public.lessons);
  end if;
end $$;

-- Step 3: land the FK (orphans gone or none — constraint validates immediately)
alter table public.lesson_attempts
  add constraint lesson_attempts_lesson_id_fkey
  foreign key (lesson_id) references public.lessons (id) on delete cascade;
