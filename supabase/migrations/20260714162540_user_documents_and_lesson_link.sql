-- pending-pdfs-generate (Slice 1, task-1)
--
-- Schema the PDF list needs (spec decisions #1/#2):
-- 1. lessons.document_id — nullable FK → documents(id) on delete set null (Open-lesson link)
-- 2. documents.generation_error_code — nullable failure signal (Retry status)
-- 3. user_documents view — extracted docs + newest linked lesson_id (security_invoker = on)
--
-- No documents.status enum change; no legacy backfill (pre-feature lessons stay null-linked).

-- === lessons.document_id ======================================================================

alter table public.lessons
  add column document_id uuid references public.documents (id) on delete set null;

comment on column public.lessons.document_id is
  'Source document for this lesson (R3 PDF list). Written by generate-lesson on success; '
  'null for legacy lessons. on delete set null so purging a lesson-less doc never breaks a lesson.';

create index lessons_document_id_idx on public.lessons (document_id);

-- === documents.generation_error_code ==========================================================

alter table public.documents
  add column generation_error_code text;

comment on column public.documents.generation_error_code is
  'Last server-side generation failure code (R3). Set after the document is identified; '
  'cleared/overwritten by a later attempt. Doc status stays extracted — the lesson link flips '
  'the list row to lesson-ready, not this column.';

-- === user_documents view ======================================================================
-- security_invoker = on so underlying documents/lessons RLS (auth.uid()) governs rows (@s18/@s19).
-- Only status='extracted' (@s17). Newest lesson per doc via lateral join (no duplicate rows).

create view public.user_documents
with (security_invoker = on) as
select
  d.id,
  d.filename,
  d.page_count,
  d.created_at,
  d.generation_error_code,
  l.id as lesson_id
from public.documents d
left join lateral (
  select lessons.id
  from public.lessons
  where lessons.document_id = d.id
  order by lessons.created_at desc
  limit 1
) l on true
where d.status = 'extracted';

comment on view public.user_documents is
  'PDF list rows: extracted documents for the caller (RLS), with newest linked lesson_id. '
  'Row status is derived in the client DAO (lesson_id → generated; else generation_error_code → '
  'failed; else ready).';

-- Data API exposure (mirrors R1 documents GRANTs — RLS still scopes rows)
grant select on public.user_documents to anon, authenticated, service_role;
