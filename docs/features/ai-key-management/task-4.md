---
id: task-4
title: ApiKeyDao — invoke save + status select (Supabase DAO)
slice: 1
scenarios: [s1, s3, s11]
status: done
paths: [libs/services/src/dao/api-key.dao.ts, libs/services/src/dao/api-key.dao.test.ts]
---

## Goal
Create the Supabase DAO (`ApiKeyDao`, abstract class, static methods) — raw data access only:
- `saveApiKey({ provider, apiKey }): Promise<ApiKeyStatus>` — invokes `getSupabase().functions.invoke('manage-api-key', { body: { action: 'save', provider, apiKey } })`; returns the masked status the function replies with; passes through the function's structured error/throw.
- `getApiKeyStatus(): Promise<ApiKeyStatus>` — `getSupabase().from('user_ai_keys').select('provider, updated_at')` for the current user (RLS-scoped); maps row-present → `{ hasKey: true, provider, updatedAt }`, no row → `{ hasKey: false }`. **Selects no secret column; exposes no raw-key read path.**

## Done criteria
- [x] Scenario @s1 (client half): `saveApiKey` invokes `manage-api-key` with the `save` action + args and returns the masked status (test mocks `getSupabase().functions.invoke`).
- [x] Scenario @s3: `getApiKeyStatus` maps present/absent row → `hasKey` true/false with the masked fields (test mocks `getSupabase().from(...).select(...)`).
- [x] Scenario @s11: the DAO has **no** method that returns the raw key; the status select lists only non-secret columns — test asserts the returned shape omits any key field.
- [x] `ApiKeyDao` is an `abstract class` with `static` methods; **not** barrel-exported (DAOs are consumed by services only).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Pattern A (Supabase DAO) — both `functions.invoke` and the metadata `select` go through `getSupabase()`; there is **no** external-API DAO here (the provider call happens inside the Edge Function, not the client). See `.agents/rules/hooks-service-dao.mdc`.
- No validation / error normalization here — that is the service (task-5/task-10).
- `removeApiKey` is added in task-10 (Slice 2).
