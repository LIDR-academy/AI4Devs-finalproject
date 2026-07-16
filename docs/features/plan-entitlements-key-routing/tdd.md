# TDD — plan-entitlements-key-routing

## Scenario map

| Scenario | Test | File |
|---|---|---|
| @s1 | live trigger/default/constraint/select-own/write-denial behavior | `profiles.rls.integration.test.ts` |
| @s2 | free saved-key controls | `use-entitlements.test.ts`, `api-key-gate.test.tsx`, `upload.test.tsx` |
| @s3 | free no-key guidance; create hidden | `api-key-gate.test.tsx`, `upload.test.tsx` |
| @s4 | pending hides create/key settings | `api-key-gate.test.tsx`, `api-key-settings.test.tsx`, `upload.test.tsx` |
| @s5 | explicit error hides controls | `entitlements.service.test.ts`, `api-key-gate.test.tsx`, `api-key-settings.test.tsx`, `upload.test.tsx` |
| @s6 | retry delegates and recovers | `use-entitlements.test.ts`, `api-key-gate.test.tsx`, `api-key-settings.test.tsx` |
| @s9 | paid enables create; hides BYOK | `entitlements-ui.integration.test.tsx`, `upload.test.tsx` |
| @s12 | downgrade applies current controls | `use-entitlements.test.ts`, `api-key-gate.test.tsx` |
| @s13 | create gating preserves Open lesson | `pdf-document-list-item.test.tsx`, `pdf-documents.test.tsx` |
| @s14 | profile plan is persisted as the live server-read foundation | `profiles-migration.test.ts`, `entitlements.dao.test.ts` |
| @s16 | `showAds` derives from plan only | `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s17 | paid enables create; hides BYOK | `entitlements-ui.integration.test.tsx`, `upload.test.tsx` |

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
- @s4 RED loading exposed controls; GREEN both UI gates hide plan-sensitive controls.
- @s9/@s17 RED paid no-key hit BYOK UI; GREEN current entitlements drive gate/settings.
- @s12 RED saved-key state overrode downgrade; GREEN `canCreate` is authoritative.
- @s5/@s6 RED failures showed guidance/blank UI; GREEN localized error + hook retry.
- @s13 RED hiding create removed row access; GREEN optional generate preserves Open lesson.
- @s2–@s5/@s9/@s17 RED UploadScreen had no runnable branch test; GREEN Expo Jest + screen wiring tests.
- @s13 RED creation-disabled stories were absent; GREEN item/list/feature stories + scoped E2E.

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
- @s9/@s17 paid gate + settings integration passed first run; no source change.

## Review refactors

- @s1 profile RLS test now consumes shared project Supabase Test Helpers; behavior unchanged.
- TanStack Query finding human-waived: dependency absent; local reducer matches sibling Supabase hooks.
