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
| @s7 | free route resolves Vault user key | `lesson-generation.key-source.test.ts`, `lesson-generation.key-routing.integration.test.ts` |
| @s8 | free missing/blank key returns `missing_key` | `lesson-generation.key-source.test.ts`, `lesson-generation.key-routing.integration.test.ts` |
| @s9 | paid enables create; hides BYOK | `entitlements-ui.integration.test.tsx`, `upload.test.tsx` |
| @s10 | paid ignores saved key and uses platform key | `lesson-generation.key-source.test.ts`, `lesson-generation.key-routing.integration.test.ts` |
| @s11 | missing/blank platform key is retryable server failure | `lesson-generation.key-source.test.ts`, `lesson-generation.helpers.test.ts` |
| @s12 | downgrade applies current controls | `use-entitlements.test.ts`, `api-key-gate.test.tsx` |
| @s13 | create gating preserves Open lesson | `pdf-document-list-item.test.tsx`, `pdf-documents.test.tsx` |
| @s14 | next generation reads live server plan | `profiles-migration.test.ts`, `entitlements.dao.test.ts`, `lesson-generation.key-routing.integration.test.ts` |
| @s15 | request selectors cannot choose funded inference | `lesson-generation.key-routing.integration.test.ts` |
| @s16 | `showAds` derives from plan only | `entitlements.service.test.ts`, `use-entitlements.test.ts` |
| @s17 | paid enables create; hides BYOK | `entitlements-ui.integration.test.tsx`, `upload.test.tsx` |
| @s18 | paid keyless generation resolves platform key | `lesson-generation.key-source.test.ts`, `lesson-generation.key-routing.integration.test.ts` |
| @s19 | unusable platform key has no BYOK fallback/CTA | `lesson-generation.errors.test.ts`, `lesson-generation.service.test.ts`, `lesson-generation.helpers.test.ts` |

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

- @s3 free without key disables creation.
- @s4 plan-pending and key-pending states hide entitlements.
- @s5 Supabase data-access errors propagate unchanged from the DAO.
- @s6 retry clears error and derives current controls.
- @s12 paid→free reload covers key-present and key-absent examples.
- @s14 Service → DAO integration reads the current profile plan.
- @s16 `showAds` derives from free/paid plan.
- @s17 free→paid reload enables creation without a user key.
- @s9/@s17 paid gate + settings integration passed first run; no source change.

## Slice 3 cycles

- @s7 RED key-source module absent; GREEN free route returns only the saved user key.
- @s8 RED whitespace Vault key passed; GREEN blank free keys return `missing_key`.
- @s10/@s18 RED paid route returned BYOK error; GREEN paid uses platform key regardless of user-key state.
- @s11 RED absent platform key returned `missing_key`; GREEN paid configuration failures return `platform_key_unavailable`.
- @s19 RED platform 401/403 mapped to BYOK `invalid_key`; GREEN source-aware mapping returns retryable `platform_key_unavailable`.
- @s11/@s19 RED client lacked platform mapping; GREEN typed normalization, localized server copy, and retry recovery.
- @s7–@s19 RED Deno mirror/wiring absent; GREEN live profile read, exclusive Vault/platform branches, ignored request selectors, and source-aware provider errors.
- Barrel-export RED failed integration import; GREEN key-source decision exported through services.

## Manual runtime smoke check

After setting `PLATFORM_GROQ_API_KEY`, confirm one paid keyless generation succeeds and runtime
secret/configuration failures remain redacted. Plan flips and crafted fields are executable tests.

## Review refactors

- @s1 profile RLS test now consumes shared project Supabase Test Helpers; behavior unchanged.
- TanStack Query finding human-waived: dependency absent; local reducer matches sibling Supabase hooks.
- @s10/@s18 RED paid exclusivity/provider behavior had no executable seam; GREEN lazy plan router + resolved-key provider seam.
- @s7/@s15 RED Edge wiring lacked control-flow proof; GREEN Deno mirror uses lazy Vault callback, live profile plan, and resolved provider key.
- @s7/@s15 free crafted-selector behavioral coverage passed after the review refactor; no further source change.
- @s1 RED trigger followed backfill; GREEN trigger now protects signups before idempotent backfill.
- @s14 RED executable Edge route was absent; GREEN each request reads the current server plan.
- @s15 crafted route-field coverage passed against the executable Edge route; source regex removed.
- Paid control RED had no funded slot; GREEN atomic per-user concurrency/rate/daily quota RPCs.
- @s4 RED loading was silent; GREEN both entitlement gates expose live status + iOS announcement.
- Key-failure RED accepted image reads; GREEN routing resolves key and limits before image metadata.

## Mutation re-work

- @s7/@s10/@s15 RED key-route mutants bypassed source exclusivity/acquisition/provider calls; GREEN direct production-seam tests.
- @s15 RED malformed API and schema-error mutants escaped precedence checks; GREEN observable guard/branch tests.
- @s19 nullish-body mutant was equivalent inside the broad catch; GREEN refactor plus parse-failure coverage made every branch killable.

## Full-review CI re-work

- Existing AppChrome E2E RED exposed missing safe-area context; GREEN Storybook root now provides it.
- Existing PdfUpload E2E RED expected removed manual continuation; GREEN asserts the auto-advance contract.

## Amend — plans flags
- @s1 plans seed + plan_id FK; @s2/@s9 DAO join flag-map; hook canCreateWithoutKey; Edge usePlatformKey.
