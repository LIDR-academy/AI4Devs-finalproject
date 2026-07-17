create table public.platform_generation_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  minute_window_started_at timestamptz not null,
  minute_requests integer not null check (minute_requests >= 0),
  day_started_on date not null,
  day_requests integer not null check (day_requests >= 0),
  lease_expires_at timestamptz
);

alter table public.platform_generation_limits enable row level security;
revoke all on public.platform_generation_limits from public, anon, authenticated, service_role;

create function public.acquire_platform_generation_slot(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_at timestamptz := clock_timestamp();
  today_at_utc date := (now_at at time zone 'utc')::date;
  current_state public.platform_generation_limits%rowtype;
begin
  insert into public.platform_generation_limits (
    user_id,
    minute_window_started_at,
    minute_requests,
    day_started_on,
    day_requests,
    lease_expires_at
  )
  values (p_user_id, now_at, 0, today_at_utc, 0, null)
  on conflict (user_id) do nothing;

  select *
  into current_state
  from public.platform_generation_limits
  where user_id = p_user_id
  for update;

  if current_state.minute_window_started_at <= now_at - interval '1 minute' then
    current_state.minute_window_started_at := now_at;
    current_state.minute_requests := 0;
  end if;

  if current_state.day_started_on <> today_at_utc then
    current_state.day_started_on := today_at_utc;
    current_state.day_requests := 0;
  end if;

  if current_state.lease_expires_at > now_at
    or current_state.minute_requests >= 5
    or current_state.day_requests >= 50
  then
    update public.platform_generation_limits
    set minute_window_started_at = current_state.minute_window_started_at,
        minute_requests = current_state.minute_requests,
        day_started_on = current_state.day_started_on,
        day_requests = current_state.day_requests
    where user_id = p_user_id;
    return false;
  end if;

  update public.platform_generation_limits
  set minute_window_started_at = current_state.minute_window_started_at,
      minute_requests = current_state.minute_requests + 1,
      day_started_on = current_state.day_started_on,
      day_requests = current_state.day_requests + 1,
      lease_expires_at = now_at + interval '130 seconds'
  where user_id = p_user_id;

  return true;
end;
$$;

create function public.release_platform_generation_slot(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.platform_generation_limits
  set lease_expires_at = null
  where user_id = p_user_id;
$$;

revoke all on function public.acquire_platform_generation_slot(uuid)
  from public, anon, authenticated;
revoke all on function public.release_platform_generation_slot(uuid)
  from public, anon, authenticated;
grant execute on function public.acquire_platform_generation_slot(uuid) to service_role;
grant execute on function public.release_platform_generation_slot(uuid) to service_role;
