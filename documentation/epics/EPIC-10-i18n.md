# EPIC-10 — Internationalisation (i18n)
> Priority: 1.5 (after EPIC-09, before EPIC-01) | Status: ✅ Stories + tasks defined

---

## Overview

Establishes multilanguage support as a cross-cutting foundation for the entire SupportHub product. Spanish (`es`) is the default and primary language; English (`en`) is supported at launch. The i18n infrastructure must be in place before any user-visible strings are hardcoded in the frontends or email templates.

**Scope:**
- Frontend i18n setup for both `client-portal` and `backoffice` (translation files, i18n library wiring, language-aware rendering)
- Language preference stored on the user record in the database and managed by admins via the backoffice
- Language switcher in the top navigation bar of both frontends (applies immediately without page reload)
- Email templates prepared for both `es` and `en` so AWS SES sends in the user's language
- Backend API capable of returning localised error messages and labels in the user's language

**Architectural constraint:** Language is not auto-detected from the browser. It is an admin-managed per-user setting (set when creating or editing a user in EPIC-05). The frontend reads the language from the authenticated user's profile on login and stores it in auth state. The language switcher in the navbar updates both the local i18n context and, optionally, triggers a profile update call — this detail is for the architect to resolve.

---

## Architecture Note

### Decisions resolved from the PO's Note for Architect

---

**Library choice (US-10.1, US-10.2)**

Both `client-portal` and `backoffice` use **`react-i18next`** (backed by `i18next` core). Rationale: widest ecosystem adoption, excellent TypeScript support via module augmentation for compile-time key safety, lazy-loading via `i18next-http-backend`, and Vite-compatible. `@lingui/react` was considered but rejected because its compile step adds toolchain complexity that is not justified at this scale.

Both repos use identical library versions and configuration patterns to minimise cognitive overhead across teams.

**Translation file format and folder structure**

- Format: **nested JSON** (namespaced by feature area).
- Folder convention: `src/locales/{lng}/{ns}.json` — e.g. `src/locales/es/common.json`, `src/locales/en/auth.json`.
- Namespaces: `common` (shared labels, buttons, errors), `auth`, `tickets`, `admin` — one namespace per major feature area. New epics add namespaces rather than growing `common`.
- Key naming: `camelCase`, hierarchical where needed (`form.email.label`). No snake_case keys. No hardcoded fallback strings in component JSX — always use `t('key')`.
- Translation files are loaded lazily at runtime via `i18next-http-backend` (served as static assets by Vite dev server / production build). No bundled translation strings.
- TypeScript type safety: `i18next.d.ts` module augmentation wires `CustomTypeOptions.resources` to the `es` namespace types so translation key typos are caught at compile time.

**Language stored in the user record (US-10.4)**

The `PreferredLanguage` field lives on `ApplicationUser` in the **`identity`** repo (`Identity.Infrastructure/Identity/ApplicationUser.cs`). Rationale: the `identity` server already owns `ApplicationUser` and issues the access token — placing the field there avoids a cross-service DB call at token-issuance time. The field is a `string` column, ISO 639-1 code: `"es"` (default) or `"en"`.

Because the field lives in `identity`, no `api`-side entity change is required for US-10.4 itself. The `api` reads the language from the JWT claim.

**Language claim in JWT (US-10.3, US-10.6)**

OpenIddict is configured to include the `PreferredLanguage` value as the `locale` custom claim in the access token. The claim is added via a custom `IOpenIddictClaimsDestinationsHandler` (or equivalent OpenIddict claims principal customisation hook) in `Identity.Infrastructure`. Claim name: **`locale`** (aligns with OIDC standard claim). Value: ISO 639-1 code (`"es"` / `"en"`).

Both SPAs read `locale` from the decoded JWT claims at login and initialise `i18next` with that language — no extra API call required.

**Language switcher persistence (US-10.3)**

When the user changes language via the navbar, the new preference is persisted via **`PATCH /api/me/language`** in the `api` repo. The `api` service updates the `identity` store via a server-to-server call (using an internal service token or admin credential) OR — simpler and preferred — the `api` delegates the update to `identity` via an internal HTTP endpoint (`PATCH /internal/users/{id}/language`) protected by a shared secret env var (`INTERNAL_API_KEY`). The `api` owns the `PATCH /api/me/language` surface and calls identity internally.

> **Architect flag:** The internal identity endpoint is a deliberate architectural shortcut. An alternative (user updates identity directly from the SPA) would require the SPA to hold an identity-scoped token — more complex. The internal call approach is preferred.

If the server call fails, the SPA still switches locally (US-10.3 AC) and shows a non-blocking toast warning.

**Backend error localisation (US-10.6)**

.NET's built-in `IStringLocalizer<T>` with `.resx` resource files is used in the `api` repo. Resource file structure:

```
Api.Infrastructure/Resources/
  Errors.es.resx     ← default (Spanish)
  Errors.en.resx
```

`RequestLocalizationOptions` is configured in `AddInfrastructure` with supported cultures `["es", "en"]` and a custom `IRequestCultureProvider` that reads the `locale` JWT claim (not the `Accept-Language` header) and sets the thread culture. Error message keys are referenced via `IStringLocalizer<ErrorMessages>` injected into use cases. Adding a new language requires only a new `.resx` file — no code changes.

**Email template strategy (US-10.5)**

Email templates are stored as `.html` files per language in `Api.Infrastructure/EmailTemplates/{template}/{lng}.html` (e.g. `EmailTemplates/Invitation/es.html`, `EmailTemplates/Invitation/en.html`). Variable substitution uses simple `{{VariableName}}` placeholder replacement — no external template engine dependency. The `IEmailService.SendAsync` signature gains a `string language` parameter (or a `UserEmailContext` record that includes language). The service selects the correct file at runtime; if the language file is not found, it falls back to `es`.

---

## User Stories

---

### US-10.1 — Frontend i18n infrastructure is set up for `client-portal`
> *As a developer, I want the `client-portal` frontend wired with an i18n library and translation files so that all user-visible strings can be localised without touching component code.*

**Acceptance Criteria:**
- [ ] An i18n library is configured in `client-portal` (library choice is left to the architect).
- [ ] Translation files exist for `es` (Spanish, default) and `en` (English) under a dedicated translations folder.
- [ ] All user-visible strings in the app are referenced via translation keys — no hardcoded UI text in any component.
- [ ] Spanish is used as the fallback language: if a key is missing in the active language, the Spanish string is shown rather than a raw key.
- [ ] The active language is initialised from the authenticated user's profile on login and persisted in the i18n context for the duration of the session.
- [ ] Changing the active language updates all rendered text immediately without a full page reload.
- [ ] Date, time, and number formatting respect the active locale.

**Story Points:** 3

---

#### TASK-10.1.1 — Install and configure i18next in `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** none

**What to build:**
Install `i18next`, `react-i18next`, and `i18next-http-backend` as dependencies. Create `src/i18n.ts` that initialises i18next with the http backend, sets `fallbackLng: "es"`, `supportedLngs: ["es", "en"]`, and the namespace list (`common`, `auth`, `tickets`). The `loadPath` points to `/locales/{{lng}}/{{ns}}.json`. Wrap the React app in `<Suspense>` in `src/main.tsx` to handle lazy translation loading. Export the configured `i18n` instance for use elsewhere.

**Constraints:**
- No browser language detection (`i18next-browser-languagedetector` is NOT installed). Language is always set programmatically from the user profile — never inferred from the browser.
- `interpolation.escapeValue` must be `false` (React handles escaping).
- `debug` mode is `true` in Development only (`import.meta.env.DEV`).
- The `i18n.ts` file must be imported as a side effect in `src/main.tsx` before any component renders.
- No translation keys are bundled in the JS bundle — all loaded via http backend at runtime.

**Definition of Done:**
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] `src/i18n.ts` exists and exports the configured i18next instance.
- [ ] `i18next`, `react-i18next`, `i18next-http-backend` appear in `package.json` dependencies.
- [ ] `src/main.tsx` imports `./i18n` before mounting the app and wraps with `<Suspense>`.

---

#### TASK-10.1.2 — Create translation file structure for `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-10.1.1

**What to build:**
Create the translation file folder structure under `public/locales/`. Each namespace gets a JSON file per language. Seed the files with all keys already needed by any existing component strings (e.g. auth page labels, navigation labels, button labels, loading/error states). Spanish (`es`) files must be complete — English (`en`) files mirror the same keys with English values.

**Constraints:**
- Path convention: `public/locales/{lng}/{ns}.json` — served as static assets by Vite (no import needed, fetched by http backend).
- Keys use `camelCase`, nested objects for hierarchy (e.g. `{ "form": { "email": { "label": "Correo electrónico" } } }`).
- No raw translation strings in any `.tsx` component file — every visible string must have a key in `es` and `en`.
- Namespaces for this epic: `common.json` (buttons, nav, generic labels), `auth.json` (login, activation, password reset strings).
- Spanish is the source of truth; English values must be semantically correct (not placeholder text like "TODO").

**Definition of Done:**
- [ ] `public/locales/es/common.json` and `public/locales/en/common.json` exist and are valid JSON.
- [ ] `public/locales/es/auth.json` and `public/locales/en/auth.json` exist and are valid JSON.
- [ ] No hardcoded user-visible strings remain in any `.tsx` file (grep for raw UI strings in JSX).
- [ ] `npm run build` succeeds.

---

#### TASK-10.1.3 — TypeScript type-safe translation keys for `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-10.1.2

**What to build:**
Create `src/i18next.d.ts` that augments the `i18next` module's `CustomTypeOptions` interface. Wire `resources` to the shape of the Spanish (`es`) translation JSON files so that `t('key')` calls are compile-time checked. Add a `defaultNS: 'common'` entry so `t('someKey')` without namespace prefix resolves against `common`.

**Constraints:**
- The type file augments `declare module 'i18next'` — it does not import translation files at runtime.
- Only the `es` (Spanish) namespace types are used for the type definition (it is the source of truth).
- The `CustomTypeOptions.resources` must include all defined namespaces (`common`, `auth`, `tickets`).
- After this task, a misspelled translation key in a `.tsx` file must produce a TypeScript compile error.

**Definition of Done:**
- [ ] `src/i18next.d.ts` exists with `CustomTypeOptions` augmentation.
- [ ] `npm run build` (tsc strict) succeeds with no errors.
- [ ] Introducing a deliberately misspelled key (e.g. `t('nonexistent.key')`) produces a TypeScript error (verify manually and revert).

---

### US-10.2 — Frontend i18n infrastructure is set up for `backoffice`
> *As a developer, I want the `backoffice` frontend wired with the same i18n library and translation files so that admin-facing UI is also fully localisable.*

**Acceptance Criteria:**
- [ ] The same i18n library and configuration approach as US-10.1 is applied to the `backoffice` repo.
- [ ] Translation files exist for `es` and `en` under a dedicated translations folder in `backoffice`.
- [ ] All admin-facing UI strings are referenced via translation keys — no hardcoded text in any component.
- [ ] Spanish is the fallback language for missing keys.
- [ ] The active language is initialised from the authenticated admin user's profile on login.
- [ ] Changing the active language updates all rendered text immediately without a full page reload.

**Story Points:** 2

---

#### TASK-10.2.1 — Install and configure i18next in `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** none

**What to build:**
Mirror TASK-10.1.1 exactly in the `backoffice` repo. Install `i18next`, `react-i18next`, `i18next-http-backend`. Create `src/i18n.ts` with the same configuration: `fallbackLng: "es"`, `supportedLngs: ["es", "en"]`, namespaces (`common`, `admin`, `auth`). Import as side effect in `src/main.tsx`.

**Constraints:**
- Identical library versions to `client-portal` (pin same semver in `package.json`).
- No browser language detection.
- Same `public/locales/{lng}/{ns}.json` path convention as `client-portal`.
- `debug` enabled in Development only.

**Definition of Done:**
- [ ] `npm run build` succeeds for `backoffice` with no TypeScript errors.
- [ ] `src/i18n.ts` exists in `backoffice` with the same structure as `client-portal`.
- [ ] `src/main.tsx` wraps the app in `<Suspense>` and imports `./i18n`.

---

#### TASK-10.2.2 — Create translation file structure and type augmentation for `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10.2.1

**What to build:**
Create `public/locales/es/` and `public/locales/en/` with `common.json`, `auth.json`, and `admin.json` namespace files, seeded with all strings currently used in any existing backoffice component. Create `src/i18next.d.ts` with `CustomTypeOptions` augmentation for type-safe keys. All visible strings in `.tsx` files must be replaced with `t('key')` calls.

**Constraints:**
- `admin.json` covers user management, client management, and dashboard labels specific to the backoffice.
- Spanish files must be fully populated; English files must have correct translations (not placeholders).
- Same key naming convention as `client-portal` (`camelCase`, nested objects).
- No hardcoded user-visible text in any backoffice `.tsx` file after this task.

**Definition of Done:**
- [ ] `public/locales/es/admin.json`, `public/locales/en/admin.json` exist and are valid JSON.
- [ ] `src/i18next.d.ts` exists with `CustomTypeOptions` augmentation.
- [ ] `npm run build` (tsc strict) succeeds with no TypeScript errors.
- [ ] No hardcoded user-visible strings in any `.tsx` file (grep check).

---

### US-10.3 — Language switcher in the navigation bar
> *As a user, I want to switch the interface language from the navigation bar so that I can use SupportHub in my preferred language without going to a settings page.*

**Acceptance Criteria:**
- [ ] A language selector is visible in the top navigation bar on every authenticated page in both `client-portal` and `backoffice`.
- [ ] The selector shows the currently active language and allows switching between Spanish and English.
- [ ] Selecting a language changes the UI immediately (no page reload required).
- [ ] The selected language is persisted to the user's profile on the server so that it is restored on the next login.
- [ ] If saving the preference to the server fails, the UI still switches locally and shows a non-blocking warning.
- [ ] The selected language is reflected in the `lang` attribute on the HTML `<html>` element.

**Story Points:** 3

---

#### TASK-10.3.1 — `PATCH /api/me/language` endpoint in `api`
**Layer:** Application + Infrastructure + API
**Repo:** api
**Depends on:** none

**What to build:**
Add a `UpdateMyLanguageUseCase` in `Api.Application/UseCases/Me/` that accepts a `UpdateLanguageCommand` (containing the new `locale` string). The use case validates the value (must be `"es"` or `"en"`), then calls an `IIdentityInternalClient` interface to forward the update to the `identity` service via `PATCH /internal/users/{userId}/language`. Register `PATCH /api/me/language` on a `MeController` in `Api.API/Controllers/Me/`.

**Constraints:**
- The endpoint requires `[Authorize]` — no anonymous access.
- User ID is extracted from the `sub` JWT claim — never from the request body.
- `IIdentityInternalClient` is defined in `Api.Application/Common/Interfaces/` and implemented in `Api.Infrastructure/Identity/`.
- The internal call to `identity` uses `INTERNAL_API_KEY` from environment variables as a bearer token — add this variable to `.env.example`.
- If the `identity` call fails, the use case returns a `Result.Fail` with a `ServiceUnavailableError` — the controller returns `503`.
- Validation: `locale` must be one of `["es", "en"]`; return `422` for invalid values.
- Route: `PATCH /api/me/language` (controller attribute `[Route("api/me")]`, action `[HttpPatch("language")]`).

**Definition of Done:**
- [ ] `dotnet build` succeeds for the `api` solution.
- [ ] `PATCH /api/me/language` with a valid JWT returns `200 OK`.
- [ ] `PATCH /api/me/language` with `locale: "fr"` returns `422`.
- [ ] `PATCH /api/me/language` without a JWT returns `401`.
- [ ] `INTERNAL_API_KEY` is documented in `api/.env.example`.

---

#### TASK-10.3.2 — `PATCH /internal/users/{id}/language` endpoint in `identity`
**Layer:** Infrastructure + API
**Repo:** identity
**Depends on:** TASK-10.1.1 (ApplicationUser has PreferredLanguage — see TASK-10.4.1)

**What to build:**
Add an `InternalUsersController` in `Identity.API/Controllers/Internal/` with a `PATCH /internal/users/{id}/language` action. The action reads the `INTERNAL_API_KEY` from the `Authorization: Bearer` header, validates it against the env var, updates `ApplicationUser.PreferredLanguage` via `UserManager<ApplicationUser>`, and returns `204 No Content`. This endpoint is not part of the OIDC surface and must not require OpenIddict authentication.

**Constraints:**
- Authentication is a custom header check (`Authorization: Bearer {INTERNAL_API_KEY}`) — NOT `[Authorize]` with JWT Bearer. Use a simple middleware or action filter that reads `IConfiguration["INTERNAL_API_KEY"]`.
- `INTERNAL_API_KEY` must be added to `identity/.env.example`.
- The endpoint is NOT exposed via Swagger (exclude from OpenAPI docs).
- `locale` must be validated to `["es", "en"]` — return `400` for invalid values.
- No new EF Core migration is needed if `PreferredLanguage` is added in TASK-10.4.1 first (depends on that task).

**Definition of Done:**
- [ ] `dotnet build` succeeds for the `identity` solution.
- [ ] `PATCH /internal/users/{id}/language` with correct `INTERNAL_API_KEY` and valid locale returns `204`.
- [ ] Request without correct key returns `401`.
- [ ] `INTERNAL_API_KEY` is in `identity/.env.example`.

---

#### TASK-10.3.3 — `LanguageSwitcher` component in `client-portal`
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-10.1.1, TASK-10.3.1

**What to build:**
Create a `LanguageSwitcher` component in `src/components/LanguageSwitcher.tsx` using a shadcn/ui `Select` (or `DropdownMenu`). It reads the current language from `i18n.language` and calls `i18n.changeLanguage(locale)` on selection. After changing locally, it fires a `PATCH /api/me/language` call via Axios (non-blocking — use TanStack Mutation). On mutation error, show a shadcn/ui `Toast` warning. On language change, update the `<html lang="">` attribute. Mount the component inside the top navigation bar on all authenticated routes.

**Constraints:**
- Language switch is immediate — `i18n.changeLanguage` is called before the server round-trip completes (optimistic).
- Server persistence failure must NOT revert the local language change — only show a non-blocking toast.
- `<html lang="">` update: use `document.documentElement.setAttribute('lang', locale)` after every language change (including on initial load from JWT).
- Only shadcn/ui primitives — no raw `<select>` HTML element.
- TanStack Query mutation is used for the PATCH call (not raw `axios.patch` in a click handler).

**Definition of Done:**
- [ ] `LanguageSwitcher` component exists at `src/components/LanguageSwitcher.tsx`.
- [ ] Switching language in the UI changes all text immediately without page reload.
- [ ] `<html lang="">` reflects the selected locale after switching.
- [ ] A failed server call shows a toast warning and does not revert the local language.
- [ ] `npm run build` succeeds.

---

#### TASK-10.3.4 — `LanguageSwitcher` component in `backoffice`
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10.2.1, TASK-10.3.1

**What to build:**
Mirror TASK-10.3.3 in `backoffice`. Create `src/components/LanguageSwitcher.tsx` with the same behaviour: optimistic local switch, non-blocking server PATCH, toast on error, `<html lang="">` update. Mount in the backoffice top navigation bar on all authenticated routes.

**Constraints:**
- Identical behaviour and constraints to TASK-10.3.3.
- Same TanStack Query mutation pattern, same shadcn/ui primitives.

**Definition of Done:**
- [ ] `LanguageSwitcher` exists in `backoffice/src/components/LanguageSwitcher.tsx`.
- [ ] Switching language in the backoffice UI changes all text immediately.
- [ ] `<html lang="">` is updated on switch.
- [ ] `npm run build` succeeds.

---

### US-10.4 — Admin can set a user's language preference
> *As an admin, I want to set the preferred language for any user from the admin panel so that users receive the portal and emails in their language from day one.*

**Acceptance Criteria:**
- [ ] The user creation and user edit forms in the backoffice include a "Language" field with options: Spanish and English.
- [ ] Spanish is the default value when creating a new user.
- [ ] Saving the form persists the language preference to the user's profile in the database.
- [ ] The language preference is returned as part of the user's profile in the authentication token claims or user-info endpoint so the frontend can read it on login.

**Story Points:** 2

---

#### TASK-10.4.1 — Add `PreferredLanguage` to `ApplicationUser` and EF Core migration (identity)
**Layer:** Infrastructure + DB
**Repo:** identity
**Depends on:** none

**What to build:**
Add a `PreferredLanguage` string property to `ApplicationUser` in `Identity.Infrastructure/Identity/ApplicationUser.cs`. Default value is `"es"`. Configure the column via Fluent API in the `ApplicationUser` entity configuration (max length 10, not nullable, default `"es"`). Generate and apply an EF Core migration to add the column to the `identity.AspNetUsers` table.

**Constraints:**
- `PreferredLanguage` is `string`, not nullable, default `"es"` — enforced at both application and database levels.
- Fluent API configuration goes in `Identity.Infrastructure/Persistence/Configurations/ApplicationUserConfiguration.cs` (create if it doesn't exist).
- Migration is generated from the `Identity.Infrastructure` project targeting `IdentityAppDbContext`.
- No raw SQL — migration is code-first only.
- Existing rows receive `"es"` as the default value (migration sets column default).

**Definition of Done:**
- [ ] `dotnet build` succeeds for the `identity` solution.
- [ ] `ApplicationUser.PreferredLanguage` property exists with default `"es"`.
- [ ] EF Core migration file exists under `Identity.Infrastructure/Migrations/`.
- [ ] `dotnet ef database update` applies the migration without error (dev environment).

---

#### TASK-10.4.2 — Include `locale` claim in OpenIddict access token (identity)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-10.4.1

**What to build:**
Customise OpenIddict's claims principal so that every access token includes the authenticated user's `PreferredLanguage` as the `locale` claim. Implement this via OpenIddict's `IOpenIddictServerHandler<ProcessSignInContext>` (or the `OnProcessSignIn` event hook) in `Identity.Infrastructure/Identity/`. The handler reads `ApplicationUser.PreferredLanguage` from `UserManager` and adds it to the principal's claims with destination `DestinationTypes.AccessToken`.

**Constraints:**
- Claim name must be exactly `"locale"` (standard OIDC claim name).
- The claim must be set to `DestinationTypes.AccessToken` — not just the identity token.
- If `PreferredLanguage` is null or empty, emit `"es"` as the fallback value in the claim.
- Register the handler in `AddInfrastructure` (DI registration in `DependencyInjection.cs`).
- No changes to the OpenIddict endpoint configuration — only a claims handler is added.

**Definition of Done:**
- [ ] `dotnet build` succeeds.
- [ ] After login, the decoded access token JWT contains a `locale` claim with value `"es"` or `"en"`.
- [ ] Changing `ApplicationUser.PreferredLanguage` in the DB and re-logging in reflects the new value in the token.

---

#### TASK-10.4.3 — Language field in backoffice user creation and edit forms
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-10.2.2

**What to build:**
Add a "Language" field (shadcn/ui `Select`, options: Spanish / English) to the user creation form and the user edit form in the backoffice. Spanish (`"es"`) is the default value on the creation form. The selected value is submitted as `preferredLanguage` in the request payload to the `api` user creation / update endpoints (those endpoints are defined in EPIC-05; this task adds the field to the form and the request payload — the field must be wired to whatever form state management is already in place).

**Constraints:**
- Use shadcn/ui `Select` — no raw `<select>`.
- The field label is translated via `t('admin:users.form.language.label')` — add the key to `admin.json` in both `es` and `en`.
- Default value on creation: `"es"`.
- The `preferredLanguage` field is included in the form's submit payload — the receiving API endpoint (EPIC-05) is responsible for persisting it.
- If the EPIC-05 user creation/edit endpoint does not yet exist, the form renders correctly but the submit wiring is noted as a EPIC-05 dependency in a code comment.

**Definition of Done:**
- [ ] Language select field appears in the user creation form and user edit form in the backoffice.
- [ ] Default selection is "Spanish" on the creation form.
- [ ] `admin.json` (es and en) contains the language field label key.
- [ ] `npm run build` succeeds.

---

### US-10.5 — Transactional emails are sent in the user's language
> *As a user, I want to receive system emails (invitation, password reset, ticket notifications) in my preferred language so that communications are clear and relevant to me.*

**Acceptance Criteria:**
- [ ] Email templates for invitation and password reset exist in both Spanish and English.
- [ ] The email service selects the template version that matches the recipient's language preference stored on their profile.
- [ ] If no language preference is set, the email defaults to Spanish.
- [ ] All variables in the templates (user name, ticket title, reset link, etc.) are correctly interpolated in both language versions.
- [ ] Ticket notification emails (from EPIC-08 / EPIC-04) also respect the recipient's language preference.

**Story Points:** 3

---

#### TASK-10.5.1 — Language-aware `IEmailService` interface and template loader (api)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** none

**What to build:**
Update the `IEmailService` interface in `Api.Application/Common/Interfaces/` to include a `string language` parameter (or a `UserEmailContext` record) on `SendAsync`. Create a `TemplateEmailService` in `Api.Infrastructure/Email/` that loads HTML template files from `Api.Infrastructure/EmailTemplates/{templateName}/{language}.html`, performs `{{VariableName}}` placeholder substitution via `string.Replace`, and falls back to `es` if the requested language file does not exist. All template files are embedded resources in the `Api.Infrastructure` assembly.

**Constraints:**
- Template files live at `Api.Infrastructure/EmailTemplates/{templateName}/{language}.html` (e.g. `Invitation/es.html`, `PasswordReset/en.html`).
- Files are embedded resources in `Api.Infrastructure.csproj` (`<EmbeddedResource Include="EmailTemplates/**" />`).
- Placeholder format: `{{VariableName}}` — double curly braces, PascalCase variable names.
- Fallback: if `{language}.html` is not found, load `es.html`. If `es.html` is also not found, throw `InvalidOperationException`.
- `IEmailService` lives in `Api.Application` — no breaking change to callers beyond adding the `language` parameter.
- No external template engine dependency (Scriban, Fluid, etc.) — plain string replacement only.

**Definition of Done:**
- [ ] `dotnet build` succeeds.
- [ ] `IEmailService.SendAsync` signature includes a `language` parameter.
- [ ] `TemplateEmailService` exists at `Api.Infrastructure/Email/TemplateEmailService.cs`.
- [ ] Template files are declared as embedded resources in `Api.Infrastructure.csproj`.

---

#### TASK-10.5.2 — HTML email templates: Invitation (es + en)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-10.5.1

**What to build:**
Create `Api.Infrastructure/EmailTemplates/Invitation/es.html` and `Api.Infrastructure/EmailTemplates/Invitation/en.html`. Both templates are valid, self-contained HTML emails with inline CSS (no external stylesheets). Variables: `{{UserName}}`, `{{ActivationLink}}`, `{{ExpiryHours}}`. Spanish is the primary/reference template; English mirrors it in content and layout.

**Constraints:**
- Templates must contain no hardcoded language-specific strings outside their own file.
- Variable placeholders use exact format `{{VariableName}}` matching what `TemplateEmailService` replaces.
- Both files must be declared as embedded resources (covered by the `EmailTemplates/**` glob in TASK-10.5.1).
- Templates must render correctly when opened as standalone HTML files (for QA preview).
- No external images or fonts — inline styles only (SES delivery reliability).

**Definition of Done:**
- [ ] `Api.Infrastructure/EmailTemplates/Invitation/es.html` exists and is valid HTML.
- [ ] `Api.Infrastructure/EmailTemplates/Invitation/en.html` exists and is valid HTML.
- [ ] Both files contain `{{UserName}}`, `{{ActivationLink}}`, `{{ExpiryHours}}` placeholders.
- [ ] `dotnet build` succeeds (embedded resource included).

---

#### TASK-10.5.3 — HTML email templates: Password Reset (es + en)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-10.5.1

**What to build:**
Create `Api.Infrastructure/EmailTemplates/PasswordReset/es.html` and `Api.Infrastructure/EmailTemplates/PasswordReset/en.html`. Variables: `{{UserName}}`, `{{ResetLink}}`, `{{ExpiryMinutes}}`. Same constraints as TASK-10.5.2 — inline CSS, no external resources, self-contained HTML.

**Constraints:**
- Identical constraints to TASK-10.5.2.
- Variable placeholders: `{{UserName}}`, `{{ResetLink}}`, `{{ExpiryMinutes}}`.

**Definition of Done:**
- [ ] `Api.Infrastructure/EmailTemplates/PasswordReset/es.html` exists and is valid HTML.
- [ ] `Api.Infrastructure/EmailTemplates/PasswordReset/en.html` exists and is valid HTML.
- [ ] Both contain the required `{{VariableName}}` placeholders.
- [ ] `dotnet build` succeeds.

---

#### TASK-10.5.4 — HTML email templates: Ticket Notification (es + en)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-10.5.1

**What to build:**
Create `Api.Infrastructure/EmailTemplates/TicketNotification/es.html` and `Api.Infrastructure/EmailTemplates/TicketNotification/en.html`. Variables: `{{UserName}}`, `{{TicketTitle}}`, `{{TicketKey}}`, `{{EventDescription}}`, `{{PortalLink}}`. Same HTML/CSS constraints as TASK-10.5.2.

**Constraints:**
- Identical constraints to TASK-10.5.2.
- Variable placeholders: `{{UserName}}`, `{{TicketTitle}}`, `{{TicketKey}}`, `{{EventDescription}}`, `{{PortalLink}}`.

**Definition of Done:**
- [ ] `Api.Infrastructure/EmailTemplates/TicketNotification/es.html` exists and is valid HTML.
- [ ] `Api.Infrastructure/EmailTemplates/TicketNotification/en.html` exists and is valid HTML.
- [ ] Both contain the required `{{VariableName}}` placeholders.
- [ ] `dotnet build` succeeds.

---

### US-10.6 — Backend API returns localised error messages
> *As a developer, I want the backend API to return error messages in the user's preferred language so that client-facing error text matches the language the user is working in.*

**Acceptance Criteria:**
- [ ] The API reads the user's language preference from the authenticated JWT claim (or falls back to Spanish if absent).
- [ ] Validation error messages and business-rule error messages returned in the API error envelope are in the user's language.
- [ ] Adding a new supported language requires only adding new string resource files — no code changes to use cases or controllers.
- [ ] The fallback language is Spanish: if a message key is not found for the user's language, the Spanish string is used.

**Story Points:** 3

---

#### TASK-10.6.1 — RequestLocalizationOptions and `locale` claim culture provider (api)
**Layer:** Infrastructure + API
**Repo:** api
**Depends on:** none

**What to build:**
Configure `RequestLocalizationOptions` in `Api.Infrastructure/DependencyInjection.cs` with `SupportedCultures` and `SupportedUICultures` of `["es", "en"]` and `DefaultRequestCulture` of `"es"`. Implement a custom `IRequestCultureProvider` (`JwtLocaleCultureProvider`) in `Api.Infrastructure/Localisation/` that reads the `locale` claim from `IHttpContextAccessor` and returns the matching `ProviderCultureResult`. Register `JwtLocaleCultureProvider` as the first (and only) provider in `RequestLocalizationOptions.RequestCultureProviders` — disable browser (`AcceptLanguageHeaderRequestCultureProvider`) and cookie providers. Register `UseRequestLocalization` middleware in `Program.cs` in the correct pipeline position (after `UseAuthentication`, before `MapControllers`).

**Constraints:**
- Culture provider reads the `locale` claim from `HttpContext.User` — not `Accept-Language` header, not query string, not cookie.
- If the `locale` claim is absent or unrecognised, fall back to `"es"`.
- `UseRequestLocalization` must be placed AFTER `UseAuthentication` in the middleware pipeline so the claim is available.
- No changes to controllers or use cases — culture resolution is infrastructure-only.
- Register `IHttpContextAccessor` in DI if not already registered.

**Definition of Done:**
- [ ] `dotnet build` succeeds.
- [ ] Authenticated request with `locale: "en"` claim results in `Thread.CurrentThread.CurrentUICulture.Name == "en"` (verifiable via a test or log statement).
- [ ] Unauthenticated or missing-claim request defaults to `"es"` culture.

---

#### TASK-10.6.2 — `.resx` error message resource files and `IStringLocalizer` wiring (api)
**Layer:** Infrastructure + Application
**Repo:** api
**Depends on:** TASK-10.6.1

**What to build:**
Create `Api.Infrastructure/Resources/ErrorMessages.es.resx` (Spanish, default) and `Api.Infrastructure/Resources/ErrorMessages.en.resx` (English). Populate both files with all validation and business-rule error message strings currently hardcoded in validators and use cases. Define a marker class `ErrorMessages` in `Api.Infrastructure/Resources/` for `IStringLocalizer<ErrorMessages>` injection. Register `services.AddLocalization()` in `AddInfrastructure`. Update existing validators and use cases to inject `IStringLocalizer<ErrorMessages>` and replace hardcoded message strings with localiser keys.

**Constraints:**
- `.resx` files live in `Api.Infrastructure/Resources/`. The default (invariant) culture is Spanish — `ErrorMessages.es.resx` is the fallback.
- `ErrorMessages.resx` (no culture suffix) must also exist as the invariant fallback file (copy of `es` content) — required by .NET resource loading.
- Key naming: `SCREAMING_SNAKE_CASE` to match error codes (e.g. `TICKET_TITLE_REQUIRED`, `USER_NOT_FOUND`).
- `IStringLocalizer<ErrorMessages>` is injected into Application-layer validators via DI — Application does not reference Infrastructure directly (inject via `IStringLocalizer<T>` interface from `Microsoft.Extensions.Localization` which is in the abstractions package available to Application).
- Adding a new language requires only a new `ErrorMessages.{lng}.resx` file — no code changes.
- Fallback: .NET's resource manager automatically falls back to the invariant (Spanish) resource if a key is missing in the requested culture.

**Definition of Done:**
- [ ] `dotnet build` succeeds with no errors.
- [ ] `Api.Infrastructure/Resources/ErrorMessages.resx`, `ErrorMessages.es.resx`, and `ErrorMessages.en.resx` all exist.
- [ ] A validation error triggered by an authenticated user with `locale: "en"` claim returns an English error message in the API response envelope.
- [ ] A validation error triggered by an authenticated user with `locale: "es"` claim returns a Spanish error message.
- [ ] No hardcoded error message strings remain in validators or use cases (grep check).

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-10.1 | Frontend i18n infrastructure — `client-portal` | 3 |
| US-10.2 | Frontend i18n infrastructure — `backoffice` | 2 |
| US-10.3 | Language switcher in the navigation bar | 3 |
| US-10.4 | Admin can set a user's language preference | 2 |
| US-10.5 | Transactional emails sent in the user's language | 3 |
| US-10.6 | Backend API returns localised error messages | 3 |
| **Total** | | **16** |

---

## Task Breakdown

| Task ID | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-10.1.1 | Install and configure i18next in `client-portal` | US-10.1 | client-portal | none |
| TASK-10.1.2 | Create translation file structure for `client-portal` | US-10.1 | client-portal | TASK-10.1.1 |
| TASK-10.1.3 | TypeScript type-safe translation keys for `client-portal` | US-10.1 | client-portal | TASK-10.1.2 |
| TASK-10.2.1 | Install and configure i18next in `backoffice` | US-10.2 | backoffice | none |
| TASK-10.2.2 | Create translation file structure and type augmentation for `backoffice` | US-10.2 | backoffice | TASK-10.2.1 |
| TASK-10.3.1 | `PATCH /api/me/language` endpoint in `api` | US-10.3 | api | none |
| TASK-10.3.2 | `PATCH /internal/users/{id}/language` endpoint in `identity` | US-10.3 | identity | TASK-10.4.1 |
| TASK-10.3.3 | `LanguageSwitcher` component in `client-portal` | US-10.3 | client-portal | TASK-10.1.1, TASK-10.3.1 |
| TASK-10.3.4 | `LanguageSwitcher` component in `backoffice` | US-10.3 | backoffice | TASK-10.2.1, TASK-10.3.1 |
| TASK-10.4.1 | Add `PreferredLanguage` to `ApplicationUser` + migration | US-10.4 | identity | none |
| TASK-10.4.2 | Include `locale` claim in OpenIddict access token | US-10.4 | identity | TASK-10.4.1 |
| TASK-10.4.3 | Language field in backoffice user creation and edit forms | US-10.4 | backoffice | TASK-10.2.2 |
| TASK-10.5.1 | Language-aware `IEmailService` interface and template loader | US-10.5 | api | none |
| TASK-10.5.2 | HTML email templates: Invitation (es + en) | US-10.5 | api | TASK-10.5.1 |
| TASK-10.5.3 | HTML email templates: Password Reset (es + en) | US-10.5 | api | TASK-10.5.1 |
| TASK-10.5.4 | HTML email templates: Ticket Notification (es + en) | US-10.5 | api | TASK-10.5.1 |
| TASK-10.6.1 | RequestLocalizationOptions and `locale` claim culture provider | US-10.6 | api | none |
| TASK-10.6.2 | `.resx` error message resource files and `IStringLocalizer` wiring | US-10.6 | api | TASK-10.6.1 |

---

> **Note for Architect:**
>
> **Library choice (US-10.1, US-10.2):** The PO has not prescribed an i18n library. Common choices for React + Vite are `react-i18next` (with `i18next`) or `@lingui/react`. The architect should pick one and apply it consistently to both `client-portal` and `backoffice` — both repos must use the same library to minimise cognitive overhead.
>
> **Translation file format and folder structure:** Define the translation file format (JSON namespaces, flat keys, nested keys) and where files live in the source tree (e.g. `src/locales/es/common.json`, `src/locales/en/common.json`). Document the key naming convention so developers follow it consistently from the first feature story.
>
> **Language stored in the user record (US-10.4):** A `PreferredLanguage` field (e.g. `string`, ISO 639-1 code: `"es"` / `"en"`) must be added to `ApplicationUser` in the `identity` repo OR to a `User` entity in the `api` repo. The architect must decide where this lives. If it lives in `api`, the `identity` server must include it in the access token claims via a userinfo claim enrichment step. If it lives in `identity`, it is available as a standard claim. Clarify which entity owns the field before writing tasks for US-10.4.
>
> **Language claim in JWT (US-10.3, US-10.6):** For the frontend to read language on login without an extra API call, the language preference should be included as a custom claim in the OpenIddict access token (e.g. `locale` or `preferred_language`). The architect should confirm claim name and configure OpenIddict to include it.
>
> **Language switcher persistence (US-10.3):** When the user changes language via the navbar, the new preference must be persisted to the server. A lightweight `PATCH /api/me/language` endpoint (or equivalent) is needed. The architect should define whether this lives in `api` or `identity`.
>
> **Backend error localisation (US-10.6):** .NET supports resource files (`.resx`) for localisation via `IStringLocalizer<T>`. The architect should decide the resource file structure and how the user's language preference flows from the JWT claim into the localisation middleware context (`RequestLocalizationOptions` / `IStringLocalizer`).
>
> **Email template strategy (US-10.5):** Email templates need a two-language variant. The architect should decide whether templates are stored as `.html` files per language, embedded resources, or managed in a template engine (e.g. Scriban, Fluid). The `IEmailService.SendAsync` signature may need a `language` parameter or a `UserPreferences` context object.
>
> **Priority placement:** This epic should be completed before any user-visible strings are written in frontend components or email templates. Recommend placing it immediately after EPIC-09 scaffolding and before EPIC-01 frontend tasks — ideally the i18n setup is part of or immediately follows the `client-portal` and `backoffice` scaffold stories (US-09.2.3 / US-09.2.4).
>
> **Scope of US-10.6:** The PO scope is error messages only. However, if the architect finds it simpler to route all labels through the same localisation mechanism (e.g. status label mappings for Jira statuses, priority names), that is a positive side-effect — flag it in the architecture note.
