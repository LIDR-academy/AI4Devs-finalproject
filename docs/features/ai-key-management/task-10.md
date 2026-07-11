---
id: task-10
title: Error contract + remove backbone (type / DAO / service / hook)
slice: 2
scenarios: [s6, s7, s8, s9]
status: done
paths: [libs/types/src/api-key-error.ts, libs/types/src/index.ts, libs/services/src/dao/api-key.dao.ts, libs/services/src/services/api-key.service.ts, libs/services/src/services/api-key.service.test.ts, libs/services/src/dao/api-key.dao.test.ts, libs/hooks/src/hooks/use-api-key.ts, libs/hooks/src/hooks/use-api-key.test.ts]
---

## Goal
Give the failure and removal paths a typed, UI-agnostic contract across the backbone:
- **Type**: add `ApiKeyErrorCode = 'invalid_key' | 'network_error' | 'validation_error'` + `ApiKeyError = { code: ApiKeyErrorCode }` to `@helsoft/types` (`api-key-error.ts`, plain TS, barrel-exported).
- **DAO**: add `removeApiKey(): Promise<ApiKeyStatus>` — invokes `manage-api-key` with the `remove` action; passes through the function's structured error/throw.
- **Service**: normalize every failure of `saveApiKey`/`removeApiKey`/`getApiKeyStatus` into an `ApiKeyErrorCode`: the function's `invalid_key` → `invalid_key`; a blank client key → `validation_error`; transport/edge/thrown/unknown → `network_error` (safer default). Add `removeApiKey()`. The raw Supabase/Edge error never leaks upward.
- **Hook**: add `removeApiKey()`; set `error` to the normalized `ApiKeyErrorCode` on a failed save/remove and clear it on success; refresh `status` after remove.

## Done criteria
- [x] Scenario @s6: a `invalid_key` response normalizes to `invalid_key`; the service tests assert nothing is treated as stored.
- [x] Scenario @s7: a transport/thrown failure normalizes to `network_error`; a subsequent successful save resolves normally (retry works).
- [x] Scenario @s8: `removeApiKey` invokes the `remove` action and, on success, the service/hook reflect `{ hasKey: false }`.
- [x] Scenario @s9: a failed remove normalizes to `network_error`; `status` stays `hasKey: true` (key preserved).
- [x] Copy stays out of types/services (service returns a `code`; the UI maps code → i18n key in task-11/task-13).
- [x] `ApiKeyErrorCode`/`ApiKeyError` barrel-exported; `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Mirrors the login error-contract task (`auth-error.ts` + `AuthService` normalization + `useAuth.error`). Reuse the closed-set runtime guard pattern from `useAuth` (`isAuthErrorShape`) so an off-contract cause falls back to `network_error` rather than an unchecked cast.
