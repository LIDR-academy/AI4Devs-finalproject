create table public.plans (
  id text primary key,
  use_platform_key boolean not null,
  show_ads boolean not null,
  show_key_settings boolean not null
);

insert into public.plans (
  id,
  use_platform_key,
  show_ads,
  show_key_settings
)
values
  ('free', false, true, true),
  ('paid', true, false, false);

alter table public.plans enable row level security;

create policy "plans_select_authenticated" on public.plans
  for select
  to authenticated
  using (true);

revoke all on public.plans from anon, authenticated;
grant select on public.plans to authenticated;
grant all on public.plans to service_role;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null default 'free' references public.plans (id)
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;

create function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_profile_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
