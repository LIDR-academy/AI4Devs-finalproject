---
id: task-4
title: Route generation keys by live plan flags
slice: 3
scenarios: [s7, s8, s10, s11, s14, s15, s18, s19]
status: done
paths:
  - supabase/functions/generate-lesson/index.ts
  - supabase/functions/generate-lesson/_shared/lesson-generation.key-source.ts
  - supabase/functions/generate-lesson/_shared/lesson-generation.route.ts
  - libs/types/src/lesson-generation.ts
  - libs/types/src/lesson-generation.test.ts
  - libs/supabase-services/src/services/lesson-generation.key-source.ts
  - libs/supabase-services/src/services/lesson-generation.key-source.test.ts
  - libs/supabase-services/src/services/lesson-generation.key-routing.integration.test.ts
  - libs/supabase-services/src/services/lesson-generation.service.ts
  - libs/supabase-services/src/services/lesson-generation.service.test.ts
  - libs/supabase-services/src/services/lesson-generation.errors.ts
  - libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.ts
  - libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.test.ts
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
---

## Goal
Make `generate-lesson` read the caller's current plan flags with its service-role client on every request, then resolve exactly one key source from `use_platform_key`: Vault-backed user key when false, or `PLATFORM_GROQ_API_KEY` when true. Extend the typed client error contract for an unavailable platform key.

## Done criteria
- [x] Request schema contains no trusted plan, entitlement, or key-source selector
- [x] Current plan flags are read after authentication on every generation request
- [x] `use_platform_key=false` calls `get_api_key`; missing user key returns `missing_key`
- [x] `use_platform_key=true` never calls `get_api_key`, works with no user-key row, ignores any stored user key, and reads only `PLATFORM_GROQ_API_KEY`
- [x] Missing/empty platform key returns `platform_key_unavailable` and makes no provider call
- [x] Configured-but-invalid/unusable platform key normalizes to `platform_key_unavailable`
- [x] Provider calls, responses, and logs never expose either key
- [x] Client error normalization and localized recovery map platform-key failure to server error + retry, never Settings/key CTA
- [x] Pure key-source decision logic is Jest-tested in the workspace and mirrored into the Edge Function
- [x] Scenarios `@s7`, `@s8`, `@s10`, `@s11`, `@s14`, `@s15`, `@s18`, `@s19` are mapped in `tdd.md`

## Notes
Never fall back between key sources: a platform-key failure must not consume a saved user key. Route on live flags only — never on plan name.
