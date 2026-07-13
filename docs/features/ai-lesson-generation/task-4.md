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
The first LLM call in the repo. Implement the `generate-lesson` Edge Function happy path for composition `both`: authenticate the caller (JWT) and read `documents.pages` + `document_images` for `documentId` under RLS; read the decrypted key via `get_api_key` (service-role client, task-3); build a prompt enforcing composition; call **Groq via `@ai-sdk/groq`** with `generateObject(deckSchema)`; attach images by position/description metadata; validate into a typed `GeneratedLesson` with a minted `lessonId`; return it. **Begins with a time-boxed spike** proving the SDK + `generateObject` run in the real Edge (Deno) runtime against a live key (risks.md R1).

## Structure (pure, Jest-testable logic in `@helsoft/supabase-services`; hand-mirrored into `_shared/`)
- `lesson-generation.prompt.ts` — builds the model prompt from page text + composition + an image manifest (`{ imageId, page, position }[]`, no bytes). Enforces `both` here (variants in task-11).
- `lesson-generation.schema.ts` — the strict deck schema (zod) covering `InstructionalSlide` + all five R3 activity shapes and their invariants (e.g. `correctOptionId ∈ options[].id`; matching perfect-pairing) (@s13).
- `lesson-generation.placement.ts` — metadata/position-driven attachment: map an image to a slide derived from its source page (@s9). (Vision fallback is task-12.)
- `lesson-generation.assembly.ts` — validate model output against the schema, order slides, stamp `lessonId`/`position`, attach `SlideImageRef`s (@s3, @s11).
- `supabase/functions/generate-lesson/index.ts` — thin orchestration glue (auth, two Supabase clients, storage/DB reads, the SDK adapter call, JSON response). Not run in this sandbox (risks.md R2).

## Done criteria
- [x] Scenarios @s3,@s6,@s9,@s11,@s13 covered by unit tests on the pure modules; @s7,@s8 covered by the function's own asserts (key never in request/response body or logs) + task-3's migration-level manual smoke (service-role-only)
- [x] `generateObject` output that fails the schema → thrown (`GenerationSchemaError`) for task-12 to map to `generation_failed` (no partial deck)
- [x] Model IDs live in one tunable constant (`_shared/models.ts`) behind the SDK seam — IDs are the ones spec.md's Open decision #2 names; **not independently reconfirmed against Groq's live model list** (no API key available this session, see spike note below)
- [x] Deck is stamped with a minted `lessonId` (`crypto.randomUUID()`); **no `lessons` row written** (Open decision #5)
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green for the pure modules (`@helsoft/supabase-services`); `index.ts` + every `_shared/` mirror `deno check` clean and the pure-logic mirror smoke-executed for real under `deno run` (see spike note) — **not** deployed/run against a real extracted document (open manual step before merge)
- [x] No hardcoded strings/colors/dimensions

## Spike note (risks.md R1 — human-visible before merge)
Ran in this session, outside the plan's original assumption that Deno is unavailable here: the
Deno CLI **is** present in this sandbox. `deno check` on `index.ts` (run from outside the pnpm
workspace tree, since Deno's byonm mode otherwise tries to resolve `npm:` specifiers against this
repo's node_modules) resolved and type-checked `npm:ai@7`, `npm:@ai-sdk/groq@4`, and
`npm:@supabase/supabase-js@2` cleanly — `createGroq({ apiKey })` + `generateObject({ model, schema:
deckSchema, prompt })` compiles against the real installed SDK types. The four pure `_shared/`
mirrors were also executed for real under `deno run` (not just Jest-mirrored) against a
hand-built raw deck + image manifest and produced the expected assembled lesson. **What did NOT
run**: an actual network call to Groq (`generateObject` resolving against the live API) — no Groq
API key is available in this environment. This remains the one open manual-verification item for
a human before merge/deploy, exactly as risks.md R1 anticipated, just narrower in scope than
originally assumed (the SDK-in-Deno-runtime risk is now largely retired; only the live-key round
trip remains open).

## Notes
- Fallback if the SDK misbehaves in Deno: plain `fetch` to Groq's OpenAI-compatible endpoint behind the same adapter seam (risks.md R1).
- The client sends only `{ documentId, composition }`; the function reads the extracted content itself (keeps the client thin; avoids re-sending large text).
