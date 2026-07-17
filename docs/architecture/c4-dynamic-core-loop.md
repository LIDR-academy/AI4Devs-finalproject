# C4 — Dynamic Diagram: Core Loop (Upload → Generate → Study → Score)

Audience: engineers, technical reviewers. Traces the PRD's headline flow — "upload → generate →
study → score" — across the containers from [c4-containers.md](./c4-containers.md), in call
order. Assumes the learner is already authenticated and has a Groq key saved (see
`c4-components-generate-lesson.md` for `manage-api-key`, not repeated here).

```mermaid
C4Dynamic
  title Dynamic Diagram - Core Loop

  Person(learner, "Learner")
  Container(app, "Study Buddy App", "Expo")
  Container(extractFn, "extract-pdf", "Edge Function")
  Container(generateFn, "generate-lesson", "Edge Function")
  ContainerDb(storage, "Supabase Storage", "Object storage")
  ContainerDb(postgres, "Postgres", "Supabase + RLS")
  System_Ext(groq, "Groq", "LLM inference")

  Rel(learner, app, "1. Selects a PDF to upload")
  Rel(app, storage, "2. Uploads raw PDF to pdf-uploads/user_id/document_id")
  Rel(app, postgres, "3. Inserts a documents row (status: processing)", "PostgREST")
  Rel(app, extractFn, "4. Invokes extract-pdf(documentId)")
  Rel(extractFn, storage, "5. Reads the raw PDF")
  Rel(extractFn, storage, "6. Writes downscaled/recompressed extracted images")
  Rel(extractFn, postgres, "7. Writes pages + document_images; sets status: extracted (or failed + error_code)")
  Rel(app, learner, "8. Shows extraction result / error")

  Rel(learner, app, "9. Picks lesson composition (instructional / activity / both)")
  Rel(app, generateFn, "10. Invokes generate-lesson(documentId, composition)")
  Rel(generateFn, postgres, "11. Reads document pages/images; resolves caller's Groq key by secret_id")
  Rel(generateFn, groq, "12. generateObject - structured slide deck (plus vision fallback for unplaced images)")
  Rel(generateFn, postgres, "13. Inserts the lessons row (user_id = auth.uid())")
  Rel(generateFn, app, "14. Returns lessonId or a typed error code")

  Rel(learner, app, "15. Plays the lesson slide by slide")
  Rel(app, postgres, "16. Persists current slide position as the learner advances (resume support)")
  Rel(learner, app, "17. Answers activity slides; sees immediate feedback")
  Rel(app, postgres, "18. Inserts a lesson_attempts row with the final score on completion")
  Rel(app, learner, "19. Shows the results summary (score, or completion state for instructional-only)")

  UpdateLayoutConfig($c4ShapeInRow="4")
```

## Notes

- **Steps 1-8 (extraction) and 9-14 (generation) are two independent Edge Function round-trips**,
  not one call — the client owns the state transition between them and can retry extraction
  without re-triggering generation.
- **Step 12 is itself two possible LLM calls** (text model, then a conditional vision-model call)
  — see [c4-components-generate-lesson.md](./c4-components-generate-lesson.md) for that detail;
  this diagram keeps generation as one logical step to stay readable end-to-end.
- **Steps 15-19 (player, activities, scoring, resume) do not go through any Edge Function** —
  the app talks to Postgres directly (RLS-scoped) for slide position and attempt persistence,
  matching R9 and R7 in the PRD.
- Everything after step 1 assumes the learner is authenticated (`Supabase Auth`, per
  [c4-containers.md](./c4-containers.md)) — omitted here to keep the flow scoped to the core loop.
