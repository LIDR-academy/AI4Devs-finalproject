---
feature: localization-i18n
story: user-stories/localization-i18n.md
status: spec_ready
---

# Spec — localization-i18n

## Summary
Display the UI in the user's language across web/iOS/Android from one Expo codebase. Adds shared lib
`@helsoft/localization` wrapping **i18next + react-i18next**, ships bundles for **English (`en`,
base/fallback), Spanish (`es`), Portuguese (`pt`), German (`de`)**, and exposes a provider + translation
hook so any component can translate without importing i18next directly. Active language = **auto-detect +
manual override**: first launch resolves the device locale via `expo-localization`; the user overrides from
**Settings**, and that choice **persists** across restarts and **wins over** the device locale. Every
hardcoded user-facing string in `libs/components/` and `apps/app-study-buddy/` is migrated to keys; adding a
locale later is config-only.

## User stories
- As a **multilingual user**, I want the app in my language with in-app switching, so I can study in the language I understand best on web/iOS/Android.
- As a **returning user**, I want my chosen language remembered across restarts, so I never reselect it or get overridden by the device locale.
- As a **developer**, I want all UI copy from translation keys with a config-only path to add a locale, so we can localize new markets without reworking components.

## Acceptance criteria → see `gherkin-scenarios.md` (each `@s` scenario is an AC)
_(Known limitation on the selector container's group role/label for native assistive tech — see FO2.)_

## UI states
The only new visible surface is the **language selector** on Settings; the rest is cross-cutting (translating existing screens).

| State | Applies? | Notes |
|---|---|---|
| Loading | Yes (provider/init) | Gate first paint until i18n resolves the initial locale (async saved-pref read + device detection), mirroring `useSession` (`return null`/hold splash). Selector itself is synchronous once mounted. |
| Content | Yes | Provider ready, Settings open: 4 languages in own names, active indicated; screens render translated copy. Primary state. |
| Error | **No blocking state** (by design) | Graceful degradation: failed read → device/English; missing key → English; failed save → in-memory for session (see Open decisions). |
| Empty | **N/A** | Fixed non-empty 4-locale set; selector can never have zero options. |

## Analytics events
**None for MVP.** (A single `language_changed` event would suffice later — deliberately deferred.)

## Feature flags
**None.** Foundational UI plumbing (every screen renders through it), not an experiment.

## Out of scope / non-goals
- Locale-aware date/number/currency formatting — deferred unless a string interpolates an already-formatted value.
- RTL layout — none of en/es/pt/de is RTL.
- Translating dynamically generated lesson content — only app UI chrome is localized.
- Locales beyond en/es/pt/de — config-only to add, but shipping more is a follow-on.
- Machine/runtime translation — es/pt/de are authored, not auto-generated.
- Settings surface beyond language.

## Follow-on (deferred, tracked)
- **FO1 — Robust failed-save handling.** MVP applies a selection in-memory + logs on persistence-save failure; follow-on should retry/queue and/or surface a non-blocking notice. Interim behavior carries a `TODO(FO1)` at the failed-save path (task-7). **Human gate 2026-07-09: APPROVED as-is.**
- **FO2 — Known limitation: selector `radiogroup` group role/label very likely not exposed to native (iOS/Android) AT (WCAG 1.3.1 / 4.1.2, Level A).** The container `View` (`language-selector.tsx:38`) sets `accessibilityRole="radiogroup"` + group `accessibilityLabel` but not `accessible={true}`; RN only exposes a plain `View` to VoiceOver/TalkBack when `accessible={true}`, which would make it an opaque leaf and hide its 4 `radio` children (verified: `RCTViewComponentView.mm:398` gates `isAccessibilityElement` on `accessible`). Investigation (round-2, `tdd.md` Phase 6): no public `View` prop exposes the group role/label without the swallow-children trap or native-module work, and Jest/RNTL cannot model this native behavior to verify a fix. Each option stays fully labelled/roled/stated (task completable); web unaffected. Pre-existing/systemic (identical in `radio-group.tsx:29`); generic fix out of scope. **Human gate 2026-07-10: risk ACCEPTED** — ships with the documented limitation; closing it deferred to a design-system follow-up covering both `LanguageSelector` and `RadioGroup`.

## Open decisions (resolved with rationale)
- Shared `Locale` union + `SUPPORTED_LOCALES` + `FALLBACK_LOCALE` live in `@helsoft/types` (`locale.ts`), not localization — both localization and services need the set; avoids a circular dep.
- Native language labels (endonyms) are static in `@helsoft/localization` config, not keys — each language must show in its own name regardless of active locale.
- Persistence uses `@react-native-async-storage/async-storage` via a DAO in `@helsoft/supabase-services` — universal (localStorage web / native store), honors DAO→service layering.
- Provider + hook live in `@helsoft/localization`, not `@helsoft/hooks` — intrinsic to the i18n React context; persistence still routes through services.
- Language selector is a **presentational molecule** in `@helsoft/components` (props: `options`/`value`/`onChange`/a11y labels), no localization-hook dep — token-driven, Storybook-able across locales; wiring lives in a study-buddy feature component so the screen stays a thin shell.
- On failed persistence save: selection still applies in-memory + is logged (no throw, no blocking UI) — instant switch beats blocking on a rare storage error. **Human gate 2026-07-09: APPROVED as-is**; a `TODO(FO1)` must mark the path (task-7).
- First paint gated until i18n ready (return `null`/hold splash) — avoids a flash of untranslated copy.
- At least one interpolated + one pluralized key introduced during migration and tested — AC11/AC12 require proving these i18next capabilities.
- **FO2 — Human gate 2026-07-10: risk ACCEPTED** (details in Follow-on FO2 above). The selector container's `radiogroup` group role/label is very likely not exposed to native AT (WCAG 1.3.1 / 4.1.2, Level A); accepted for shipping (mirroring FO1) — pre-existing/systemic, no verified-safe fix with this repo's tooling, task stays completable. Closes `reviewer_accessibility`'s escalation at APPROVED.
