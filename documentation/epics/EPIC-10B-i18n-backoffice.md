# EPIC-10B — Internationalisation (i18n) — `backoffice`
> Priority: after EPIC-10 (client-portal i18n first) | Status: ✅ Stories + tasks defined

> **Scope note:** This epic covers the `backoffice` frontend only. All architecture decisions (library choice, namespace convention, error code format, `errors.json` structure) are defined in [EPIC-10](EPIC-10-i18n.md) and inherited here. Backend i18n tasks (`identity`, `api`) were absorbed into EPIC-01 and EPIC-04.

---

## Overview

Applies the i18n infrastructure established in EPIC-10 to the `backoffice` frontend. All architectural decisions (library, namespace convention, error code format) are already resolved — this epic is purely an application of those decisions to the admin-facing frontend.

**Scope:**
- i18n library wiring and translation files for `backoffice`
- Language switcher in the backoffice top navigation bar
- Language field in the backoffice user creation and edit forms (sets `PreferredLanguage` on the user record)
- `errors` translation namespace and `useApiError` hook for the backoffice

**Prerequisites:**
- **EPIC-10** (TASK-10.1.1) must be complete — architecture decisions and library versions are established there.
- **EPIC-01** TASK-01.6.1 must be complete — `ErrorCodes.cs` defines the error code catalogue that `errors.json` maps.
- **EPIC-01** TASK-01.7.2 must be complete — `PATCH /api/me/language` endpoint is used by the backoffice `LanguageSwitcher`.
- **EPIC-05** auth tasks must be complete — the `AuthProvider` for backoffice (modelled on EPIC-01 TASK-01.2.2) reads the `locale` claim and calls `i18n.changeLanguage`.

---

## Architecture Note

All architecture decisions are inherited from EPIC-10. For reference:

- **Library:** `react-i18next` + `i18next` + `i18next-http-backend` — identical versions to `client-portal`.
- **Translation file path:** `public/locales/{lng}/{ns}.json` — same convention as `client-portal`.
- **Namespaces:** `common`, `auth`, `admin`, `errors`. The `admin` namespace is backoffice-specific; the others mirror `client-portal`.
- **Key naming:** `camelCase`, nested objects — except `errors.json` which uses error code strings (`"E0101"`) as keys.
- **Error codes:** Defined in `Api.Application/Common/Errors/ErrorCodes.cs` (EPIC-01 TASK-01.6.1). `errors.json` here mirrors the same codes as `client-portal`.
- **Language switcher persistence:** `PATCH /api/me/language` (EPIC-01 TASK-01.7.2) — same endpoint used by `client-portal`.

---

## User Stories

---

### US-10B.1 — Frontend i18n infrastructure is set up for `backoffice`
> *As a developer, I want the `backoffice` frontend wired with the same i18n library and translation files as `client-portal` so that admin-facing UI is fully localisable.*

**Acceptance Criteria:**
- [ ] The same i18n library and configuration approach as EPIC-10 US-10.1 is applied to the `backoffice` repo.
- [ ] Translation files exist for `es` and `en` under `public/locales/` in `backoffice`.
- [ ] All admin-facing UI strings are referenced via translation keys — no hardcoded text in any component.
- [ ] Spanish is the fallback language for missing keys.
- [ ] The active language is initialised from the authenticated admin user's JWT `locale` claim on login.
- [ ] Changing the active language updates all rendered text immediately without a full page reload.

**Story Points:** 2

---

#### TASK-10B.1.1 — Install and configure i18next + TypeScript type augmentation in `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** none

**What to build:**
Install `i18next`, `react-i18next`, and `i18next-http-backend` as dependencies (pin to same semver as `client-portal`). Create `src/i18n.ts` with identical configuration to `client-portal`: `fallbackLng: "es"`, `supportedLngs: ["es", "en"]`, namespaces (`common`, `auth`, `admin`, `errors`), `loadPath: "/locales/{{lng}}/{{ns}}.json"`. Wrap the React app in `<Suspense>` in `src/main.tsx` and import `./i18n` as a side effect. In the same task, create `src/i18next.d.ts` augmenting `CustomTypeOptions.resources` with the `es` namespace types and `defaultNS: "common"`.

**Constraints:**
- Identical library versions to `client-portal` — pin same semver in `package.json`.
- No browser language detection — language is always set programmatically from the JWT `locale` claim.
- `interpolation.escapeValue` must be `false`.
- `debug` mode is `true` in Development only (`import.meta.env.DEV`).
- `CustomTypeOptions.resources` must include all namespaces: `common`, `auth`, `admin`, `errors`.

**Definition of Done:**
- [ ] `npm run build` succeeds for `backoffice` with no TypeScript errors.
- [ ] `src/i18n.ts` exists with the same structure as `client-portal`'s `i18n.ts`.
- [ ] `src/main.tsx` imports `./i18n` before mounting the app and wraps with `<Suspense>`.
- [ ] `src/i18next.d.ts` exists with `CustomTypeOptions` augmentation covering all namespaces (`common`, `auth`, `admin`, `errors`).

---

#### TASK-10B.1.2 — Create translation file structure for `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10B.1.1

**What to build:**
Create `public/locales/es/` and `public/locales/en/` with `common.json`, `auth.json`, `admin.json`, and `errors.json` namespace files. Seed all files with every string currently used in any existing backoffice component. Replace every hardcoded user-visible string in `.tsx` files with the corresponding `t('key')` call. `errors.json` must contain all codes from `ErrorCodes.cs` (EPIC-01 TASK-01.6.1), mirroring `client-portal`'s `errors.json`.

**Constraints:**
- Path convention: `public/locales/{lng}/{ns}.json` — served as static assets by Vite.
- Keys use `camelCase`, nested objects — except `errors.json` which uses error code strings (`"E0101"`) as keys.
- `admin.json` covers user management, client management, and dashboard labels specific to the backoffice.
- Spanish files must be fully populated; English files must have correct translations (not placeholders).
- No hardcoded user-visible text in any backoffice `.tsx` file after this task.

**Definition of Done:**
- [ ] `public/locales/es/common.json`, `public/locales/en/common.json` exist and are valid JSON.
- [ ] `public/locales/es/auth.json`, `public/locales/en/auth.json` exist and are valid JSON.
- [ ] `public/locales/es/admin.json`, `public/locales/en/admin.json` exist and are valid JSON.
- [ ] `public/locales/es/errors.json`, `public/locales/en/errors.json` exist and are valid JSON with all codes from `ErrorCodes.cs` (EPIC-01 TASK-01.6.1).
- [ ] No hardcoded user-visible strings in any `.tsx` file (grep check).
- [ ] `npm run build` (tsc strict) succeeds with no TypeScript errors.

---

### US-10B.2 — Language switcher in the `backoffice` navigation bar
> *As an admin, I want to switch the interface language from the navigation bar so that I can use the backoffice in my preferred language without going to a settings page.*

**Acceptance Criteria:**
- [ ] A language selector is visible in the top navigation bar on every authenticated page in `backoffice`.
- [ ] The selector shows the currently active language and allows switching between Spanish and English.
- [ ] Selecting a language changes the UI immediately (no page reload required).
- [ ] The selected language is persisted to the user's profile on the server so that it is restored on the next login.
- [ ] If saving the preference to the server fails, the UI still switches locally and shows a non-blocking warning.
- [ ] The selected language is reflected in the `lang` attribute on the HTML `<html>` element.

**Story Points:** 1

---

#### TASK-10B.2.1 — `LanguageSwitcher` component in `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10B.1.1, EPIC-01 TASK-01.7.2

**What to build:**
Mirror `client-portal`'s `LanguageSwitcher` component (EPIC-01 TASK-01.7.3) in `backoffice`. Create `src/components/LanguageSwitcher.tsx` using a shadcn/ui `Select` (or `DropdownMenu`). It reads the current language from `i18n.language`, calls `i18n.changeLanguage(locale)` optimistically on selection, fires a non-blocking `PATCH /api/me/language` TanStack Mutation, shows a shadcn/ui `Toast` on error, and updates `<html lang="">`. Mount in the backoffice top navigation bar on all authenticated routes.

**Constraints:**
- Identical behaviour and constraints to EPIC-01 TASK-01.7.3 (`client-portal` switcher).
- Language switch is immediate — `i18n.changeLanguage` is called before the server round-trip completes (optimistic).
- Server persistence failure must NOT revert the local language change — only show a non-blocking toast.
- Only shadcn/ui primitives — no raw `<select>` HTML element.
- TanStack Query mutation is used for the PATCH call.

**Definition of Done:**
- [ ] `LanguageSwitcher` exists at `backoffice/src/components/LanguageSwitcher.tsx`.
- [ ] Switching language in the backoffice UI changes all text immediately without page reload.
- [ ] `<html lang="">` reflects the selected locale after switching.
- [ ] A failed server call shows a toast warning and does not revert the local language.
- [ ] `npm run build` succeeds.

---

### US-10B.3 — Admin can set a user's language preference from the backoffice
> *As an admin, I want to set the preferred language for any user from the user creation and edit forms so that users receive the portal and emails in their language from day one.*

> **Scope:** Backoffice form only. The `PreferredLanguage` field on `ApplicationUser` and the JWT `locale` claim are set up in EPIC-10 (US-10.4).

**Acceptance Criteria:**
- [ ] The user creation and user edit forms in the backoffice include a "Language" field with options: Spanish and English.
- [ ] Spanish is the default value when creating a new user.
- [ ] Saving the form includes `preferredLanguage` in the request payload to the `api` user creation / update endpoints.

**Story Points:** 1

---

#### TASK-10B.3.1 — Language field in backoffice user creation and edit forms
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10B.1.2

**What to build:**
Add a "Language" field (shadcn/ui `Select`, options: Spanish / English) to the user creation form and the user edit form in the backoffice. Spanish (`"es"`) is the default value on the creation form. The selected value is submitted as `preferredLanguage` in the request payload to the `api` user creation / update endpoints (those endpoints are defined in EPIC-05; this task adds the field to the form and the request payload, wired to the existing form state management).

**Constraints:**
- Use shadcn/ui `Select` — no raw `<select>`.
- The field label is translated via `t('admin:users.form.language.label')` — add the key to `admin.json` in both `es` and `en`.
- Default value on creation: `"es"`.
- The `preferredLanguage` field is included in the form's submit payload — the receiving API endpoint (EPIC-05) is responsible for persisting it.
- If the EPIC-05 user creation/edit endpoint does not yet exist, the form renders correctly but the submit wiring is noted as an EPIC-05 dependency in a code comment.

**Definition of Done:**
- [ ] Language select field appears in the user creation form and user edit form in the backoffice.
- [ ] Default selection is "Spanish" on the creation form.
- [ ] `admin.json` (es and en) contains the `users.form.language.label` key.
- [ ] `npm run build` succeeds.

---

### US-10B.4 — Backoffice maps API error codes to localised messages
> *As a developer, I want the backoffice to translate API error codes into the admin's active language so that admins see error messages in their preferred language.*

**Acceptance Criteria:**
- [ ] The `backoffice` has an `errors` translation namespace with all error codes from the EPIC-10 catalogue in both `es` and `en`.
- [ ] A `useApiError` hook maps API error codes to localised strings for the active language.
- [ ] When the active language changes, error messages displayed in the UI update to the new language.
- [ ] Unknown error codes fall back to the English `message` from the API response.

**Story Points:** 1

---

#### TASK-10B.4.1 — `errors` translation namespace and `useApiError` hook in `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** EPIC-01 TASK-01.6.1, TASK-10B.1.2

**What to build:**
The `errors.json` files are already created as part of TASK-10B.1.2. Create a `useApiError` hook in `src/lib/useApiError.ts` that mirrors the `client-portal` implementation (EPIC-10 TASK-10.1.3): accepts the API error response, looks up the code in the `errors` namespace via `t('errors:CODE')`, and falls back to the raw English `message` field if the code is not found.

**Constraints:**
- Identical logic and constraints to EPIC-10 TASK-10.1.3 (`client-portal` version).
- The `useApiError` hook uses `i18n.exists('errors:CODE')` before calling `t()` to avoid missing-key warnings.
- Fallback to the API's English `message` string must be explicit — do not rely on i18next's missing-key handler.
- The hook is used in TanStack Query `onError` callbacks and form submission error handlers.

**Definition of Done:**
- [ ] `src/lib/useApiError.ts` exists in `backoffice`.
- [ ] Switching the active language causes error messages displayed in the backoffice to update without re-fetching.
- [ ] An unrecognised error code displays the English `message` from the API response.
- [ ] `npm run build` succeeds.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-10B.1 | Frontend i18n infrastructure — `backoffice` | 2 |
| US-10B.2 | Language switcher in the `backoffice` navigation bar | 1 |
| US-10B.3 | Admin sets user's language preference from backoffice | 1 |
| US-10B.4 | Backoffice maps API error codes to localised messages | 1 |
| **Total** | | **5** |

---

## Task Breakdown

| Task ID | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-10B.1.1 | Install and configure i18next + TS type augmentation in `backoffice` | US-10B.1 | backoffice | none |
| TASK-10B.1.2 | Create translation file structure for `backoffice` | US-10B.1 | backoffice | TASK-10B.1.1 |
| TASK-10B.2.1 | `LanguageSwitcher` component in `backoffice` | US-10B.2 | backoffice | TASK-10B.1.1, EPIC-01 TASK-01.7.2 |
| TASK-10B.3.1 | Language field in backoffice user creation and edit forms | US-10B.3 | backoffice | TASK-10B.1.2 |
| TASK-10B.4.1 | `errors` translation namespace and `useApiError` hook in `backoffice` | US-10B.4 | backoffice | EPIC-01 TASK-01.6.1, TASK-10B.1.2 |
