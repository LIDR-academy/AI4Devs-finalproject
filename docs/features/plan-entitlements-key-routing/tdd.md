# TDD — plan-entitlements-key-routing

## Scenario map

| Scenario | Test | File |
|---|---|---|
| @s1 | live trigger/default/constraint/select-own/write-denial behavior | `profiles.rls.integration.test.ts` |
| @s2 | reads/derives free entitlements; saved key enables creation | `entitlements.dao.test.ts`, `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s3 | free plan without key disables creation | `use-entitlements.test.ts` |
| @s4 | pending plan or key status hides entitlements | `use-entitlements.test.ts` |
| @s5 | missing profile, invalid plan, and read failure are explicit errors | `entitlements.dao.test.ts`, `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s6 | retry clears error; stale requests cannot overwrite success | `use-entitlements.test.ts` |
| @s9 | paid plan derives platform access without user key | `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s12 | paid→free reload with key present and absent | `use-entitlements.test.ts`, `entitlements.integration.test.ts` |
| @s14 | profile plan is persisted as the live server-read foundation | `profiles-migration.test.ts`, `entitlements.dao.test.ts` |
| @s16 | `showAds` derives from plan only | `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s17 | paid reload enables creation without user key | `use-entitlements.test.ts` |

## Observed RED → GREEN cycles

- @s1 RED migration file absent; GREEN profiles schema/trigger/RLS; REFACTOR empty search path.
- @s1 RED existing auth users lacked profiles; GREEN idempotent free-plan backfill.
- @s1 RED live suite found `profiles` absent; GREEN applied migration and proved database behavior.
- @s1 RED service-role read was denied; GREEN trusted-role grant, authenticated writes still denied.
- @s2 RED DAO module absent; GREEN current profile plan query; REFACTOR typed row.
- @s2 RED service module absent; GREEN free-plan derivation.
- @s2 RED hook module absent; GREEN reducer-backed plan/key composition.
- @s5 RED null profile resolved; GREEN explicit missing-profile error.
- @s5 RED invalid plan fell through to free; GREEN reject invalid stored values.
- @s6 RED stale failure overwrote retry success; GREEN latest-request guard.
- @s9 RED paid plan was rejected; GREEN platform-derived paid entitlements.
- @s2 RED package import lacked `EntitlementsDao`; GREEN DAO/package barrels.
- @s2 RED RNTL could not parse under web Jest; GREEN isolated `jest-expo` native project.

## Coverage added on already-green production

These review-driven tests passed on first run; they are coverage, not falsely reported RED cycles.
They caused no production change.

- @s3 free without key disables creation.
- @s4 plan-pending and key-pending states hide entitlements.
- @s5 Supabase data-access errors propagate unchanged from the DAO.
- @s6 retry clears error and derives current controls.
- @s12 paid→free reload covers key-present and key-absent examples.
- @s14 Service → DAO integration reads the current profile plan.
- @s16 `showAds` derives from free/paid plan.
- @s17 free→paid reload enables creation without a user key.

## Review refactors

- @s1 profile RLS test now consumes shared project Supabase Test Helpers; behavior unchanged.
- TanStack Query finding human-waived: dependency absent; local reducer matches sibling Supabase hooks.
