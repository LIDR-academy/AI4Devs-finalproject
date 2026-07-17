---
id: task-2
title: Edge Function persists the lesson server-side under auth.uid()
slice: 1
scenarios: [s1, s2, s3]
status: done
paths: [supabase/functions/generate-lesson/index.ts, supabase/functions/generate-lesson/_shared/, libs/types/src/lesson-generation.ts]
---

## Goal
Make `generate-lesson` write the `lessons` row (title + ordered slides) under the caller's
`auth.uid()` **before returning success**, and return that persisted row's real `id` as the
`GeneratedLesson.lessonId` (replacing the minted in-memory id). Persist runs via the caller-JWT
client so RLS stamps `user_id`. On persist failure, return the typed error code (new `persist_failed`,
added to `GenerationErrorCode` in `@helsoft/types` and the `_shared` mirror) — retry-only, no partial
success. Keep decision logic in a pure, Jest-tested `_shared` module (mirrored into
`libs/supabase-services/src/services/`), per the Deno-outside-harness rule.

## Done criteria
- [x] Scenario(s) {s1, s2, s3} covered by unit tests (persist module + error mapping) on the JS mirror
- [x] Row persisted before the 200 response; `lessonId` in the response = the DB row id
- [x] `persist_failed` added to `GenerationErrorCode` + `GENERATION_ERROR_CODES` + `_shared` mirror, mapped to a non-2xx status
- [x] `_shared/` and `libs/supabase-services` mirror kept in hand-sync (note in file header)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [x] No key/body logged; persist uses the caller-JWT client (RLS), never service-role

## Notes
- Client still does NOT insert lessons (story decision #2). `LessonGenerationDao` is unchanged.
- Live Edge/Deno execution stays a manual pre-merge verify item (same boundary as existing
  generate-lesson spike note); tests cover the pure persist/mapping logic on the JS side.
- `persist_failed` recovery = `retry` (wired in task-7).
