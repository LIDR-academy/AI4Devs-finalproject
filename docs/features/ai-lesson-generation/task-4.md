---
id: task-4
title: generate-lesson Edge Function happy path (both) + Groq/AI-SDK spike
slice: 1
scenarios: [s3, s6, s7, s8, s9, s11, s13]
status: done
paths:
  - supabase/functions/generate-lesson/
  - libs/supabase-services/src/services/lesson-generation.prompt.ts
  - libs/supabase-services/src/services/lesson-generation.schema.ts
  - libs/supabase-services/src/services/lesson-generation.placement.ts
  - libs/supabase-services/src/services/lesson-generation.assembly.ts
---

## Goal
The first LLM call in the repo. Implement the `generate-lesson` Edge Function happy path for composition `both`: authenticate caller (JWT), read `documents.pages` + `document_images` under RLS; read decrypted key via `get_api_key` (service-role, task-3); build a prompt enforcing composition; call **Groq via `@ai-sdk/groq`** with `generateObject(deckSchema)`; attach images by position/description metadata; validate into a typed `GeneratedLesson` with a minted `lessonId`; return it. Begins with a time-boxed spike proving the SDK + `generateObject` run in the real Edge (Deno) runtime against a live key (risks.md R1).

## Structure (pure, Jest-testable logic in `@helsoft/supabase-services`; hand-mirrored into `_shared/`)
- `lesson-generation.prompt.ts` — model prompt from page text + composition + image manifest (`{ imageId, page, position }[]`, no bytes); enforces `both` (variants in task-11).
- `lesson-generation.schema.ts` — strict deck schema (zod): `InstructionalSlide` + all five R3 activity shapes + invariants (e.g. `correctOptionId ∈ options[].id`; matching perfect-pairing) (@s13).
- `lesson-generation.placement.ts` — metadata/position-driven attachment: map image to slide from its source page (@s9); vision fallback is task-12.
- `lesson-generation.assembly.ts` — validate model output against schema, order slides, stamp `lessonId`/`position`, attach `SlideImageRef`s (@s3, @s11).
- `supabase/functions/generate-lesson/index.ts` — thin orchestration glue (auth, two Supabase clients, storage/DB reads, SDK adapter call, JSON response). Not run in this sandbox (risks.md R2).

## Done criteria
- [x] @s3,@s6,@s9,@s11,@s13 covered by unit tests on the pure modules; @s7,@s8 covered by the function's own asserts (key never in request/response body or logs) + task-3's migration-level manual smoke
- [x] `generateObject` output failing the schema → thrown (`GenerationSchemaError`) for task-12 to map to `generation_failed` (no partial deck)
- [x] Model IDs live in one tunable constant (`_shared/models.ts`), per spec.md Open decision #2; not independently reconfirmed against Groq's live model list (no API key this session — see Spike note)
- [x] Deck stamped with a minted `lessonId` (`crypto.randomUUID()`); no `lessons` row written (Open decision #5)
- [x] `pnpm lint`+`check-types`+`test` green for pure modules (`@helsoft/supabase-services`); `index.ts` + every `_shared/` mirror `deno check` clean, pure-logic mirrors smoke-executed under `deno run` (see Spike note) — not deployed/run against a real extracted document (open manual step before merge)
- [x] No hardcoded strings/colors/dimensions

## Spike note (risks.md R1 — human-visible before merge)
Deno CLI is present in this sandbox (risks.md assumed it wasn't). `deno check index.ts` (run outside the pnpm workspace tree, to avoid byonm resolving `npm:` specifiers against this repo's node_modules) type-checked `npm:ai@7`, `npm:@ai-sdk/groq@4`, `npm:@supabase/supabase-js@2` cleanly against the real SDK types. All four pure `_shared/` mirrors executed for real under `deno run` (not just Jest-mirrored) against a hand-built raw deck + image manifest, producing the expected assembled lesson. **Not run**: an actual network call to Groq (no API key available in this environment) — remains the one open manual-verification item before merge/deploy; narrower in scope than risks.md R1 anticipated (SDK-in-Deno risk retired, only the live-key round trip remains open).

## Notes
- Fallback if the SDK misbehaves in Deno: plain `fetch` to Groq's OpenAI-compatible endpoint behind the same adapter seam (risks.md R1).
- The client sends only `{ documentId, composition }`; the function reads the extracted content itself (keeps the client thin; avoids re-sending large text).
