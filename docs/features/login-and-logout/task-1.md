---
id: task-1
title: AuthDao — raw Supabase email/password sign-in & sign-out
slice: 1
scenarios: [s2, s4]
status: done
paths: [libs/supabase-services/src/dao/auth.dao.ts, libs/supabase-services/src/dao/auth.dao.test.ts]
---

## Goal
Create the Supabase DAO for authentication: `AuthDao` (abstract class, static methods) exposing `signInWithPassword({ email, password })` and `signOut()`. Raw data access only — call `getSupabase().auth.signInWithPassword(...)` / `getSupabase().auth.signOut()` and return/throw exactly what supabase-js gives back. No validation, no error mapping, no React (those belong to the service/hook).

## Done criteria
- [ ] Scenarios @s2, @s4 covered by DAO unit tests (`auth.dao.test.ts`) that mock `getSupabase()` and assert the right auth call + args are made and the raw result/error is passed through.
- [ ] `AuthDao` is an `abstract class` with `static` async methods; **not** exported through a barrel (DAOs are consumed by services only, per `hooks-service-dao.mdc`).
- [ ] No business logic / validation / error normalization in the DAO.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions.

## Notes
- Follows Pattern A (Supabase DAO) in `.agents/rules/hooks-service-dao.mdc`; mirror the shape of `libs/supabase-services/src/dao/locale-preference.dao.ts`.
- `getSupabase()` throws if init was skipped — the service layer decides how to treat that; the DAO just calls it.
- Types `Session`/`User` are re-exported from `@helsoft/supabase-services` (`libs/supabase-services/src/index.ts`).
