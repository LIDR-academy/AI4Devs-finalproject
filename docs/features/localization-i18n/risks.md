# Risks — localization-i18n

| # | Risk | Type | L | I | Mitigation |
|---|---|---|---|---|---|
| R1 | `expo-localization` API differs under SDK 57 (`getLocales()` shape / region tags); wrong parsing → wrong initial locale | tech | M | M | Verify vs SDK 57 docs; normalize device tag to base subtag (`pt-BR`→`pt`) + map to supported set with English fallback; unit-test region-tagged inputs. |
| R2 | i18next init is async; components render before ready, flashing raw keys/fallback | tech | M | M | Gate first paint at provider until ready (`return null`/hold splash, `useSession` pattern); `initImmediate:false` + expose `ready`. |
| R3 | Circular dep if services imports the locale set from localization (which imports the persistence service) | tech | M | H | Put `Locale`/`SUPPORTED_LOCALES`/`FALLBACK_LOCALE` in `@helsoft/types`; no lib imports another that imports it back. |
| R4 | AsyncStorage differs/unavailable across platforms (SSR, private-mode localStorage); read/write throws | tech | M | M | Wrap all storage in DAO try/catch; read failure → device→English (AC15); save failure → in-memory + log; unit-test both paths. |
| R5 | Incomplete migration — a hardcoded string missed, stays untranslated | product | H | M | Explicit coverage task + fs audit (`migration-coverage.test.ts`) asserting no bare user-facing literals; reviewer_code verifies vs AC9. |
| R6 | es/pt/de translations wrong/machine-quality/missing keys | product | M | M | English is authoritative base + runtime fallback (AC10); keep bundles key-aligned; flag non-`en` copy for native-speaker review (out of code scope). |
| R7 | Migrating every screen + 4 bundles balloons slice-3 scope | timeline | M | M | Keep migration mechanical, confined to slice 3; screens are thin placeholders (small surface); land lib+provider+selector (slices 1–2) first. |
| R8 | Adding deps triggers pnpm ignored-build prompts or Metro/Jest resolution issues | tech | L | M | Add deps to correct workspace; approve blocked builds; run check-types + test per workspace before handoff. |
| R9 | Pluralization rules differ per language; naive `_plural` key breaks non-English plurals | tech | L | M | Use i18next's standard plural key convention per locale; test pluralization for ≥1 non-English locale; count-based key in all 4 bundles. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `i18next` / `react-i18next` | to add | In `@helsoft/localization`; core engine + provider/hook wrapped by the lib. |
| `expo-localization` | to add | In `apps/app-study-buddy`; reads device locale. Verified vs SDK 57. |
| `@react-native-async-storage/async-storage` | available | App dep (v2.2.0); added to `@helsoft/services` for the preference DAO. Universal (localStorage web / native). |
| `@helsoft/types` | available | Hosts `Locale` + supported-locale constants; already a services dep. |
| `@helsoft/components` tokens/atoms | available | `theme` tokens + `Icon` for the non-color-only active indicator. |
| Settings screen + root layout | available | `(app)/settings.tsx` + `_layout.tsx` are the integration points. |
| Jest + Playwright + Storybook | available | Test infra ready (jest-expo, RNTL, Storybook on RN-web, Playwright). |
