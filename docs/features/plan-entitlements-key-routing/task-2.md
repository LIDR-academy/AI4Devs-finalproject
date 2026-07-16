---
id: task-2
title: Expose derived client entitlements
slice: 1
scenarios: [s2, s3, s4, s5, s6, s9, s12, s16, s17]
status: todo
paths:
  - libs/types/src/entitlements.ts
  - libs/types/src/index.ts
  - libs/supabase-services/src/dao/entitlements.dao.ts
  - libs/supabase-services/src/dao/entitlements.dao.test.ts
  - libs/supabase-services/src/services/entitlements.service.ts
  - libs/supabase-services/src/services/entitlements.service.test.ts
  - libs/supabase-services/src/services/entitlements.types.ts
  - libs/supabase-services/src/services/index.ts
  - libs/hooks/src/hooks/use-entitlements.ts
  - libs/hooks/src/hooks/use-entitlements.types.ts
  - libs/hooks/src/hooks/use-entitlements.reducer.ts
  - libs/hooks/src/hooks/use-entitlements.test.ts
  - libs/hooks/src/hooks/index.ts
---

## Goal
Implement `useEntitlements()` through the required Hook → Service → DAO layers. The DAO reads the caller's `profiles.plan`; the service validates and derives plan-only values; the hook composes shared `useApiKey()` status to derive `canCreate`, and exposes loading, error, and retry.

## Done criteria
- [ ] Contract exposes `plan`, `keySource`, `showKeySettings`, `showAds`, and `canCreate`
- [ ] `free` derives user-key source, key settings and ads; `paid` derives platform-key source, neither settings nor ads
- [ ] `canCreate` is `paid || hasKey`; no raw key enters the contract
- [ ] Missing profile and data-access failure are explicit errors, never coerced to `free`
- [ ] Loading covers both plan and key-status dependencies; retry reloads the failed entitlement read
- [ ] Related loading/data/error state uses a co-located reducer
- [ ] DAO, service, hook, type, and barrel tests/exports are complete
- [ ] Scenarios `@s2`–`@s6`, `@s9`, `@s12`, `@s16`, `@s17` are mapped in `tdd.md`

## Notes
`showAds` is returned but has no consumer in this feature. Reuse the existing `ApiKeyProvider` value so entitlement composition does not duplicate key-status requests.
