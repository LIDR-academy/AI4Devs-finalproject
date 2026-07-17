# C4 — Component Diagram: `generate-lesson` Edge Function

Level 3. Audience: developers. Zooms into the `generate-lesson` container from
[c4-containers.md](./c4-containers.md) — chosen because it is the richest container in the
system (prompt construction, structured-output validation, image placement, and persistence all
live here) and its internal seams matter for anyone changing generation behavior.

Source: `supabase/functions/generate-lesson/index.ts` + `./_shared/*.ts` (hand-mirrored from the
Jest-tested modules in `libs/supabase-services/src/services/lesson-generation.*`, since Deno
Edge Functions sit outside this repo's Jest/Stryker harness).

```mermaid
C4Component
  title Component Diagram - generate-lesson Edge Function

  Container(app, "Study Buddy App", "Expo", "Triggers generation, holds the resulting lesson id")
  ContainerDb(postgres, "Postgres", "Supabase", "documents, document_images, lessons, user_ai_keys")
  ContainerDb(storage, "Supabase Storage", "Object storage", "pdf-images bucket")
  System_Ext(groq, "Groq", "Hosted LLM inference")

  Container_Boundary(generateFn, "generate-lesson") {
    Component(httpHandler, "HTTP Handler", "Deno.serve (index.ts)", "Authenticates the caller's JWT, parses the request, orchestrates the pipeline below, maps outcomes to typed JSON responses")

    Component(promptBuilder, "Prompt Builder", "lesson-generation.prompt.ts", "Builds the deck prompt from extracted page text and the chosen composition (instructional-only / activity-only / both)")

    Component(deckSchema, "Deck Schema", "lesson-generation.schema.ts (Zod)", "Structured-output schema the model must satisfy; enforced via generateObject")

    Component(placement, "Image Placement", "lesson-generation.placement.ts", "Attaches extracted images to slides using position/description metadata; flags images with no metadata for vision fallback")

    Component(assembly, "Deck Assembly", "lesson-generation.assembly.ts", "Merges the validated deck, placed images, and composition rules into the final GeneratedLesson shape")

    Component(persist, "Persistence", "lesson-generation.persist.ts", "Inserts the lessons row under the caller's auth.uid(); marks the source document with a generation-failure code on error")

    Component(errors, "Error Mapping", "lesson-generation.errors.ts", "Maps SDK/timeout/validation failures to the typed GenerationErrorCode contract the client understands")

    Component(models, "Model IDs", "models.ts", "Pins TEXT_MODEL_ID (gpt-oss-20b) and VISION_MODEL_ID (llama-4-scout) behind one seam")
  }

  Rel(app, httpHandler, "POST (documentId, composition)", "HTTPS/JSON")

  Rel(httpHandler, postgres, "Reads document pages + document_images; resolves the caller's API key via RPC", "SQL")
  Rel(httpHandler, promptBuilder, "Builds prompt from pages + composition")
  Rel(promptBuilder, httpHandler, "Prompt text")
  Rel(httpHandler, groq, "generateObject(TEXT_MODEL_ID, prompt, deckSchema)", "Vercel AI SDK")
  Rel(httpHandler, deckSchema, "Validates the model's structured output")
  Rel(httpHandler, placement, "Places images by metadata; flags unresolved images")
  Rel(placement, storage, "Reads image bytes for unresolved images", "Storage API")
  Rel(httpHandler, groq, "generateObject(VISION_MODEL_ID) - fallback placement for flagged images", "Vercel AI SDK")
  Rel(httpHandler, assembly, "Assembles final deck (slides + composition + placed images)")
  Rel(httpHandler, persist, "Persists the assembled lesson")
  Rel(persist, postgres, "INSERT lessons (user_id = auth.uid())", "SQL")
  Rel(httpHandler, errors, "On any failure, maps to a typed error code")
  Rel(httpHandler, models, "Reads model IDs")
  Rel(httpHandler, app, "200 (lessonId) or a typed error", "HTTPS/JSON")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Notes

- **HTTP Handler is thin by design.** `index.ts` is intentionally orchestration-only glue; every
  decision (prompt shape, schema, placement rule, error mapping) lives in a pure, unit-testable
  module — the comment at the top of `index.ts` calls this out explicitly as a Deno-testing-gap
  mitigation (Jest/Stryker can't run against the Deno runtime in this sandbox).
- **Vision fallback is conditional, not always-on.** The vision-model call only happens for
  images `placement` can't resolve from text metadata (R2's placement rule); slides with no
  resolvable image render text-only rather than failing the whole generation.
- **Composition enforcement isn't a separate component** — it's a parameter threaded through
  `promptBuilder` and validated again in `assembly`/`deckSchema`, per R2.1 (`instructional-only`
  / `activity-only` / `both`).
- **`manage-api-key` and `extract-pdf` are simpler** (HTTP handler + 2-4 pure modules each) and
  are not diagrammed separately — their responsibilities are already fully captured at the
  container level in [c4-containers.md](./c4-containers.md).
