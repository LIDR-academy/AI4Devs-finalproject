-- Local-only seed (runs on `supabase db reset` / first `supabase start`).
-- Do NOT push this to a hosted project — use Auth Admin API there instead.

create extension if not exists pgcrypto;

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
