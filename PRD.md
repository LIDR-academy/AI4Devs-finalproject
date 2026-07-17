# PRD: AI Study Buddy

**Author:** Hernán Laura
**Status:** Draft v1
**Date:** 2026-06-15
**Context:** AI4Devs bootcamp final project (portfolio). Goal is a shippable, demo-able MVP — scope is deliberately tight.

---

## Problem Statement

Anyone who needs to learn or be tested on the contents of a PDF — a student with a chapter assigned by their school or university, a professional working through a manual or report, someone preparing for an exam or certification — faces the same gap: reading the document passively rarely makes the material stick, and there is no fast way to both **learn it** and **check whether you've actually understood it**. Building study material by hand (slides, quizzes, flashcards) is tedious, so most people just re-read and hope. This app removes that work: it turns any PDF into an AI-generated lesson of alternating **instructional** and **activity** slides, so anyone can study the material and assess their understanding in a single flow, whatever their reason for learning it.

---

## Goals

1. **Turn a PDF into a usable lesson with one upload.** A learner uploads a PDF and receives a generated deck of instructional + activity slides without any manual authoring.
2. **Produce content that demonstrably teaches.** The core success bet is *learning gains* — measured by improvement between activity attempts (retakes) within a lesson.
3. **Work everywhere from one codebase.** Ship to web first, with iOS/Android buildable from the same React Native + Expo project.
4. **Keep AI cost controllable.** Free users bring their own AI API key (near-zero variable cost). A small manually-flagged paid tier may use a platform key for demos — no public billing yet.
5. **Be a clean portfolio artifact.** A reviewable repo with a real architecture (auth, backend, CI/CD) that a hiring manager or instructor can run and evaluate.

---

## Non-Goals

1. **Authoring/editing slides by hand.** v1 generates slides; it does not ship a slide editor. *(Editing is high-effort UI and not needed to prove the core loop.)*
2. **Multi-format ingest (DOCX, PPTX, URLs, video).** PDF only for v1. More formats on v2. *(Each format is its own parsing problem; PDF covers the stated use case.)*
3. **Spaced-repetition / long-term scheduling across lessons.** No cross-lesson review queue yet. *(Valuable but a separate initiative; v1 proves single-lesson learning gains first.)*
4. **Collaboration, sharing, or classroom/teacher features.** Single-user study experience only. *(The app is an individual study tool; multi-user roles and permissions add complexity for little MVP value.)*
5. **Real billing, ads networks, or usage metering.** No Stripe/App Store IAP, no ad-network integration, no token/lesson caps in v1. *(Users have a `plan_id` → `plans` row with capability flags; `show_ads` is stored for later; paid demos use a platform key with no hard cap until v2.)*
6. **Native mobile store releases.** Mobile is buildable but the CI pipeline deploys **web only** at start. *(Store submission is process overhead, not core value.)*
7. **Drag-drop interactions.** Matching activities are in scope (see R3), but implemented as tap-to-select-two-items-to-pair, not drag-and-drop. *(Drag-drop is meaningfully more work on RN + web for little added proof of the learning loop; revisit later.)*

---

## Target Users

Anyone who needs to learn or assess themselves on the contents of a PDF, regardless of why they're learning it — students studying and self-testing on material assigned by a school or university, professionals upskilling from manuals or papers, and people preparing for exams or certifications. **Free** users are comfortable getting an AI API key (or willing to follow a short setup guide). **Paid** users (manually flagged) skip key setup and use the platform key.

---

## User Stories

Grouped by the core loop. Ordered by priority within each group.

### Onboarding & setup
- As a new user, I want to sign up, log in, and log out securely so that my documents and lessons stay private to me and are available whenever I return.
- As a returning user, I want my session to persist across app restarts (until I log out) so that I don't have to re-authenticate every time.
- As a free-tier user, I want to add my own AI API key once and have it securely stored so that I don't re-enter it every session.
- As a free-tier user, I want clear guidance on where to get an API key so that setup doesn't block me.
- As a paid-tier user, I want to generate lessons without supplying an API key so that setup stays frictionless.
- As the product, I want plan **flags** (key source, key-settings visibility, ads flag, create gate) enforced client-side and server-side so free vs paid behave correctly even if the UI is bypassed.

### Generating a lesson
- As a learner, I want to upload a PDF and have the app generate a lesson so that I can start studying without manual prep.
- As a learner, I want to choose whether the lesson is instructional-only, activity-only, or both, so that I get the format that fits how I want to study (e.g. just learn, just test myself, or both).
- As a learner, I want to see generation progress (and a clear error if the PDF can't be parsed) so that I'm not staring at a blank screen.

### Studying & activities
- As a learner, I want to move through slides one at a time so that I can focus on a single concept or question.
- As a learner, I want to answer activity slides (multiple choice, fill-in-the-blank, flashcards, open-ended, matching) and get immediate feedback so that I know whether I understood.
- As a learner, I want to see my score at the end of the lesson so that I can gauge how much I learned.

### Returning
- As a learner, I want my generated lessons saved so that I can resume or retake them later.
- As a learner, I want to leave a lesson partway through and return to the exact slide I left off so that I don't lose my place or have to start over.
- As a learner, I want to retake a lesson's activities so that I can measure improvement (learning gains).

### Localization
- As a multilingual user, I want the app to display in my language and let me switch languages in-app so that I can study comfortably in the language I understand best (web, iOS, or Android).
- As a user who changes the app language, I want to be told when my language choice couldn't be saved, with a way to try again, so that I'm not surprised by it reverting after a restart.

### Project foundation (developer) — ✅ done
- As a developer, I want the monorepo scaffolded and the backend provisioned so that every story above can be built and verified on a working foundation. Delivered: Turborepo + pnpm workspaces (`apps/`, `libs/`, `supabase/`); universal Expo app (`app-study-buddy`, web/iOS/Android with Expo Router); shared `@helsoft/*` libs (types, components, hooks, services, study-buddy) with the Supabase client initialized at app startup; Storybook on react-native-web (template lib `lib-with-storybook` + stories in `components`); hosted Supabase project created, linked to the repo and wired via env vars; agent rules in `.agents/rules/` aligned with this architecture; `build`/`lint`/`check-types`/`clean` pipeline green from the repo root.

---

## Requirements

### Must-Have (P0) — the MVP cannot ship without these

~**R1 — PDF upload & backend content extraction (text + images)** *(highest technical risk — build first)*~
Description: User uploads a PDF; **content extraction runs on the backend (Supabase Edge Function / storage-triggered function), not on the client.** The server extracts both the readable text and the embedded images, stores the images (Supabase Storage), and returns the text plus references to the extracted images. This is the riskiest piece and should be the first task delivered.
Acceptance criteria:
- Given a PDF, when the user uploads it, then the backend processes the whole document — every page — and extracts both its selectable text and its embedded images, returning success to the client.
- Given a PDF that contains embedded images (diagrams, figures, charts, photos), when extraction runs, then those images are extracted, downscaled/recompressed (reduced dimensions + quality to limit storage cost and clutter), persisted to storage, and associated with the page/position they came from so generation can reference them.
- Given a PDF with mixed pages (some text-only, some text+image, some image-only figures), when extraction runs, then text and images are captured from across all pages and kept in document order.
- Extraction logic lives server-side so it behaves identically regardless of platform (web, iOS, Android) — the client never parses the PDF.
- Given an unsupported or image-only/scanned PDF (text rendered as a scanned image), when extraction runs, then the user sees a clear error explaining the file can't be used (OCR of scanned text is out of scope for v1 — note this differs from extracting embedded figures, which is supported).
- Given a file over the size limit, then the upload is rejected with a clear message.

~**R2 — AI lesson generation (instructional + activity slides)**~
Description: The extracted text **and the extracted images (R1)** are sent to the AI **through a Supabase Edge Function that injects the user's stored key server-side** (the key and the provider call never live in the client). The function uses the **Vercel AI SDK** so providers/models are swappable without reworking generation. It returns a structured deck of typed slides, honoring the lesson composition chosen in R2.1, and may attach relevant extracted images to slides.
Acceptance criteria:
- Given extracted text, when generation runs, then the result is an ordered list of slides each typed as `instructional` or `activity`.
- The AI provider call is made from the Edge Function via the Vercel AI SDK, not the client; the key is read server-side and never exposed to the device or logs.
- Image placement: where the extracted image carries a description/position (from R1), generation uses that metadata to choose the slide; where only the raw image is available, a vision-capable model decides placement. Either way the generated slide references the stored image (R1) so it renders alongside the content; slides without a relevant image render text-only.
- Image references in the generated deck point to persisted images; a missing or broken image reference degrades gracefully to text-only rather than failing the slide.
- Activity slides include: multiple choice, fill-in-the-blank, flashcard, open-ended, and matching types (see R3 for details).
- Each activity slide carries the correct answer(s) and, where applicable, an explanation.
- Generation shows progress state and surfaces a readable error on failure (bad key, rate limit, timeout) without crashing.

~**R2.1 — Lesson composition choice (instructional / activity / both)**~
Description: Before generating, the learner chooses what the lesson should contain: instructional slides only, activity slides only, or both.
Acceptance criteria:
- Before generation, the learner can pick one of: `instructional only`, `activity only`, `both`. Default is `both`.
- Given `instructional only`, when generation runs, then the deck contains only instructional slides and no activity slides.
- Given `activity only`, when generation runs, then the deck contains only activity slides and no instructional slides.
- Given `both`, when generation runs, then the deck contains a mix of instructional and activity slides.
- The chosen composition is passed to the Edge Function (R2) and reflected in the generated deck; the prompt enforces it.
- Edge case: if `activity only` is chosen, the end-of-lesson score (R7) still works; if `instructional only` is chosen, there are no activities to score and the results summary reflects that (no score shown).

~**R3 — Activity slide types with feedback**~
Description: Render and grade the supported activity types.
Acceptance criteria (per type):
- Multiple choice: learner selects an option; correct/incorrect feedback shown immediately.
- Fill-in-the-blank: learner types an answer; graded against accepted answer(s) (case-insensitive, trimmed).
- Flashcard / recall: learner reveals the answer and self-marks recalled / not recalled.
- Open-ended / short answer: learner submits free text; shown a model answer for self-assessment (not auto-graded in v1).
- Matching: learner pairs related items by tapping one item then its match (no drag-drop); correctness shown on submit.
- *(P0 floor: multiple choice + fill-in-the-blank + flashcards. Open-ended / short answer and matching are also in scope for v1. Drag-drop interaction is **out of scope** — matching uses tap-to-select-two — see Non-Goals.)*

~**R4 — Slide navigation & lesson player**~
Description: A player to move through the deck one slide at a time.
Acceptance criteria:
- Given a generated lesson, the learner can advance and go back through slides.
- A slide that has an associated extracted image (R2) renders that image alongside its content; image-less slides render text-only.
- Progress through the deck is visible.
- The player works on web and on a mobile viewport (responsive), and images scale appropriately to the viewport.

~**R5 — Lesson persistence**~
Description: Lessons saved per user.
Acceptance criteria:
- A generated lesson is persisted to the user's account and reappears after logout/login.
- A logged-out user cannot access another user's lessons (row-level security).

**R5.1 — Auth & sign-up**
Description: User can sign up, log in, and log out.
Acceptance criteria:
- User can sign up, log in, and log out.

~**R6 — Bring-your-own AI key (server-side proxy)**~
Description: **Free-tier** user stores their own API key; **all AI calls are proxied through a Supabase Edge Function** so the key is used server-side and never reaches the client at call time. Paid-tier key source is R10.
Acceptance criteria:
- Free-tier user can save, update, and remove their key.
- The key is stored encrypted/secured server-side, scoped to the user, never returned to the client after save, and never written to logs.
- For free tier, generation reads the user key inside the Edge Function (R2); the client only triggers the function and never holds the raw key during a request.
- Free-tier generation fails gracefully with guidance if no key is set.

~**R7 — Score / results summary**~
Description: End-of-lesson summary showing performance.
Acceptance criteria:
- After completing activity slides, the learner sees a score (correct / total on auto-gradable types).
- Retaking the lesson records a new score so improvement is visible.
- For an instructional-only lesson (R2.1), the summary shows a completion state instead of a score, since there are no activities to grade.

**R8 — Cross-platform build & web CI/CD**
Description: One Expo codebase; GitHub Actions builds and deploys web.
Acceptance criteria:
- The app runs via Expo on web, iOS, and Android (web is the deployed target).
- On merge to main, GitHub Actions builds the web app and deploys it.
- A failing build blocks deploy.

**R9 — Resume mid-lesson**
Description: The learner's position in a lesson is saved so they can leave and return to the exact slide they left off.
Acceptance criteria:
- As the learner advances through slides, their current position is persisted to their account (not just local state).
- Given an in-progress lesson, when the learner reopens it (including after logout/login or on another device), then they resume at the exact slide they left off.
- Already-answered activity slides retain their state on resume so progress and score (R7) stay consistent.
- A completed lesson can be restarted from the beginning (and retaken per R7).

~**R10 — Plan flags & key-source routing**~
Description: Each user has a `profiles.plan_id` FK to `public.plans` (default `free` on signup via trigger). Capabilities come from **live plan flags** — never `plan === 'paid'` / `plan === 'free'` branches. Seeded `free` / `paid` rows set the flags below; additional plan ids are allowed via FK. Flip `plan_id` manually in the Supabase dashboard — no billing UI. Client exposes profile via `useProfile` / `ProfileProvider`; Edge `generate-lesson` routes the AI key from `use_platform_key` only.

Plan flags (seeded defaults):

| Flag | Free | Paid | Effect |
|---|---|---|---|
| `use_platform_key` | false | true | Edge key route; client `canCreate = use_platform_key` or saved key |
| `show_key_settings` | true | false | BYOK settings visibility |
| `show_ads` | true | false | Exposed on client profile; **no ad UI** in v1 |

Acceptance criteria:
- New signups get exactly one profile with `plan_id = free`.
- Client loads flags via profiles→plans join (`useProfile`); shows key settings when `show_key_settings`; create/upload when `canCreate`; exposes `showAds` unused.
- `!canCreate`: create/upload hidden; upload shows contact-support copy (`upload.cannotCreate`). If generate is invoked anyway with `use_platform_key=false` and no user key, Edge rejects with `missing_key`.
- `use_platform_key=false` + saved key: generation uses the user's Vault key (R6).
- `use_platform_key=true`: key settings hidden; generation uses `PLATFORM_GROQ_API_KEY`; server never reads the user key; missing/unusable platform key → `platform_key_unavailable` (server error + retry, not a "add your key" CTA).
- Plan flip (e.g. paid → free): existing lessons stay playable; next profile load and next generate use live flags (no redeploy).
- Crafted client plan / entitlement / keySource fields are ignored — Edge always reads live `use_platform_key`.
- Authenticated clients can select-own profile and read plans; they cannot mutate `plan_id`.

### Nice-to-Have (P1) — fast follows, core works without them

- **Regenerate / adjust** a lesson (e.g., "make it harder," "more activities," fewer slides).
- **Per-slide difficulty or topic tagging** surfaced to the learner.
- **Page-range selection** so a learner can generate from part of a long PDF.
- **Open-ended auto-grading** via AI (instead of self-assessment).

### Future Considerations (P2) — out of scope, but design shouldn't block them

- Spaced-repetition review queue across lessons (data model should allow per-activity attempt history).
- Additional ingest formats (DOCX, URLs) — keep extraction decoupled from generation.
- **Billing + paid usage metering.** Stripe (or similar) and a **token-based hard cap** on platform-key usage when `use_platform_key` is true. v1 ships manual `plan_id` flips + uncapped platform key for trusted demos only (R10).
- **Ad network integration** driven by the existing `show_ads` / `showAds` flag (R10) — UI/network out of scope until then.
- Native app store releases via the same CI pipeline.
- Drag-drop interaction for matching (v1 uses tap-to-select-two).
- Sharing or exporting a generated deck (e.g., to PPTX/PDF).

---

## Success Metrics

The headline bet is **learning gains**, with supporting funnel and quality metrics.

### Leading indicators (days → weeks)
- **Generation success rate:** % of uploads that produce a usable lesson. Target: ≥ 90% of supported (non-scanned) PDFs. *Measure: generation events succeeded / attempted.*
- **Lesson completion rate:** % of started lessons where the learner reaches the results summary. Target: ≥ 60%.
- **Activity engagement:** median % of activity slides attempted per started lesson. Target: ≥ 70%.
- **Generation time:** median time from upload to first slide. Target: under ~30s for a typical chapter-length PDF (model-dependent).

### Lagging indicators (weeks → months)
- **Learning gain (primary):** improvement in score on lesson retake. Success threshold: average +15 percentage points on retake; stretch: +25. *Measure: per-user delta between first and best/second attempt on auto-gradable activities.*
- **Repeat usage:** % of users who generate a second lesson within 14 days. Target: ≥ 30%.

### Measurement notes
- Instrument generation, slide views, activity attempts (with correctness), and completion as events tied to user + lesson.
- Evaluate the primary metric on a small cohort (even classmates/testers) at ~2 and ~4 weeks post-launch.

---

## Resolved Decisions

- **AI key handling:** proxied through a **Supabase Edge Function**. The key is stored server-side and the provider call is made from the function — the client never holds the key at call time. (Drives R2, R6.)
- **AI integration layer:** use the **Vercel AI SDK** (ai-sdk.dev) so the app is provider-agnostic and can switch between providers/models without reworking the generation code. (Drives R2.)
- **PDF content extraction:** runs on the **backend** (Edge Function), not the client. It is the **highest technical risk and the first task to build**. (Drives R1.)
- **Image storage:** extracted images are **downscaled and recompressed** (reduced dimensions + quality) before storage to limit storage cost and on-slide clutter. (Drives R1.)
- **Image placement:** when the extracted image carries a description/position, generation uses that metadata to pick the slide; when only the raw image is available, a vision-capable model decides placement. (Drives R2.)
- **Learning-gain measurement:** measured via **retake improvement only**. No pre/post quiz in this project. (Drives Success Metrics.)
- **Matching:** **in scope** for v1, implemented as tap-to-select-two-items-to-pair (no drag-drop). Open-ended / short answer also stays in. (Drives R3, Non-Goals.)
- **Plans:** `profiles.plan_id` → `plans` flag rows (seeded `free` / `paid`; flip via dashboard). Flags: `use_platform_key`, `show_key_settings`, `show_ads`. Client `canCreate = use_platform_key || hasKey`; Edge routes on live `use_platform_key`. No Stripe, no ads UI, no hard cap in v1. (Drives R10; extends R6.)

## Open Questions

- **[Eng — research spike]** Which server-side PDF extraction approach works in the Edge Function runtime (Deno) and can extract both text and embedded images with page/position info? Candidate to evaluate first: [liteparse](https://github.com/run-llama/liteparse); compare against other PDF parsers. The spike should also confirm whether it can detect scanned/image-only PDFs to trigger R1's error path. *Blocking for R1.*
- **[Product]** Max PDF size / page count for v1, given generation cost and latency — to be determined by the team through testing. *Non-blocking; set a sensible cap after the R1 spike.*

---

## Timeline Considerations

This is a bootcamp final project, so phase to guarantee a working demo of the **core loop** (upload → generate → study → score) before polishing.

**Phase 0 — Foundations & de-risking (do first):** Two first deliverables — (a) authentication with Supabase Auth (sign up / log in / log out; the first work ticket and the `auth.uid()` foundation that RLS later builds on), and (b) a research spike on PDF extraction (evaluate liteparse and alternatives for text + images + position info + scanned-PDF detection) followed by the backend extraction Edge Function (R1), proven on real PDFs. Extraction is the highest technical risk.

**Phase 1 — Core loop (must demo):** R2 generation (via Edge Function proxy), R2.1 composition choice, R3 (MCQ + fill-in-blank + flashcards + open-ended + matching), R4 player, R7 score.

**Phase 2 — Persistence & platform:** R5 lesson persistence + RLS (auth itself lands in Phase 0), R6 server-side bring-your-own key, R9 resume mid-lesson (depends on persistence), R8 web CI/CD on GitHub Actions.

**Phase 3 — Polish & plans:** ~R10 plan flags + key-source routing~ (shipped); P1 items as time allows; mobile responsiveness pass.

**Dependencies & sequencing:**
- Authentication (R5 auth) and backend PDF extraction (R1) are the first deliverables — auth is the foundation for per-user data and RLS; extraction is the highest technical risk and everything downstream depends on it.
- The Edge Function proxy pattern is shared by R1, R2, R6, and R10 — build the function scaffolding once, early; R10 extends the same proxy to swap key source from live `use_platform_key`.
- CI/CD (R8) deploys web only at start; native builds are validated locally but not released.

---

## Appendix: Constraints (as specified)

- **Stack:** React Native + Expo, targeting Android, iOS, and web via react-native-web.
- **Auth + backend:** Supabase.
- **CI/CD:** GitHub Actions — initially build + deploy **web** only.
- **AI usage:** free-flagged users supply their own API key; `use_platform_key` plans use `PLATFORM_GROQ_API_KEY`. Calls go through the **Vercel AI SDK**. Key source resolved server-side from live plan flags (R10).
- **PDF extraction:** server-side, candidate library [liteparse](https://github.com/run-llama/liteparse) pending the R1 research spike.
