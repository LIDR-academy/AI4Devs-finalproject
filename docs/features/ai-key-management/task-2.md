---
id: task-2
title: Edge Function manage-api-key — validate-then-store (save)
slice: 1
scenarios: [s1, s12, s13]
status: done
paths: [supabase/functions/manage-api-key/]
---

## Goal
Create the first repo Edge Function (Deno), `manage-api-key`, handling the **save** action for an authenticated caller:
1. Authenticate the caller from the request JWT; derive `user_id` (never trust a client-supplied id).
2. **Validate** the submitted key with a lightweight, no-cost provider auth probe behind a `validateKey(provider, key)` seam — default `GET https://api.openai.com/v1/models` with `Authorization: Bearer <key>` (open decision 2). Classify: 2xx → valid; 401/403 → invalid; everything else / thrown → transient.
3. On **valid**: write the key as a Supabase **Vault** secret (service role), upsert the `user_ai_keys` metadata row (`user_id`, `secret_id`, `provider`, `updated_at`).
4. Return a **masked status** only: `{ hasKey: true, provider, updatedAt }` — never echo the key.
5. On **invalid** → structured `{ code: 'invalid_key' }` (nothing stored). On **transient** → `{ code: 'network_error' }`.
6. **Redact**: never log the request body or the key; log only `{ action, outcome, userId }`.

## Done criteria
- [x] Scenario @s1 (server half): probe 2xx → Vault store + metadata upsert → masked status returned.
- [x] Scenario @s12: a Deno log-spy test asserts the raw key value appears in **no** log call across the save path.
- [x] Scenario @s13 (server half): decryption uses the service-role Vault decrypted view; the function never returns plaintext.
- [x] `validateKey(provider, key)` is an isolated, Deno-unit-tested classifier (2xx/401/403/other) — the provider endpoint is the only provider-specific piece.
- [x] Deno tests pass; a **manual smoke** against the **local** stack is recorded (hosted-project smoke not available to this session — no hosted credentials; local smoke exercised the real auth JWT flow + a real OpenAI network probe against a fake key → 401 → `invalid_key`, nothing stored, redacted logs; see tdd.md).

## Notes
- Deno/Edge sits **outside** Jest/Stryker (risks R1) — verified by `deno test` + manual smoke + reviewer_security, not the mutation gate.
- Uses a plain `fetch` for the probe; the Vercel AI SDK (R2 generation) is NOT needed here.
- The `remove` action and the `invalid_key`/transient rejection **contract** wiring to the client are extended in task-9 (Slice 2). This task delivers the happy save path + redaction.
- Never claim "invalid" for a transient failure (risks R4): only 401/403 → `invalid_key`.
