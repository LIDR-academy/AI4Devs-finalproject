-- pdf-upload-extraction (task-1): documents/document_images schema, storage buckets, RLS.
-- Locked at the spec gate (decision #3): bucket names + path scheme are `pdf-uploads`/`pdf-images`,
-- keyed `{user_id}/{document_id}/...`; ownership is enforced by `auth.uid()` everywhere.

-- === Tables ===================================================================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  filename text not null,
  size_bytes int not null,
  page_count int,
  status text not null default 'processing' check (status in ('processing', 'extracted', 'failed')),
  error_code text,
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.documents is
  'One uploaded PDF and its extraction outcome. `pages` is an ordered JSONB array of {page,text} — generation (R2) reads it whole.';

create table public.document_images (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  page_number int not null,
  position_index int not null,
  storage_path text not null,
  width int not null,
  height int not null,
  mime_type text not null,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.document_images is
  'One embedded image extracted from a document, downscaled/recompressed, tied to the page and in-page position it came from (@s2/@s3).';

create index document_images_document_id_idx on public.document_images (document_id);

-- === API exposure ==============================================================================
-- New tables are not auto-exposed to the Data API roles by default (config.toml's
-- `auto_expose_new_tables` is unset, matching the current cloud default) — RLS policies below
-- control *row* access, but the roles still need table-level GRANTs to reach the API at all.

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.documents to anon, authenticated, service_role;
grant select, insert, update, delete on public.document_images to anon, authenticated, service_role;

-- === Row-level security: documents ============================================================

alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- === Row-level security: document_images (ownership via parent document) =====================

alter table public.document_images enable row level security;

create policy "document_images_select_own" on public.document_images
  for select using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

create policy "document_images_insert_own" on public.document_images
  for insert with check (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

create policy "document_images_update_own" on public.document_images
  for update using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

create policy "document_images_delete_own" on public.document_images
  for delete using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

-- === Storage buckets (both private) ===========================================================

insert into storage.buckets (id, name, public)
values ('pdf-uploads', 'pdf-uploads', false), ('pdf-images', 'pdf-images', false)
on conflict (id) do nothing;

-- === Storage policies — object access restricted to the owner (leading {user_id} path segment) =

create policy "pdf_uploads_select_own" on storage.objects
  for select using (bucket_id = 'pdf-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_uploads_insert_own" on storage.objects
  for insert with check (bucket_id = 'pdf-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_uploads_update_own" on storage.objects
  for update using (bucket_id = 'pdf-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_uploads_delete_own" on storage.objects
  for delete using (bucket_id = 'pdf-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_images_select_own" on storage.objects
  for select using (bucket_id = 'pdf-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_images_insert_own" on storage.objects
  for insert with check (bucket_id = 'pdf-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_images_update_own" on storage.objects
  for update using (bucket_id = 'pdf-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "pdf_images_delete_own" on storage.objects
  for delete using (bucket_id = 'pdf-images' and (storage.foldername(name))[1] = auth.uid()::text);
