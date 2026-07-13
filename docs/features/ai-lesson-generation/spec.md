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
- **`documentId` hand-off between the two siblings (decision #9):** `PdfUpload` (R1) gains an **additive, optional** `onExtracted?: (documentId: string) => void` prop, fired **once** when its own `usePdfExtraction()` result first yields a `documentId`; `upload.tsx` lifts a single `documentId` value (`useState`) and threads it to both siblings — `<PdfUpload onExtracted={setDocumentId} />` and `<LessonGeneration documentId={documentId} />`. That handoff value is the **only** state the screen holds; all business logic (composition state, orchestration, error normalization) stays in the libs, so `upload.tsx` stays a thin shell. See Open decision #9 for the rationale and the discarded alternative.

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
- **[#1 Provider swap OpenAI → Groq — cross-cutting, touches shipped R6 code] Decision: swap the whole app to Groq.** Update `AiProvider` (`libs/types/src/api-key.ts:5` and the mirror `supabase/functions/manage-api-key/provider.ts:5` + its `AI_PROVIDERS` allow-list), the **service-side default provider** `libs/supabase-services/src/services/api-key.service.ts:6` (`const DEFAULT_PROVIDER: AiProvider = 'openai'` → `'groq'` — this is the provider actually persisted when `ApiKeyService.saveApiKey(rawKey)` is called with no explicit provider, which is how the UI calls it, so @s20's "stored provider resolves to Groq" hinges on it), the settings display name + guidance URL (`libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx:8,14` → `{ groq: 'Groq' }`, `https://console.groq.com/keys`), the `settings.apiKey.guidance` copy in all four locales (en/es/pt/de), and every `provider: 'openai'` / "OpenAI" test/story/e2e fixture the type + copy change breaks. — **why:** the human chose a straight swap (not a picker) so the stored key + generation call both target Groq. **Correction to the brief:** the R6 OpenAI *validation probe* the swap was expected to re-point **no longer exists** — it was stripped on 2026-07-13 (`progress/history.md:27`; `manage-api-key` now stores keys directly, `handle-save.ts` has no probe). So the swap reduces to type + default-provider + copy + guidance + fixtures; there is no probe endpoint to change. A consequence: an invalid key is now first discovered at **generation** time → the `invalid_key` code above is a first-class path. Documented as a dependency in `risks.md`.
- **[#2 Model selection — left to spec_partner by the story] Decision: two Groq models — `llama-3.3-70b-versatile` for text/generation, `meta-llama/llama-4-scout-17b-16e-instruct` for vision, vision invoked only as the raw-image fallback.** — **why:** this maps 1:1 to the AC's two placement branches ("metadata drives" vs "vision decides"), keeps the common all-text path cheap/fast (no image tokens on every call → helps the PRD's ~30s target), and bounds vision cost to the rare raw-image case. Model names live in one tunable constant behind the `@ai-sdk/groq` seam so PRD R2's "swap models without reworking generation" holds; the implementator confirms current Groq model IDs at build. **Discarded:** a single multimodal model for both — simpler but pays vision-token cost on every generation.
- **[#3 Composition picker placement] Decision: same screen as the PDF-upload widget, shown alongside/below it, default `both`, set before Generate; not a separate step.** — **why:** the human's resolution; keeps upload→configure→generate one continuous flow. The picker is always visible; Generate is gated on a successfully extracted document (@s16).
- **[#4 Progress-state UI] Decision: multi-step discrete labeled progress (Reading content → Generating slides → Attaching images), hook-driven over the fixed phase order (see Progress model), not a bare spinner or percentage bar.** — **why:** the human's resolution; gives the learner a sense of the pipeline. Kept behind a stable UI contract so a server-driven upgrade is non-breaking.
- **[#5 No persistence — generation returns an in-memory deck] Decision: this story does NOT create a `lessons` table or persist the deck; the Edge Function returns a typed deck stamped with a minted `lessonId` (like `extract-pdf` mints a `documentId`), and R5 (Phase 2) owns persistence.** — **why:** PRD phases R2 (Phase 1) before R5 (Phase 2); the story lists R4 but **not** R5 as a downstream, and the R7 precedent explicitly deferred the `lessons` table to R5 (`score-results-summary/spec.md:39`; `lesson_attempts.lesson_id` is a soft reference, `20260711041422_create_lesson_attempts.sql:3`). The story's "no partial/corrupt deck is persisted" AC is then satisfied **structurally**: generation is atomic (validate the full AI response into a typed deck, or return a typed error — nothing half-written), and because it writes no deck, there is by construction never a partial one; the R1 `documents`/`document_images` rows are untouched on failure. The minted `lessonId` is the forward-compatible handle R5 will adopt as PK and that `lesson_attempts.lesson_id` can later point at.
- **[#6 Server-side key read — new migration] Decision: add a `get_api_key(p_user_id)` service-role RPC that returns the decrypted Vault secret, `security definer`, `execute` granted to `service_role` only.** — **why:** R6 built `save_api_key`/`remove_api_key` but deliberately left the read to R2 (`ai-key-management/spec.md:45`). Same security model as the R6 RPCs: not reachable by `authenticated`, so the client physically cannot read plaintext; the Edge Function authenticates the caller and supplies `p_user_id` itself (never a client-supplied id). Honors @s7/@s8 (key server-side only, never logged). Same Vault-vs-`pgcrypto` fallback caveat as R6 applies (risks.md).
- **[#7 Placement primary path = position metadata] Decision: every R1 image already carries `page_number` + `position_index` (`document_images`), so metadata-driven placement is the default (anchor an image to a slide derived from its source page's text); the vision model is the fallback for images on low/no-text pages where no text-anchored slide exists.** — **why:** R1 populates position for every image but leaves `description` null in its current output, so "position metadata" is the always-available signal; this reads the AC's two branches as "text/position-anchored" vs "needs a look at the pixels".
- **[#8 Placement + code location follow the R6/pipeline convention, not a new feature lib] Decision: DAO/service in `@helsoft/supabase-services`, hook in `@helsoft/hooks`, organism/molecule in `@helsoft/components`, wiring in `@helsoft/study-buddy`, contract types in `@helsoft/types`, function in `supabase/functions/generate-lesson/`.** — **why:** R6 (the closest analogue — Edge-Function-proxied AI, Supabase client DAO, error-normalizing service, plain-state hook, organism + wiring split) used exactly these layer libs. `@helsoft/pdf-upload-extraction` is its own lib only because of the heavy `mupdf`/Deno-mirror concern (and was an ad-hoc refactor, not the pipeline); generation has no equivalent client-side dependency. The Deno function's pure logic (prompt builder, deck schema/validation, image-placement, deck assembly) is still authored as pure, independently-testable modules — mirrored by hand into `_shared/` and Jest-tested on the JS side — because Deno sits outside this sandbox's Jest/Stryker harness (same boundary as R1).
- **[#9 `documentId` hand-off between the two upload-screen siblings] Decision: `PdfUpload` gains an additive, optional `onExtracted?: (documentId: string) => void` callback prop (fired once when its own `usePdfExtraction()` result first yields a `documentId`); `upload.tsx` lifts a single `documentId` value with `useState` and threads it to `PdfUpload` (`onExtracted={setDocumentId}`) and `LessonGeneration` (`documentId={documentId}`).** — **why:** `PdfUpload` today takes **zero props** and owns `usePdfExtraction()` / `result.documentId` entirely internally (`libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx`), so a sibling has no way to read the id — the hand-off has to be built. An additive optional callback is backward-compatible (existing R1 callers omit it → identical behavior) and keeps `PdfUpload` owning its own extraction lifecycle. The single `documentId` `useState` the screen keeps is pure composition glue (not business logic), and the picker gates Generate on it (`canGenerate = !!documentId`, @s16). **Discarded:** lifting `usePdfExtraction()` itself up into `upload.tsx` so both siblings read `documentId` from a shared parent hook — rejected because it moves hook/business logic into `app/` (AGENTS.md: business logic lives in libs, not the screen) and reworks R1's shipped, tested component more than necessary.
