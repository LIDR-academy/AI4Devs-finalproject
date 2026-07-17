---
id: task-2
title: Expose derived client profile
slice: 1
scenarios: [s2, s3, s4, s5, s6, s9, s12, s16, s17]
status: done
paths:
  - libs/types/src/profile.ts
  - libs/types/src/index.ts
  - libs/supabase-services/src/dao/profile.dao.ts
  - libs/supabase-services/src/dao/profile.dao.test.ts
  - libs/supabase-services/src/services/profile.service.ts
  - libs/supabase-services/src/services/profile.service.test.ts
  - libs/supabase-services/src/services/profile.types.ts
  - libs/supabase-services/src/services/profile.integration.test.ts
  - libs/supabase-services/src/services/index.ts
  - libs/hooks/src/hooks/use-profile.ts
  - libs/hooks/src/hooks/use-profile.types.ts
  - libs/hooks/src/hooks/use-profile.reducer.ts
  - libs/hooks/src/hooks/use-profile.test.ts
  - libs/hooks/src/hooks/index.ts
---

## Goal
Implement `useProfile()` / `ProfileProvider` through Hook → Service → DAO. The DAO joins the caller's `profiles` → `plans` flags; the service maps to the client contract; the hook composes shared `useApiKey()` to derive `canCreate`, and exposes loading, error, and retry. One fetch is shared app-wide under `ProfileProvider`.

## Done criteria
- [x] Contract exposes `plan`, `keySource`, `showKeySettings`, `showAds`, and `canCreate`
- [x] Flags map: `use_platform_key` → `keySource`; `show_key_settings` / `show_ads` pass through
- [x] `canCreate` is `keySource === 'platform' || hasKey`; no raw key enters the contract
- [x] Missing profile and data-access failure are explicit errors, never coerced to `free`
- [x] Loading covers both plan and key-status dependencies; retry reloads the failed profile read
- [x] Related loading/data/error state uses a co-located reducer
- [x] DAO, service, hook, type, and barrel tests/exports are complete
- [x] Scenarios `@s2`–`@s6`, `@s9`, `@s12`, `@s16`, `@s17` are mapped in `tdd.md`

## Notes
`showAds` is returned but has no consumer in this feature. Nest `ProfileProvider` under `ApiKeyProvider` so composition does not duplicate key-status requests.
