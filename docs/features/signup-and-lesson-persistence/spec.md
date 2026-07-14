---
feature: signup-and-lesson-persistence
story: user-stories/in-progress/signup-and-lesson-persistence.md
status: approved
---

# Spec — signup-and-lesson-persistence
_Terse overview. ACs live in `gherkin-scenarios.md`; task/impl detail in `task-N.md`; risks in
`tmp/signup-and-lesson-persistence/risks.md`. Link, don't copy._

## Summary
PRD **R5** persistence remainder: generated lessons are stored server-side under the learner's
`auth.uid()`, listed on Home (newest first, all), reopenable in the existing player flow, and
deletable with confirmation — all isolated by Postgres RLS. **Sign-up is carved out** to
`user-stories/pending/sign-up.md` and is not part of this feature.

## User stories
- As an **authenticated learner**, I want my generated lessons saved to my account, listed on Home,
  reopenable, and deletable, so that my study materials are private to me, still there next login,
  and removable when I don't need them.

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then).

## UI states (LessonList organism)
| State | Trigger | Notes |
|---|---|---|
| Loading | Lessons request in flight | Progress indicator; announced (@s13) |
| Content | ≥ 1 saved lesson | Title + created date per item, newest first, show all; open + delete affordances (@s4) |
| Empty | Zero saved lessons | Empty state inviting lesson creation; never another user's data (@s5) |
| Error | Lessons request failed | Message + retry action (@s14) |

## Analytics events
None — out of scope for MVP (per story).

## Feature flags
None.

## Out of scope / non-goals
- Sign-up / email verification / forgot-password (→ `pending/sign-up.md`).
- Rename lesson; resuming mid-lesson (R9) — reopen starts from the top.
- Pagination / search / sort controls (show all, newest first only).
- Full player rendering (R4) — reopen enters the existing `/lesson/[id]` flow.
- Retry idempotency/dedupe (a retry may create a second lesson row).

## Open decisions (resolved, with rationale)
- **FK this story** — `lesson_attempts.lesson_id` → `lessons.id`, `on delete cascade` — **why:** the
  soft ref was deferred "until the lessons table (R5)"; delete should remove orphaned attempts.
- **Server-side persist in the Edge Function** — `generate-lesson` writes the `lessons` row (title +
  ordered slides) under the caller's `auth.uid()` before returning; client never inserts — **why:**
  story decision #2; deck is validated server-side, key/logic stay server-side.
- **`lessonId` = real DB id** — the persisted row id replaces the minted in-memory id — **why:**
  player + `lesson_attempts` key on it; player opens only for a persisted lesson (@s3).
- **Persist fail → retry only** — new `persist_failed` `GenerationErrorCode`, recovery `retry`; no
  in-memory-only play path — **why:** story decision #3; atomic success-or-retry.
- **Newest first, show all** — no pagination — **why:** story decision #5.
- **Delete in, rename out** — with confirmation dialog — **why:** story decision #6.
- **RLS mirrors `lesson_attempts`** — `user_id default auth.uid()`, policies `user_id = auth.uid()`
  for select/insert/delete — **why:** proven Phase-0 pattern; server-enforced isolation (@s11/@s12).
- **Plain-state `useLessons` (not tanstack-query)** — `useState`/`useEffect` + `refetch` — **why:**
  tanstack-query still not installed; matches `useAuth`/`useApiKey`/`useLessonAttempt` precedent.
- **`LessonList` presentational, `SavedLessons` wires it** — organism receives pre-formatted labels;
  wiring formats dates/copy via `t` and navigates — **why:** `LoginForm`/`ResultsSummary` precedent.
