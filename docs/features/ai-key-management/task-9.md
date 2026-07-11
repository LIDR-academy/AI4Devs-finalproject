---
id: task-9
title: Edge Function manage-api-key — invalid-key rejection + remove action
slice: 2
scenarios: [s6, s8, s12]
status: done
paths: [supabase/functions/manage-api-key/]
---

## Goal
Extend the `manage-api-key` Edge Function (task-2) with the failure and removal paths:
- **Invalid-key rejection**: when the provider probe returns 401/403, reply with structured `{ code: 'invalid_key' }` and **persist nothing** (no Vault write, no metadata upsert). Transient failures (429/5xx/timeout/thrown) → `{ code: 'network_error' }`.
- **`remove` action**: for an authenticated caller, delete the Vault secret (by `secret_id`) **and** the `user_ai_keys` metadata row (service role). Reply with `{ hasKey: false }`. A removal failure → `{ code: 'network_error' }`, leaving the stored key intact.
- Redaction holds across both paths: never log the request body or key; log only `{ action, outcome, userId }`.

## Done criteria
- [x] Scenario @s6 (server half): probe 401/403 → `invalid_key`, nothing written to Vault or the metadata table (Deno test).
- [x] Scenario @s8 (server half): `remove` deletes both the Vault secret and the metadata row → `{ hasKey: false }` (Deno test).
- [x] Scenario @s12: log-spy Deno test confirms the raw key appears in **no** log call across invalid-key and remove paths.
- [x] Only 401/403 classify as `invalid_key`; every other non-2xx / thrown → `network_error` (risks R4). Deno-tested against representative statuses.
- [x] Deno tests pass; manual smoke recorded (invalid key rejected without storing; remove clears the stored secret + row).

## Notes
- Deno/Edge is outside Jest/Stryker (risks R1) — Deno tests + manual verification + reviewer_security.
- The client-side normalization to `ApiKeyErrorCode` and the `removeApiKey` DAO/service/hook wiring are task-10.
