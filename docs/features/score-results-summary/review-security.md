# review-security.md — score-results-summary (full review, `c317a5a..758d1c8`)

**Verdict: APPROVED — zero findings.**

## Checks performed
- Secrets: `git diff c317a5a..HEAD` grepped for `api[_-]?key|secret|token|password|service_role`, no hits in source. Supabase client reads only `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` (`apps/app-study-buddy/.env.example:2-3`); no service-role key referenced client-side.
- Service-layer validation: `libs/services/src/services/lesson-attempt.service.ts:10-16` rejects empty/whitespace `lessonId`, `total <= 0`, `score < 0`, `score > total` before delegating to the DAO — confirmed landed (not just claimed in `mutation.md`) and pinned by `lesson-attempt.service.test.ts:26-49` (incl. the `score === 0` boundary mutation-kill test).
- No PII/analytics: no `console.*`/analytics/tracking calls added in the diff (`git diff | grep -i "console\.|analytics|track(|logEvent"` empty of production hits); feature has no analytics events per spec, none added.
- RLS (`supabase/migrations/20260711041422_create_lesson_attempts.sql:22-34`): RLS enabled; `lesson_attempts_select_own` (line 24-27) and `lesson_attempts_insert_own` (line 29-32) both correctly scope on `user_id = auth.uid()`; `with check` present on insert; grants (`line 34`) are `select, insert` to `authenticated` only — no `anon`/`public` grant; no update/delete policy exists so both are implicitly denied (matches insert-only design).
- Spoofing (R3): `NewLessonAttempt` type (`libs/types/src/lesson-attempt.ts:15-19`) carries no `userId` field; DAO insert payload (`libs/services/src/dao/lesson-attempt.dao.ts:30`) sends only `lesson_id/score/total`; `user_id` is server-set via the column default (`migration:10`) and enforced by RLS `with check`. `lesson-attempt.dao.test.ts:25-35` pins the insert call args to exclude `user_id`, closing off client-side spoofing.
- FK (R2): `lesson_id` intentionally has no FK (documented, `migration:3` comment + `risks.md` R2) — accepted design risk, not a security gap given RLS scoping by `user_id`.
- TLS: no new external HTTP calls added; only Supabase JS client used (TLS by default).
- Deep links/webviews: none added.
- Dependency diff: `pnpm-lock.yaml` new top-level entries are `babel-jest`, `babel-plugin-polyfill-*`, `babel-preset-*`, `react-native@0.86.0`, `ts-jest` (test tooling for the new `libs/types` package) — nothing unexpected or alarming.
