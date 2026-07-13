---
id: task-6
title: LessonGenerationService (orchestrate happy path)
slice: 1
scenarios: [s3, s6]
status: todo
paths:
  - libs/supabase-services/src/services/lesson-generation.service.ts
  - libs/supabase-services/src/services/index.ts
---

## Goal
Business layer that orchestrates generation via `LessonGenerationDao`, never Supabase/`fetch` directly. Slice-1 scope is the happy path: validate the caller + inputs, call the DAO, return the typed `GeneratedLesson`. Error normalization into `GenerationErrorCode` is task-11/12 (kept out of the happy-path slice, mirroring how R1 split `PdfExtractionService` happy path from its error contract).

## Shape
```ts
export abstract class LessonGenerationService {
  static async generate(request: GenerateLessonRequest, userId: string): Promise<GeneratedLesson> {
    if (!userId) throw toGenerationError('unauthenticated');
    if (!request.documentId) throw toGenerationError('document_not_ready');
    return LessonGenerationDao.generateLesson(request);
  }
}
```

## Done criteria
- [ ] Scenarios @s3 (returns the ordered typed deck) / @s6 (passes composition through) covered by `lesson-generation.service.test.ts` (mock the DAO)
- [ ] No React; no direct Supabase/`fetch`; delegates to the DAO (per `hooks-service-dao.mdc`)
- [ ] `unauthenticated` / `document_not_ready` guard rejections tested at the service layer
- [ ] Exported through the services barrel
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Shares the `toGenerationError(code)` helper with task-11/12 (single source for the typed-error shape, mirroring `PdfExtractionService`).
