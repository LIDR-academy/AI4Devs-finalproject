---
id: task-1
title: Create plan-backed profiles
slice: 1
scenarios: [s1, s12, s14]
status: done
paths:
  - supabase/migrations/<timestamp>_create_profiles.sql
---

## Goal
Add the authoritative `public.profiles` plan record. Seed every new auth user as `free`, constrain plans to `free|paid`, permit authenticated users to read only their own row, and reserve plan writes for trusted dashboard/service-role administration.

## Done criteria
- [x] `profiles.id` is a cascading foreign key to `auth.users.id`
- [x] `plan` defaults to `free` and rejects every other value
- [x] Auth-user insert trigger creates exactly one profile
- [x] RLS permits select-own and no authenticated plan mutation
- [x] Migration tests cover default, constraint, ownership, and missing-row behavior
- [x] Scenarios `@s1`, `@s12`, `@s14` are mapped in `tdd.md`

## Notes
The server reads this row live for every generation. Do not derive plan from `user_ai_keys`; paid users may have no key row.
