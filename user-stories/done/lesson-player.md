# Slide navigation & lesson player (R4)

**As a** learner
**I want** a player that shows my generated lesson one slide at a time — with its image if it has one, and its activity component if it's an activity slide — with visible progress and the ability to move forward and back
**so that** I can work through the deck at my own pace, on web or mobile, and answer activities in place before reaching my results

## Context
- PRD's **R4 — Slide navigation & lesson player**, part of Phase 1 (core loop, must demo). The primary consumer of **R1** (extracted images), **R2** (generated slides), **R2.1** (composition choice), and **R3** (activity slide types) — all done.
- Today `apps/app-study-buddy/src/app/(app)/lesson/[id]/{index,player,results}.tsx` are placeholder screens: `player.tsx` renders static text with a stub "finish" link and no real slide rendering; `results.tsx` calls `buildStubLessonResultsFixture` instead of reading real answers. This story replaces the player stub with the real slide-by-slide UI and feeds real graded answers to results.
- **R3's activity organisms already exist** and are done: `activity-multiple-choice.md`, `activity-fill-in-the-blank.md`, `activity-flashcard-recall.md`, `activity-matching.md`, `activity-open-ended.md` (components live in `libs/activities/src/organisms/*`). This story wires those existing, answerable components into the deck — it does not build new activity UI.
- **R7** (`score-results-summary`, done) computes score via `scoreLesson` over a `GradedAnswer[]` and persists an attempt, but shipped against an **injected/stubbed** array, explicitly deferring the live source to "R4 (player) / R9 (resume)". This story supplies that live wiring for a single uninterrupted session.
- **R9** (`resume-mid-lesson`, pending) explicitly flags that it cannot be implemented against today's player stub and must sequence after (or alongside) R4. This story does **not** need to persist position or answered state across sessions/devices/logout — that is R9's job — only to hold them in memory for the current player session so a real `GradedAnswer[]` reaches the results screen.
- **Images:** `Slide.image` is a `SlideImageRef` (`libs/types/src/lesson.ts`) — a reference (`imageId`/`storagePath`/dimensions), never raw bytes. The player is expected to resolve a short-lived signed URL from `storagePath` at render time; a missing or unresolvable reference must degrade to text-only rather than fail the slide (mirrors R2's own AC on this).
- Layering: `Component → Hook → Service → DAO` (`.agents/rules/hooks-service-dao.mdc`). Deck/session state (current slide index, per-slide answered state, image URL resolution) has ≥3 related fields that change together, so it's a `useReducer` candidate per `state.mdc` — left to spec to confirm shape.

## Acceptance criteria
- Given a generated lesson opened from the lesson detail screen, the player shows exactly one slide at a time, starting at the first slide.
- The learner can advance to the next slide and go back to the previous slide using Next/Back buttons; Back is disabled (or hidden) on the first slide.
- Instructional slides render their title and content text. Activity slides render their title, prompt, and the matching answerable R3 component (multiple choice, fill-in-the-blank, flashcard, matching, or open-ended) so the learner can answer in place.
- A slide with an associated extracted image (`SlideImageRef`) renders that image alongside its content, scaled to fit the viewport; a slide without an image — or whose image reference fails to resolve — renders text-only with no error shown to the learner.
- Progress through the deck is visible as a progress bar plus a numeric "slide X of N" indicator, and both update as the learner navigates.
- Going back to a previously-answered activity slide shows its prior in-session answer state (selected option, typed text, flashcard reveal, matched pairs, etc.) rather than resetting it, for the remainder of the current session.
- Advancing past the last slide navigates to the results screen, passing the real lesson and the learner's in-session graded answers (replacing today's stub fixture) so R7's score / completion-state logic reflects what was actually answered.
- The player renders correctly on a web viewport and a mobile viewport (responsive layout); navigation controls and the progress indicator stay usable and visible at both sizes, and images scale appropriately to each.

## Notes
- **Scope decision (confirmed with the requester):** R4 includes wiring the real R3 activity components into the deck (not just navigation/display chrome) — this is the point where the player becomes end-to-end functional and stops feeding R7 a stub.
- **Scope decision:** navigation is Next/Back buttons only (no swipe gesture) — same interaction on web and mobile.
- **Scope decision:** advancing past the last slide auto-navigates to results (no separate "Finish" control).
- Out of scope: persisting position/answers across sessions, devices, or logout (R9 owns that); the results screen's own layout and attempt-persistence logic (R7, done) — R4 only needs to hand it real data instead of the stub fixture.
- Signed URL mechanism/expiry for images (Supabase Storage signed URL vs. public bucket, cache duration) is an implementation detail deferred to spec.
- No analytics event requested for this story; flag to `spec_partner` if one turns out to be wanted.
