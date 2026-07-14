# Sign-up & lesson persistence (R5)

**As a** new user
**I want** to create an account and have my generated lessons saved to it
**so that** my study materials are private to me and are still there the next time I log in

## Context
- PRD's **R5 — Auth & persistence**. Login/logout already shipped (`login-and-logout.md`, done) — this story is the two pieces R5 still needs: **sign-up** and **lesson persistence + RLS**.
- **Sign-up is currently missing, not just unwired.** `AuthService`/`AuthDao` (`libs/supabase-services/src/services/auth.service.ts`, `.../dao/auth.dao.ts`) only implement `signIn`/`signOut` — `signUp` doesn't exist at any layer. `apps/app-study-buddy/src/app/(auth)/sign-up.tsx` is a stub screen (no form, not wired). `AuthService`'s existing comment already reserves password-strength validation for "the signup story" — this is that story.
- **No `lessons` table exists yet.** `GeneratedLesson` (`libs/types/src/lesson-generation.ts`) is produced by the `generate-lesson` Edge Function and lives in memory only — nothing persists it today. The `lesson_attempts` migration (`supabase/migrations/20260711041422_create_lesson_attempts.sql`) explicitly stores `lesson_id` as a soft reference "until the lessons table (R5) exists."
- **Home screen already stubs the list this story makes real:** `apps/app-study-buddy/src/app/(app)/index.tsx` hardcodes `t('lessons.count', { count: 0 })`. This story replaces that stub with the user's actual saved lessons.
- Layering: `Component → Hook → Service → DAO` (`.agents/rules/hooks-service-dao.mdc`). New Supabase DAO/service (e.g. `lessons.dao.ts` / `lessons.service.ts`) go in `@helsoft/supabase-services`; schema change via `npx supabase migration new` + RLS policies (mirror the `lesson_attempts` pattern: `user_id` defaulted server-side to `auth.uid()`, policies scoped to `user_id = auth.uid()`).
- **Out of scope:** resuming an in-progress attempt (saved answer/position state) is **R9**, a separate future story. Reopening a saved lesson here re-renders it from the top like a fresh attempt — consistent with the existing insert-only `lesson_attempts` model (`score-results-summary.md`). Forgot-password/password-reset remains out of scope (per `login-and-logout.md`).

## Acceptance criteria
- **Sign-up, happy path** — Given a new user on the sign-up screen, When they enter an email and a password meeting the existing login-and-logout strength rule (8+ chars, mix of letters/numbers/symbols) and submit, Then a Supabase account is created and a verification email is sent; the account cannot log in yet.
- **Email verification required** — Given an unverified account, When the user attempts to log in, Then login is rejected with a clear message (e.g. "Please verify your email before logging in"), not the generic invalid-credentials error.
  - Given the user follows the verification link, When they then log in with the same credentials, Then login succeeds via the existing login flow.
- **Duplicate email** — Given an email already registered, When sign-up is attempted with it, Then a clear error is shown ("An account with this email already exists" or similar) and no duplicate account is created.
- **Weak password** — Given a password that fails the strength rule, When sign-up is attempted, Then it's rejected client-side (or by Supabase) with a clear message before any account is created.
- **Login/logout unchanged** — existing `login-and-logout.md` behavior (valid/invalid credentials, network error, session persistence across restarts) continues to work unchanged.
- **Lesson persisted on generation** — Given an authenticated user completes lesson generation, When the Edge Function returns the generated lesson, Then the lesson (title + ordered slides) is persisted to Supabase under that user's id immediately — before the learner studies or scores it, and even if they close the app without finishing.
- **Saved lessons visible** — Given a user with one or more saved lessons, When they view the Home screen, Then it shows their real saved lessons (title, created date) instead of the "0 lessons" stub.
- **Reopen a saved lesson** — Given a saved lesson in the list, When the user taps it, Then it opens in the existing player/slide flow, starting from the top.
- **Survives logout/login** — Given a user with saved lessons, When they log out and log back in with the same account, Then all previously saved lessons still appear, unchanged.
- **New account starts empty** — Given a newly signed-up user, When they view Home, Then they see zero saved lessons (no data from any other account).
- **Row-level security enforced at the data layer** — Given user A's saved lessons, When user B (authenticated, different account) or an unauthenticated request queries the `lessons` table directly, Then no rows belonging to user A are returned — enforced by Postgres RLS (`user_id = auth.uid()`), not only by client-side filtering/UI.

## Notes
- Reuses `login-and-logout`'s password-strength rule and its "no forgot-password flow" boundary — don't re-litigate either in spec.
- `lesson_attempts.lesson_id` should gain a real foreign key to the new `lessons.id` once it exists (currently a soft reference per that migration's own comment) — confirm in spec whether this story lands that FK or defers it.
- Email verification is a Supabase Auth built-in (confirmation email + link) — no custom email infra needed.
- No analytics events or feature flags required for MVP.
- Ready for `/ticket-orchestrator signup-and-lesson-persistence`.
