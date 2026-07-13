---
id: task-2
title: Generation contract types + slide image reference
slice: 1
scenarios: [s1, s3, s11]
status: todo
paths:
  - libs/types/src/lesson-generation.ts
  - libs/types/src/lesson.ts
  - libs/types/src/index.ts
---

## Goal
Define the cross-lib contract types every layer of generation shares, and extend the R3 slide types with an optional image reference. These are plain TS types in `@helsoft/types` (cross-lib contract).

## Types to add — `lesson-generation.ts`
- `LessonComposition = 'instructional-only' | 'activity-only' | 'both'` (default `'both'` is enforced in UI/wiring, not the type).
- `GenerateLessonRequest = { documentId: string; composition: LessonComposition }` — the only thing the client sends (@s6).
- `GeneratedLesson` (the returned deck): `{ lessonId: string; title: string; composition: LessonComposition; slides: Slide[] }` — an **in-memory** deck; no `lessons` row is written (spec.md Open decision #5).
- `GenerationProgressStep = 'reading' | 'generating' | 'attaching'` — the ordered, fixed phase list the hook advances through (@s14).
- `GenerationErrorCode = 'missing_key' | 'invalid_key' | 'rate_limited' | 'timeout' | 'generation_failed' | 'document_not_ready' | 'network_error' | 'unauthenticated'` (+ a `GenerationError = { code: GenerationErrorCode }` shape, mirroring `PdfExtractionError`).

## Types to extend — `lesson.ts`
- Add `SlideImageRef = { imageId: string; storagePath: string; width: number; height: number; alt?: string }` — a reference to the persisted R1 image (`document_images.id` + `storage_path` + dims), **never** the bytes.
- Add **optional** `image?: SlideImageRef` to `SlideBase` (so any slide kind may carry one). Text-only slides omit it (@s11); a missing/unresolvable ref degrades to text-only at render (@s12, R4).

## Done criteria
- [ ] Scenarios @s1/@s3/@s11 underpinned by these types (compile-time contract)
- [ ] Exported through `libs/types/src/index.ts`
- [ ] `pnpm check-types` green across all consumers (no existing R3 code broken by the optional `image` field)
- [ ] No runtime logic in these files (types only, per `types.mdc`)

## Notes
- Keep the Deno mirror in mind: the `generate-lesson` function can't import `@helsoft/types`, so task-4 hand-mirrors the request/deck/error shapes into `supabase/functions/generate-lesson/_shared/` (same rule as R1's `pdf-extraction` types).
- `lessonId` is the forward-compatible handle R5 will later adopt as the `lessons` PK and `lesson_attempts.lesson_id` can point at.
