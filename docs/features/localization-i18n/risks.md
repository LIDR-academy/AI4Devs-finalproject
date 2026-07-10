# Risks — localization-i18n

| # | Risk | Type | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R1 | `expo-localization` API differs under Expo SDK 57 (e.g. `getLocales()` shape / region tags like `pt-BR`, `de-AT`); wrong parsing yields wrong initial locale | technical | M | M | Verify against https://docs.expo.dev/versions/v57.0.0/ before coding; normalize the device tag to its **base language** subtag (`pt-BR` → `pt`) and map to the supported set with an English fallback; unit-test the mapping with region-tagged inputs. |
| R2 | i18next + react-i18next initialization is async; components can render before i18n is ready, flashing raw keys or fallback copy | technical | M | M | Gate first paint at the provider/root until i18n is ready (return `null`/hold splash, mirroring the `useSession` pattern); initialize synchronously where possible (`initImmediate: false`) and expose a `ready` flag. |
| R3 | Circular dependency if `@helsoft/services` (preference validation) imports the supported-locale set from `@helsoft/localization`, which itself imports the persistence service | technical | M | H | Put `Locale`/`SUPPORTED_LOCALES`/`FALLBACK_LOCALE` in `@helsoft/types` (both libs already may depend on types; services does). No lib imports another that imports it back. |
| R4 | AsyncStorage behaves differently across platforms or is unavailable (SSR/web prerender, private-mode `localStorage`), and a read/write throws | technical | M | M | Wrap all storage access in the DAO with try/catch; on read failure fall back to device detection → English (AC15); on save failure apply in-memory and log; unit-test both failure paths with a mocked store. |
| R5 | Incomplete migration — a hardcoded string is missed, so some copy stays untranslated | product | H | M | Treat coverage as an explicit task with an audit (grep for literal JSX text / `title:` strings across `apps/app-study-buddy/` and `libs/components/`); add a lint-style check or test asserting no bare user-facing literals remain; reviewer_code verifies against AC9. |
| R6 | Translations for es/pt/de are wrong, machine-quality, or missing keys, degrading trust | product | M | M | English is the authoritative base and the runtime fallback (AC10) so a missing key never breaks UI; keep all bundles key-aligned with `en`; flag non-`en` copy for a native-speaker review pass (out of code scope, noted for the human). |
| R7 | Migrating every screen + all four bundles is broad and could balloon the slice-3 scope | timeline | M | M | Keep migration mechanical and confined to slice 3; screens are currently thin placeholders, so the surface is small today; land the lib + provider + selector (slices 1–2) first so the feature is demoable even if a few strings trail. |
| R8 | Adding `expo-localization` / i18next deps triggers pnpm ignored-build prompts or Metro/Jest resolution issues in the monorepo | technical | L | M | Add deps to the correct workspace (`@helsoft/localization` for i18next/react-i18next; app for `expo-localization`), approve any blocked builds in `pnpm-workspace.yaml`, and run `pnpm check-types` + `pnpm test` per workspace before handoff. |
| R9 | Pluralization rules differ per language (i18next v4 JSON plural suffixes) and a naive `_plural` key breaks non-English plurals | technical | L | M | Use i18next's standard plural key convention per locale and test pluralization for at least one non-English locale; keep the count-based key in all four bundles. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `i18next` | available (to add) | New dep in `@helsoft/localization`; core translation engine. Pin a version compatible with react-i18next. |
| `react-i18next` | available (to add) | New dep in `@helsoft/localization`; provides `I18nextProvider` + `useTranslation` that the lib's provider/hook wrap. |
| `expo-localization` | available (to add) | New dep in `apps/app-study-buddy` (and/or `@helsoft/localization`); reads device locale. **Verify API against Expo SDK 57 docs** before use. |
| `@react-native-async-storage/async-storage` | available | Already a dependency of `apps/app-study-buddy` (v2.2.0); add it to `@helsoft/services` for the preference DAO. Universal: `localStorage` on web, native store on iOS/Android. |
| `@helsoft/types` | available | Already exists and is a dependency of `@helsoft/services`; will host the `Locale` type + supported-locale constants. |
| `@helsoft/components` tokens/atoms | available | `theme` tokens + `icon`/`card`/`state-layer` atoms exist for the presentational selector (non-color-only active indicator via an icon). |
| Settings screen + root layout | available | `apps/app-study-buddy/src/app/(app)/settings.tsx` and `apps/app-study-buddy/src/app/_layout.tsx` exist as integration points. |
| Jest + Playwright + Storybook | available | Test infra is set up (`jest-expo`, `@testing-library/react-native`, Storybook on react-native-web, Playwright) for unit + component + e2e tests. |
