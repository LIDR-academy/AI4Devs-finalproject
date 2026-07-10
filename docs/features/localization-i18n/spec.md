---
feature: localization-i18n
story: user-stories/localization-i18n.md
status: spec_ready
---

# Spec — localization-i18n

## Summary
AI Study Buddy must display its UI in the user's language across web, iOS, and Android from one Expo codebase. This feature adds a new shared library `@helsoft/localization` that wraps **i18next + react-i18next**, ships resource bundles for **English (`en`, base/fallback), Spanish (`es`), Portuguese (`pt`), German (`de`)**, and exposes a provider plus a translation hook so any lib or app component can translate without importing i18next directly.

The active language is chosen by **auto-detect + manual override**: on first launch the app resolves the device locale via `expo-localization`; the user can override it from the existing **Settings** screen, and that choice **persists** across restarts and **wins over** the device locale. Every existing user-facing hardcoded string in `libs/components/` and `apps/app-study-buddy/` is migrated to translation keys — no hardcoded UI copy remains. Adding a locale later is config-only (drop a resource bundle + register its code).

## User stories
- As a **multilingual user of AI Study Buddy**, I want **the app to display in my language and let me switch languages in-app**, so that **I can study comfortably in the language I understand best, on web, iOS, or Android**.
- As a **returning user**, I want **my chosen language remembered across restarts**, so that **I never have to reselect it or be surprised by my device locale overriding my choice**.
- As a **developer**, I want **all UI copy sourced from translation keys with a config-only path to add a locale**, so that **the product can localize new markets without reworking components**.

## Acceptance criteria (Given/When/Then)

### Library & provider
- **AC1** — Given the app starts, When the root layout (`apps/app-study-buddy/src/app/_layout.tsx`) mounts, Then the `LocalizationProvider` from `@helsoft/localization` is mounted above the router so every screen and shared component can access translations.
- **AC2** — Given a component rendered inside the provider, When it requests a translation key that exists in the active locale, Then it renders the translated string for that locale without importing i18next directly (only the lib's hook).
- **AC3** — Given the localization lib, When it initializes i18next with react-i18next, Then it is configured with `fallbackLng: 'en'` and registers resource bundles for `en`, `es`, `pt`, `de`, each exported through the lib's `index.ts` barrel; a key resolves from the active locale's bundle.

### Auto-detection (first launch)
- **AC4** — Given first launch with no saved preference, When the device locale is one of `en`/`es`/`pt`/`de`, Then the UI resolves the initial locale to that language and renders in it.
- **AC5** — Given first launch with no saved preference, When the device locale is unsupported, Then the UI falls back to **English**.

### Manual override & switching
- **AC6** — Given the Settings screen, When it renders, Then it shows a language selector listing the 4 supported languages each labeled in its **own** name (English, Español, Português, Deutsch), with the active language visibly indicated.
- **AC7** — Given the Settings screen, When the user selects a different language, Then the UI updates **immediately** (no app restart) across app screens and shared components.
- **AC8** — Given the user has selected a language, When they close and reopen the app, Then the app launches in the selected language, and that saved choice **takes precedence over the device locale**.

### Coverage & correctness
- **AC9** — Given any user-facing screen or shared component in `libs/components/` and `apps/app-study-buddy/`, When it renders, Then every visible string comes from a translation key and no hardcoded UI copy remains (including Expo Router screen titles).
- **AC10** — Given a key missing from the active locale, When a component renders it, Then it falls back to the English string and never renders a raw key or crashes.
- **AC11** — Given a string that interpolates values, When it is rendered with those values, Then i18next injects them into the correct positions.
- **AC12** — Given a string with plural forms, When it is rendered with a count, Then i18next selects the correct plural form for the active locale.
- **AC13** — Given the app runs on web, iOS, and Android, When any of the behaviors above run, Then localization behaves identically because the config/resolution logic lives in the shared, platform-agnostic lib.
- **AC14** — Given the language selector, When rendered, Then each option exposes an accessible role/label, the active selection is announced to assistive tech, and the active state is **not** conveyed by color alone (a non-color indicator is present). *(Known limitation on the container's group role/label for native assistive tech — see Follow-on FO2.)*
- **AC15** — Given reading the saved preference from the platform store fails, When the app resolves the initial locale, Then it degrades gracefully to device detection (and then English) without crashing, and the UI still renders.

## UI states
The only new visible UI surface is the **language selector** on the Settings screen; the rest of the feature is cross-cutting (translation of existing screens). Reasoning per state below.

| State | Applies? | Trigger | Notes |
|---|---|---|---|
| Loading | Yes (provider/app-init level) | Cold start while the provider resolves the initial locale (async read of the saved preference + device detection) before first paint | Gate first paint until i18n is ready, mirroring the existing `useSession` loading gate in `_layout.tsx` (returns `null`/keeps splash until ready). The selector component itself is synchronous once mounted. |
| Content | Yes | Provider ready; Settings screen open | Selector lists the 4 supported languages in their own names, active one indicated; all screens render translated copy. This is the primary state. |
| Error | **No dedicated blocking state** | Persistence read/write failure or a missing key | By design this feature **degrades gracefully** rather than showing an error screen: a failed preference read falls back to device detection/English (AC15); a missing key falls back to English (AC10). A failed **save** still applies the selection in-memory for the session (see Open decisions). No blocking error UI in MVP. |
| Empty | **N/A** | — | The supported-locale set is a fixed, non-empty list (4 at launch). The selector can never have zero options, so there is no empty state. |

## Analytics events
**None for MVP.** No analytics events are defined for this feature. (If language-switch telemetry is wanted later, a single `language_changed` event carrying the target locale would suffice — deliberately deferred; not required by the story.)

## Feature flags
**None.** The feature ships unflagged. Localization is foundational UI plumbing (every screen renders through it) rather than an experiment, so a flag would add branching without value.

## Out of scope / non-goals
- **Locale-aware date/number/currency formatting** — deferred (per story) unless a translated string requires interpolation of an already-formatted value.
- **RTL layout support** — none of the launch locales (en/es/pt/de) are RTL; RTL mirroring is out of scope.
- **Translating dynamically generated lesson content** — the lesson text/activities come from the user's PDF + their AI provider, not app UI chrome. Only app UI strings are localized; generated content is not translated.
- **Adding locales beyond en/es/pt/de** — the architecture makes adding one config-only, but shipping additional languages is a follow-on.
- **Machine/automated translation of copy** — es/pt/de strings are authored/provided, not auto-generated at runtime.
- **A settings surface beyond language** — this story only adds the language selector to the existing Settings screen; other settings are untouched.

## Follow-on (deferred, tracked)
- **FO1 — Robust failed-save handling.** The MVP applies a language selection in-memory and logs on a persistence-save failure (see Open decisions). A follow-on should improve this: retry/queue the write and/or surface a non-blocking notice so the user knows their choice may not survive a restart. The interim behavior carries a `TODO(FO1)` at the failed-save path in task-7 so it is discoverable and not mistaken for finished work.
- **FO2 — Known limitation: the language selector's `radiogroup` group role/label is very likely not exposed to native (iOS/Android) assistive tech (AC14).** `LanguageSelector`'s container `View` (`libs/components/src/molecules/language-selector/language-selector.tsx:38`) sets `accessibilityRole="radiogroup"` and a group `accessibilityLabel`, but per React Native's own accessibility model a plain `View` is only an accessibility element (i.e. exposed to VoiceOver/TalkBack at all) when `accessible={true}` is explicitly set — which this container deliberately does not do, because doing so would very likely make VoiceOver treat the container as one opaque leaf element and stop recursing into its children, making the four individually-accessible `radio` options **unreachable** (verified: RN's `RCTViewComponentView.mm:398` gates `UIView.isAccessibilityElement` 1:1 on the `accessible` prop). Investigated during round-2 review (2026-07-10): no public React Native `View` prop exists that exposes a group role/label to native assistive tech without either (a) making the container swallow its children (the `accessible={true}` trap) or (b) requiring native-module-level work outside a plain `View`'s public API (see `tdd.md` Phase 6 for the full investigation, including an empirical probe showing our test tooling — Jest + `@testing-library/react-native` — cannot even faithfully model this native swallowing behavior, so it cannot be used to safely verify a candidate fix either). Every individual `radio` option remains fully labelled, roled, and stated, so the task stays completable; what's missing is the explicit "this is one group of N" framing on iOS/Android specifically (web is unaffected — `react-native-web` maps `accessibilityRole` straight to the DOM `role` attribute regardless of `accessible`). This is a design-system-wide gap, not unique to this feature — the identical pattern predates this feature in the sibling `libs/components/src/molecules/radio-group/radio-group.tsx:29` — so a generic fix (if one exists at all, e.g. via a native module exposing iOS's `UIAccessibilityContainer.accessibilityElements` or an Android-specific approach, each requiring on-device VoiceOver/TalkBack verification this repo's tooling cannot provide) is **out of this feature's scope** and flagged here for a human/product follow-up decision, in the same spirit as FO1. **Human gate (2026-07-10): risk ACCEPTED as-is** (see Open decisions) — the feature ships with this documented Level-A limitation; closing it is deferred to a design-system follow-up covering both `LanguageSelector` and the sibling `RadioGroup`.

## Open decisions (resolved with rationale)
- **Decision:** The shared `Locale` union type + `SUPPORTED_LOCALES` + `FALLBACK_LOCALE` constants live in `@helsoft/types` (`libs/types/src/locale.ts`), not in `@helsoft/localization`. — **why:** both `@helsoft/localization` (config/detection) and `@helsoft/services` (preference validation) need the supported-locale set. `@helsoft/services` already depends on `@helsoft/types` but not on `@helsoft/localization`; putting the set in types is the single source of truth and avoids a circular dependency (`localization → services` for persistence, `services → localization` for the set). A string union + a `const` array are plain TS, satisfying the types-lib rule.
- **Decision:** The **native language labels** (English, Español, Português, Deutsch) are static endonyms held in `@helsoft/localization` config, not translation keys. — **why:** the story requires each language be labeled in its *own* name regardless of the active locale, so they must not change when the UI language changes.
- **Decision:** Persistence uses `@react-native-async-storage/async-storage` (already an app dependency) via a DAO in `@helsoft/services`. — **why:** AsyncStorage is universal — it uses `localStorage` on web and native storage on iOS/Android — satisfying the story's "AsyncStorage native / localStorage web" note with one API and honoring the layering rule (no component touches storage directly; access routes through DAO → service).
- **Decision:** The translation **hook and provider live in `@helsoft/localization`**, not `@helsoft/hooks`. — **why:** they are intrinsic to the i18n React context (mirroring react-i18next's own `useTranslation`); a feature lib owning its provider/hook keeps i18next out of every consumer and matches the story's description. Persistence still routes through `@helsoft/services` (DAO/service) per the layering rule.
- **Decision:** The **language selector is a molecule** in `@helsoft/components` and is **presentational** (props: `options`, `value`, `onChange`, accessibility labels) with no dependency on the localization hook. — **why:** a single-select list of labeled options functioning as a unit is a molecule; keeping it presentational (like the existing `RadioGroup`) makes it token-driven, Storybook-able across locales, and reusable. The wiring to `useLocalization` lives in a feature component in `@helsoft/study-buddy` so the app screen stays a thin shell.
- **Decision:** On a **failed persistence save**, the selection still applies in-memory for the current session and the failure is logged (no thrown error, no blocking UI). — **why:** switching language must feel instant and reliable; losing the persisted preference on a rare storage error is a minor, recoverable degradation (the user re-selects next launch) — better than blocking the switch. **Human gate (2026-07-09): APPROVED as-is.** Additionally, per the human, a documented `TODO` must be left at the failed-save code path (task-7) referencing the follow-on below, so the interim behavior is tracked rather than silent.
- **Decision:** First paint is **gated until i18n is ready** at the provider/root level (return `null`/hold splash), reusing the existing session-loading pattern. — **why:** avoids a flash of untranslated/fallback copy before the resolved locale is known; the resolution is a fast async storage read so the gate is momentary.
- **Decision:** At least one **interpolated** key and one **pluralized** key are introduced during migration (e.g. an interpolated "lesson <id>" title and a pluralized item count) and covered by tests, even though current screens are placeholders. — **why:** AC11/AC12 require these i18next capabilities to be proven; without a real usage they would be untested.
- **Decision (FO2 — Human gate 2026-07-10): risk ACCEPTED.** The `LanguageSelector` container's `radiogroup` group role/label is very likely not exposed to native (iOS/Android) assistive tech (WCAG 1.3.1 / 4.1.2, Level A) — full analysis in Follow-on FO2 and `tdd.md` Phase 6. The human accepts this limitation for shipping, the same way FO1's interim behavior was accepted (2026-07-09). — **why:** the gap is pre-existing and design-system-wide (identical in the sibling `RadioGroup`, predating this feature), has **no verified-safe fix available with this repo's tooling** (the naive `accessible={true}` fix is a proven regression that hides the child options; no Jest/RNTL test can distinguish a safe fix from a harmful one), and does **not** block task completion (every language option remains individually labelled, roled, stated, and operable; the `header` above provides contextual framing; web is unaffected). A genuine fix requires on-device VoiceOver/TalkBack verification and likely a native-module + design-system change — deferred to a separate follow-up covering both `LanguageSelector` and `RadioGroup`. This sign-off satisfies `reviewer_accessibility`'s escalation condition, closing the review at APPROVED.
