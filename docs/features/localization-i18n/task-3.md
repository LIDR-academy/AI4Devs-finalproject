---
id: task-3
title: Device-locale detection + initial-locale resolution (expo-localization)
slice: 1
scenarios: [s3, s4]
status: done
paths:
  - libs/localization/src/detector/device-locale.ts
  - libs/localization/src/detector/resolve-initial-locale.ts
  - libs/localization/src/provider/localization-provider.tsx
  - apps/app-study-buddy/package.json
---

## Goal
Read the device locale via `expo-localization`, normalize a region-tagged value to its base language subtag (`pt-BR` → `pt`), and resolve the initial locale: a supported device locale is used as-is; an unsupported one falls back to English. The provider consumes this resolution at startup (before the saved preference is wired in task-7, this is the sole source of the initial locale).

## Done criteria
- [ ] Scenario(s) @s3, @s4 covered by concrete tests (supported device locale → that language; unsupported → English)
- [ ] `device-locale.ts` reads `expo-localization` and normalizes region tags to a base subtag
- [ ] `resolve-initial-locale.ts` maps a detected tag to a `Locale` from `SUPPORTED_LOCALES` or `FALLBACK_LOCALE`; pure and unit-tested with region-tagged + unsupported inputs
- [ ] `expo-localization` added to the correct workspace; API verified against Expo SDK 57 docs (https://docs.expo.dev/versions/v57.0.0/)
- [ ] Provider uses the resolved locale as its initial language
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- R1: `getLocales()` shape may have changed under SDK 57 — verify before coding and mock it in tests so detection is deterministic.
- Keep `resolve-initial-locale` a pure function taking the detected tag + supported set so it is trivially unit-testable and reused by task-7's precedence logic.
