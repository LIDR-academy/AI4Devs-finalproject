---
id: task-4
title: PdfUploadDao — Supabase Storage upload + extract-pdf invoke
slice: 1
scenarios: [s1, s4]
status: todo
paths: [libs/services/src/dao/pdf-upload.dao.ts, libs/services/src/dao/pdf-upload.dao.test.ts]
---

## Goal
Create the Supabase DAO for the client side of upload: `PdfUploadDao` (abstract class, static methods) that (a) uploads the raw PDF bytes to the `pdf-uploads` bucket, (b) inserts the `documents` row with `status = 'processing'`, and (c) invokes the `extract-pdf` function and returns its raw result. Raw data access only — no validation, no error normalization, no React (those belong to the service/hook).

## Done criteria
- [ ] `PdfUploadDao` is an `abstract class` with `static async` methods, e.g. `uploadPdf({ userId, documentId, bytes, filename })`, `insertDocument(...)`, and `invokeExtraction(documentId)` (calls `getSupabase().functions.invoke('extract-pdf', ...)`).
- [ ] Uses `getSupabase()` from `libs/services/src/supabase/supabase-client.ts` (Pattern A — Supabase DAO); returns/throws exactly what supabase-js gives back.
- [ ] Contains **no PDF parsing** — the client never parses (supports @s4). Only uploads + inserts + invokes.
- [ ] Scenarios @s1 / @s4 covered by `pdf-upload.dao.test.ts` mocking `getSupabase()` (storage, from().insert, functions.invoke) and asserting the right calls + args and pass-through of the raw result/error.
- [ ] Not exported through a barrel (DAOs are consumed by services only, per `hooks-service-dao.mdc`).
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions (bucket names + limits come from constants/config).

## Notes
- Mirror `libs/services/src/dao/auth.dao.ts` / `locale-preference.dao.ts` shape.
- Platform read of the picked file (web `Blob` vs native URI via `expo-file-system`) is the only place that touches platform specifics — keep it isolated here so service/hook/UI stay platform-agnostic (risk R5). The picker itself lives at the app/wiring layer; the DAO receives bytes.
