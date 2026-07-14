# Lesson persistence & delete (R5)

**As a** authenticated learner
**I want** my generated lessons saved to my account, listed on Home, reopenable, and deletable
**so that** my study materials are private to me, still there next login, and I can remove ones I don't need

## Context
- PRD's **R5 — Auth & persistence** remainder after login/logout (`login-and-logout.md`, done). **Sign-up is carved out** into `user-stories/pending/sign-up.md` — not this story.
- **No `lessons` table exists yet.** `GeneratedLesson` (`libs/types/src/lesson-generation.ts`) is produced by the `generate-lesson` Edge Function and lives in memory only. The `lesson_attempts` migration stores `lesson_id` as a soft reference "until the lessons table (R5) exists."
- **Home screen stubs the list:** `apps/app-study-buddy/src/app/(app)/index.tsx` hardcodes `t('lessons.count', { count: 0 })`. This story replaces that with the user's real saved lessons.
- Layering: `Component → Hook → Service → DAO`. New Supabase DAO/service (`lessons.dao.ts` / `lessons.service.ts`) in `@helsoft/supabase-services`; schema via `npx supabase migration new` + RLS (mirror `lesson_attempts`: `user_id` defaulted server-side to `auth.uid()`, policies `user_id = auth.uid()`).
- **Persistence is server-side:** the `generate-lesson` Edge Function writes the `lessons` row (title + ordered slides) under the caller’s `auth.uid()` before returning success — client does not insert the lesson itself.
- **Out of scope:** sign-up / email verification (→ `sign-up.md`); rename lesson; resuming mid-lesson (**R9**); forgot-password. Reopen starts from the top (fresh attempt), consistent with insert-only `lesson_attempts`.

## Acceptance criteria
- **Lesson persisted on generation** — Given an authenticated user completes lesson generation, When the Edge Function succeeds, Then the lesson (title + ordered slides) is already persisted in Supabase under that user’s id — before they study or score it, even if they close the app without finishing.
- **Persist failure → retry only** — Given generation/persist fails server-side, When the client shows the error, Then the learner gets a retry affordance; no in-memory-only play path (player only opens for a real persisted `lessonId`).
- **Saved lessons visible** — Given a user with one or more saved lessons, When they view Home, Then it shows their real saved lessons (title, created date), newest first, showing all (no pagination).
- **Empty home** — Given an authenticated user with no saved lessons, When they view Home, Then they see zero lessons (empty state), not another user’s data.
- **Reopen a saved lesson** — Given a saved lesson in the list, When the user taps it, Then it opens in the existing player/slide flow, starting from the top.
- **Survives logout/login** — Given a user with saved lessons, When they log out and log back in, Then all previously saved lessons still appear, unchanged.
- **Delete a lesson** — Given a saved lesson in the list, When the user deletes it (with confirmation), Then it is removed from Supabase and no longer appears on Home. Rename is out of scope.
- **FK landed** — `lesson_attempts.lesson_id` becomes a real foreign key to `lessons.id`.
- **Row-level security** — Given user A’s lessons, When user B (authenticated) or an unauthenticated request queries `lessons` directly, Then no rows belonging to A are returned — Postgres RLS (`user_id = auth.uid()`), not client-only filtering. Delete likewise scoped to own rows.

## Notes
- Debated decisions (2026-07-13): Edge Fn persists; persist fail → retry only; newest-first show-all; delete in, rename out; sign-up deferred to `sign-up.md`; FK this story.
- No analytics events or feature flags required for MVP.
- Feature folder/branch name remains `signup-and-lesson-persistence` (started under that kebab); scope is persistence + delete only.
