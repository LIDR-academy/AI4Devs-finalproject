---
id: task-1
title: DB migration — documents/document_images schema, storage buckets, RLS
slice: 1
scenarios: [s2, s3, s14]
status: todo
paths: [supabase/migrations/]
---

## Goal
Create the persistence foundation via a single Supabase migration (`npx supabase migration new pdf_extraction`): the `documents` and `document_images` tables, the private `pdf-uploads` and `pdf-images` storage buckets, and the RLS + storage policies that scope everything to `auth.uid()`. This is the schema R2 (generation) later reads and the ownership boundary that makes @s14 true.

## Done criteria
- [ ] `documents` table: `id uuid pk default gen_random_uuid()`, `user_id uuid not null references auth.users`, `filename text`, `size_bytes int`, `page_count int`, `status text` (`processing`|`extracted`|`failed`), `error_code text null`, `pages jsonb` (ordered `[{page,text}]`), `created_at timestamptz default now()`.
- [ ] `document_images` table: `id uuid pk`, `document_id uuid not null references documents on delete cascade`, `page_number int`, `position_index int`, `storage_path text`, `width int`, `height int`, `mime_type text`, `description text null`, `created_at timestamptz`.
- [ ] Two private storage buckets created: `pdf-uploads`, `pdf-images` (not public).
- [ ] RLS enabled on both tables; policies for select/insert/update/delete restricted to `user_id = auth.uid()` (images via parent-document ownership).
- [ ] Storage policies restrict object access to the owner (leading `{user_id}` path segment = `auth.uid()`) on both buckets.
- [ ] Scenario @s14 covered by RLS assertions (Supabase Test Helpers) proving cross-user isolation + unauthenticated denial; @s2/@s3 supported by the `document_images` (page/position) + `documents.pages` (order) shape.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green (no code churn; migration + any test helpers only).

## Notes
- Migration only — no app/lib code. Follow `.agents/rules/global.mdc`: schema changes via `supabase migration new` then `db push`.
- Keep `pages` as ordered JSONB (generation reads it whole); a normalized `document_pages` table is the documented alternative (spec decision #3).
- `on delete cascade` from `document_images` → `documents` so a failed/retried upload cleans up.
- Bucket names + path scheme are **locked** at the gate (spec decision #3): `pdf-uploads`/`pdf-images`, keyed `{user_id}/{document_id}/…`.
