-- score-results-summary (Slice 1, task-3) -- per-retake, insert-only attempt record.
--
-- lesson_id is a soft reference (no FK) -- the `lessons` table doesn't exist yet (R5).
-- Add the FK once it lands. RLS enforces user_id = auth.uid() on select/insert; the client
-- never sets user_id itself (the column default does), so a spoofed insert is rejected by
-- the `with check` clause regardless of what the client sends.

create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  lesson_id uuid not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  created_at timestamptz not null default now(),
  constraint lesson_attempts_score_lte_total check (score <= total)
);

comment on table public.lesson_attempts is
  'One row per completed, scored lesson attempt (R7). Insert-only -- retakes never update a '
  'prior row. lesson_id is a soft reference until the lessons table (R5) exists.';

alter table public.lesson_attempts enable row level security;

create policy "lesson_attempts_select_own" on public.lesson_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "lesson_attempts_insert_own" on public.lesson_attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.lesson_attempts to authenticated;
