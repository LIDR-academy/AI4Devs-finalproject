# EPIC-04 — Email Notifications (AWS SES)
> Priority: 7 | Status: ✅ Stories + tasks defined

---

## Overview

Delivers the real AWS SES email implementation that replaces the `NoOpEmailService` stub introduced in EPIC-01. When Jira webhook events arrive (EPIC-08), SupportHub can send transactional emails to notify clients of ticket status changes and new team comments. This epic also covers the invitation and password-reset emails defined in EPIC-01 (which are stubbed there and activated here) and the per-user opt-in/opt-out preference for email notifications.

**Scope:**
- AWS SES v2 integration: domain verification, sender identity, IAM credentials via environment variables.
- Real implementation of `IEmailService` (replacing `NoOpEmailService`).
- HTML email templates for all transactional emails (invitation, password reset, status-change notification, comment notification) in both English and Spanish.
- Per-user email notification preference (opt-in/opt-out) — the toggle UI in the admin panel is part of EPIC-05B.

**Out of scope:**
- Email open/click tracking.
- Bounce and complaint handling (v2).
- Bulk or marketing email.

---

## Architecture Note

### Decisions resolved from the PO's Note for Architect

---

**`IEmailService` implementation — replace stub, no feature flag**

EPIC-04 delivers `TemplateEmailService` in `Api.Infrastructure/Email/` (previously attributed to EPIC-10, now absorbed here). `TemplateEmailService` handles template loading from embedded resources, `{{Variable}}` substitution, and language fallback, and delegates the actual SES dispatch to `ISesEmailSender` (a new internal interface in `Api.Application/Common/Interfaces/`). `IEmailService.SendAsync` requires a `string language` parameter (fallback to `"es"`) — all callers must supply the recipient's preferred language. The `NoOpEmailService` stub in `api` is replaced outright — no feature flag, no toggle. In test environments the DI container registers a `NoOpSesEmailSender : ISesEmailSender` no-op, guarded by an environment check in `AddInfrastructure`. The `identity` repo has its own separate `IEmailService` stub (introduced in TASK-01.5.1); EPIC-04 delivers a real SES implementation for that repo as well.

**Sender identity — domain-level verification, shared sender**

All emails (invitation, password reset, notification) share a single verified sender configured via `SES_FROM_ADDRESS` (the `From` address, e.g. `noreply@supporthub.example.com`) and `SES_FROM_NAME` (the display name, e.g. `SupportHub`). Domain-level verification is used in production; individual address verification is acceptable in local/development. No SES sandbox restrictions are assumed in production. The `SES_FROM_ADDRESS` and `SES_FROM_NAME` environment variables are already listed in `api-conventions.md §12`; EPIC-04 must also add them to the `identity` repo's `.env.example` (since invitation and password-reset emails are sent from `identity`).

**`EmailNotificationsEnabled` field — `UserEmailPreference` entity in `api` DB**

The preference lives in the `api` database as a new `UserEmailPreference` entity (`Api.Domain/Notifications/UserEmailPreference.cs`). Fields: `Id` (Guid), `UserId` (Guid — mirrors the `sub` claim from the JWT, same as `Notification.ClientUserId`), `Email` (string — a cache of the user's email address, populated at first use or admin provisioning), `EmailNotificationsEnabled` (bool, default `true`), `PreferredLanguage` (string, default `"es"`). Rationale: the `api` notification use cases need both the email address and the preference flag on every email send. Storing them in `api` avoids a synchronous cross-service call to `identity` on the hot notification path. `EPIC-05B` will read/write `EmailNotificationsEnabled` via the same entity. The `Email` and `PreferredLanguage` fields mirror `identity` data; they are seeded when the admin provisions a user (EPIC-05) or when the user first logs in (US-04.5 endpoint can create-or-update the row). The entity is not soft-deleted — it survives user deactivation for audit purposes.

**Resolving user email for notification sends (US-04.3, US-04.4)**

When a notification is created by EPIC-08's `StatusChangedHandler` / `CommentCreatedHandler`, the `IEmailService.SendNotificationEmailAsync` call receives a `toEmail` string parameter. EPIC-08 already passes the email to this method (the stub accepts it). The SES implementation simply uses that parameter directly — no additional lookup. The caller (EPIC-08's handlers) must resolve the `toEmail` and check `EmailNotificationsEnabled` before calling the service. Since EPIC-08 is already implemented with stubs, EPIC-04 must extend `StatusChangedHandler` and `CommentCreatedHandler` to perform this lookup via a new `IUserEmailPreferenceRepository` and only call `IEmailService` when notifications are enabled. This is a targeted modification to existing EPIC-08 use cases — not new use cases.

**Email template ownership — EPIC-04 delivers all templates**

EPIC-04 owns all HTML email templates. The `api` repo templates (`Invitation`, `PasswordReset`, `TicketNotification`) live as embedded resources under `Api.Infrastructure/EmailTemplates/{name}/{language}.html` and are loaded by `TemplateEmailService`. The `identity` repo's invitation and password-reset templates live separately under `Identity.Infrastructure/EmailTemplates/` (a mirror, since `identity` is an independent service with no reference to `Api.Infrastructure`). Both sets use the same `{{VariableName}}` placeholder format and the same template names/variables.

**`PORTAL_BASE_URL` environment variable**

A new `PORTAL_BASE_URL` env var is introduced in `api/.env.example`. It is used in notification emails (US-04.3, US-04.4) to generate the ticket detail link. Format: `https://portal.supporthub.example.com` (no trailing slash). The link pattern is `{PORTAL_BASE_URL}/tickets/{jiraIssueKey}`.

**AWS SES v2 client construction**

Both `api` and `identity` use `AWSSDK.SimpleEmailServiceV2`. The SES client is constructed via `new AmazonSimpleEmailServiceV2Client(RegionEndpoint.GetBySystemName(config["AWS_REGION"]))` — credentials are resolved automatically from `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables via the standard AWS credential chain. No explicit credential object is created in code.

**Dependency ordering**

- TASK-04.1.x (identity email templates + SES): depends on TASK-01.5.1 (`IEmailService` stub in identity). Templates are self-contained within `Identity.Infrastructure`.
- TASK-04.3.3 (`TemplateEmailService` + `SesEmailSender` in `api`): creates both the template engine and the SES dispatcher in one task, no upstream epic dependency beyond TASK-04.3.2.
- TASK-04.3.4 / TASK-04.4.1 (extending webhook handlers): depend on TASK-04.3.3 (real SES in `api`) and TASK-08.1.6/7 (webhook handlers with stub email).
- TASK-04.5.x (user preference entity): depends on EPIC-08 Notification entity (TASK-08.1.1) and must be in place before the preference UI tasks.

---

## User Stories

---

### US-04.1 — Send invitation email via AWS SES
> *As an invited user, I want to receive an activation email with a secure link so that I can set my password and access the portal.*

**Acceptance Criteria:**
- [ ] When an admin creates a new user invitation (EPIC-05), an email is sent to the invitee's address via AWS SES.
- [ ] The email contains a unique, single-use activation link that expires after 72 hours (consistent with US-01.1).
- [ ] The email is sent from a verified sender domain configured via an environment variable — no hardcoded sender address.
- [ ] The email renders correctly in both English and Spanish based on the user's language preference. If no preference is set, Spanish is used as the default.
- [ ] If SES returns an error, the error is logged and surfaced to the caller — the invitation record remains in the DB but the admin is informed that the email could not be sent.
- [ ] The email is not sent as plain text only — it has an HTML body with a clearly visible "Activate your account" call-to-action button.
- [ ] The subject line and body copy are template-driven — no hardcoded English-only text.

**Story Points:** 3

#### TASK-04.1.1 — HTML invitation email templates in `identity` repo (es + en)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-01.1.1

**What to build:**
Create self-contained HTML email templates for the invitation (account activation) email in both Spanish and English, embedded directly in the `identity` repo. Files live at `Identity.Infrastructure/EmailTemplates/Invitation/es.html` and `Identity.Infrastructure/EmailTemplates/Invitation/en.html`. These are separate from the `api` repo templates (TASK-04.3.3) because `identity` is an independent service with no reference to `Api.Infrastructure`. Declare both files as embedded resources in `Identity.Infrastructure.csproj`. Both templates are valid, self-contained HTML with inline CSS. Variables: `{{UserName}}`, `{{ActivationLink}}`, `{{ExpiryHours}}`.

**Constraints:**
- Template files are embedded resources: `<EmbeddedResource Include="EmailTemplates/**" />` in `Identity.Infrastructure.csproj`.
- Placeholder format: `{{VariableName}}` — double curly braces, PascalCase, matching the replacement logic introduced in TASK-04.1.2.
- No external images, fonts, or stylesheets — inline CSS only (SES delivery reliability).
- Spanish (`es.html`) is the reference/primary template. English mirrors it in structure.
- A prominent "Activate your account" call-to-action button must be present in both templates.
- Subject lines (Spanish: `"Activa tu cuenta en SupportHub"`, English: `"Activate your SupportHub account"`) are defined as constants in the template loader (TASK-04.1.2), not inside the HTML file.

**Definition of Done:**
- [ ] `Identity.Infrastructure/EmailTemplates/Invitation/es.html` exists and contains `{{UserName}}`, `{{ActivationLink}}`, `{{ExpiryHours}}` placeholders.
- [ ] `Identity.Infrastructure/EmailTemplates/Invitation/en.html` exists with the same placeholders.
- [ ] Both files render as valid HTML when opened standalone.
- [ ] `dotnet build` succeeds (embedded resources included).

---

#### TASK-04.1.2 — HTML password reset email templates in `identity` repo (es + en)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-01.5.1

**What to build:**
Create self-contained HTML email templates for the password reset email in both Spanish and English, embedded in `Identity.Infrastructure`. Files at `Identity.Infrastructure/EmailTemplates/PasswordReset/es.html` and `Identity.Infrastructure/EmailTemplates/PasswordReset/en.html`. Variables: `{{UserName}}`, `{{ResetLink}}`, `{{ExpiryMinutes}}`. A prominent "Reset your password" CTA button must be present in both.

**Constraints:**
- Same embedded resource, inline-CSS, and placeholder constraints as TASK-04.1.1.
- Subject lines (Spanish: `"Restablece tu contraseña en SupportHub"`, English: `"Reset your SupportHub password"`) are constants in the template loader — not hardcoded inside the HTML.
- `{{ExpiryMinutes}}` is `"60"` (1 hour, consistent with TASK-01.5.1 token expiry).

**Definition of Done:**
- [ ] `Identity.Infrastructure/EmailTemplates/PasswordReset/es.html` exists with `{{UserName}}`, `{{ResetLink}}`, `{{ExpiryMinutes}}`.
- [ ] `Identity.Infrastructure/EmailTemplates/PasswordReset/en.html` exists with the same placeholders.
- [ ] `dotnet build` succeeds.

---

#### TASK-04.1.3 — `ISesEmailSender` and SES v2 implementation in `identity`
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-04.1.1, TASK-04.1.2

**What to build:**
Create a template-loading email sender for the `identity` repo. Define `IIdentityEmailService` (if not already `IEmailService`) in `Identity.Infrastructure/Email/` with methods `SendInvitationEmailAsync` and `SendPasswordResetEmailAsync`. Implement `SesIdentityEmailService` in `Identity.Infrastructure/Email/` using `AWSSDK.SimpleEmailServiceV2`. The implementation loads the appropriate HTML template (language-aware, fallback to `es`), performs `{{Variable}}` placeholder substitution via `string.Replace`, and sends via `AmazonSimpleEmailServiceV2Client.SendEmailAsync`. Replace the `NoOpEmailService` stub registration in `DependencyInjection.cs` with `SesIdentityEmailService`. Add `SES_FROM_ADDRESS`, `SES_FROM_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` to `identity/.env.example`.

**Constraints:**
- `AmazonSimpleEmailServiceV2Client` is constructed with `RegionEndpoint.GetBySystemName(config["AWS_REGION"])` — credentials resolved from environment variables via the AWS default credential chain, never hardcoded.
- `SES_FROM_ADDRESS` and `SES_FROM_NAME` read from `IConfiguration` — no hardcoded sender.
- Template loading uses `Assembly.GetExecutingAssembly().GetManifestResourceStream(...)` for embedded resources — path format `Identity.Infrastructure.EmailTemplates.{templateName}.{language}.html`.
- Language fallback: if the requested language resource stream is null, fall back to `es`.
- All `AmazonSimpleEmailServiceV2Client` calls are `async` — no `.Result` or `.Wait()`.
- SES errors are thrown (not swallowed) — the caller (endpoint) is responsible for error handling per US-04.1 AC.
- Registration in `AddInfrastructure`: `services.AddScoped<IEmailService, SesIdentityEmailService>()` (or equivalent interface name).
- `CancellationToken ct` is passed through to SES async calls.

**Definition of Done:**
- [ ] `SesIdentityEmailService` exists at `Identity.Infrastructure/Email/SesIdentityEmailService.cs`.
- [ ] `dotnet build` succeeds for `identity` solution.
- [ ] `SES_FROM_ADDRESS`, `SES_FROM_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` appear in `identity/.env.example`.
- [ ] `NoOpEmailService` is no longer registered in `DependencyInjection.cs` (replaced by `SesIdentityEmailService`).
- [ ] Manual smoke test: invoking the endpoint with valid SES credentials sends an HTML email with the correct subject and CTA button.

---

### US-04.2 — Send password reset email via AWS SES
> *As a client user who has forgotten their password, I want to receive a password reset email so that I can regain access to my account without contacting support.*

**Acceptance Criteria:**
- [ ] When a user requests a password reset (US-01.5), an email is sent to their registered address via AWS SES.
- [ ] The email contains a unique, single-use reset link that expires after 1 hour (consistent with US-01.5).
- [ ] The email is sent from the same verified sender configured for invitation emails.
- [ ] The email renders correctly in both English and Spanish based on the user's language preference. If no preference is set, Spanish is used as the default.
- [ ] If SES returns an error, the error is logged and a generic success message is still shown to the end user (to prevent account enumeration — consistent with US-01.5 acceptance criteria).
- [ ] The email has an HTML body with a clearly visible "Reset your password" call-to-action button.
- [ ] Subject line and body copy use i18n-managed strings.

**Story Points:** 2

> **Implementation note:** US-04.2 is delivered by TASK-04.1.2 (password reset HTML templates in `identity`) and TASK-04.1.3 (SES implementation in `identity`). The password reset endpoint in `identity` (TASK-01.5.1) already calls `IEmailService` — EPIC-04's SES implementation is a drop-in replacement that adds no new endpoint or use case. The error-swallowing behaviour (show success to end user even if SES fails) is already specified in TASK-01.5.1 (always return `200 OK`); TASK-04.1.3 ensures SES errors are logged at `Error` level but do not propagate past the endpoint.

No additional tasks required for US-04.2 beyond those defined under US-04.1.

---

### US-04.3 — Send email notification when ticket status changes
> *As a client, I want to receive an email when the team changes the status of one of my tickets so that I am kept informed even when I am not actively logged into the portal.*

**Acceptance Criteria:**
- [ ] When a status-change notification is created by EPIC-08 (`US-08.2`), an email is sent to the ticket owner's registered address — but only if that user has email notifications enabled (US-04.5).
- [ ] The email identifies the ticket (by key and title if available, or key alone) and states the new status in the portal's defined labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded).
- [ ] The email includes a direct link to the ticket detail page in the client portal.
- [ ] The email renders correctly in both English and Spanish based on the recipient's language preference. If no preference is set, Spanish is used as the default.
- [ ] Email sending is fire-and-continue — if SES returns an error, the error is logged but the in-app notification (US-08.2) is not affected.
- [ ] The email is not sent if the user's email address is unverified or if email notifications are disabled for that user.
- [ ] The email has an HTML body and uses i18n-managed strings.

**Story Points:** 3

#### TASK-04.3.1 — `UserEmailPreference` domain entity and repository interface (api)
**Layer:** Domain
**Repo:** api
**Depends on:** TASK-08.1.1 (Notification entity)

**What to build:**
Define the `UserEmailPreference` entity in `Api.Domain/Notifications/UserEmailPreference.cs`. Fields: `Id` (Guid, from `BaseEntity`), `UserId` (Guid — mirrors the JWT `sub` claim, same identifier used in `Notification.ClientUserId`), `Email` (string, max 256), `EmailNotificationsEnabled` (bool, default `true`), `PreferredLanguage` (string, max 5, default `"es"`), and the `BaseEntity` timestamp fields. Include a static factory method `UserEmailPreference.Create(Guid userId, string email, string preferredLanguage)`. Define `IUserEmailPreferenceRepository` in `Api.Domain/Interfaces/` with methods: `GetByUserIdAsync`, `AddAsync`, `UpdateAsync`.

**Constraints:**
- `UserEmailPreference` inherits from `BaseEntity` (per backend-guidelines §5).
- No public setters — use domain methods (`SetEmailNotificationsEnabled(bool value)`, `Touch()`) to mutate state.
- `IUserEmailPreferenceRepository` lives in `Api.Domain/Interfaces/` — no EF Core, no HTTP references.
- `UserId` field is a bare `Guid`, not a navigation property — no FK constraint to another table (the user lives in the `identity` DB, not `api`).

**Definition of Done:**
- [ ] `UserEmailPreference` entity exists at `Api.Domain/Notifications/UserEmailPreference.cs` with all fields and factory method.
- [ ] `IUserEmailPreferenceRepository` exists at `Api.Domain/Interfaces/IUserEmailPreferenceRepository.cs`.
- [ ] `dotnet build` succeeds for `Api.Domain`.

---

#### TASK-04.3.2 — `UserEmailPreference` EF Core configuration and migration (api)
**Layer:** Infrastructure + DB
**Repo:** api
**Depends on:** TASK-04.3.1

**What to build:**
Create the EF Core configuration for `UserEmailPreference` in `Api.Infrastructure/Persistence/Configurations/UserEmailPreferenceConfiguration.cs` and implement `UserEmailPreferenceRepository` in `Api.Infrastructure/Persistence/Repositories/`. Add the `DbSet<UserEmailPreference>` to `AppDbContext`. Register `IUserEmailPreferenceRepository` → `UserEmailPreferenceRepository` as `Scoped` in `AddInfrastructure`. Generate the EF Core migration for the new `UserEmailPreferences` table.

**Constraints:**
- Table name: `UserEmailPreferences` in the `public` schema.
- `UserId` column has a unique index — one preference row per user.
- `Email` column: `varchar(256)`, not null.
- `PreferredLanguage` column: `varchar(5)`, not null, default `"es"`.
- `EmailNotificationsEnabled` column: bool, not null, default `true`.
- Migration class must not contain raw SQL — Fluent API only.
- Auto-migration on startup in `Development` only (per backend-guidelines §7).

**Definition of Done:**
- [ ] EF Core configuration file exists at `Api.Infrastructure/Persistence/Configurations/UserEmailPreferenceConfiguration.cs`.
- [ ] `UserEmailPreferenceRepository` exists at `Api.Infrastructure/Persistence/Repositories/UserEmailPreferenceRepository.cs`.
- [ ] Migration file exists under `Api.Infrastructure/Persistence/Migrations/`.
- [ ] `dotnet ef database update` applies the migration successfully against a local PostgreSQL instance.
- [ ] `dotnet build` succeeds.

---

#### TASK-04.3.3 — `TemplateEmailService`, HTML templates, and `SesEmailSender` in `api`
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-04.3.2

**What to build:**
This task delivers the full email infrastructure for the `api` repo in one coherent unit:

1. **`IEmailService` update**: extend the existing `IEmailService` interface in `Api.Application/Common/Interfaces/` to include a `string language` parameter on `SendAsync` (fallback to `"es"`). Update all call sites accordingly (EPIC-08 stubs use `"es"` as a placeholder until TASK-04.3.4/TASK-04.4.1 pass the real language).

2. **`ISesEmailSender`**: new interface in `Api.Application/Common/Interfaces/ISesEmailSender.cs` with `Task SendHtmlEmailAsync(string toEmail, string fromAddress, string fromName, string subject, string htmlBody, CancellationToken ct)`.

3. **`TemplateEmailService`**: implement in `Api.Infrastructure/Email/TemplateEmailService.cs`. Loads embedded HTML templates from `Api.Infrastructure/EmailTemplates/{templateName}/{language}.html` using `Assembly.GetManifestResourceStream`. Performs `{{VariableName}}` placeholder substitution. Falls back to `"es"` if the requested language resource is not found. Delegates dispatch to `ISesEmailSender`. This is the `IEmailService` implementation registered in all environments.

4. **HTML templates** (embedded resources in `Api.Infrastructure.csproj`):
   - `EmailTemplates/Invitation/es.html` — vars: `{{UserName}}`, `{{ActivationLink}}`, `{{ExpiryHours}}`
   - `EmailTemplates/Invitation/en.html`
   - `EmailTemplates/PasswordReset/es.html` — vars: `{{UserName}}`, `{{ResetLink}}`, `{{ExpiryMinutes}}`
   - `EmailTemplates/PasswordReset/en.html`
   - `EmailTemplates/TicketNotification/es.html` — vars: `{{UserName}}`, `{{TicketTitle}}`, `{{TicketKey}}`, `{{EventDescription}}`, `{{PortalLink}}`
   - `EmailTemplates/TicketNotification/en.html`

5. **`SesEmailSender`**: implement in `Api.Infrastructure/Email/SesEmailSender.cs` using `AmazonSimpleEmailServiceV2Client`. Reads `SES_FROM_ADDRESS`, `SES_FROM_NAME`, `AWS_REGION` from `IConfiguration`.

6. **DI registration**: `services.AddScoped<IEmailService, TemplateEmailService>()`, `services.AddSingleton<ISesEmailSender, SesEmailSender>()`. In test/development without SES, register `NoOpSesEmailSender` (logs + no-ops) guarded by `config["USE_SES"] != "true"`.

**Constraints:**
- `AmazonSimpleEmailServiceV2Client` constructed with `RegionEndpoint.GetBySystemName(config["AWS_REGION"])` — credentials from environment via AWS default credential chain. No explicit credential object in code.
- `SES_FROM_ADDRESS` and `SES_FROM_NAME` read from `IConfiguration` — no hardcoded sender.
- Template path format: `Api.Infrastructure.EmailTemplates.{templateName}.{language}.html` (dot-separated namespace, matching embedded resource convention).
- Language fallback: if the requested language stream is null, retry with `"es"`. If `"es"` is also null, throw `InvalidOperationException`.
- Placeholder format: `{{VariableName}}` — `string.Replace` for each variable; no templating engine dependency.
- All templates: valid self-contained HTML with inline CSS only — no external images, fonts, or stylesheets.
- Subject lines: defined as constants in a `EmailSubjects` static class in `Api.Application/Common/` (separate from templates).
- All SES calls are fully async — no `.Result` or `.Wait()`.
- `SesEmailSender` is `Singleton` (SES client is thread-safe and expensive to initialise per request).
- `NoOpEmailService` is removed; `TemplateEmailService` is the `IEmailService` in all environments.
- `PORTAL_BASE_URL` and `USE_SES` added to `api/.env.example`.

**Definition of Done:**
- [ ] `IEmailService` interface has `string language` parameter on `SendAsync`.
- [ ] `ISesEmailSender` interface exists at `Api.Application/Common/Interfaces/ISesEmailSender.cs`.
- [ ] `TemplateEmailService` exists at `Api.Infrastructure/Email/TemplateEmailService.cs`.
- [ ] `SesEmailSender` exists at `Api.Infrastructure/Email/SesEmailSender.cs`.
- [ ] All 6 HTML template files exist under `Api.Infrastructure/EmailTemplates/` and are declared as embedded resources.
- [ ] `PORTAL_BASE_URL` and `USE_SES` appear in `api/.env.example`.
- [ ] `dotnet build` succeeds.
- [ ] Manual smoke test: with real SES credentials and a verified sender, an HTML email arrives at the recipient with correct template substitution.

---

#### TASK-04.3.4 — Extend `StatusChangedHandler` to check preference and send real email (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-04.3.3, TASK-08.1.6

**What to build:**
Modify `StatusChangedHandler` (implemented in TASK-08.1.6) in `Api.Application/Webhooks/` to perform a real `EmailNotificationsEnabled` check before calling `IEmailService.SendNotificationEmailAsync`. The handler injects `IUserEmailPreferenceRepository` and, after persisting the `Notification`, calls `GetByUserIdAsync(notification.ClientUserId)`. If the preference row is absent or `EmailNotificationsEnabled` is `false`, the email send is skipped silently. If enabled, the handler calls `IEmailService.SendAsync(toEmail, "TicketNotification", variables, preference.PreferredLanguage, ct)` — where variables include `{{UserName}}`, `{{TicketTitle}}`, `{{TicketKey}}`, `{{EventDescription}}`, and `{{PortalLink}}`. The `TicketNotification` template is delivered in TASK-04.3.3. The `PortalLink` is `{PORTAL_BASE_URL}/tickets/{jiraIssueKey}` resolved from `IConfiguration`. Email failure is fire-and-continue (log `Error`, do not rollback notification).

**Constraints:**
- `IUserEmailPreferenceRepository` is injected into `StatusChangedHandler` — no direct `DbContext` or EF Core usage in Application layer.
- `PORTAL_BASE_URL` is read from `IConfiguration` via a constructor-injected `IOptions<EmailOptions>` record or directly from `IConfiguration` — never hardcoded.
- If `GetByUserIdAsync` returns null (user has no preference row), the email is skipped — never throw.
- Subject line constants (Spanish / English) live in the `EmailSubjects` static class in `Api.Application/Common/` created in TASK-04.3.3.
- Pass `preference.PreferredLanguage` as the `language` parameter to `IEmailService.SendAsync`.

**Definition of Done:**
- [ ] `StatusChangedHandler` reads `IUserEmailPreferenceRepository` and checks `EmailNotificationsEnabled` before calling `IEmailService`.
- [ ] A status-change webhook for a user with `EmailNotificationsEnabled = true` results in an SES email send (verifiable via SES send log or test with `NoOpSesEmailSender`).
- [ ] A status-change webhook for a user with `EmailNotificationsEnabled = false` creates the `Notification` row but sends no email.
- [ ] `dotnet build` succeeds.

---

### US-04.4 — Send email notification when a client-facing comment is added
> *As a client, I want to receive an email when the support team posts a comment addressed to me so that I can respond promptly without having to check the portal regularly.*

**Acceptance Criteria:**
- [ ] When a comment notification is created by EPIC-08 (`US-08.3`), an email is sent to the ticket owner's registered address — but only if that user has email notifications enabled (US-04.5).
- [ ] The email identifies the ticket and includes a preview of the comment text (the `[Client]` prefix is already stripped by EPIC-08 before the notification is created).
- [ ] The email includes a direct link to the ticket detail page in the client portal.
- [ ] The email renders correctly in both English and Spanish based on the recipient's language preference. If no preference is set, Spanish is used as the default.
- [ ] Email sending is fire-and-continue — SES failures are logged and do not affect the in-app notification record.
- [ ] The email is not sent if email notifications are disabled for that user.
- [ ] The email has an HTML body and uses i18n-managed strings.

**Story Points:** 2

#### TASK-04.4.1 — Extend `CommentCreatedHandler` to check preference and send real email (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-04.3.3, TASK-08.1.7

**What to build:**
Modify `CommentCreatedHandler` (implemented in TASK-08.1.7) in `Api.Application/Webhooks/` to perform the same `EmailNotificationsEnabled` check and SES dispatch as TASK-04.3.4 does for `StatusChangedHandler`. Inject `IUserEmailPreferenceRepository`. After persisting the `Notification`, look up the preference, skip email if disabled, otherwise call `IEmailService.SendNotificationEmailAsync` with the `TicketNotification` template — `{{EventDescription}}` carries a short comment preview (truncate `notification.Message` to 200 characters). Fire-and-continue error handling.

**Constraints:**
- Identical preference-lookup and fire-and-continue constraints as TASK-04.3.4.
- Comment preview truncation: first 200 characters of the notification message, appended with `"…"` if truncated. This truncation happens in the handler, not in the template.
- Subject line constants for comment notification (Spanish / English) are added to the `EmailSubjects` static class introduced in TASK-04.3.4.
- No changes to `IEmailService` interface or `TicketNotification` template.

**Definition of Done:**
- [ ] `CommentCreatedHandler` reads `IUserEmailPreferenceRepository` and checks `EmailNotificationsEnabled` before calling `IEmailService`.
- [ ] A comment webhook for a user with `EmailNotificationsEnabled = true` results in an SES email send.
- [ ] A comment webhook for a user with `EmailNotificationsEnabled = false` creates the `Notification` row but sends no email.
- [ ] `dotnet build` succeeds.

---

### US-04.5 — User can opt out of email notifications
> *As a client, I want to choose whether I receive email notifications so that I can reduce inbox noise if I prefer to check the portal directly.*

**Acceptance Criteria:**
- [ ] Each user has an email notifications preference that can be enabled or disabled. New users have email notifications **enabled by default**.
- [ ] The client can toggle this preference from the portal's profile or settings page — a clearly labelled switch or checkbox that takes effect immediately on save.
- [ ] When email notifications are disabled, no notification emails (status change or comment) are sent to that user. Invitation and password-reset emails are not affected by this preference — they are always sent.
- [ ] When email notifications are re-enabled, subsequent notification events resume sending emails — no backfill of past events is sent.
- [ ] The current preference state is accurately reflected in the UI whenever the settings page is loaded.
- [ ] Saving the preference shows a brief confirmation (e.g. a toast) and does not navigate away from the settings page.
- [ ] The API endpoint that saves the preference is authenticated and scoped to the current user — a user cannot change another user's preference.

**Story Points:** 3

#### TASK-04.5.1 — `GetEmailPreference` and `UpdateEmailPreference` use cases (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-04.3.2

**What to build:**
Create two use cases in `Api.Application/UseCases/EmailPreferences/`:
1. `GetEmailPreferenceUseCase` — accepts `GetEmailPreferenceQuery(Guid userId)`, calls `IUserEmailPreferenceRepository.GetByUserIdAsync`. If the row does not exist, returns a default DTO with `EmailNotificationsEnabled = true` (do not create a row on read).
2. `UpdateEmailPreferenceUseCase` — accepts `UpdateEmailPreferenceCommand(Guid userId, bool emailNotificationsEnabled)`. Calls `GetByUserIdAsync`; if null, creates a new row via `UserEmailPreference.Create(userId, email, preferredLanguage)` (reading email and language from the JWT claims passed in the command). Otherwise calls `SetEmailNotificationsEnabled(value)` and commits via `IUnitOfWork`. Returns `Result<EmailPreferenceDto>`.

Both use cases follow the standard pattern (internal class, `IXxxUseCase` interface, FluentValidation). `EmailPreferenceDto` is a `record(bool EmailNotificationsEnabled)`.

**Constraints:**
- Use case classes are `internal`, injected via interface per backend-guidelines §2.
- No MediatR.
- `UpdateEmailPreferenceUseCase` must not allow updating another user's preference — enforce `cmd.UserId == authenticated sub` at the use-case level (the controller passes the JWT `sub`; the use case trusts it).
- `GetEmailPreferenceQuery` validator: `UserId` must not be `Guid.Empty`.
- `UpdateEmailPreferenceCommand` validator: `UserId` not empty, `EmailNotificationsEnabled` is a bool (no additional constraint needed).

**Definition of Done:**
- [ ] `GetEmailPreferenceUseCase` and `UpdateEmailPreferenceUseCase` exist in `Api.Application/UseCases/EmailPreferences/`.
- [ ] `IGetEmailPreferenceUseCase` and `IUpdateEmailPreferenceUseCase` interfaces exist in the same folder.
- [ ] `EmailPreferenceDto` record exists.
- [ ] `dotnet build` succeeds.

---

#### TASK-04.5.2 — `EmailPreferencesController` (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-04.5.1

**What to build:**
Create `Api.API/Controllers/EmailPreferences/EmailPreferencesController.cs` exposing two endpoints:
1. `GET /api/email-preferences` — `[Authorize]`, extracts `UserId` from JWT `sub` claim, calls `IGetEmailPreferenceUseCase`, returns `200 OK` with `EmailPreferenceDto`.
2. `PATCH /api/email-preferences` — `[Authorize]`, body `{ emailNotificationsEnabled: bool }`, extracts `UserId` from JWT `sub`, calls `IUpdateEmailPreferenceUseCase`, returns `200 OK` with updated `EmailPreferenceDto`.

**Constraints:**
- Controller inherits from `ApiControllerBase` — no `ControllerBase` direct inheritance.
- `UserId` extracted from `User.FindFirstValue(ClaimTypes.NameIdentifier)` — never from request body or query string (per api-conventions.md §6).
- Result-to-HTTP mapping via `result.ToActionResult(this)` (per api-conventions.md §2).
- Route: `[Route("api/email-preferences")]` (lowercase, no `/api/[controller]` template since the class name would produce `email-preferences-controller`).
- Both endpoints are `[Authorize]` — no `[AllowAnonymous]`.
- Register both use cases as `Scoped` in `AddInfrastructure`.

**Definition of Done:**
- [ ] `GET /api/email-preferences` (authenticated) returns `200 OK` with `{ emailNotificationsEnabled: true }` for a new user.
- [ ] `PATCH /api/email-preferences` with `{ emailNotificationsEnabled: false }` returns `200 OK` and the updated value.
- [ ] `GET /api/email-preferences` without a JWT returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-04.5.3 — Email notifications preference UI (`client-portal`)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-04.5.2

**What to build:**
Add an "Email notifications" section to the client portal's profile/settings page (route `/settings` or the closest equivalent available at implementation time). The section renders a labelled shadcn/ui `Switch` component showing the current preference. On load, the page calls `GET /api/email-preferences` via TanStack Query. When the user toggles the switch, it immediately calls `PATCH /api/email-preferences` (optimistic update), shows a success toast on completion, and shows an error toast (reverting the switch to the previous state) on failure. The page does not navigate away after save.

**Constraints:**
- Use shadcn/ui `Switch` — no raw `<input type="checkbox">`.
- TanStack Query: `useQuery` for the fetch, `useMutation` for the update. Invalidate the query key after a successful mutation.
- Optimistic update: the switch value changes immediately in the UI; rollback to previous value on mutation error.
- Toast notification on success: use the existing toast mechanism (established by EPIC-01 / EPIC-08 frontend tasks). On error, show: "Could not save preference. Please try again."
- All visible strings (label, description, toast messages) use i18n translation keys — no hardcoded text. Keys are added to the `client-portal` `common` namespace translation files for both `es` and `en`.
- The `Switch` and its label are accessible (associated via `htmlFor`/`id`).

**Definition of Done:**
- [ ] `/settings` route renders the "Email notifications" switch with the current preference loaded from the API.
- [ ] Toggling the switch calls `PATCH /api/email-preferences` and shows a success toast.
- [ ] A failed PATCH shows an error toast and reverts the switch.
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] All strings are translation-keyed (no hardcoded English text in JSX).

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-04.1 | Send invitation email via AWS SES | 3 |
| US-04.2 | Send password reset email via AWS SES | 2 |
| US-04.3 | Send email notification on ticket status change | 3 |
| US-04.4 | Send email notification on new client-facing comment | 2 |
| US-04.5 | User can opt out of email notifications | 3 |
| **Total** | | **13** |

---

## Task Breakdown

| Task ID | Title | Story | Layer | Repo | Depends on |
|---|---|---|---|---|---|
| TASK-04.1.1 | HTML invitation email templates in `identity` (es + en) | US-04.1 | Infrastructure | identity | TASK-01.1.1 |
| TASK-04.1.2 | HTML password reset email templates in `identity` (es + en) | US-04.1 / US-04.2 | Infrastructure | identity | TASK-01.5.1 |
| TASK-04.1.3 | `SesIdentityEmailService` — real SES implementation for `identity` | US-04.1 / US-04.2 | Infrastructure | identity | TASK-04.1.1, TASK-04.1.2 |
| TASK-04.3.1 | `UserEmailPreference` domain entity and repository interface | US-04.3 | Domain | api | TASK-08.1.1 |
| TASK-04.3.2 | `UserEmailPreference` EF Core config and migration | US-04.3 | Infrastructure + DB | api | TASK-04.3.1 |
| TASK-04.3.3 | `TemplateEmailService`, HTML templates (6 files), and `SesEmailSender` in `api` | US-04.3 | Infrastructure | api | TASK-04.3.2 |
| TASK-04.3.4 | Extend `StatusChangedHandler` with preference check and SES dispatch | US-04.3 | Application | api | TASK-04.3.3, TASK-08.1.6 |
| TASK-04.4.1 | Extend `CommentCreatedHandler` with preference check and SES dispatch | US-04.4 | Application | api | TASK-04.3.3, TASK-08.1.7 |
| TASK-04.5.1 | `GetEmailPreference` and `UpdateEmailPreference` use cases | US-04.5 | Application | api | TASK-04.3.2 |
| TASK-04.5.2 | `EmailPreferencesController` | US-04.5 | API | api | TASK-04.5.1 |
| TASK-04.5.3 | Email notifications preference UI | US-04.5 | Frontend | client-portal | TASK-04.5.2 |

---

> **Note for Architect:**
>
> - **`IEmailService` implementation**: decided — `TemplateEmailService` is the `IEmailService` registered in all environments (TASK-04.3.3). `NoOpEmailService` is removed. For test/development without SES, a `NoOpSesEmailSender` implements `ISesEmailSender` and is swapped in via `config["USE_SES"] != "true"` guard in `AddInfrastructure`. No feature flag needed on `IEmailService` itself.
>
> - **Email templates**: decided — embedded HTML resources with inline CSS, `{{VariableName}}` substitution via `string.Replace`. No Razor, no Fluid/Scriban. Template loading via `Assembly.GetManifestResourceStream`. Language fallback to `"es"` if the requested language resource is not found.
>
> - **`IEmailService.SendAsync` signature**: decided — must include `string language` parameter (fallback `"es"`). Callers that do not yet have the language (EPIC-08 stubs) pass `"es"` as placeholder; TASK-04.3.4 and TASK-04.4.1 pass `preference.PreferredLanguage`.
>
> - **`EmailNotificationsEnabled` field placement**: decided — `UserEmailPreference` entity lives in `api` DB (TASK-04.3.1). Avoids cross-service lookup on the hot notification path. `UserId` is a bare `Guid` (mirrors JWT `sub`), not a FK to any `identity` table.
>
> - **`EmailNotificationsEnabled` admin toggle**: deferred to EPIC-05B. EPIC-04 owns only the client-facing preference UI (US-04.5). EPIC-05B will add an admin-override story writing to the same `UserEmailPreference` entity.
>
> - **Sender identity**: all emails share `SES_FROM_ADDRESS` / `SES_FROM_NAME` env vars. Domain-level verification in production; individual address verification acceptable in development/sandbox.
>
> - **`PORTAL_BASE_URL` env var**: added in TASK-04.3.3 to `api/.env.example`. Used to generate `{{PortalLink}}` in `TicketNotification` templates.
>
> - **Dependency ordering**: US-04.1/04.2 activate stub email calls wired in EPIC-01. US-04.3/04.4 activate the stub wired in EPIC-08 (TASK-08.2.1). SES implementation is a drop-in — no call-site changes needed beyond the `language` parameter already in the interface.
