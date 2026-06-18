# EPIC-10 — Internationalisation (i18n) — `client-portal` frontend
> Priority: before EPIC-01 frontend tasks | Status: ✅ Stories + tasks defined

> **Scope note:** This epic covers the `client-portal` frontend only — i18n library wiring, translation files, and the frontend error-code mapping hook. All backend i18n work (PreferredLanguage, locale claim, language endpoints, email templates, ErrorCodes) has been absorbed into EPIC-01 and EPIC-04. Backoffice i18n is in [EPIC-10B](EPIC-10B-i18n-backoffice.md).

---

## Overview

Wires the i18n library into the `client-portal` SPA and establishes the translation file structure that every subsequent epic builds on. Spanish (`es`) is the default and primary language; English (`en`) is supported at launch.

**What this epic delivers:**
- `react-i18next` + `i18next` + `i18next-http-backend` installed and configured in `client-portal`
- TypeScript type augmentation for compile-time key safety
- Translation file structure (`public/locales/{lng}/{ns}.json`) with seeded `common`, `auth`, and `errors` namespaces
- `useApiError` hook that maps backend error codes to localised strings
- All existing `client-portal` component strings replaced with `t()` calls

**What this epic does NOT deliver (absorbed elsewhere):**
- `PreferredLanguage` on `ApplicationUser` → EPIC-01 TASK-01.1.1
- `locale` JWT claim via `LocaleClaimHandler` → EPIC-01 TASK-01.1.2
- `PATCH /internal/users/{id}/language` endpoint → EPIC-01 TASK-01.7.1
- `PATCH /api/me/language` endpoint + `IIdentityInternalClient` → EPIC-01 TASK-01.7.2
- `LanguageSwitcher` component → EPIC-01 TASK-01.7.3
- `TemplateEmailService`, HTML email templates → EPIC-04 TASK-04.3.3
- `ErrorCodes.cs` + `ErrorMessages.cs` in `api` → EPIC-01 TASK-01.6.1

**Architectural constraint:** Language is never auto-detected from the browser. The `AuthProvider` reads the `locale` claim from the decoded access token after login (EPIC-01 TASK-01.2.2) and calls `i18n.changeLanguage(locale)`. This epic must be complete before any `client-portal` frontend task in any other epic writes user-visible strings.

---

## Architecture Note

### Decisions resolved

**Library choice**

`client-portal` and `backoffice` both use **`react-i18next`** (backed by `i18next` core), `i18next-http-backend` for lazy loading, identical semver versions. `@lingui/react` was considered and rejected — its compile step adds toolchain complexity not justified at this scale.

**Translation file format and folder structure**

- Format: **nested JSON**, namespaced by feature area.
- Path: `public/locales/{lng}/{ns}.json` — served as Vite static assets, fetched by `i18next-http-backend` at runtime. No bundled strings.
- Namespaces: `common` (buttons, nav, generic labels), `auth` (login, activation, password reset), `errors` (error code → localised message). New epics add namespaces rather than growing `common`. The `tickets` namespace is added when ticket UI is built (EPIC-02/03).
- Key naming: `camelCase`, nested objects for hierarchy (`form.email.label`). `errors.json` is the only exception — keys are error code strings (`"E0101"`).
- TypeScript safety: `src/i18next.d.ts` augments `CustomTypeOptions.resources` so translation key typos are caught at compile time.

**i18n initialisation order**

`src/i18n.ts` is imported as a side-effect in `src/main.tsx` before any component mounts. The app root is wrapped in `<Suspense>` so translation files are loaded before any UI renders. The `AuthProvider` (EPIC-01 TASK-01.2.2) calls `i18n.changeLanguage(locale)` after decoding the access token — this epic wires the machinery; EPIC-01 drives it.

**Frontend error mapping**

Backend is culture-agnostic (`ErrorCodes.cs` in `api`, delivered in EPIC-01 TASK-01.6.1). Every error response carries a structured code (`E0101`) and an English `message`. The `useApiError` hook maps the code to the user's active language via the `errors` namespace; if the code is not found, it falls back to the API's English `message`.

---

## User Stories

---

### US-10.1 — Frontend i18n infrastructure is set up for `client-portal`
> *As a developer, I want the `client-portal` frontend wired with an i18n library and translation files so that all user-visible strings can be localised without touching component code.*

**Acceptance Criteria:**
- [ ] `react-i18next`, `i18next`, and `i18next-http-backend` are installed and configured in `client-portal`.
- [ ] Translation files exist for `es` (default) and `en` under `public/locales/`.
- [ ] All user-visible strings in existing components are referenced via `t()` keys — no hardcoded UI text.
- [ ] Spanish is the fallback language: a missing key in the active language shows the Spanish string, not a raw key.
- [ ] The active language is set programmatically from the JWT `locale` claim after login (via `AuthProvider` in EPIC-01) — never auto-detected from the browser.
- [ ] Changing the active language via `i18n.changeLanguage()` re-renders all text immediately without a page reload.
- [ ] An `useApiError` hook maps backend error codes to localised strings, falling back to the English `message` for unknown codes.

**Story Points:** 3

---

#### TASK-10.1.1 — Install and configure i18next + TypeScript type augmentation in `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** none

**What to build:**
Install `i18next`, `react-i18next`, and `i18next-http-backend` as dependencies. Create `src/i18n.ts` that initialises i18next with the http backend, `fallbackLng: "es"`, `supportedLngs: ["es", "en"]`, and namespaces `["common", "auth", "tickets", "errors"]`. The `loadPath` is `/locales/{{lng}}/{{ns}}.json`. Wrap the React app root in `<Suspense>` in `src/main.tsx` and import `./i18n` as a side effect before any component mounts. Create `src/i18next.d.ts` augmenting `CustomTypeOptions.resources` with the `es` namespace types and `defaultNS: "common"` — so translation key typos are caught at compile time from the very first commit.

**Constraints:**
- No browser language detection — `i18next-browser-languagedetector` must NOT be installed. Language is always set programmatically (by `AuthProvider` reading the JWT `locale` claim).
- `interpolation.escapeValue` must be `false` (React handles XSS escaping).
- `debug` mode is `true` only in Development (`import.meta.env.DEV`).
- No translation strings bundled in the JS bundle — all loaded via http backend at runtime.
- `CustomTypeOptions.resources` must include all namespaces: `common`, `auth`, `tickets`, `errors`.

**Definition of Done:**
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] `src/i18n.ts` exists and exports the configured i18next instance.
- [ ] `i18next`, `react-i18next`, `i18next-http-backend` appear in `package.json` dependencies.
- [ ] `src/main.tsx` imports `./i18n` before mounting the app and wraps the root with `<Suspense>`.
- [ ] `src/i18next.d.ts` exists with `CustomTypeOptions` augmentation covering all namespaces.

---

#### TASK-10.1.2 — Create translation file structure and seed existing strings in `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-10.1.1

**What to build:**
Create `public/locales/es/` and `public/locales/en/` with `common.json`, `auth.json`, and `errors.json` namespace files. Seed all files with every string currently used in any existing component (auth pages, navigation, buttons, loading/error states from EPIC-09 scaffold). Replace every hardcoded user-visible string in existing `.tsx` files with the corresponding `t('key')` call. `errors.json` must contain all error codes defined in `ErrorCodes.cs` (EPIC-01 TASK-01.6.1) — coordinate with that task so codes are available before seeding.

**Constraints:**
- Path: `public/locales/{lng}/{ns}.json` — served as Vite static assets, no imports needed.
- Key naming: `camelCase`, nested objects for hierarchy. Example: `{ "form": { "email": { "label": "Correo electrónico" } } }`.
- `errors.json` keys are error code strings (`"E0101"`) — the only exception to the camelCase rule.
- Spanish files are the source of truth and must be fully populated. English files must have correct semantic translations — not placeholder text.
- No raw translation strings in any `.tsx` file after this task — every visible string must use `t()`.

**Definition of Done:**
- [ ] `public/locales/es/common.json` and `public/locales/en/common.json` exist and are valid JSON.
- [ ] `public/locales/es/auth.json` and `public/locales/en/auth.json` exist and are valid JSON.
- [ ] `public/locales/es/errors.json` and `public/locales/en/errors.json` exist, are valid JSON, and contain all codes from `ErrorCodes.cs`.
- [ ] No hardcoded user-visible strings remain in any `.tsx` file.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-10.1.3 — `useApiError` hook in `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-10.1.2, EPIC-01 TASK-01.6.1

**What to build:**
Create `src/lib/useApiError.ts` (or `src/lib/apiError.ts` if a plain utility is preferred over a hook). The function accepts the API error response object (shape: `{ error: { code, message } }` or `{ errors: [{ code, field, message }] }`), looks up the code in the `errors` i18next namespace via `i18n.exists('errors:CODE')` before calling `t('errors:CODE')`, and returns the localised string. Falls back to the API's English `message` string for any code not found in the namespace.

**Constraints:**
- Use `i18n.exists('errors:CODE')` before calling `t()` — avoids triggering i18next's missing-key warning for unknown codes.
- Fallback to the raw English `message` must be explicit in code — do not rely on i18next's `missingKeyHandler`.
- The hook/utility is used in TanStack Query `onError` callbacks and form submission error handlers — never called directly in JSX.
- Handles both single-error (`error.code`) and validation-error (`errors[].code`) shapes.

**Definition of Done:**
- [ ] `src/lib/useApiError.ts` exists in `client-portal`.
- [ ] Switching the active language causes error messages displayed in the UI to update without re-fetching.
- [ ] An unrecognised error code returns the English `message` from the API response — not a raw key string.
- [ ] `npm run build` succeeds.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-10.1 | Frontend i18n infrastructure — `client-portal` | 3 |
| **Total** | | **3** |

> **Backend i18n tasks previously in this epic** (PreferredLanguage, locale claim, language endpoints, email templates, ErrorCodes) are now in **EPIC-01** (US-01.1, US-01.2, US-01.7) and **EPIC-04** (TASK-04.3.3). See those epics for the full picture.

---

## Task Breakdown

| Task ID | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-10.1.1 | Install and configure i18next + TS type augmentation | US-10.1 | client-portal | none |
| TASK-10.1.2 | Translation file structure and seed existing strings | US-10.1 | client-portal | TASK-10.1.1 |
| TASK-10.1.3 | `useApiError` hook | US-10.1 | client-portal | TASK-10.1.2, EPIC-01 TASK-01.6.1 |

---

> **Note for Architect:**
>
> - **Sequencing**: TASK-10.1.1 must be complete before any `client-portal` task in EPIC-01 writes user-visible strings. TASK-10.1.2 seeds strings from components that exist at the time — new components added in later epics add their own keys as they go.
> - **`tickets` namespace**: seeded as empty in TASK-10.1.2; populated when ticket UI is built in EPIC-02/03.
> - **`errors.json` seeding**: depends on `ErrorCodes.cs` being finalised in EPIC-01 TASK-01.6.1. If that task is not complete when this epic runs, seed `errors.json` with the auth-domain codes (`E01xx`) that are known and fill the rest as EPIC-01 TASK-01.6.1 lands.
> - **`AuthProvider` wiring**: this epic does not wire `i18n.changeLanguage` to the JWT `locale` claim — that is done in EPIC-01 TASK-01.2.2. This epic only installs the machinery.
