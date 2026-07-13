---
feature: ai-lesson-generation
story: user-stories/in-progress/ai-lesson-generation.md   # pending/ → in-progress/ → done/ across the run
status: spec_drafted
---

# Spec — ai-lesson-generation
_Keep terse. **Acceptance criteria are NOT duplicated here** — the `@s` scenarios in `gherkin-scenarios.md` are the ACs. Link, don't copy._

## Summary
A learner picks what their lesson should contain (instructional only / activity only / both, default **both**) alongside the PDF-upload widget, then triggers generation. A Supabase **Edge Function** reads the R1-extracted text + image rows for that document, reads the learner's stored AI key **server-side** (Supabase Vault, service-role), and calls **Groq** through the **Vercel AI SDK** (`@ai-sdk/groq`) to return a structured, ordered deck of typed slides (instructional + the five R3 activity types) that honors the chosen composition. Relevant R1 images are attached to slides **by reference** (position/description metadata, or a vision model for raw images), degrading to text-only when a reference is missing or broken. The learner sees discrete, labeled multi-step progress while it runs and a readable error on failure. This is PRD **R2 + R2.1**; it feeds R4 (player) and R7 (the instructional-only "no score" case).

This story also performs a small **cross-cutting provider swap** of the already-shipped R6 code from OpenAI to Groq (see Open decisions + `risks.md` dependency row). It does **not** persist the deck to a `lessons` table — persistence is R5 (Phase 2); generation returns an in-memory deck stamped with a forward-compatible `lessonId`.

## User stories
- As a **learner**, I want **to choose what my lesson contains and have the AI generate it from my uploaded PDF**, so that **I get a structured deck of instructional and/or activity slides, with my key never leaving the server**.

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then).

**Story AC → scenario map:** default-both + pick → @s1,@s2 · composition passed+enforced → @s6,@s3,@s4,@s5 · ordered typed slides → @s3 · provider call server-side, key off the client/logs → @s7,@s8 · metadata-vs-vision placement → @s9,@s10 · slide image ref / text-only → @s11 · missing/broken ref → text-only → @s12 · activity types + answers + explanation → @s13 · progress state → @s14 · graceful failure, no partial deck → @s15.
**Decisions / states:** picker placement + gating → @s16 · Content/ready → @s17 · provider swap → @s20 · i18n → @s18 · a11y → @s19.

## Architecture & data flow
```
Upload screen (upload.tsx — thin shell; lifts one documentId handoff value, see decision #9)
  └─ ApiKeyGate (R6, existing)                  → blocks the screen when no key is saved
       ├─ PdfUpload (R1, +onExtracted prop)     → extracts a PDF; fires onExtracted(documentId) on success
       └─ LessonGeneration (study-buddy)        → owns composition state (default 'both'); receives documentId prop
            └─ LessonGenerationPanel (components — organism, 4 states)
                 ├─ RadioGroup (existing molecule) → composition picker
                 └─ GenerationProgress (components — new molecule) → labeled multi-step progress
            └─ useLessonGeneration (hooks — plain state: stage, currentStep, result, error)
                 └─ LessonGenerationService (supabase-services — orchestrate + normalize errors)
                      └─ LessonGenerationDao (supabase-services — Supabase DAO)
                           └─ getSupabase().functions.invoke('generate-lesson', { documentId, composition })
                                └─ Edge Function generate-lesson (Deno, first LLM call in the repo):
                                     1. auth caller (JWT) → read documents.pages + document_images (RLS)
                                     2. read decrypted key via get_api_key() RPC (service role, Vault)
                                     3. build prompt enforcing composition
                                     4. Vercel AI SDK @ai-sdk/groq → generateObject(deckSchema)
                                     5. attach images by metadata; vision model for raw images
                                     6. validate → typed deck (mint lessonId) OR typed errorCode
```
- **No external-API DAO in the client libs** (mirrors R6): the Groq call happens *inside* the Edge Function, so the only client DAO is a Supabase DAO (`functions.invoke`).
- **Two server clients in the function** (mirrors both precedents): a caller-JWT client for the RLS-scoped `documents`/`document_images` reads, and a service-role client for the Vault key read.
- **Client sends only `{ documentId, composition }`** — the function reads the (potentially large) extracted text + image rows itself by `documentId`; the client never re-sends content.
- **`documentId` hand-off between the two siblings** — see Open decision #9 for the mechanism, rationale, and discarded alternative.

## UI states (LessonGenerationPanel organism)
| State | Trigger | Notes |
|---|---|---|
| Empty | No deck yet | Composition picker (RadioGroup, default `both`) always visible; **Generate disabled until an extracted document is available**; no progress, no error. *(→ @s1,@s2,@s16)* |
| Loading | Generation in flight | `GenerationProgress` molecule shows ordered labeled steps (Reading content → Generating slides → Attaching images) advancing as the pipeline progresses; picker + Generate disabled; resolves to Content/Error. *(→ @s14)* |
| Content | Generation succeeded | Deck-ready summary (slide count + composition) + primary CTA to open the lesson in the player (R4). A deck whose images degraded to text-only still succeeds and lands here — image degradation is never an error. *(→ @s17,@s12)* |
| Error | Any `GenerationErrorCode` | Readable message per code; recovery affordance (Retry, or "go to Settings" for key errors, or "re-upload" for source errors); announced to assistive tech; panel returns to a usable state. *(→ @s15)* |

## Error contract (`GenerationErrorCode`)
`LessonGenerationService` normalizes every failure — server result or transport — into a typed `GenerationErrorCode` (discriminated type in `@helsoft/types`), so the UI never branches on raw Supabase/function/provider errors.

| Code | Cause | Detected | i18n key | Recovery |
|---|---|---|---|---|
| `missing_key` | No key stored server-side at call time (R6 gate is the primary UX; this is the backstop for a key removed after the gate rendered) | Server | `generation.error.missingKey` → link to Settings | Add a key |
| `invalid_key` | Groq rejects the key (401/403). Since R6 no longer validates on save (see Open decisions), an invalid key is first discovered here. | Server | `generation.error.invalidKey` | Fix key in Settings |
| `rate_limited` | Groq 429 | Server | `generation.error.rateLimited` | Retry |
| `timeout` | Provider/function wall-clock exceeded | Server | `generation.error.timeout` | Retry |
| `generation_failed` | Malformed/unparseable AI response (fails deck-schema validation) or other server processing failure | Server | `generation.error.generationFailed` | Retry |
| `document_not_ready` | `documentId` missing, not owned, or not in `status = 'extracted'` | Server | `generation.error.documentNotReady` | Re-upload |
| `network_error` | Client transport/relay/fetch failure or offline | Client | `generation.error.network` | Retry |
| `unauthenticated` | No active session | Client / server | `generation.error.unauthenticated` | Sign in |

## Slide image reference (extends R3 types)
`libs/types/src/lesson.ts` gains a `SlideImageRef` and an **optional** `image?: SlideImageRef` on `SlideBase` (so any slide kind may carry one). The ref points at the persisted R1 image (`document_images.id` + `storage_path` + dimensions), **not** the bytes — R4 resolves a short-lived signed URL from `storage_path`. Degradation (@s12): a missing ref renders text-only; a ref that fails to resolve/load renders text-only. Generation never fails a slide or the request over an image.

## Progress model (decision — see Open decisions)
The multi-step progress is driven by the **hook** advancing through a fixed, ordered phase list (`reading` → `generating` → `attaching`) that mirrors the real server pipeline order, while the single synchronous `functions.invoke` is in flight; on success it settles to done, on failure to Error. The UI contract is "an ordered list of labeled steps + a current index", so a later upgrade to **server-driven** step advancement (if streaming proves practical in the Edge/AI-SDK runtime) can slot in behind the same hook contract without touching the UI. "Attaching images" completes immediately when the deck has no images.

## Provider & model selection (Groq, via Vercel AI SDK)
- **Provider:** Groq, via `@ai-sdk/groq` (Vercel AI SDK) — the whole app swaps OpenAI → Groq (Open decisions #1).
- **Models (tunable constant behind the SDK seam; confirm current IDs against Groq's model list at build — mirrors R1's spike-and-confirm):**
  - **Text/generation:** `llama-3.3-70b-versatile` — slide-text generation, composition enforcement, and metadata/position-driven image attachment (given an image *manifest* of ids + page + position, no image bytes).
  - **Vision (fallback only):** `meta-llama/llama-4-scout-17b-16e-instruct` (multimodal) — invoked **only** for images that can't be metadata-placed (raw image, no anchoring text), to decide placement or drop.

## Analytics events
**None** — the story specifies none for MVP. *(Note: the PRD's "generation success rate / time" metrics would live here later; deliberately deferred by the story, unlike R1 where analytics were a human-approved add-on.)*

## Feature flags
**None** — the story specifies none for MVP.

## Out of scope / non-goals
- **Lesson persistence / a `lessons` table (R5, Phase 2).** Generation returns an **in-memory** deck stamped with a forward-compatible `lessonId`; it writes no `lessons` row. *(See Open decisions.)*
- **The lesson player (R4).** Rendering the deck (incl. attached images via signed URLs) is R4; this story hands the deck to a player entry point (placeholder nav until R4 lands).
- **Grading/answering activities (R3, done).** The five activity types are *generated* here; rendering + grading are their own shipped stories.
- **The "no key saved" guard rail (R6, done).** Owned by `ApiKeyGate` at the upload screen; generation only adds the call-time `missing_key` backstop.
- **OCR / scanned PDFs, page-range selection, regenerate/adjust, additional providers or a provider picker** — future.
- **Real intermediate server progress via streaming** unless the spike shows it's cheap (see Progress model).

## Open decisions (resolved, with rationale)
- **[#1 Provider swap OpenAI → Groq, cross-cutting]** Swap the whole app to Groq: `AiProvider` (`libs/types/src/api-key.ts:5` + Deno mirror `manage-api-key/provider.ts:5` + allow-list), `DEFAULT_PROVIDER` in `api-key.service.ts:6` (the actually-persisted provider — UI calls `saveApiKey(rawKey)` with no explicit provider, so @s20 hinges on this constant), settings display name + guidance URL (`api-key-settings.tsx:8,14` → `{ groq: 'Groq' }`, `https://console.groq.com/keys`), all 4 locale `guidance` copies, and every `'openai'`/"OpenAI" fixture. **Why:** straight swap (not a picker), per the human. **Correction:** the R6 OpenAI validation probe this was expected to re-point no longer exists (stripped 2026-07-13, `progress/history.md:27`) — swap is type+default+copy+guidance+fixtures only; invalid key is now first discovered at generation time (`invalid_key`).
- **[#2 Model selection]** Two Groq models: `llama-3.3-70b-versatile` for text/generation, `meta-llama/llama-4-scout-17b-16e-instruct` for vision (invoked only as the raw-image fallback). **Why:** maps 1:1 to the AC's two placement branches, keeps the common all-text path cheap/fast (no image tokens per call, helps the ~30s target), bounds vision cost to the rare case. Model IDs live in one tunable constant behind the SDK seam; implementator confirms current IDs at build. **Discarded:** one multimodal model for both — simpler but pays vision-token cost every call.
- **[#3 Composition picker placement]** Same screen as the PDF-upload widget, shown alongside it, default `both`, set before Generate — not a separate step. **Why:** human's resolution; keeps upload→configure→generate one flow. Picker always visible; Generate gated on a successfully extracted document (@s16).
- **[#4 Progress-state UI]** Multi-step discrete labeled progress (Reading content → Generating slides → Attaching images), hook-driven over the fixed phase order — not a spinner/percentage bar. **Why:** human's resolution; gives a sense of the pipeline; stable UI contract so a server-driven upgrade stays non-breaking.
- **[#5 No persistence]** This story returns an in-memory deck stamped with a minted `lessonId` (like `extract-pdf` mints `documentId`); no `lessons` table/row. R5 (Phase 2) owns persistence. **Why:** PRD phases R2 before R5; story lists R4 but not R5 downstream; R7 precedent already deferred the `lessons` table to R5 (`score-results-summary/spec.md:39`). "No partial/corrupt deck" AC is satisfied structurally: generation is atomic (validate full response into typed deck, or typed error — nothing half-written); R1 rows untouched on failure.
- **[#6 Server-side key read]** New `get_api_key(p_user_id)` service-role RPC, `security definer`, `execute` to `service_role` only. **Why:** R6 built save/remove but deliberately left the read to R2 (`ai-key-management/spec.md:45`). Same security model as R6's RPCs — not reachable by `authenticated`; Edge Function derives `p_user_id` from the authenticated caller, never client-supplied. Honors @s7/@s8. Same Vault-vs-pgcrypto fallback caveat as R6 (risks.md).
- **[#7 Placement primary path = position metadata]** Metadata-driven placement is default (every R1 image carries `page_number`+`position_index`); vision model is fallback for images on low/no-text pages with no text-anchored slide. **Why:** R1 always populates position but leaves `description` null currently — position is the always-available signal.
- **[#8 Code location follows R6/pipeline convention]** DAO/service in `@helsoft/supabase-services`, hook in `@helsoft/hooks`, organism/molecule in `@helsoft/components`, wiring in `@helsoft/study-buddy`, contract types in `@helsoft/types`, function in `supabase/functions/generate-lesson/`. **Why:** R6 is the closest analogue (Edge-Function-proxied AI + Supabase DAO + error-normalizing service + plain-state hook + organism/wiring split) and used exactly these layer libs; generation has no `mupdf`-style dependency requiring its own lib. Deno function's pure logic still authored as independently-testable modules, hand-mirrored into `_shared/`, Jest-tested on the JS side (Deno is outside this sandbox's harness, same boundary as R1).
- **[#9 `documentId` hand-off between the two upload-screen siblings]** `PdfUpload` gains an additive, optional `onExtracted?: (documentId: string) => void` prop, fired once when `usePdfExtraction()` first yields a `documentId`; `upload.tsx` lifts one `documentId` (`useState`) and threads it to both siblings — `<PdfUpload onExtracted={setDocumentId} />`, `<LessonGeneration documentId={documentId} />`. **Why:** `PdfUpload` today takes zero props and owns extraction entirely internally — a sibling has no way to read the id otherwise. Additive/optional keeps it backward-compatible; the single `useState` is pure composition glue, not business logic; picker gates Generate on it (`canGenerate = !!documentId`, @s16). **Discarded:** lifting `usePdfExtraction()` into `upload.tsx` — rejected, moves business logic into `app/` and reworks R1's shipped component unnecessarily.
