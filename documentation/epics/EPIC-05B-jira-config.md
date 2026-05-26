# EPIC-05B — Admin: Jira Configuration
> Priority: 9 | Status: ✅ Stories + tasks defined

---

## Overview

Covers all backoffice admin screens related to Jira configuration: linking a client to a Jira project, testing connectivity, and configuring the webhook secret used to verify inbound Jira events. This epic is the single backoffice destination for all Jira-related admin configuration.

**Scope:** backoffice frontend UI and supporting API endpoints for admin-managed Jira settings. Backend logic for the Jira integration itself lives in EPIC-07 (outbound) and EPIC-08 (inbound).

---

## Architecture Note

### Decisions resolved from the PO's Note for Architect

---

**1. `ClientProject` entity ownership and migration strategy**

EPIC-05B is the canonical owner of `ClientProject`. EPIC-07 (TASK-07.1.3) introduced a stub entity (`Id`, `ClientId`, `JiraProjectKey`) to unblock outbound Jira calls. EPIC-08 (TASK-08.1.1) added `JiraWebhookSecretHash` to that stub. EPIC-05B does **not** recreate the entity — it extends the existing stub with the admin UI and API layer that was always intended to live here. The stub migration from EPIC-08 (TASK-08.1.1) is the foundation; EPIC-05B's tasks consume the existing entity as-is. No migration conflicts arise because `ClientProject` already exists; EPIC-05B only adds the admin use cases and controller that manage it.

---

**2. `ClientProject` — one record per client (1:1)**

`ClientProject` is a 1:1 extension of `Client`. `ClientId` carries a unique index enforced in `ClientProjectConfiguration`. Multi-project-per-client is not a v1 requirement. The entity already carries `ClientId` (Guid, unique FK → `Clients`) and `JiraProjectKey` (string?). EPIC-05B treats it as an upsert-on-save target: if no `ClientProject` row exists for a client, the save creates one; if one already exists, it updates it in-place. This avoids a separate "create vs update" distinction in the API.

---

**3. Jira configuration UI placement — section on the existing `/clients/{id}` page (EPIC-05)**

The Jira configuration section (US-05B.1, US-05B.2) is rendered as a dedicated "Jira Configuration" tab/section on the existing `/clients/{id}` client detail page built in EPIC-05 (TASK-05.9.6). This avoids a redundant standalone route and keeps all per-client settings on one screen. The `/clients/{id}` route already exists by the time EPIC-05B executes. EPIC-05B adds a new `JiraConfigSection` component that is imported and embedded in the client detail page. This is an additive change to an existing page — EPIC-05 does not need to be reopened, only the client detail page component file is extended.

The webhook configuration (US-05B.4) and Jira connectivity test (US-05B.3) are **global** admin operations (not per-client) and live on a dedicated `/jira-settings` route under `AdminShell`. The pre-placed tasks (TASK-07.4.2, TASK-08.6.3, TASK-08.6.4) target this route.

---

**4. Jira connectivity check scope — global, not per-client**

`GET /api/admin/jira/connection-status` (TASK-07.4.1, already defined in EPIC-07) tests the global Jira credentials (`JIRA_USER_EMAIL` + `JIRA_API_TOKEN`). There is no per-client credential validation for the project key in v1 — the connectivity test is sufficient. A per-client project-key existence check (e.g. "does ACME exist in Jira?") is deferred post-v1.

---

**5. Webhook URL display — `API_BASE_URL` env var**

`API_BASE_URL` is already declared in `api/.env.example` by EPIC-08 (TASK-08.6.2). EPIC-05B consumes it via the existing `IWebhookUrlProvider` implementation. No new env var is introduced.

---

**6. US-05B.5 — `EmailNotificationsEnabled` admin toggle — `UpdateEmailPreferenceUseCase` reuse**

The `UserEmailPreference` entity and `IUpdateEmailPreferenceUseCase` are fully defined by EPIC-04 (TASK-04.5.1 and TASK-04.5.2). The client-facing `PATCH /api/email-preferences` endpoint enforces `cmd.UserId == authenticated sub`. EPIC-05B introduces a **separate admin endpoint** `PATCH /api/admin/users/{userId}/email-preference` that bypasses the self-ownership check. The admin endpoint calls its own `IAdminUpdateEmailPreferenceUseCase` which accepts a target `userId` from the route (not from the JWT) and delegates to `IUserEmailPreferenceRepository` directly. This avoids bending the existing self-service use case's ownership invariant and keeps admin and user-facing write paths cleanly separated. Both write to the same `UserEmailPreferences` table column — no schema conflict.

---

**7. Pre-placed task alignment**

- **TASK-07.4.2** → implements US-05B.3 (connectivity test button on `/jira-settings` page).
- **TASK-08.6.3** → implements the API endpoints for US-05B.4 (webhook config). This task is the missing API controller layer not yet written in EPIC-08.
- **TASK-08.6.4** → implements the UI for US-05B.4 (webhook config section on `/jira-settings` page).
- US-05B.1 + US-05B.2 require two new tasks: one API task (use cases + `JiraProjectController`) and one frontend task (`JiraConfigSection` component on the client detail page).
- US-05B.5 requires two new tasks: one API task (`IAdminUpdateEmailPreferenceUseCase` + admin endpoint) and one frontend task (toggle on the user detail page).

---

**Cross-cutting decisions:**

- All admin API endpoints require `[Authorize(Roles = "Admin")]`. Non-admin JWT returns `403`.
- `ClientId` on admin endpoints is always extracted from the route path or JWT claims — never from the request body.
- The `/jira-settings` route in the backoffice is guarded by `requireAdmin` (TASK-05.1.4 route guard).
- shadcn/ui components only — no raw HTML form elements in any frontend task.

---

## Pre-placed Tasks (from EPIC-07 and EPIC-08)

The following tasks were moved here from other epics to consolidate all backoffice Jira UI work. They carry their original task IDs for traceability.

---

### From EPIC-07 — Jira connectivity check UI

#### TASK-07.4.2 — Jira connectivity check UI (backoffice)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-07.4.1

**What to build:**
Add a "Test Jira connection" button to the Jira integration settings section of the backoffice admin panel. On click, it calls `GET /api/admin/jira/connection-status` and displays the result inline: success shows "Jira connection successful. Authenticated as: `<jiraUser>`." in green; failure shows the diagnostic reason in red. The button shows a loading spinner while the request is in-flight.

**Constraints:**
- Use shadcn/ui `Button`, `Badge`, and `Alert` (or `AlertDescription`) — no raw HTML elements for status display.
- The button is disabled while the query is in-flight to prevent double-clicks.
- TanStack Query `useQuery` with `enabled: false` (manual trigger on click) — not an auto-fetching query.
- The section is accessible only to authenticated admin users — route guard redirects non-admins.
- `npm run build` must succeed with no TypeScript errors.

**Definition of Done:**
- [ ] "Test Jira connection" button exists in the Jira settings section of the backoffice.
- [ ] Clicking it calls `GET /api/admin/jira/connection-status` and displays success or failure inline.
- [ ] Button is disabled while the request is in-flight.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### From EPIC-08 — Webhook secret configuration

#### TASK-08.6.3 — Admin webhook configuration endpoint (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-08.6.2

**What to build:**
Add webhook configuration actions to a `WebhookAdminController` in `Api.API/Controllers/Admin/` (or extend an existing `JiraAdminController`):
1. `GET /api/admin/webhook-config` — calls `IGetWebhookConfigUseCase`. Returns `200 OK` with `WebhookConfigDto`.
2. `PUT /api/admin/webhook-config` — body: `SetWebhookSecretRequest { string Secret }`. Calls `ISetWebhookSecretUseCase`. Returns `200 OK` on success.

Both endpoints extract `ClientId` from the authenticated admin's JWT claims.

**Constraints:**
- Both endpoints require `[Authorize(Roles = "Admin")]` — non-admin JWT returns `403` (per api-conventions.md §6).
- `ClientId` extracted from JWT claim — never from request body.
- Route: `/api/admin/webhook-config` (per api-conventions.md §4 — lowercase kebab-case).
- Controller inherits from `ApiControllerBase` (per api-conventions.md §1).
- `SetWebhookSecretRequest` must not appear in any Swagger response schema or log.
- Map `422` for validation errors via `ResultExtensions`.

**Definition of Done:**
- [ ] `GET /api/admin/webhook-config` returns `200 OK` with `WebhookConfigDto` for an Admin JWT.
- [ ] `PUT /api/admin/webhook-config` with a valid secret returns `200 OK`.
- [ ] Non-admin JWT returns `403` on both endpoints.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.6.4 — Admin webhook configuration UI (backoffice)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-08.6.3

**What to build:**
Add a "Webhook" section to the Jira integration settings page in the backoffice. The section renders:
- A read-only "Webhook URL" input with a "Copy" button (copies to clipboard).
- A "Webhook secret" password input showing `••••••` if already configured, empty if not.
- A "Save secret" button that calls `PUT /api/admin/webhook-config` and shows a success toast on completion.
- Help text: "This secret must match the value entered in Jira's webhook configuration."

**Constraints:**
- Use shadcn/ui `Input` (type `password`), `Button`, `Label`, `Tooltip`, and `useToast` (or `Sonner`) — no raw HTML form elements.
- The clipboard copy uses the `navigator.clipboard.writeText` API — no third-party clipboard library.
- The password input value is never pre-filled with the real secret — only `••••••` placeholder is displayed if configured (`isConfigured: true` from API).
- The "Save secret" button is disabled while the mutation is in-flight.
- TanStack Query `useMutation` for the `PUT` call; `useQuery` for the initial `GET`.
- Error state: show an inline error message below the input if the API returns a validation or server error.
- `npm run build` must succeed with no TypeScript errors.

**Definition of Done:**
- [ ] Webhook URL is displayed as a read-only field with a functional copy button.
- [ ] Submitting a valid secret calls `PUT /api/admin/webhook-config` and shows a success toast.
- [ ] The password field shows `••••••` placeholder (not the raw secret) after saving.
- [ ] A non-admin user cannot access or see the settings section (route guard or redirect).
- [ ] `npm run build` succeeds with no TypeScript errors.

---

## User Stories

---

### US-05B.1 — Admin can link a client to a Jira project
> *As an admin, I want to associate a client organisation with a specific Jira project key so that tickets created by that client's users are filed in the correct Jira project.*

**Acceptance Criteria:**
- [ ] The client detail page in the admin panel includes a "Jira Configuration" section.
- [ ] The section contains a "Jira project key" input field (e.g. `ACME`, `SUP`).
- [ ] The field accepts only uppercase alphanumeric values (Jira project key format); an inline validation error is shown for invalid formats.
- [ ] Saving a valid project key stores the mapping for the selected client; the key is visible when the admin returns to the page.
- [ ] If no Jira project key is configured for a client, a clearly visible warning indicates that ticket creation will fail for users of that client until the key is set.
- [ ] The save action requires the Admin role — non-admin requests receive `403`.
- [ ] A success toast is shown on save; a validation error is shown inline if the save fails.

**Story Points:** 3

#### TASK-05B.1.1 — `UpsertJiraProjectKeyUseCase` and `GetClientJiraConfigUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.1 (ClientProject entity + migration)

**What to build:**
Create two use cases in `Api.Application/Admin/JiraConfig/UseCases/`. First: `GetClientJiraConfigUseCase` accepts `GetClientJiraConfigQuery(Guid clientId)` and returns `Result<ClientJiraConfigDto>`. It queries `IClientProjectRepository.GetByClientIdAsync` — if no row exists, returns a DTO with `jiraProjectKey: null`. Second: `UpsertJiraProjectKeyUseCase` accepts `UpsertJiraProjectKeyCommand(Guid clientId, string? jiraProjectKey)` — upserts the `ClientProject` row (create if missing, update in-place if present) and commits via `IUnitOfWork`. `ClientJiraConfigDto` has: `clientId` (Guid), `jiraProjectKey` (string?) — nullable so the frontend can show the missing-key warning.

**Constraints:**
- `jiraProjectKey` validation: when non-null, must match `^[A-Z][A-Z0-9]+$` (Jira project key pattern — uppercase letters, 2+ chars). Use a FluentValidation validator co-located in `Api.Application/Admin/JiraConfig/UseCases/`. Null (clear the mapping) is always valid.
- Use cases are `internal`, injected via interfaces `IGetClientJiraConfigUseCase` and `IUpsertJiraProjectKeyUseCase` (per backend-guidelines §2).
- `IClientProjectRepository` must expose `GetByClientIdAsync(Guid clientId, CancellationToken ct)` and `UpsertAsync(ClientProject entity, CancellationToken ct)`. Add these to the existing domain repository interface (defined in EPIC-08 alongside the entity).
- `UpsertJiraProjectKeyUseCase` must return `ValidationError` (per backend-guidelines §3) when the format is invalid — do not throw.
- Both use cases live in `Api.Application/Admin/JiraConfig/UseCases/` — not in the top-level `UseCases/` folder (admin subpath for discoverability).

**Definition of Done:**
- [ ] `GetClientJiraConfigUseCase` and `UpsertJiraProjectKeyUseCase` exist at `Api.Application/Admin/JiraConfig/UseCases/`.
- [ ] `UpsertJiraProjectKeyUseCase` returns a validation failure for keys that don't match the Jira format pattern.
- [ ] `UpsertJiraProjectKeyUseCase` accepts `null` to clear the mapping without a validation error.
- [ ] `dotnet build` succeeds with no Infrastructure references in Application.

---

#### TASK-05B.1.2 — `JiraConfigController` — Jira project key endpoints (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-05B.1.1

**What to build:**
Create `Api.API/Controllers/Admin/JiraConfigController.cs` extending `ApiControllerBase` with two endpoints:
1. `GET /api/admin/clients/{clientId}/jira-config` — calls `IGetClientJiraConfigUseCase`, returns `200 OK` with `ClientJiraConfigDto`.
2. `PUT /api/admin/clients/{clientId}/jira-config` — body `SetJiraProjectKeyRequest { string? JiraProjectKey }`, calls `IUpsertJiraProjectKeyUseCase`, returns `200 OK` on success.

**Constraints:**
- Both endpoints require `[Authorize(Roles = "Admin")]` — non-admin JWT returns `403` (per api-conventions.md §6).
- `clientId` is taken from the route, not from the JWT claim or request body (admin is acting on behalf of a client, not themselves).
- Route: `[Route("api/admin/clients/{clientId:guid}/jira-config")]` (per api-conventions.md §4 — lowercase kebab-case, nested resource).
- Controller inherits `ApiControllerBase` (per api-conventions.md §1).
- `PUT` uses `ResultExtensions.ToActionResult` for `422` on validation errors.
- Register both use case interfaces in `AddInfrastructure` (or the Application DI registration extension).

**Definition of Done:**
- [ ] `GET /api/admin/clients/{clientId}/jira-config` with Admin JWT returns `200 OK` with `clientJiraConfigDto`.
- [ ] `PUT /api/admin/clients/{clientId}/jira-config` with `jiraProjectKey: "ACME"` returns `200 OK`.
- [ ] `PUT` with an invalid format (e.g. `"acme"`) returns `422`.
- [ ] Non-admin JWT returns `403` on both endpoints.
- [ ] `dotnet build` succeeds.

---

#### TASK-05B.1.3 — `/jira-settings` route and `JiraSettingsPage` shell (backoffice)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.3 (AdminShell), TASK-05.1.4 (route guards)

**What to build:**
Create the `/jira-settings` route inside `AdminShell`. The page is a shell component `src/pages/JiraSettingsPage.tsx` that renders three sections: (1) a "Jira Connectivity" section (placeholder for TASK-07.4.2), (2) a "Webhook Configuration" section (placeholder for TASK-08.6.4), and a navigation link to this page from the `AdminShell` sidebar. The route is guarded by `requireAdmin`. This task creates the skeleton only — the individual section components are added by subsequent tasks.

**Constraints:**
- Route path: `/jira-settings`, guarded by `requireAdmin` (TASK-05.1.4 loader pattern — React Router v7 `loader`, not `useEffect`).
- Page renders inside `AdminShell` — do not create a standalone layout.
- Add a sidebar nav link "Jira Settings" pointing to `/jira-settings` in `AdminShell.tsx`.
- Use shadcn/ui `Card` or `Separator` to visually divide sections.
- `npm run build` must succeed with no TypeScript errors.

**Definition of Done:**
- [ ] `/jira-settings` route exists and renders inside `AdminShell`.
- [ ] Navigating to `/jira-settings` without an Admin token redirects to `/login`.
- [ ] "Jira Settings" nav link appears in `AdminShell` sidebar.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05B.1.4 — `JiraConfigSection` component on the client detail page (backoffice)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05B.1.2, TASK-05.9.6 (client detail page)

**What to build:**
Create `src/components/admin/JiraConfigSection.tsx`. The component receives `clientId: string` as a prop and renders a "Jira Configuration" section. On mount, it fetches `GET /api/admin/clients/{clientId}/jira-config` via TanStack Query `useQuery`. The section displays a "Jira project key" `Input` (shadcn/ui) pre-filled with the current value (empty if null). A shadcn/ui `Alert` with a warning variant is shown when `jiraProjectKey` is null. Saving calls `PUT /api/admin/clients/{clientId}/jira-config` via `useMutation`. On success, show a Sonner success toast and invalidate the query. On validation error (`422`), show the server error message inline below the input. Import and embed `JiraConfigSection` in the existing client detail page created by TASK-05.9.6.

**Constraints:**
- Client-side format validation: enforce `^[A-Z][A-Z0-9]+$` with an inline error before the API call — do not rely on the server as the first line of defence.
- Use shadcn/ui `Input`, `Button`, `Label`, `Alert` (warning variant), and `Sonner` — no raw HTML form elements.
- The "Save" button is disabled while the mutation is in-flight.
- TanStack Query: `useQuery` for the initial GET; `useMutation` for the PUT. Use `invalidateQueries` after a successful save.
- The `JiraConfigSection` component is self-contained — it owns its own queries; the parent client detail page does not pass data into it beyond `clientId`.
- `npm run build` must succeed with no TypeScript errors.

**Definition of Done:**
- [ ] `JiraConfigSection` renders on the client detail page with the current `jiraProjectKey` pre-filled.
- [ ] Warning `Alert` is visible when `jiraProjectKey` is null.
- [ ] Submitting an invalid format shows a client-side inline error without calling the API.
- [ ] Submitting a valid key calls `PUT` and shows a success toast.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05B.2 — Admin can update or remove a client's Jira project mapping
> *As an admin, I want to change or clear the Jira project key for a client so that I can correct mistakes or reassign the client to a different project.*

**Acceptance Criteria:**
- [ ] The "Jira project key" field is pre-populated with the current value when the admin opens the configuration section.
- [ ] Saving a new valid value immediately replaces the previous key — all subsequent ticket creation calls for that client use the updated key.
- [ ] The admin can clear the field and save to remove the mapping; once cleared, the missing-key warning reappears.
- [ ] Removing a project key does not affect tickets already created under the old key — existing Jira issues are not altered.
- [ ] The save action requires the Admin role — non-admin requests receive `403`.
- [ ] A success toast is shown on update; a validation error is shown inline if the save fails.

**Story Points:** 2

> US-05B.2 is fully covered by TASK-05B.1.1 through TASK-05B.1.4 (upsert semantics handle both create and update; null value clears the mapping; the UI pre-fills the current value from the `useQuery` result and shows the warning when null). No additional tasks are required for this story.

---

### US-05B.3 — Admin can verify the Jira connection is working
> *As an admin, I want to test the Jira connection from the backoffice so that I can confirm the integration credentials are valid before clients start creating tickets.*

**Acceptance Criteria:**
- [ ] The Jira configuration section of the backoffice includes a "Test connection" button.
- [ ] Clicking the button sends a test request to the configured Jira instance and displays the result inline — no page reload required.
- [ ] A successful test shows a confirmation message and the authenticated Jira account name.
- [ ] A failed test shows a clear diagnostic message indicating the reason (e.g. invalid credentials, unreachable host, permission error).
- [ ] The button shows a loading indicator while the test is in progress and is disabled to prevent duplicate requests.
- [ ] The test is accessible only to authenticated admin users.

**Story Points:** 2

> US-05B.3 is covered by pre-placed TASK-07.4.2 (connectivity check UI on `/jira-settings`). The API endpoint is already defined in TASK-07.4.1 (EPIC-07). No additional tasks are required.

---

### US-05B.4 — Admin can configure the Jira webhook secret
> *As an admin, I want to set the shared secret used to verify incoming Jira webhook events so that the portal can securely receive status-change and comment notifications from Jira.*

**Acceptance Criteria:**
- [ ] The Jira configuration section of the backoffice includes a "Webhook" subsection.
- [ ] The subsection displays a read-only "Webhook URL" field with a "Copy" button so the admin can paste it into Jira's webhook configuration.
- [ ] A "Webhook secret" password field allows the admin to enter or rotate the shared secret.
- [ ] If a secret is already configured, the field shows a masked placeholder (`••••••`) — the raw secret is never displayed.
- [ ] Saving a valid secret stores it securely; subsequent webhook requests from Jira are validated using the new secret immediately.
- [ ] Help text explains that the value must match what is entered in Jira's webhook configuration.
- [ ] The save action requires the Admin role — non-admin requests receive `403`.
- [ ] A success toast is shown on save; an error message is shown inline if the save fails.

**Story Points:** 3

> US-05B.4 is covered by pre-placed TASK-08.6.3 (API controller) and TASK-08.6.4 (backoffice UI). The use case layer is already defined in TASK-08.6.2 (EPIC-08). No additional tasks are required.

---

### US-05B.5 — Admin can enable or disable email notifications for a user
> *As an admin, I want to toggle email notifications on or off for any client user so that I can manage communication preferences on behalf of clients who are not yet comfortable using the portal settings.*

**Acceptance Criteria:**
- [ ] The user detail or edit screen in the admin panel displays a clearly labelled "Email notifications" toggle for each client user.
- [ ] The toggle reflects the user's current preference accurately when the screen is loaded.
- [ ] Changing the toggle and saving immediately updates the user's email notification preference — subsequent notification emails are sent or suppressed accordingly.
- [ ] The change applies only to the selected user and does not affect other users in the same client organisation.
- [ ] This setting does not affect invitation or password-reset emails — those are always sent regardless of this preference.
- [ ] The endpoint that saves the preference requires the Admin role — non-admin requests receive `403`.
- [ ] A success toast is shown on save; a validation error message is shown if the save fails.

**Story Points:** 2

> **Note:** The corresponding user-facing toggle (client self-service) is defined in EPIC-04 US-04.5. Both stories write to the same `EmailNotificationsEnabled` field on `UserEmailPreference`. The admin path uses a separate use case and endpoint (`PATCH /api/admin/users/{userId}/email-preference`) that does not enforce self-ownership, while the client-facing path (`PATCH /api/email-preferences`) enforces `userId == JWT sub`. Both write to the same column via `IUserEmailPreferenceRepository`.

#### TASK-05B.5.1 — `AdminUpdateEmailPreferenceUseCase` and admin endpoint (api)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-04.3.2 (UserEmailPreference EF Core config + IUserEmailPreferenceRepository), TASK-04.5.1 (GetEmailPreference use case)

**What to build:**
Create `AdminUpdateEmailPreferenceUseCase` in `Api.Application/Admin/EmailPreferences/UseCases/`. The use case accepts `AdminUpdateEmailPreferenceCommand(Guid targetUserId, bool emailNotificationsEnabled)`. It calls `IUserEmailPreferenceRepository.GetByUserIdAsync(targetUserId)` — if no row exists, returns `NotFoundError`; if found, calls `SetEmailNotificationsEnabled(value)` and commits via `IUnitOfWork`. Returns `Result<EmailPreferenceDto>` (reuse the existing DTO from TASK-04.5.1). Expose via `PATCH /api/admin/users/{userId}/email-preference` in a new `AdminEmailPreferencesController` in `Api.API/Controllers/Admin/`. The endpoint body is `{ emailNotificationsEnabled: bool }`.

**Constraints:**
- Endpoint requires `[Authorize(Roles = "Admin")]` — non-admin JWT returns `403` (per api-conventions.md §6).
- `targetUserId` is taken from the route `{userId:guid}` — never from the JWT or request body. The admin can update any user's preference.
- This use case does **not** reuse `IUpdateEmailPreferenceUseCase` (that one enforces self-ownership). The admin use case is a separate class with a separate interface `IAdminUpdateEmailPreferenceUseCase`.
- `AdminUpdateEmailPreferenceCommand` validator: `targetUserId` not empty (Guid is always passed via route, but validate in the command). Validation failure returns `422` via `ResultExtensions`.
- Controller inherits `ApiControllerBase` (per api-conventions.md §1). Route: `[Route("api/admin/users/{userId:guid}/email-preference")]`.

**Definition of Done:**
- [ ] `AdminUpdateEmailPreferenceUseCase` exists at `Api.Application/Admin/EmailPreferences/UseCases/AdminUpdateEmailPreferenceUseCase.cs`.
- [ ] `PATCH /api/admin/users/{userId}/email-preference` with Admin JWT and `emailNotificationsEnabled: false` returns `200 OK` with updated `EmailPreferenceDto`.
- [ ] Non-admin JWT returns `403`.
- [ ] `userId` for a non-existent user returns `404`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05B.5.2 — Email notifications toggle on user detail page (backoffice)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05B.5.1, TASK-05.7.3 (user detail page)

**What to build:**
Add an "Email notifications" section to the user detail page (`/users/{id}`, built in TASK-05.7.3). The section renders a shadcn/ui `Switch` labelled "Email notifications enabled". On page load, fetch the current value via `GET /api/email-preferences?userId={id}` (or the admin-specific endpoint if one exists — use whichever endpoint returns the user's current preference for a given `userId`). Toggling the switch and clicking "Save" calls `PATCH /api/admin/users/{userId}/email-preference` via TanStack Query `useMutation`. Show a Sonner success toast on success. On error, show an inline error toast.

**Constraints:**
- Use shadcn/ui `Switch`, `Label`, `Button`, and `Sonner` — no raw HTML form elements.
- The "Save" button is disabled while the mutation is in-flight.
- TanStack Query `useQuery` for the initial value; `useMutation` for the PATCH. Use `invalidateQueries` on success.
- The toggle reflects the live value from the API — not a local-only state. The initial value is loaded from the server, not hardcoded.
- This section is only visible for users with `status === "Active"` (pending-activation users have not yet logged in and have no preference row; the backend returns `404` for them — hide the section or show a "Not yet configured" note instead).
- `npm run build` must succeed with no TypeScript errors.

**Definition of Done:**
- [ ] Email notifications toggle renders on the user detail page with the current preference pre-loaded.
- [ ] Toggling and saving calls `PATCH /api/admin/users/{userId}/email-preference` and shows a success toast.
- [ ] For a `PendingActivation` user, the toggle is hidden or shows a "Not yet configured" message.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-05B.1 | Admin can link a client to a Jira project | 3 |
| US-05B.2 | Admin can update or remove a client's Jira project mapping | 2 |
| US-05B.3 | Admin can verify the Jira connection is working | 2 |
| US-05B.4 | Admin can configure the Jira webhook secret | 3 |
| US-05B.5 | Admin can enable or disable email notifications for a user | 2 |
| **Total** | | **12** |

---

## Task Breakdown

| Task | Title | Story | Layer | Repo | Depends on |
|---|---|---|---|---|---|
| TASK-07.4.2 | Jira connectivity check UI | US-05B.3 | Frontend | backoffice | TASK-07.4.1 |
| TASK-08.6.3 | Admin webhook configuration endpoints | US-05B.4 | API | api | TASK-08.6.2 |
| TASK-08.6.4 | Admin webhook configuration UI | US-05B.4 | Frontend | backoffice | TASK-08.6.3 |
| TASK-05B.1.1 | `UpsertJiraProjectKeyUseCase` + `GetClientJiraConfigUseCase` | US-05B.1 | Application | api | TASK-08.1.1 |
| TASK-05B.1.2 | `JiraConfigController` — Jira project key endpoints | US-05B.1 | API | api | TASK-05B.1.1 |
| TASK-05B.1.3 | `/jira-settings` route and `JiraSettingsPage` shell | US-05B.3 | Frontend | backoffice | TASK-05.1.3, TASK-05.1.4 |
| TASK-05B.1.4 | `JiraConfigSection` component on client detail page | US-05B.1 | Frontend | backoffice | TASK-05B.1.2, TASK-05.9.6 |
| TASK-05B.5.1 | `AdminUpdateEmailPreferenceUseCase` + admin endpoint | US-05B.5 | Application + API | api | TASK-04.3.2, TASK-04.5.1 |
| TASK-05B.5.2 | Email notifications toggle on user detail page | US-05B.5 | Frontend | backoffice | TASK-05B.5.1, TASK-05.7.3 |
