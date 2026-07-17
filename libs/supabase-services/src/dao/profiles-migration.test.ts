import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  __dirname,
  '../../../../supabase/migrations/20260716170000_create_profiles.sql',
);

describe('profiles migration', () => {
  it('@s1 seeds plans before profiles and installs the signup trigger before backfill', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql.indexOf('create table public.plans')).toBeGreaterThan(-1);
    expect(sql.indexOf("('free', false, true, true)")).toBeGreaterThan(
      sql.indexOf('create table public.plans'),
    );
    expect(sql.indexOf("('paid', true, false, false)")).toBeGreaterThan(-1);
    expect(sql.indexOf('create table public.profiles')).toBeGreaterThan(
      sql.indexOf("('paid', true, false, false)"),
    );
    expect(sql.indexOf('create trigger on_auth_user_profile_created')).toBeGreaterThan(-1);
    expect(
      sql.indexOf('insert into public.profiles (id)\nselect id from auth.users'),
    ).toBeGreaterThan(sql.indexOf('create trigger on_auth_user_profile_created'));
  });

  it('@s1 creates one default-free profile per auth user with select-own-only RLS', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toMatch(/id uuid primary key references auth\.users \(id\) on delete cascade/i);
    expect(sql).toMatch(/plan_id text not null default 'free' references public\.plans \(id\)/i);
    expect(sql).toMatch(/use_platform_key boolean not null/i);
    expect(sql).toMatch(/show_ads boolean not null/i);
    expect(sql).toMatch(/show_key_settings boolean not null/i);
    expect(sql).not.toMatch(/can_create_without_key/i);
    expect(sql).toMatch(/insert into public\.profiles \(id\)\s+values \(new\.id\)/i);
    expect(sql).toMatch(/after insert on auth\.users\s+for each row/i);
    expect(sql).toMatch(
      /insert into public\.profiles \(id\)\s+select id from auth\.users\s+on conflict \(id\) do nothing/i,
    );
    expect(sql).toMatch(/for select\s+to authenticated\s+using \(\(select auth\.uid\(\)\) = id\)/i);
    expect(sql).not.toMatch(/for (insert|update|delete)\s+to authenticated/i);
    expect(sql).toMatch(/grant select on public\.profiles to authenticated/i);
    expect(sql).toMatch(/grant select on public\.plans to authenticated/i);
    expect(sql).toMatch(/grant all on public\.profiles to service_role/i);
  });
});
