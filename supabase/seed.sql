-- Local-only seed (runs on `supabase db reset` / first `supabase start`).
-- Do NOT push this to a hosted project — use Auth Admin API there instead.

create extension if not exists pgcrypto;

-- Demo plan flag rows (beyond seeded free/paid from migration).
insert into public.plans (
  id,
  use_platform_key,
  show_ads,
  show_key_settings,
  can_create_without_key
)
values
  ('demo_platform_key', true, false, false, false),
  ('demo_show_ads', false, true, false, false),
  ('demo_show_key', false, false, true, false)
on conflict (id) do update set
  use_platform_key = excluded.use_platform_key,
  show_ads = excluded.show_ads,
  show_key_settings = excluded.show_key_settings,
  can_create_without_key = excluded.can_create_without_key;

do $$
declare
  v_user_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  v_email text := 'test@mail.com';
  v_encrypted_pw text := crypt('123456', gen_salt('bf'));
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', v_user_id, v_email)::jsonb,
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );
end $$;

-- Entitlement demo users (password: test123). Profiles are created by trigger; flip plan_id after.
do $$
declare
  r record;
begin
  for r in
    select *
    from (
      values
        (
          '11111111-1111-1111-1111-111111111111'::uuid,
          'platform@key.com',
          'demo_platform_key'
        ),
        (
          '22222222-2222-2222-2222-222222222222'::uuid,
          'show@ads.com',
          'demo_show_ads'
        ),
        (
          '33333333-3333-3333-3333-333333333333'::uuid,
          'show@key.com',
          'demo_show_key'
        )
    ) as t(user_id, email, plan_id)
  loop
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      r.user_id,
      'authenticated',
      'authenticated',
      r.email,
      crypt('test123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      r.user_id,
      format(
        '{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
        r.user_id,
        r.email
      )::jsonb,
      'email',
      r.user_id::text,
      now(),
      now(),
      now()
    );

    update public.profiles
    set plan_id = r.plan_id
    where id = r.user_id;
  end loop;
end $$;
