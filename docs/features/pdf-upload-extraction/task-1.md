---
id: task-1
title: DB migration — documents/document_images schema, storage buckets, RLS
slice: 1
scenarios: [s2, s3, s14]
status: done
paths: [supabase/migrations/]
---

## Goal
Create the persistence foundation via a single Supabase migration (`npx supabase migration new pdf_extraction`): the `documents` and `document_images` tables, the private `pdf-uploads` and `pdf-images` storage buckets, and the RLS + storage policies that scope everything to `auth.uid()`. This is the schema R2 (generation) later reads and the ownership boundary that makes @s14 true.

## Done criteria
- [x] `documents` table: `id uuid pk default gen_random_uuid()`, `user_id uuid not null references auth.users`, `filename text`, `size_bytes int`, `page_count int`, `status text` (`processing`|`extracted`|`failed`), `error_code text null`, `pages jsonb` (ordered `[{page,text}]`), `created_at timestamptz default now()`.
- [x] `document_images` table: `id uuid pk`, `document_id uuid not null references documents on delete cascade`, `page_number int`, `position_index int`, `storage_path text`, `width int`, `height int`, `mime_type text`, `description text null`, `created_at timestamptz`.
- [x] Two private storage buckets created: `pdf-uploads`, `pdf-images` (not public).
- [x] RLS enabled on both tables; policies for select/insert/update/delete restricted to `user_id = auth.uid()` (images via parent-document ownership).
- [x] Storage policies restrict object access to the owner (leading `{user_id}` path segment = `auth.uid()`) on both buckets.
- [x] Scenario @s14 covered by RLS assertions (real, executed against the local Supabase stack — Jest + `@supabase/supabase-js`, not the Deno-only Supabase Test Helpers, per the sandbox adaptation) proving cross-user isolation + unauthenticated denial; @s2/@s3 supported by the `document_images` (page/position) + `documents.pages` (order) shape.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green (no code churn; migration + any test helpers only). RLS test isolated in `pnpm --filter @helsoft/services test:rls` (Docker-dependent, excluded from the default run) — see `tdd.md`.

## Notes
- Migration only — no app/lib code. Follow `.agents/rules/global.mdc`: schema changes via `supabase migration new` then `db push`.
- Keep `pages` as ordered JSONB (generation reads it whole); a normalized `document_pages` table is the documented alternative (spec decision #3).
- `on delete cascade` from `document_images` → `documents` so a failed/retried upload cleans up.
- Bucket names + path scheme are **locked** at the gate (spec decision #3): `pdf-uploads`/`pdf-images`, keyed `{user_id}/{document_id}/…`.
- **Real finding (this local stack):** `config.toml`'s `auto_expose_new_tables` is unset (the new cloud default), so `anon`/`authenticated`/`service_role` get **zero** table-level access to new tables until explicitly granted — RLS alone isn't enough; the migration also runs `grant usage on schema public` + `grant select, insert, update, delete on public.documents/document_images` to all three roles. Without this, every request (including the service-role admin client) fails with `permission denied for table documents` (Postgres `42501`), which is what the first RLS test run surfaced.
