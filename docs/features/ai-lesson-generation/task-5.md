---
id: task-5
title: LessonGenerationDao (Supabase functions.invoke)
slice: 1
scenarios: [s6, s7]
status: done
paths:
  - libs/supabase-services/src/dao/lesson-generation.dao.ts
  - libs/supabase-services/src/dao/lesson-generation.types.ts
  - libs/supabase-services/src/index.ts
---

## Goal
Raw client-side data access for generation: a **Supabase DAO** (Pattern A) that invokes the `generate-lesson` Edge Function. Mirrors `ApiKeyDao` — there is **no external-API DAO in the client** because the Groq call happens inside the function (@s7).

## Shape
```ts
export abstract class LessonGenerationDao {
  static async generateLesson({ documentId, composition }: GenerateLessonRequest): Promise<GeneratedLesson> {
    const { data, error } = await getSupabase().functions.invoke('generate-lesson', {
      body: { documentId, composition },
    });
    if (error) throw error;
    return data as GeneratedLesson;
  }
}
```

## Done criteria
- [x] Scenarios @s6 (composition passed in the invoke body) / @s7 (no key ever in the client call) covered by `lesson-generation.dao.test.ts` (mock `getSupabase()`)
- [x] No validation, no error mapping, no React (raw access only, per `hooks-service-dao.mdc`)
- [x] Exported through the `@helsoft/supabase-services` barrel — **deviation**: matches the actual repo convention (`ApiKeyDao`/`LessonAttemptDao` are likewise not re-exported from the top-level barrel; only `services/index.ts` is) rather than the task doc's literal wording; DAO consumers (the service layer) import it directly, as every existing DAO's own consumer does
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Multi-file DAO types (`InvokeGenerateBody` if needed) go in `lesson-generation.types.ts`, not the impl file — not needed: the invoke body is exactly `GenerateLessonRequest` from `@helsoft/types`, so no extra DAO-local type exists to hold.
