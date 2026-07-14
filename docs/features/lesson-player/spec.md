---
feature: lesson-player
story: user-stories/in-progress/lesson-player.md
status: approved
---

# Spec — lesson-player

Replaces the placeholder player with a real slide-by-slide deck: loads a generated lesson, renders one slide at a time (instructional or answerable R3 activity, with its image), shows progress + Next/Back, and ends on a **results slide that is the final step of the same deck** (R7 `LessonResults` rendered inline from real in-session answers) — ending R4's stub feed.

## User stories
- As a **learner**, I want to move through my lesson one slide at a time — with images and in-place activities, visible progress, and forward/back — ending on my results inside the same deck, so that I answer activities before seeing my results, on web or mobile.

## Acceptance criteria
→ **[`gherkin-scenarios.md`](./gherkin-scenarios.md)** — each `@s` scenario is an acceptance criterion (Given/When/Then).

## UI states
| State | Trigger | Notes |
|---|---|---|
| Loading | lesson fetch in flight | spinner, no slide yet (@s17) |
| Content | lesson loaded, ≥1 slide | the deck: progress + one step + Next/Back; last step is the inline results slide (@s1–@s14, @s20–@s22) |
| Empty | lesson loaded, 0 slides | message + Back only; no deck, no results slide, no retry (@s15) |
| Error | lesson fetch failed | message + Retry + Back (@s16) |

Per-slide: image resolves to a scaled image or degrades silently to text-only (@s7–@s9).

## Analytics events
None for R4 (decision).

## Feature flags
None.

## Out of scope / non-goals
- Persisting position/answers across sessions, devices, or logout — **R9**.
- Results screen scoring/attempt-persistence internals — **R7 (done)**; R4 only feeds `LessonResults` real data, inline.
- Standalone `results.tsx` route + `index.tsx` "View results" link — legacy deep-links, out of R4's happy path (still on the stub), deferred to R9.
- Building new activity UI — R4 wires the **existing** R3 organisms.
- Swipe navigation — Next/Back buttons only, same on web + mobile.

## Open decisions (resolved, with rationale)
- **Results is the last slide of the deck** (`N = contentSlides + 1`): Next off the last content slide enters it; Back enabled (→ last content slide, answers restored); Next hidden on it. *Why:* reached/left by normal navigation — no dead-end route hop.
- **Graded answers finalized on entering results** — `GradedAnswer{isCorrect:false}` for every unanswered activity; score recomputed (pure) each entry. *Why:* unanswered count as wrong (not omitted); complete array is R9-friendly.
- **Save the attempt once per session** — first entry persists (R7); Back then re-enter shows the score UI **without** saving again; retake allows a new save. Gated by an `attemptSaved` deck flag + a backward-compatible `persistOnMount` prop on `LessonResults`. *Why:* results is an unmount-on-leave step, so R7's save-on-mount would otherwise record an attempt per visit.
- **Results fed inline from deck state** (not router params, not a cross-route store). *Why:* in-deck = no route hop; deck state already holds lesson + answers.
- **Retake = in-deck reset** — wipe answers + `attemptSaved`, return to first content slide. *Why:* fresh attempt in the same deck; no navigation.
- **Skip allowed** — Next never gates on an answer. *Why:* self-paced study.
- **Images via Supabase signed URL** from `SlideImageRef.storagePath` (bucket `pdf-images`); missing/failed → text-only, no error. *Why:* refs aren't bytes; mirrors R2's degrade AC.
- **0-slide lesson → Empty + Back** (not error/retry). *Why:* nothing failed; nothing to play.
- **Load failure → Error + Retry + Back** *(spec_partner decision).* *Why:* transient I/O; mirrors `useLessons.refetch` / `useLessonAttempt.retry`.
- **Deck state as `useReducer`** — `currentIndex` + `answers` + `attemptSaved`; transitions next/back/answer/markAttemptSaved/reset. *Why:* `state.mdc` threshold + testable transitions + R9 readiness.

## Layering
`Component → Hook → Service → DAO` (`hooks-service-dao.mdc`). New: full-lesson fetch stack (task-1) + signed-image stack (task-3); deck state per `state.mdc`.
