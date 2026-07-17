---
id: task-5
title: ApiKeyService — validate input + status
slice: 1
scenarios: [s1, s3, s4, s5]
status: done
paths: [libs/supabase-services/src/services/api-key.service.ts, libs/supabase-services/src/services/api-key.service.test.ts, libs/supabase-services/src/services/index.ts]
---

## Goal
Create the business-logic layer (`ApiKeyService`, abstract class, static methods) over `ApiKeyDao`:
- `saveApiKey(provider, rawKey): Promise<ApiKeyStatus>` — pre-check the input (trim; reject blank/whitespace-only before any round-trip → `validation_error`); default `provider` to `'openai'` (v1); call `ApiKeyDao.saveApiKey`; return the masked status. (Error normalization to `ApiKeyErrorCode` is layered in task-10.)
- `getApiKeyStatus(): Promise<ApiKeyStatus>` — call `ApiKeyDao.getApiKeyStatus`; **never throw** — a failed read resolves to `{ hasKey: false }` so the UI degrades to the no-key state rather than crashing.

## Done criteria
- [x] Scenario @s1 (service half): a non-blank key calls the DAO and returns the masked status.
- [x] Scenario @s3: `getApiKeyStatus` returns the DAO's masked status; a read failure resolves to `{ hasKey: false }` (never throws).
- [x] Scenario @s4: saving when a key already exists runs the same validate-then-store path (the service does not special-case first-save vs update — the Edge Function upserts).
- [x] Scenario @s5 (non-blank rule — service half + defensive backstop): a blank/whitespace-only key is rejected (trim → `validation_error`) before any DAO/round-trip. The reachable guard is `ApiKeyForm`'s Empty-state disabled submit (@s5, task-7/task-11); this service throw is the defensive backstop per spec Open decision 3 (`validation_error` backstop). Keep the pre-check **minimal** (non-blank only) — no brittle provider-specific prefix/length assumption (risks R-prov).
- [x] `ApiKeyService` is `abstract class` with `static` methods; exported via `libs/supabase-services/src/services/index.ts`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

Note: implemented as `saveApiKey(rawKey, provider = 'openai')` (rawKey first, provider defaulted) rather than the `(provider, rawKey)` order sketched in the Goal — matches how every caller (hook/UI) actually supplies just the raw key; functionally identical (provider still defaults to `'openai'` per v1).

## Notes
- Mirrors `AuthService`/`LocalePreferenceService`: validate before the DAO, shield callers from raw failures. The typed `ApiKeyErrorCode` normalization arrives in task-10 (Slice 2), same split as login task-2 → task-6.
- The blank-key `validation_error` is a service-level defensive backstop only (spec Open decision 3): it has no UI/e2e scenario because the Empty state disables submit until non-blank; asserted in `api-key.service.test.ts`, mirroring the login empty-password backstop.
- No React here.
