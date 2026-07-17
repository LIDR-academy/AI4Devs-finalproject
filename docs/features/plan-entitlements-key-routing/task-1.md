---
id: task-1
title: Create plan-backed profiles
slice: 1
scenarios: [s1, s12, s14]
status: done
paths:
  - supabase/migrations/20260716170000_create_profiles.sql
  - supabase/migrations/20260716220000_drop_can_create_without_key.sql
  - libs/supabase-services/src/dao/profiles-migration.test.ts
  - libs/supabase-services/src/dao/profiles.rls.integration.test.ts
---

## Goal
Add `public.plans` flag rows and `public.profiles` with `plan_id` FK (default `free`). Seed every new auth user as free, permit authenticated users to read only their own profile (+ read plans), and reserve plan writes for trusted dashboard/service-role administration.

## Done criteria
- [x] `profiles.id` is a cascading foreign key to `auth.users.id`
- [x] `plan_id` defaults to `free` and FKs to `plans.id`
- [x] Auth-user insert trigger creates exactly one profile
- [x] RLS permits select-own profiles and authenticated plan select; no authenticated plan mutation
- [x] Migration tests cover default, FK, ownership, and missing-row behavior
- [x] Scenarios `@s1`, `@s12`, `@s14` are mapped in `tdd.md`

## Notes
The server reads live `plans` flags (via profile join) for every generation. Do not derive capability from `user_ai_keys`; paid/`use_platform_key` users may have no key row.
