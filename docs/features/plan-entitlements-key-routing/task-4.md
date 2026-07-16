---
id: task-4
title: Route generation keys by live plan
slice: 3
scenarios: [s7, s8, s10, s11, s14, s15, s18, s19]
status: todo
paths:
  - supabase/functions/generate-lesson/index.ts
  - supabase/functions/generate-lesson/_shared/types.ts
  - supabase/functions/generate-lesson/_shared/lesson-generation.key-source.ts
  - libs/types/src/lesson-generation.ts
  - libs/types/src/lesson-generation.test.ts
  - libs/supabase-services/src/services/lesson-generation.key-source.ts
  - libs/supabase-services/src/services/lesson-generation.key-source.test.ts
  - libs/supabase-services/src/services/lesson-generation.service.ts
  - libs/supabase-services/src/services/lesson-generation.service.test.ts
  - libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.ts
  - libs/study-buddy/src/components/lesson-generation/lesson-generation.helpers.test.ts
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
---

## Goal
Make `generate-lesson` read the caller's current profile plan with its service-role client on every request, then resolve exactly one key source: Vault-backed user key for `free`, or `PLATFORM_GROQ_API_KEY` for `paid`. Extend the typed client error contract for an unavailable paid platform key.

## Done criteria
- [ ] Request schema contains no trusted plan, entitlement, or key-source selector
- [ ] Current plan is read after authentication on every generation request
- [ ] Free route calls `get_api_key`; missing user key returns `missing_key`
- [ ] Paid route never calls `get_api_key`, works with no user-key row, ignores any stored user key, and reads only `PLATFORM_GROQ_API_KEY`
- [ ] Missing/empty platform key returns `platform_key_unavailable` and makes no provider call
- [ ] Configured-but-invalid/unusable platform key normalizes to `platform_key_unavailable`
- [ ] Provider calls, responses, and logs never expose either key
- [ ] Client error normalization and localized recovery map platform-key failure to server error + retry, never Settings/key CTA
- [ ] Pure key-source decision logic is Jest-tested in the workspace and mirrored into the Edge Function, following the repository's existing Deno mirror pattern
- [ ] A manual deployed-function check remains documented for service-role plan reads and the runtime environment secret
- [ ] Scenarios `@s7`, `@s8`, `@s10`, `@s11`, `@s14`, `@s15`, `@s18`, `@s19` are mapped in `tdd.md`

## Notes
The admin client may read only the caller's profile and the free route's Vault RPC; document and lesson persistence continue under the caller JWT/RLS. Never fall back between key sources: a paid platform-key failure must not consume a saved user key.
