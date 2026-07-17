# AI lesson generation with composition choice (R2 + R2.1)

**As a** learner
**I want** to choose what my lesson should contain and have the AI generate it from my uploaded PDF
**so that** I get a structured deck of instructional and/or activity slides, with my key never leaving the server

## Context
PRD R2 (generation) + R2.1 (composition choice), combined into one story since R2.1 has no acceptance criteria independent of generation — it only supplies a parameter to the same Edge Function call.

- Depends on R1 (done): extracted text + persisted images are the generation input.
- Depends on R6 (done, `ai-key-management.md`): the Edge Function reads the user's stored key server-side; if no key is saved, generation fails gracefully per that story — this story doesn't re-specify that path.
- Feeds R3 (done): the five activity types (multiple choice, fill-in-the-blank, flashcard, open-ended, matching) are generated here but graded/rendered by their own stories.
- Feeds R4 (pending): the player renders whatever deck this story produces, including attached images.
- Feeds R7 (done, `score-results-summary.md`): composition choice drives the instructional-only "no score" edge case already specified there.
- Provider call is server-side only, via the Vercel AI SDK (ai-sdk.dev), so providers/models are swappable without reworking generation — never called from the client.
- Image placement: if R1 attached a description/position to an extracted image, generation uses that metadata to choose the slide; otherwise a vision-capable model decides placement. Either way the slide stores a reference to the persisted image (not the image itself); a missing/broken reference degrades to text-only rather than failing the slide.
- Composition picker (`instructional only` / `activity only` / `both`, default `both`) appears before the generate action triggers; exact screen/placement is a UI decision for spec/build, not prescribed here.

## Acceptance criteria
- Given the composition picker, when the learner has not changed it, then `both` is selected by default; they can instead pick `instructional only` or `activity only`.
- Given a chosen composition, when the learner triggers generation, then it's passed to the Edge Function and enforced in the prompt: `instructional only` → no activity slides in the result; `activity only` → no instructional slides; `both` → a mix of both.
- Given extracted text (and images) as input, when generation runs, then the result is an ordered list of slides, each typed as `instructional` or `activity`.
- The provider call happens inside the Edge Function via the Vercel AI SDK; the stored key is read server-side and is never exposed to the client or written to logs.
- Given an extracted image with description/position metadata, when generation runs, then that metadata drives which slide it's attached to; given only a raw image, a vision-capable model decides placement instead.
- Given a slide with a relevant image, when it's generated, then the slide carries a reference to the persisted (R1) image so the player can render it alongside the content; given no relevant image, the slide is text-only.
- Given a slide's image reference turns out missing or broken, when the slide is generated or rendered, then it degrades to text-only rather than failing the slide or the generation request.
- Given `activity only` or `both` composition, when activity slides are generated, then each one is one of: multiple choice, fill-in-the-blank, flashcard, open-ended, or matching (per R3's per-type contracts), and carries the correct answer(s) plus an explanation where applicable.
- While generation is running, the learner sees a progress state.
- Given generation fails (bad key, provider rate limit, timeout, or malformed AI response), when the failure occurs, then the learner sees a readable error instead of a crash, and no partial/corrupt deck is persisted.

## Notes
- Open decision (non-blocking, for `spec_partner`): which provider/model is the default behind the Vercel AI SDK call, and the exact vision-capable model used for image-placement decisions.
- Open decision (non-blocking, for `spec_partner`): where the composition picker lives in the upload→generate flow (same screen as upload vs. a separate step).
- The no-key failure path itself is owned by `ai-key-management.md` (R6) — this story only needs generation to fail gracefully when that precondition isn't met.
- No analytics event or feature flag specified for MVP.
