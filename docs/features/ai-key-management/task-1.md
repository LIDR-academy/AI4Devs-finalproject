---
id: task-1
title: DB migration — user_ai_keys table + Supabase Vault + RLS
slice: 1
scenarios: [s13]
status: done
paths: [supabase/migrations/]
---

## Goal
Create the first repo migration (`npx supabase migration new user_ai_keys`) that provisions the encrypted-key store:
- Enable the `supabase_vault` extension (idempotent) — the encrypted secret store (open decision 1).
- Create `public.user_ai_keys`: `user_id uuid primary key references auth.users(id) on delete cascade`, `secret_id uuid not null` (reference to the Vault secret — NOT the secret itself), `provider text not null`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`. **No key material** in this table.
- Enable RLS. Add a **select-only** policy for `authenticated`: `using (auth.uid() = user_id)`. Grant **no** client insert/update/delete — all writes are performed by the Edge Function's service role (task-2/task-9).

## Done criteria
- [x] Scenario @s13 (storage facet): the key store is encrypted at rest (Vault) and RLS restricts row visibility to the owning user; the service role performs writes.
- [x] `user_ai_keys` holds only non-secret metadata (`user_id`, `secret_id`, `provider`, timestamps) — no key characters.
- [x] RLS enabled; `authenticated` has SELECT on own rows only; no client write grants.
- [x] Migration applies cleanly (`npx supabase db push`) and is reversible in intent (documented).
- [x] **Manual RLS verification** recorded: user A cannot read user B's row; `authenticated` cannot read the Vault decrypted view. See tdd.md for the full transcript (applied directly against the local Docker Postgres via `docker exec ... psql`, then rolled back — `db push` against the shared local stack hit an unrelated migration-history conflict from a concurrent worktree, documented in tdd.md).

## Notes
- SQL/migrations sit **outside** the Jest/Stryker harness (risks R2) — verification is `db push` + manual RLS checks + reviewer_security, not the mutation gate.
- If the pre-Slice-1 spike finds Vault unavailable, use the R-enc fallback: a `pgcrypto`/`pgsodium`-encrypted `bytea` column with the symmetric key held only as an Edge Function secret. The higher-layer client contract is unchanged either way.
- `secret_id` is an opaque reference; even if selected it is not the secret. The DAO (task-4) selects only `provider`/`updated_at` and derives `hasKey` from row presence.
