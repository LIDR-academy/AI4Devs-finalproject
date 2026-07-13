---
id: task-5
title: LessonGenerationDao (Supabase functions.invoke)
slice: 1
scenarios: [s6, s7]
status: todo
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
- [ ] Scenarios @s6 (composition passed in the invoke body) / @s7 (no key ever in the client call) covered by `lesson-generation.dao.test.ts` (mock `getSupabase()`)
- [ ] No validation, no error mapping, no React (raw access only, per `hooks-service-dao.mdc`)
- [ ] Exported through the `@helsoft/supabase-services` barrel
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
- Multi-file DAO types (`InvokeGenerateBody` if needed) go in `lesson-generation.types.ts`, not the impl file.
