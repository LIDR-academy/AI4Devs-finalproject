# review-architecture — score-results-summary

**Verdict: APPROVED — zero findings.**

Full-diff review (`c317a5a..758d1c8`, all 3 slices) against `hooks-service-dao.mdc`, `global.mdc`, and `spec.md`'s "Component placement + pre-formatting" / "Scorer input is decoupled from the Slide union" decisions.

Checks performed, all clean:
- `Component → Hook → Service → DAO` chain intact: `libs/hooks/src/hooks/use-lesson-attempt.ts:2` imports only `LessonAttemptService` from `@helsoft/supabase-services` (no DAO import); `libs/supabase-services/src/services/lesson-attempt.service.ts:3` imports only `LessonAttemptDao`; `libs/study-buddy/src/components/lesson-results/lesson-results.tsx:3` imports the hook, not the service/DAO.
- `libs/hooks/src/hooks/use-lesson-attempt.ts` has no `@helsoft/study-buddy` import (grep confirms zero matches) — the hooks→study-buddy dependency stays out, per spec; `scoreLesson` is called directly by the wiring component (`lesson-results.tsx:7,35`), matching the documented decision.
- DTO containment: `LessonAttemptRow` (snake_case) is declared and consumed only inside `libs/supabase-services/src/dao/lesson-attempt.dao.ts:6-20`; `toLessonAttempt` maps it to the camelCase `LessonAttempt` domain type before it crosses the DAO boundary. `LessonAttemptDao` itself is referenced only from `lesson-attempt.service.ts` (grep confirms no other importer).
- `libs/components/src/organisms/results-summary/results-summary.tsx` is purely presentational — imports only atoms (`Button`, `Card`, `ProgressIndicator`) and `react-native`; receives pre-formatted label strings, never self-formats score/percent, per spec decision.
- `apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx` stays thin: routing/wiring only (`useLocalSearchParams`, `useRouter`, `ScreenContainer`, `LessonResults`, the fixture builder) — no business logic in `apps/*`.
- Barrels updated for every new export: `libs/components/src/organisms/index.ts`, `libs/hooks/src/hooks/index.ts`, `libs/supabase-services/src/services/index.ts`, `libs/study-buddy/src/index.ts`, `libs/types/src/index.ts` all include the new modules; `LessonAttemptDao` correctly has no barrel export (DAO layer stays internal to `@helsoft/supabase-services`).
- Migration (`supabase/migrations/20260711041422_create_lesson_attempts.sql`) matches the documented decision: insert-only, RLS `user_id = auth.uid()` on select + insert `with check`, no FK to `lessons` (soft reference, documented).
- New dependency (`jest`/`ts-jest`/`@types/jest` in `libs/types/package.json`) is justified — wires the previously-absent `test` script for `libs/types`' new runtime logic (`isSystemCheckedActivity`), consistent with `AGENTS.md`'s "wire the workspace's test script when adding one" and the existing `isSupportedLocale` precedent for runtime guards colocated with their type.
- The integration test (`libs/study-buddy/src/components/lesson-results/lesson-results.integration.test.tsx`) exercises the real hook→service→DAO chain against only a mocked Supabase client boundary — confirms the wiring is real, not just type-level.
