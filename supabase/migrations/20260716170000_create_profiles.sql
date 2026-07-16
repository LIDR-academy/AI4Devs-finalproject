create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free',
  constraint profiles_plan_check check (plan in ('free', 'paid'))
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
