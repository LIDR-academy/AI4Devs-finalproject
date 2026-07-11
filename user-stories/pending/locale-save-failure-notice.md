# Locale save-failure notice (Follow-on FO1)

**As a** user who changes the app language
**I want** to be told when my language choice couldn't be saved, with a way to try again
**so that** I'm not surprised by my language reverting after a restart and can re-attempt saving it

## Context
- Follow-on **FO1** from the `localization-i18n` feature (see `docs/features/localization-i18n/spec.md` → "Follow-on (deferred, tracked)").
- **Current (MVP) behavior:** when the language switch is applied, `setLocale` in `@helsoft/localization` calls `i18n.changeLanguage` (instant, in-memory) **and** `LocalePreferenceService.setStoredLocale`. If the save rejects, the error is caught and only `console.warn`-logged; the switch still applies for the session but silently won't survive a restart. A `TODO(FO1)` marks this path at `libs/localization/src/provider/localization-provider.tsx` (~line 56).
- **This story** makes that failure visible and recoverable: on a failed save, show a **non-blocking toast/snackbar** with a **"Try again"** action. **No automatic retry** — the write is attempted once per user action; the toast's retry re-attempts it on demand.
- The instant in-memory switch must **not** regress — the language always changes immediately regardless of save outcome.
- Universal Expo app (web + iOS + Android); layering is `Component → Hook → Service → DAO` (`.agents/rules/hooks-service-dao.mdc`); design system is atomic + token-driven (`.agents/rules/atomic-design.mdc`).

## Acceptance criteria
- **Happy path** — Given the user selects a language and the save succeeds, When the switch applies, Then the UI changes language immediately and **no** notice is shown.
- **Save fails** — Given the user selects a language and `setStoredLocale` rejects, When the failure is caught, Then the language still applies for the current session (in-memory) **and** a non-blocking toast/snackbar appears near the language switch telling the user their choice may not persist across a restart.
  - The toast is **transient and dismissible**, auto-dismisses after a timeout, and never blocks the switch or the rest of the UI.
  - No automatic retry happens — a single save attempt per user action.
- **Retry** — Given the failure toast is shown, When the user taps **"Try again"**, Then the app re-attempts `setStoredLocale` for the currently active locale.
  - On success → the toast confirms/dismisses and the choice is now persisted.
  - On repeated failure → the failure toast is shown again (still actionable); the app never crashes or loops.
- **Persistence proven** — Given a save that later succeeds (initial or via retry), When the app is closed and reopened, Then it launches in the chosen language (the existing `localization-i18n` persistence path).
- **Accessibility** — Given the toast appears, Then it is announced to assistive tech (status/alert live region), the "Try again" action exposes an accessible role/label, and it meets WCAG 2.2 AA contrast and ≥44pt/48dp touch-target rules.
- **Cross-platform** — the behavior is identical on web, iOS, and Android.
- The interim `TODO(FO1)` marker at the failed-save path is resolved/removed as part of this work.

## Notes
- **New component likely needed:** there is no toast/snackbar in `@helsoft/components` today (existing atoms: badge, button, card, checkbox, chip, fab, icon, icon-button, progress-indicator, state-layer, switch). Add a **Snackbar** following the existing Material-3-style tokens (`theme/{colors,elevation,motion,shape,spacing,typography}`), atomic-design placement, with `<name>.stories.tsx` (incl. the with-action + a11y states) and `<name>.test.tsx`. Presentational (props: message, action label, `onAction`, `onDismiss`, duration) — no localization-hook dependency; strings come from translation keys via the consumer.
- **Surfacing the failure (layering decision to confirm in spec):** `setLocale` currently swallows the save error. It should expose the save **outcome** without breaking the instant switch — e.g. return a result, or expose a `lastSaveError`/`onSaveError` from `useLocalization` — so the `LanguageSettings` feature component in `@helsoft/study-buddy` can trigger the toast. The provider/service/DAO layering must be preserved (component never calls the DAO).
- **Copy** is localized (en/es/pt/de) via `@helsoft/localization`, key-aligned with the other bundles — consistent with AC9 of `localization-i18n` (no hardcoded strings).
- No analytics events or feature flags required for MVP (a `locale_save_failed` event could be added later — deferred).
- Out of scope: automatic/background retry or a write queue (explicitly deferred — this story is notify-only); offline-sync of the preference.
- Ready for `/ticket-orchestrator locale-save-failure-notice`.
