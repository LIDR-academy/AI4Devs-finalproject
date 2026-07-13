---
id: task-4
title: generate-lesson Edge Function happy path (both) + Groq/AI-SDK spike
slice: 1
scenarios: [s3, s6, s7, s8, s9, s11, s13]
status: todo
paths:
  - supabase/functions/generate-lesson/
  - libs/supabase-services/src/services/lesson-generation.prompt.ts
  - libs/supabase-services/src/services/lesson-generation.schema.ts
  - libs/supabase-services/src/services/lesson-generation.placement.ts
  - libs/supabase-services/src/services/lesson-generation.assembly.ts
---

## Goal
The first LLM call in the repo. Implement the `generate-lesson` Edge Function happy path for composition `both`: authenticate the caller (JWT) and read `documents.pages` + `document_images` for `documentId` under RLS; read the decrypted key via `get_api_key` (service-role client, task-3); build a prompt enforcing composition; call **Groq via `@ai-sdk/groq`** with `generateObject(deckSchema)`; attach images by position/description metadata; validate into a typed `GeneratedLesson` with a minted `lessonId`; return it. **Begins with a time-boxed spike** proving the SDK + `generateObject` run in the real Edge (Deno) runtime against a live key (risks.md R1).

## Structure (pure, Jest-testable logic in `@helsoft/supabase-services`; hand-mirrored into `_shared/`)
- `lesson-generation.prompt.ts` — builds the model prompt from page text + composition + an image manifest (`{ imageId, page, position }[]`, no bytes). Enforces `both` here (variants in task-11).
- `lesson-generation.schema.ts` — the strict deck schema (zod) covering `InstructionalSlide` + all five R3 activity shapes and their invariants (e.g. `correctOptionId ∈ options[].id`; matching perfect-pairing) (@s13).
- `lesson-generation.placement.ts` — metadata/position-driven attachment: map an image to a slide derived from its source page (@s9). (Vision fallback is task-12.)
- `lesson-generation.assembly.ts` — validate model output against the schema, order slides, stamp `lessonId`/`position`, attach `SlideImageRef`s (@s3, @s11).
- `supabase/functions/generate-lesson/index.ts` — thin orchestration glue (auth, two Supabase clients, storage/DB reads, the SDK adapter call, JSON response). Not run in this sandbox (risks.md R2).

## Done criteria
- [ ] Scenarios @s3,@s6,@s9,@s11,@s13 covered by unit tests on the pure modules; @s7,@s8 covered by the function's own asserts + manual smoke (key read server-side, never in the response body or logs)
- [ ] `generateObject` output that fails the schema → thrown for task-12 to map to `generation_failed` (no partial deck)
- [ ] Model IDs live in one tunable constant behind the SDK seam; confirmed against Groq's current model list at build (spec.md Open decision #2)
- [ ] Deck is stamped with a minted `lessonId`; **no `lessons` row written** (Open decision #5)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green; function verified manually against a real extracted document after deploy
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Fallback if the SDK misbehaves in Deno: plain `fetch` to Groq's OpenAI-compatible endpoint behind the same adapter seam (risks.md R1).
- The client sends only `{ documentId, composition }`; the function reads the extracted content itself (keeps the client thin; avoids re-sending large text).
