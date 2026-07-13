---
id: task-3
title: get_api_key service-role Vault read RPC (migration)
slice: 1
scenarios: [s7, s8]
status: todo
paths:
  - supabase/migrations/
---

## Goal
Add the server-side path for the generation Edge Function to read the learner's decrypted AI key, which R6 deliberately did not build (`ai-key-management/spec.md:45` — "R2 will trigger its own Edge Function, which reads the key from the same store server-side"). A new migration adds `get_api_key(p_user_id uuid)` returning `{ provider text, api_key text }` from `vault.decrypted_secrets` joined to `user_ai_keys` — `security definer`, `execute` granted to `service_role` only (spec.md Open decision #6).

## Done criteria
- [ ] `get_api_key` is `security definer`, `set search_path = public, vault, pg_temp`, and `execute` is **revoked from public / granted to service_role only** (same model as `save_api_key`/`remove_api_key`) — an `authenticated` client cannot call it even with a valid JWT (@s7)
- [ ] Returns the decrypted secret + provider for the given `p_user_id`; returns no row when the user has no key (task-12 maps that to `missing_key`)
- [ ] Reversibility note in the migration header (down migration not auto-generated, mirrors R6 migrations)
- [ ] Verified against the local Supabase stack (round-trips a Vault secret); manual smoke only — no Jest (Postgres/Deno outside the harness, risks.md R2/R5)

## Notes
- **Never** exposes the key to the client contract or logs (@s8) — it is only ever read inside the function and passed to the SDK.
- Same Vault-vs-`pgcrypto` fallback caveat as R6 (risks.md R5): if hosted Vault is unavailable, the RPC reads the `bytea`/pgcrypto column instead — signature and callers unchanged.
