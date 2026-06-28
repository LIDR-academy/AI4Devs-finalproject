# EPIC-08 — Jira Integration: Inbound (Jira → Portal)
> Priority: 6 | Status: ✅ Stories + tasks defined

---

## Overview

Covers the inbound direction of the Jira integration: receiving webhook events from Jira (status changes, new team comments) and converting them into client-visible notifications inside SupportHub.

**Scope boundary — this epic is NOT a sync engine.** When Jira fires a webhook, EPIC-08:
1. Validates and authenticates the incoming event.
2. Looks up the matching client by `JiraIssueKey`.
3. Writes a `Notification` record to SupportHub's DB.
4. Optionally triggers an email via EPIC-04.

No ticket data is written back to SupportHub's DB. The portal's ticket content continues to be read live from Jira (EPIC-02). Notifications are a separate, lightweight module — they carry just enough metadata to surface an alert to the right user.

---

## Architecture Note

**Architectural decisions resolved for this epic:**

### Notification entity — per-user, not per-org
Notifications are scoped to the authenticated client user (`ClientUserId` → `ApplicationUser.Id` in the `identity` DB, mirrored as a `Guid` in `api`). For v1 each user in a client org receives their own `Notification` row. This is the simpler model given that multi-user client orgs are not the primary v1 use case; if one tenant has multiple users each user's read state is independent.

**`Notification` entity fields (defined in `Api.Domain`):**
- `Id` (Guid, `BaseEntity`)
- `ClientUserId` (Guid) — the portal user this notification belongs to
- `JiraIssueKey` (string, max 20) — the issue that triggered the event
- `Type` (enum `NotificationType`: `StatusChanged` | `CommentAdded`)
- `Message` (string, max 500) — human-readable content already stripped of prefixes
- `IsRead` (bool, default false)
- `CreatedAt` (DateTimeOffset, `BaseEntity`)

`UpdatedAt` from `BaseEntity` is inherited but not semantically meaningful for notifications — it will be updated when `IsRead` flips. No soft-delete; notifications are never physically deleted but may be archived in a future version.

### Webhook secret storage — `ClientProject.JiraWebhookSecretHash`
The webhook secret is a per-tenant configuration value. It belongs to the `ClientProject` entity. The raw secret is never stored; only its HMAC-SHA256 hash is persisted. The admin panel (US-08.6) allows rotating the secret; the new hash replaces the old one immediately. Fail-closed: if `JiraWebhookSecretHash` is null, the request is rejected with `401`.

> **Superseded by EPIC-00.** The `ClientProject` entity, its configuration, and the `JiraWebhookSecretHash` column are all created by **EPIC-00 TASK-00.3** — not by EPIC-08. By the time EPIC-08 is implemented, the column already exists in the schema. TASK-08.1.1 (described below) is rescoped accordingly: it no longer creates the entity or migration, only adds the `IClientProjectRepository` method and business logic needed for webhook secret verification.

### Webhook endpoint authentication — `[AllowAnonymous]` + HMAC verification
The `POST /api/webhooks/jira` endpoint must be publicly reachable — Jira cannot authenticate as a portal user, so `[Authorize]` must not be applied. Webhook authenticity is verified exclusively via the `X-Hub-Signature` header (HMAC-SHA256 of the raw request body using the per-tenant secret). Fail-closed: if no secret is configured for the tenant, the request is rejected with `401`. Rate limiting is applied at the endpoint level using ASP.NET Core's built-in rate limiter (`AddRateLimiter`) to mitigate unauthenticated denial-of-service — limit of 60 requests per minute per IP.

### Tenant matching — via `JiraIssueKey`
The webhook payload identifies the issue via `issue.key`. The handler resolves the `Ticket` anchor record (from EPIC-07) by `JiraIssueKey` to find the `ClientId`, then queries `ClientProject` for the matching secret. If no `Ticket` record matches, the event is silently acknowledged with `200 OK`. This means the webhook endpoint handles a single global Jira project context — all tenants' issues route through the same endpoint and are disambiguated by `JiraIssueKey`.

### Notification delivery — polling (no SignalR)
For v1, the frontend polls `GET /api/notifications?unreadOnly=true&limit=50` at a 30-second interval using TanStack Query's `refetchInterval`. This avoids a new infrastructure dependency (SignalR hub, WebSocket) and is sufficient for the expected notification latency. The API returns a flat array (no cursor pagination — 50 is the hard cap for notification history). SignalR can be added in a later version without changing the API contract.

### Email integration boundary — direct `IEmailService` call
When a notification is created, the use case calls `IEmailService.SendNotificationEmailAsync` directly (no domain events, no queues — the project is synchronous throughout). `IEmailService` is defined in `Api.Application/Common/Interfaces/` and is stubbed to a no-op in EPIC-01. EPIC-04 provides the real SES implementation. Email failure does not roll back the notification record — the `IEmailService` call is fire-and-continue: log the error (Serilog `Error`) and proceed.

### ADF plain-text extraction — lightweight static helper
`AdfToHtmlConverter` (EPIC-02) produces HTML and is not appropriate here. A lightweight `AdfPlainTextExtractor` static class in `Api.Infrastructure/Jira/` walks the ADF document tree and concatenates text node values separated by spaces. This is used in the webhook handler to extract the comment body, check for `[Client]` / `[Portal]` prefixes (case-insensitive after trimming), and strip the prefix before storing the notification message. No third-party ADF library is required.

### Webhook URL display in admin panel — yes, read-only copy field
US-08.6 admin panel includes a read-only "Webhook URL" field showing the full public URL (`<BASE_URL>/api/webhooks/jira`) so the admin can copy it into Jira's webhook configuration. `BASE_URL` is an environment variable (`API_BASE_URL`). Jira webhook registration remains a manual step.

### Pagination for notifications (US-08.4)
Notifications use **cursor-based pagination** (per api-conventions.md §5a). The hard limit is 50 items. The frontend requests the first page on panel open; there is no infinite-scroll — if `hasMore` is true the panel shows a "Load more" link. The unread badge count is a separate `GET /api/notifications/unread-count` endpoint returning a single integer.

### Rate limiting
ASP.NET Core's built-in `AddRateLimiter` (introduced in .NET 7, available in .NET 10) is used. A named policy `"webhook"` applies a fixed-window limiter (60 requests / 1 minute / IP) to the `JiraWebhookController` only. No external dependency required.

**Cross-cutting dependencies:**
- EPIC-07 (for `Ticket` anchor record and `IJiraClient`) must be complete before EPIC-08 backend tasks.
- EPIC-01 must be complete (JWT auth, `IEmailService` stub) before protected notification endpoints.
- EPIC-04 (SES email) is a downstream consumer of `IEmailService` — EPIC-08 works with the stub until EPIC-04 is implemented.
- EPIC-05B will extend `ClientProject` with additional fields; EPIC-08's `JiraWebhookSecretHash` column must be forward-compatible.

---

## User Stories

---

### US-08.1 — Receive Jira webhook events
> *As the system, I want to receive and validate webhook events from Jira so that SupportHub can react to changes that the team makes on issues without polling Jira continuously.*

**Acceptance Criteria:**
- [ ] SupportHub exposes a public HTTP endpoint that Jira can call when an issue event occurs.
- [ ] The endpoint accepts `issue_updated` and `comment_created` Jira webhook event types; other event types are silently acknowledged with a `200 OK` and ignored.
- [ ] Each incoming webhook payload is validated against a shared secret configured in the admin panel (EPIC-05B) — requests that fail validation are rejected with `401`.
- [ ] If the `JiraIssueKey` in the payload does not match any `Ticket` anchor record in SupportHub's DB, the event is acknowledged with `200 OK` and no notification is created.
- [ ] If the event is valid and the ticket is matched, the system proceeds to notification creation (US-08.2).
- [ ] The endpoint responds within a short timeout (under 3 seconds) regardless of downstream processing time — Jira does not retry on slow responses.
- [ ] Failed or invalid events are logged with the raw payload for diagnostics; no sensitive data (credentials, tokens) is logged.

**Story Points:** 3

#### TASK-08.1.1 — `IClientProjectRepository` webhook methods and `ClientProjectRepository` (api)
> ⚠️ **Rescoped from original.** The `ClientProject` entity, `ClientProjectConfiguration`, `DbSet<ClientProject>`, `JiraWebhookSecretHash` column, and migration are all delivered by **EPIC-00 TASK-00.3**. No migration work remains here. This task adds the repository interface and implementation methods that the webhook handler needs.

**Layer:** Domain + Infrastructure
**Repo:** api
**Depends on:** EPIC-00 TASK-00.3 (ClientProject entity and schema already exist), TASK-07.1.3

**What to build:**

Define `IClientProjectRepository` in `Api.Domain/Interfaces/IClientProjectRepository.cs` with the methods needed by EPIC-08 and EPIC-07:
- `GetByClientIdAsync(Guid clientId, CancellationToken ct)` — returns `ClientProject?`
- `GetByJiraProjectKeyAsync(string jiraProjectKey, CancellationToken ct)` — returns `ClientProject?`
- `UpsertAsync(ClientProject entity, CancellationToken ct)` — create or update in-place

Implement `ClientProjectRepository` in `Api.Infrastructure/Persistence/Repositories/ClientProjectRepository.cs`. Register `IClientProjectRepository → ClientProjectRepository` as `Scoped` in `AddInfrastructure`.

**Constraints:**
- `IClientProjectRepository` lives in `Api.Domain/Interfaces/` — no EF Core references.
- No new migrations — schema already exists from EPIC-00.
- `UpsertAsync` is needed by EPIC-05B; include it now so EPIC-05B has no additional repository work.

**Definition of Done:**
- [ ] `IClientProjectRepository` exists at `Api.Domain/Interfaces/IClientProjectRepository.cs` with all three method signatures.
- [ ] `ClientProjectRepository` exists at `Api.Infrastructure/Persistence/Repositories/ClientProjectRepository.cs` and implements the interface.
- [ ] `IClientProjectRepository → ClientProjectRepository` is registered in `AddInfrastructure`.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.2 — `INotificationRepository` interface + `Notification` domain entity (api)
**Layer:** Domain
**Repo:** api
**Depends on:** TASK-07.1.3

**What to build:**
Define the `Notification` entity in `Api.Domain/Notifications/` and the `INotificationRepository` interface in `Api.Domain/Interfaces/`. The entity carries: `Id`, `ClientUserId` (Guid), `JiraIssueKey` (string), `Type` (`NotificationType` enum), `Message` (string), `IsRead` (bool, default false), and the `BaseEntity` fields. `NotificationType` is a domain enum (`StatusChanged` | `CommentAdded`). Include a static factory method `Notification.Create(...)`.

**Constraints:**
- Entity inherits from `BaseEntity` (per backend-guidelines §5).
- No public setters — use private setters and domain methods (`MarkAsRead()`) for state transitions.
- `Notification.Create(Guid clientUserId, string jiraIssueKey, NotificationType type, string message)` is the only constructor pathway.
- `INotificationRepository` declares: `AddAsync`, `GetByClientUserIdAsync` (with cursor + limit params), `GetUnreadCountAsync`, `MarkAsReadAsync` (single), `MarkAllAsReadAsync`, `GetByIdAsync`.
- Zero dependencies on EF Core, Infrastructure, or Application in `Domain` (per backend-guidelines §5).
- `Message` max 500 characters — enforced at the application validation layer, not the entity constructor.

**Definition of Done:**
- [ ] `Notification` entity exists at `Api.Domain/Notifications/Notification.cs` with `Create` factory method and `MarkAsRead()` method.
- [ ] `NotificationType` enum exists at `Api.Domain/Notifications/NotificationType.cs`.
- [ ] `INotificationRepository` exists at `Api.Domain/Interfaces/INotificationRepository.cs` with all six method signatures.
- [ ] `dotnet build` succeeds with zero references to EF Core or Infrastructure types in `Api.Domain`.

---

#### TASK-08.1.3 — `NotificationConfiguration`, EF Core migration, and `NotificationRepository` (api)
**Layer:** Infrastructure (DB migration)
**Repo:** api
**Depends on:** TASK-08.1.2

**What to build:**
Create `NotificationConfiguration : IEntityTypeConfiguration<Notification>` in `Api.Infrastructure/Persistence/Configurations/`. Map the `Notifications` table with appropriate column constraints. Add `DbSet<Notification>` to `AppDbContext`. Implement `NotificationRepository` in `Api.Infrastructure/Persistence/Repositories/` fulfilling `INotificationRepository`. Register `INotificationRepository → NotificationRepository` in `AddInfrastructure`. Generate and apply the EF Core migration for the `Notifications` table.

**Constraints:**
- `JiraIssueKey`: `HasMaxLength(20)`, `IsRequired(true)`.
- `Message`: `HasMaxLength(500)`, `IsRequired(true)`.
- `ClientUserId`: index (non-unique) for query performance — `HasIndex(n => n.ClientUserId)`.
- `Type` stored as `int` (EF Core enum default) — do not use `string` conversion.
- Cursor-based pagination in `GetByClientUserIdAsync`: cursor is `CreatedAt` (DateTimeOffset) + `Id` (Guid) pair encoded as base64 JSON — decode and apply a `WHERE (CreatedAt, Id) < (cursor.CreatedAt, cursor.Id)` filter, ordered by `CreatedAt DESC, Id DESC`.
- `MarkAllAsReadAsync` uses a bulk `ExecuteUpdateAsync` — not a per-row loop.
- Repository must not reference `AppDbContext` directly in its constructor type — use `IUnitOfWork` for writes and inject `AppDbContext` only for queries.

**Definition of Done:**
- [ ] `NotificationConfiguration` exists at `Api.Infrastructure/Persistence/Configurations/NotificationConfiguration.cs`.
- [ ] `NotificationRepository` exists at `Api.Infrastructure/Persistence/Repositories/NotificationRepository.cs`.
- [ ] `INotificationRepository` registered in `AddInfrastructure`.
- [ ] EF Core migration creates `Notifications` table with all columns and the `ClientUserId` index.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.4 — `JiraWebhookPayload` DTOs and `AdfPlainTextExtractor` (api)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-08.1.1

**What to build:**
Define internal C# record types in `Api.Infrastructure/Jira/Webhook/` that map the Jira webhook JSON payloads for `issue_updated` and `comment_created` events. At minimum: `JiraWebhookPayload` (root), `JiraWebhookIssue`, `JiraWebhookChangelog`, `JiraWebhookChangelogItem` (field name + from/to values), `JiraWebhookComment`, and `JiraWebhookAuthor`. Also create a static `AdfPlainTextExtractor` class in the same namespace that accepts an ADF document JSON string (as `JsonElement` or `string`) and returns the concatenated plain-text of all text nodes, separated by single spaces.

**Constraints:**
- All payload types are `internal record` — not exposed to Application layer.
- Use `System.Text.Json` for deserialization — no Newtonsoft.
- The ADF extractor must handle null/missing nodes gracefully — return empty string, never throw.
- The extractor does not need to handle all ADF node types — only `text` nodes and `paragraph`, `doc`, `bulletList`, `listItem` containers are required; other node types are skipped.
- No third-party ADF library — the extractor is a lightweight recursive walker.
- This infrastructure DTO layer has no dependency on Application or Domain (these are deserialization helpers only).

**Definition of Done:**
- [ ] `JiraWebhookPayload` and related record types exist under `Api.Infrastructure/Jira/Webhook/`.
- [ ] `AdfPlainTextExtractor` exists at `Api.Infrastructure/Jira/Webhook/AdfPlainTextExtractor.cs`.
- [ ] Given a minimal ADF JSON with text nodes, `AdfPlainTextExtractor.Extract(json)` returns the expected plain-text string.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.5 — `ProcessJiraWebhookUseCase` — event routing and HMAC validation (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.3, TASK-08.1.4

**What to build:**
Create `ProcessJiraWebhookUseCase` in `Api.Application/Webhooks/UseCases/`. It receives a `ProcessJiraWebhookCommand` (rawBody: byte[], signature: string, eventType: string, issueKey: string, changelogItems: parsed status change if any, comment body and author if any). The use case: (1) resolves the `Ticket` by `issueKey` — returns `Result.Ok()` (silent ack) if not found; (2) resolves `ClientProject` by the ticket's `ClientId` to get `JiraWebhookSecretHash` — returns `Result.Fail(new UnauthorizedError(...))` if hash is null or HMAC verification fails; (3) routes to `StatusChangedHandler` or `CommentCreatedHandler` sub-logic based on `eventType`; (4) for unknown event types, returns `Result.Ok()` immediately.

**Constraints:**
- HMAC-SHA256 verification: compute `HMACSHA256(rawBody, secretBytes)` and compare hex digest to the signature header value using `CryptographicOperations.FixedTimeEquals` — never string equality.
- The raw secret for HMAC computation must be obtained from the current request context, not from DB storage. The `ClientProject.JiraWebhookSecretHash` stores the hash for storage only — the handler receives the raw secret via the `IWebhookSecretService` interface (see TASK-08.6.1) which resolves it from the current admin configuration.

  > **Clarification:** the per-tenant secret is stored as a hash only for the admin display masking requirement (US-08.6). For HMAC verification, the raw secret must be available. Revised approach: store the raw secret in the DB, encrypted at rest using ASP.NET Core Data Protection (`IDataProtector`). `JiraWebhookSecretHash` is renamed to `JiraWebhookSecret` (encrypted string). The admin panel masks display but the actual value is decryptable for HMAC verification. The "hash" approach conflicts with HMAC verification — this correction supersedes the Architecture Note above.

- Email dispatch: call `IEmailService.SendNotificationEmailAsync` after notification persisted. Failure must not roll back the DB write — catch the exception, log `Error`, and continue.
- Single `ExecuteAsync(ProcessJiraWebhookCommand cmd, CancellationToken ct)` method returning `Task<Result>`.
- The use case must respond within 2 seconds of invocation — no long-running operations.
- No direct references to `HttpContext`, `IFormFile`, or any ASP.NET Core types — Application is framework-agnostic.

**Constraints (continued):**
- Use case class is `internal`, injected via `IProcessJiraWebhookUseCase` interface (per backend-guidelines §2).
- Errors from sub-handlers propagate as `Result.Fail` using typed error classes.
- Jira webhook secret decryption uses `IDataProtector` injected via `IWebhookSecretService` — not raw `IConfiguration`.

**Definition of Done:**
- [ ] `ProcessJiraWebhookUseCase` exists at `Api.Application/Webhooks/UseCases/ProcessJiraWebhookUseCase.cs`.
- [ ] `IProcessJiraWebhookUseCase` interface exists in the same folder.
- [ ] An `issue_updated` event with a matching ticket and valid signature results in a `Notification` row in the DB.
- [ ] An `issue_updated` event with no matching `Ticket` record returns `Result.Ok()` without writing a DB row.
- [ ] An event with an invalid signature returns `Result.Fail` with `UnauthorizedError`.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.6 — `StatusChangedHandler` sub-logic (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.5

**What to build:**
Extract the status-change notification creation logic into an `internal sealed class StatusChangedHandler` (or equivalent private method/class) within `Api.Application/Webhooks/`. Given the `issue_updated` changelog, it: (1) finds a changelog item where `field == "status"`; (2) returns early (no notification) if none found; (3) maps the new status name to the portal's canonical labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded) — falls back to the raw Jira status name if not matched; (4) creates a `Notification` via `Notification.Create(...)` and persists it via `INotificationRepository`; (5) calls `IEmailService` (fire-and-continue).

**Constraints:**
- Status mapping is a static dictionary in `Api.Application/Webhooks/` — not a DB lookup, not a configuration value.
- If the `issue_updated` event has no status change (other field changes only), the handler returns `Result.Ok()` silently — no notification created.
- The notification `Message` format: `"Ticket {jiraIssueKey} status changed to {mappedStatus}."` — max 500 chars.
- No direct reference to `HttpContext` or ASP.NET Core types.
- Handler is `internal` — not exposed through a public interface.

**Definition of Done:**
- [ ] A Jira `issue_updated` webhook with a `status` changelog item creates a `Notification` row with `Type = StatusChanged`.
- [ ] A Jira `issue_updated` webhook with no `status` changelog item creates no `Notification` row.
- [ ] A status name not in the portal mapping uses the raw Jira status name in the notification message.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.7 — `CommentCreatedHandler` sub-logic (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.5

**What to build:**
Extract the comment notification creation logic into an `internal sealed class CommentCreatedHandler` (or equivalent) within `Api.Application/Webhooks/`. Given the parsed comment body (plain text already extracted from ADF) and author display name: (1) if body starts with `[Portal]` (case-insensitive, trimmed) → return `Result.Ok()` silently; (2) if body does not start with `[Client]` (case-insensitive, trimmed) → return `Result.Ok()` silently; (3) strip the `[Client]` prefix, trim whitespace; (4) create a `Notification` with `Type = CommentAdded` and persist it; (5) call `IEmailService` (fire-and-continue).

**Constraints:**
- All prefix checks are case-insensitive and trim leading whitespace before comparison.
- The `[Client]` prefix (including the brackets and any trailing colon or space) is stripped before storing `Message`.
- The notification `Message` format: `"New comment on {jiraIssueKey} from {authorDisplayName}: {strippedCommentText}"` — truncated to 500 chars if longer.
- `authorDisplayName` may be empty/null from Jira — default to `"Jira Team"` in that case.
- No direct reference to `HttpContext` or ASP.NET Core types.

**Definition of Done:**
- [ ] A `comment_created` event whose body starts with `[Client]` creates a `Notification` with `Type = CommentAdded`.
- [ ] A `comment_created` event whose body starts with `[Portal]` creates no notification.
- [ ] A `comment_created` event whose body has no prefix creates no notification.
- [ ] The `[Client]` prefix is absent from the stored `Notification.Message`.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.1.8 — `JiraWebhookController` — `POST /api/webhooks/jira` (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-08.1.5, TASK-08.1.6, TASK-08.1.7

**What to build:**
Create `JiraWebhookController` in `Api.API/Controllers/Webhooks/` with a single `POST /api/webhooks/jira` action. The action: (1) reads the raw request body as `byte[]` before model binding (disable body buffering — use `EnableBuffering()` or a custom approach to preserve the raw bytes for HMAC); (2) extracts the `X-Hub-Signature` header; (3) deserializes the JSON payload to extract `webhookEvent`, `issue.key`, changelog items, and comment body/author; (4) calls `IProcessJiraWebhookUseCase.ExecuteAsync`; (5) always returns `200 OK` on `Result.Ok()` or silent acknowledgements; (6) returns `401` on `UnauthorizedError`; (7) applies the `"webhook"` rate-limiting policy.

**Constraints:**
- `[AllowAnonymous]` — this endpoint must NOT be decorated with `[Authorize]`. Authenticity is verified via HMAC inside the use case.
- Raw body bytes must be captured before JSON deserialization — the HMAC is computed over the raw body.
- The endpoint must not throw exceptions for unknown `webhookEvent` values — the use case handles routing silently.
- Apply the named rate-limit policy `"webhook"` via `[EnableRateLimiting("webhook")]` attribute.
- Log the `webhookEvent` type and `issue.key` at `Information` level on each invocation. Log validation failures at `Warning` with raw body (never log headers containing secrets).
- Rate limiter registration (`AddRateLimiter` with a fixed-window `"webhook"` policy: 60 requests / 1 minute / IP) goes in `AddInfrastructure` or a dedicated `AddApiRateLimiting` extension in `Api.API`.
- Controller inherits from `ApiControllerBase` (per api-conventions.md §1).
- Route: `POST /api/webhooks/jira` — override default `[Route("api/[controller]")]` with explicit `[Route("api/webhooks")]`.

**Definition of Done:**
- [ ] `POST /api/webhooks/jira` exists and returns `200 OK` for a valid `issue_updated` event with correct HMAC.
- [ ] `POST /api/webhooks/jira` returns `401` for a request with an incorrect HMAC.
- [ ] `POST /api/webhooks/jira` returns `200 OK` for an unknown event type (e.g. `issue_created`) without creating a notification.
- [ ] Rate-limiting policy `"webhook"` is registered and applied.
- [ ] An authenticated request (with `Authorization: Bearer ...`) is NOT required — `[AllowAnonymous]` confirmed.
- [ ] `dotnet build` succeeds.

---

### US-08.2 — Notify client when ticket status changes
> *As a client, I want to receive an in-app notification when the team changes the status of one of my tickets so that I know there has been progress without having to check the portal manually.*

**Acceptance Criteria:**
- [ ] When Jira fires an `issue_updated` event that includes a status field change, SupportHub creates a notification for the client who owns that ticket.
- [ ] The notification states which ticket changed and what the new status is, expressed in the portal's defined status labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded).
- [ ] If the new status does not match any portal label, the notification is still created using the raw Jira status name, so the client is never silently left unnotified.
- [ ] The notification is stored in SupportHub's DB and visible in the client's notification centre (US-08.4).
- [ ] A notification is created only for status changes — other field changes on the same `issue_updated` event (e.g. priority updates) do not generate a notification.
- [ ] If the client has a verified email address and email notifications are enabled (EPIC-04), an email is also sent via EPIC-04's email service. If email sending fails, the in-app notification is still created — email failure does not roll back the notification record.

**Story Points:** 3

> **Implementation note:** US-08.2 is implemented by TASK-08.1.5 (`ProcessJiraWebhookUseCase`) and TASK-08.1.6 (`StatusChangedHandler`), which are defined under US-08.1 because they are part of the same webhook processing pipeline. No additional tasks are required for US-08.2 beyond the email service wiring below.

#### TASK-08.2.1 — `IEmailService.SendNotificationEmailAsync` stub method (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-01.6.1

**What to build:**
Add `SendNotificationEmailAsync(string toEmail, string subject, string body, CancellationToken ct)` to the existing `IEmailService` interface in `Api.Application/Common/Interfaces/`. Update the stub `NoOpEmailService` implementation (introduced in EPIC-01) to implement the new method as a no-op with an `Information` log entry. This gives EPIC-08 use cases a compile target for email dispatch without depending on the real SES service from EPIC-04.

**Constraints:**
- The interface and stub must exist in `Api.Application` — no Infrastructure dependency.
- The new method signature must be consistent with the existing `IEmailService` methods (async, `CancellationToken ct` last parameter, returns `Task`).
- The stub logs at `Information` level: `"[NoOpEmailService] Notification email to {Email} suppressed."` — no real email sent.
- Do not modify any existing method signatures on `IEmailService`.

**Definition of Done:**
- [ ] `IEmailService` has `SendNotificationEmailAsync` method.
- [ ] `NoOpEmailService` implements the new method with a no-op log.
- [ ] `dotnet build` succeeds.

---

### US-08.3 — Notify client when the team adds a client-facing comment
> *As a client, I want to receive an in-app notification when the technical team explicitly addresses a comment to me so that I only receive relevant, intentional communications and not internal team notes.*

**Acceptance Criteria:**
- [ ] When Jira fires a `comment_created` event on an issue tracked by SupportHub, a notification is created for the client **only if** the comment body starts with the prefix `[Client]` (case-insensitive, leading whitespace trimmed).
- [ ] Comments that do not start with `[Client]` are treated as internal and silently acknowledged with `200 OK` — no notification is created.
- [ ] Comments posted via the portal itself (body starts with `[Portal]`) never generate a notification, regardless of any other content.
- [ ] The notification states which ticket received a new client-facing comment and includes the commenter's display name.
- [ ] The `[Client]` prefix is stripped from the notification message displayed to the client — the client sees the comment content without the prefix.
- [ ] The notification is stored in SupportHub's DB and visible in the client's notification centre (US-08.4).
- [ ] If email notifications are enabled (EPIC-04), an email is also sent alongside the in-app notification. Email failure does not roll back the notification record.

**Story Points:** 3

> **Implementation note:** US-08.3 is implemented by TASK-08.1.5 and TASK-08.1.7, defined under US-08.1. No additional tasks are required.

---

### US-08.4 — View in-app notifications
> *As a client, I want to see a list of my unread notifications in the portal so that I can quickly see what has changed on my tickets since my last visit.*

**Acceptance Criteria:**
- [ ] The portal header displays a notification bell icon with a badge showing the count of unread notifications.
- [ ] Clicking the bell opens a notification panel (e.g. a dropdown or drawer) listing the most recent notifications in reverse-chronological order (newest first).
- [ ] Each notification shows: a short description of the event (status changed / new comment), the ticket title or identifier it relates to, and the time elapsed since the event (e.g. "2 hours ago").
- [ ] Notifications that relate to a specific ticket are clickable and navigate the client to that ticket's detail page.
- [ ] Opening the notification panel marks all currently displayed notifications as read, clearing the unread badge.
- [ ] If there are no notifications, the panel shows a friendly empty state (e.g. "You're all caught up").
- [ ] The notification list is paginated or limited to the most recent 50 notifications — there is no infinite history visible in the UI.
- [ ] The panel is accessible only to authenticated clients; unauthenticated access redirects to the login page.

**Story Points:** 5

#### TASK-08.4.1 — `GetNotificationsUseCase` and `GetUnreadCountUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.3

**What to build:**
Create two use cases in `Api.Application/Notifications/UseCases/`:
1. `GetNotificationsUseCase` — accepts `GetNotificationsQuery` (clientUserId: Guid, cursor: string?, limit: int) and returns `Result<PagedResult<NotificationDto>>`. Queries `INotificationRepository.GetByClientUserIdAsync` with cursor and limit.
2. `GetUnreadCountUseCase` — accepts `GetUnreadCountQuery` (clientUserId: Guid) and returns `Result<int>`. Queries `INotificationRepository.GetUnreadCountAsync`.

Define `NotificationDto` (id, jiraIssueKey, type, message, isRead, createdAt) in `Api.Application/Notifications/Dtos/`.

**Constraints:**
- `limit` in `GetNotificationsQuery` must be clamped to max 50 — enforced in the validator, not the repository.
- `GetNotificationsQuery` validator: `limit` between 1 and 50, `cursor` nullable.
- `clientUserId` is the authenticated user's `sub` claim — never caller-supplied from query string.
- Both use cases are `internal`, injected via their respective interfaces (per backend-guidelines §2).
- `NotificationDto.type` serialises as `"StatusChanged"` or `"CommentAdded"` (string, not int).

**Definition of Done:**
- [ ] `GetNotificationsUseCase` and `GetUnreadCountUseCase` exist in `Api.Application/Notifications/UseCases/`.
- [ ] `NotificationDto` record exists at `Api.Application/Notifications/Dtos/NotificationDto.cs`.
- [ ] Both use case interfaces are defined in the same folder.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.4.2 — `NotificationsController` — `GET /api/notifications` and `GET /api/notifications/unread-count` (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-08.4.1

**What to build:**
Create `NotificationsController` in `Api.API/Controllers/Notifications/` with two actions:
1. `GET /api/notifications` — accepts `cursor` (string?, query param) and `limit` (int, default 20, query param). Extracts `ClientUserId` from JWT `sub` claim. Calls `IGetNotificationsUseCase`. Returns `200 OK` with `PagedResult<NotificationDto>`.
2. `GET /api/notifications/unread-count` — no query params. Calls `IGetUnreadCountUseCase`. Returns `200 OK` with `{ "count": N }`.

**Constraints:**
- Both endpoints require `[Authorize]` — client JWT required (per api-conventions.md §6).
- `ClientUserId` extracted from `User.FindFirstValue(ClaimTypes.NameIdentifier)` — never from query string.
- Routes: `/api/notifications` and `/api/notifications/unread-count` (per api-conventions.md §4).
- Controller inherits from `ApiControllerBase` (per api-conventions.md §1).
- The `unread-count` response is a simple wrapper record `UnreadCountDto { int Count }` — not a bare integer.
- Result mapped via `ResultExtensions` (per api-conventions.md §2).

**Definition of Done:**
- [ ] `GET /api/notifications` with a valid client JWT returns `200 OK` with `PagedResult<NotificationDto>`.
- [ ] `GET /api/notifications/unread-count` returns `200 OK` with `{ "count": N }`.
- [ ] An unauthenticated request to either endpoint returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.4.3 — Notification bell and panel UI (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-08.4.2

**What to build:**
Add a `NotificationBell` component to the portal header. It renders a bell icon (shadcn/ui `Bell` icon from `lucide-react`) with a red badge showing the unread count, polled every 30 seconds via `useQuery` with `refetchInterval: 30_000`. Clicking the bell opens a `NotificationPanel` (shadcn/ui `Popover` or `Sheet`) that renders the notification list fetched from `GET /api/notifications`. Each notification item shows: icon (status vs comment), `message`, `jiraIssueKey` as a link to `/tickets/{jiraIssueKey}`, and a relative time string (`"2 hours ago"` formatted via `date-fns/formatDistanceToNow`). Empty state: "You're all caught up." The panel calls `PATCH /api/notifications/mark-all-read` (US-08.5) on open to clear the badge.

**Constraints:**
- Use `useQuery` from TanStack Query for both the unread count poll and the notification list fetch (per the tech stack).
- The `refetchInterval` for the unread count query is 30,000 ms — do not poll more frequently.
- Use shadcn/ui primitives: `Popover`, `Badge`, `ScrollArea`, `Button` — no raw HTML `<div>` for layout.
- `NotificationBell` is rendered inside the existing portal header component — do not create a new layout wrapper.
- Notifications older than 50 are not fetched — use the default `limit=50` on the first request; no "load more" in v1.
- Relative time formatting via `date-fns` — already a dependency or add it.
- Navigation to ticket detail uses React Router `<Link>` component.
- The component must handle the loading and error states of both queries gracefully — no unhandled promise rejections.

**Definition of Done:**
- [ ] Bell icon appears in the portal header with a numeric badge when `count > 0`.
- [ ] Badge updates every 30 seconds without a page refresh.
- [ ] Clicking the bell opens the notification panel with the fetched list.
- [ ] Each notification item links to the correct ticket detail route.
- [ ] Opening the panel triggers the mark-all-read call.
- [ ] Empty state "You're all caught up." is displayed when there are no notifications.
- [ ] `npm run build` (or `vite build`) succeeds with no TypeScript errors.

---

### US-08.5 — Mark individual notifications as read
> *As a client, I want to dismiss individual notifications so that I can keep my notification panel focused on items that still need my attention.*

**Acceptance Criteria:**
- [ ] Each notification in the panel has a dismiss or "mark as read" action (e.g. a close icon or a swipe action on mobile).
- [ ] Triggering the action marks that single notification as read and removes it from the unread count.
- [ ] The dismissed notification either disappears from the panel or is visually distinguished as read — it is not permanently deleted.
- [ ] There is also a "Mark all as read" action that marks all visible notifications as read in a single click.
- [ ] If the action fails (network error), the notification remains in its previous state and a brief error message is shown.

**Story Points:** 2

#### TASK-08.5.1 — `MarkNotificationReadUseCase` and `MarkAllNotificationsReadUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.1.3

**What to build:**
Create two use cases in `Api.Application/Notifications/UseCases/`:
1. `MarkNotificationReadUseCase` — accepts `MarkNotificationReadCommand` (notificationId: Guid, clientUserId: Guid). Calls `INotificationRepository.GetByIdAsync`, verifies the notification's `ClientUserId` matches the authenticated user (returns `ForbiddenError` if not), calls `MarkAsRead()` on the entity, and commits via `IUnitOfWork`.
2. `MarkAllNotificationsReadUseCase` — accepts `MarkAllNotificationsReadCommand` (clientUserId: Guid). Calls `INotificationRepository.MarkAllAsReadAsync(clientUserId)` and commits.

**Constraints:**
- Ownership check in `MarkNotificationReadUseCase`: compare `notification.ClientUserId == cmd.clientUserId` — return `ForbiddenError` if mismatch (per backend-guidelines §12 IDOR mitigation).
- `MarkAsRead()` is a domain method on `Notification` that sets `IsRead = true` and calls `Touch()`.
- Both use cases return `Task<Result>` (void success per backend-guidelines §2).
- Both are `internal`, injected via their interfaces.

**Definition of Done:**
- [ ] `MarkNotificationReadUseCase` exists at `Api.Application/Notifications/UseCases/MarkNotificationReadUseCase.cs`.
- [ ] `MarkAllNotificationsReadUseCase` exists at `Api.Application/Notifications/UseCases/MarkAllNotificationsReadUseCase.cs`.
- [ ] Calling `MarkNotificationReadUseCase` with a notification belonging to a different user returns `ForbiddenError`.
- [ ] `dotnet build` succeeds.

---

#### TASK-08.5.2 — `PATCH /api/notifications/{id}/read` and `PATCH /api/notifications/mark-all-read` endpoints (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-08.5.1

**What to build:**
Add two PATCH actions to `NotificationsController`:
1. `PATCH /api/notifications/{id}/read` — path param `id` (Guid). Extracts `ClientUserId` from JWT. Calls `IMarkNotificationReadUseCase`. Returns `204 No Content` on success.
2. `PATCH /api/notifications/mark-all-read` — no params. Extracts `ClientUserId` from JWT. Calls `IMarkAllNotificationsReadUseCase`. Returns `204 No Content` on success.

**Constraints:**
- Both endpoints require `[Authorize]` — client JWT required.
- `ClientUserId` from JWT `sub` claim — never from request body (per api-conventions.md §6).
- Route `PATCH /api/notifications/{id}/read` must not conflict with `PATCH /api/notifications/mark-all-read` — ensure ASP.NET Core routing disambiguates (literal `mark-all-read` segment takes precedence over `{id}` capture).
- Map `ForbiddenError → 403` via `ResultExtensions`.
- Map `NotFoundError → 404` via `ResultExtensions`.

**Definition of Done:**
- [ ] `PATCH /api/notifications/{id}/read` returns `204 No Content` when the notification belongs to the authenticated user.
- [ ] `PATCH /api/notifications/{id}/read` returns `403` when the notification belongs to a different user.
- [ ] `PATCH /api/notifications/mark-all-read` returns `204 No Content`.
- [ ] Unauthenticated requests return `401`.
- [ ] `dotnet build` succeeds.

---

### US-08.6 — Admin can configure the Jira webhook secret
> *As an admin, I want to set the shared secret that Jira uses to sign webhook payloads so that SupportHub can verify that incoming events are genuine and not forged.*

**Acceptance Criteria:**
- [ ] The admin panel has a "Webhook secret" field in the Jira integration settings section.
- [ ] The admin can enter a secret string and save it; it is stored securely and never displayed in plain text after saving (masked with `••••••`).
- [ ] The admin can rotate the secret by entering a new value and saving — the old secret is immediately invalidated.
- [ ] If no secret is configured, incoming webhook requests are rejected with `401` (fail-closed behaviour).
- [ ] The field is accessible only to users with the Admin role.
- [ ] A help text explains that this secret must match the value entered in Jira's webhook configuration.

**Story Points:** 2

#### TASK-08.6.1 — `IWebhookSecretService` and Data Protection wiring (api)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** TASK-08.1.1

**What to build:**
Define `IWebhookSecretService` in `Api.Application/Common/Interfaces/` with two methods: `SetSecretAsync(Guid clientId, string rawSecret, CancellationToken ct)` and `GetRawSecretAsync(Guid clientId, CancellationToken ct) → Task<string?>`. Implement `WebhookSecretService` in `Api.Infrastructure/Security/` using ASP.NET Core Data Protection (`IDataProtector`) to encrypt the raw secret before persisting it to `ClientProject.JiraWebhookSecret` and decrypt it on read. Register `IWebhookSecretService → WebhookSecretService` in `AddInfrastructure`. Configure ASP.NET Core Data Protection in `AddInfrastructure` with a named purpose string `"JiraWebhookSecret"`.

**Constraints:**
- Data Protection keys are stored using the default ASP.NET Core Data Protection key ring (filesystem in Development, configurable for Production). No additional external key storage required for v1.
- The `IDataProtector` purpose string is `"SupportHub.JiraWebhookSecret"` — constant, not configurable.
- `GetRawSecretAsync` returns null if no secret is stored (null stored value) — the caller must treat null as "no secret configured" → reject.
- `SetSecretAsync` overwrites any existing value — no history is kept.
- The raw secret must never appear in any log output at any severity level (per backend-guidelines §10).
- `IWebhookSecretService` has no Infrastructure type references — it is a pure Application-layer interface.

**Definition of Done:**
- [ ] `IWebhookSecretService` exists at `Api.Application/Common/Interfaces/IWebhookSecretService.cs`.
- [ ] `WebhookSecretService` exists at `Api.Infrastructure/Security/WebhookSecretService.cs`.
- [ ] `IWebhookSecretService` registered in `AddInfrastructure`.
- [ ] Storing and retrieving a secret round-trips correctly (encrypt → persist → read → decrypt → same string).
- [ ] `dotnet build` succeeds.

---

#### TASK-08.6.2 — `SetWebhookSecretUseCase` and `GetWebhookConfigUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-08.6.1

**What to build:**
Create two use cases in `Api.Application/Admin/Webhooks/UseCases/`:
1. `SetWebhookSecretUseCase` — accepts `SetWebhookSecretCommand` (clientId: Guid, rawSecret: string). Validates `rawSecret` non-empty, min 16 chars, max 256 chars. Calls `IWebhookSecretService.SetSecretAsync`. Returns `Result.Ok()`.
2. `GetWebhookConfigUseCase` — accepts `GetWebhookConfigQuery` (clientId: Guid). Returns `Result<WebhookConfigDto>`. `WebhookConfigDto` has: `isConfigured` (bool — true if a secret exists), `maskedSecret` (string — `"••••••"` if configured, empty if not), `webhookUrl` (string — full URL from `IWebhookUrlProvider`).

Define `IWebhookUrlProvider` in `Api.Application/Common/Interfaces/` with `GetWebhookUrl() → string`. Implement it in `Api.Infrastructure/` reading `API_BASE_URL` env var and returning `$"{apiBaseUrl}/api/webhooks/jira"`.

**Constraints:**
- `GetWebhookConfigUseCase` never returns the raw secret — only the masked display string.
- `WebhookConfigDto.maskedSecret` is always `"••••••"` when configured, regardless of the actual secret length (no partial reveal).
- The real secret value must not appear in logs or responses at any point.
- `IWebhookUrlProvider` is an Application interface — the Infrastructure implementation reads `API_BASE_URL` from `IConfiguration`.
- `API_BASE_URL` must be added to `api/.env.example`.
- Validator for `SetWebhookSecretCommand`: `rawSecret` min 16 chars, max 256 chars, `NotEmpty`.

**Definition of Done:**
- [ ] `SetWebhookSecretUseCase` exists and stores the encrypted secret.
- [ ] `GetWebhookConfigUseCase` returns `isConfigured: false` when no secret exists and `isConfigured: true` with `maskedSecret: "••••••"` after a secret is set.
- [ ] `IWebhookUrlProvider` and its Infrastructure implementation exist.
- [ ] `API_BASE_URL` is documented in `api/.env.example`.
- [ ] `dotnet build` succeeds.

---

> **TASK-08.6.3 and TASK-08.6.4 (backoffice UI)** — Moved to EPIC-05B (Admin: Jira Configuration). All backoffice UI tasks are consolidated there.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-08.1 | Receive Jira webhook events | 3 |
| US-08.2 | Notify client when ticket status changes | 3 |
| US-08.3 | Notify client when the team adds a comment | 3 |
| US-08.4 | View in-app notifications | 5 |
| US-08.5 | Mark individual notifications as read | 2 |
| US-08.6 | Admin can configure the Jira webhook secret | 2 |
| **Total** | | **18** |

---

## Task Breakdown

> **Merged task structure.** Original 16 tasks collapsed to 2 to maximise AI-assisted throughput. Each task is a complete, independently deliverable unit. TASK-08-A builds the entire backend pipeline in one pass. TASK-08-B adds the notification UI and admin secret management.

| Task | Title | Wave | Repo | Depends on |
|---|---|---|---|---|
| TASK-08-A | Notification domain + webhook pipeline — entity, repository, webhook processor, all handlers, secret service, all backend endpoints | Wave 4 | api | TASK-07-A (Ticket entity + ITicketRepository), TASK-01.6.1 (IEmailService stub) |
| TASK-08-B | Notification UI + admin secret — bell, panel, mark-read, webhook secret use cases + admin endpoints | Wave 4 | api + client-portal | TASK-08-A, TASK-02-B |

---

### TASK-08-A — Notification domain + webhook pipeline
**Wave:** 4
**Repo:** api
**Depends on:** TASK-07-A (`Ticket` entity, `ITicketRepository` exist), TASK-01.6.1 (`IEmailService` stub exists)

**What to build:**

**(1) `Notification` domain entity** — create in `Api.Domain/Notifications/`:
- Fields: `Id` (Guid), `ClientUserId` (Guid), `JiraIssueKey` (string, max 20), `Type` (`NotificationType` enum: `StatusChanged | CommentAdded`), `Message` (string, max 500), `IsRead` (bool, default false), `CreatedAt` + `UpdatedAt` from `BaseEntity`
- Inherits `BaseEntity`; private setters; domain methods: `MarkAsRead()`
- Static factory: `Notification.Create(Guid clientUserId, string jiraIssueKey, NotificationType type, string message)`
- `NotificationType` enum at `Api.Domain/Notifications/NotificationType.cs`

**(2) `INotificationRepository`** — define in `Api.Domain/Interfaces/INotificationRepository.cs`:
- `AddAsync(Notification n, CancellationToken ct)`
- `GetByClientUserIdAsync(Guid clientUserId, string? cursor, int limit, CancellationToken ct) → Task<(IReadOnlyList<Notification> Items, bool HasMore, string? NextCursor)>`
- `GetUnreadCountAsync(Guid clientUserId, CancellationToken ct) → Task<int>`
- `MarkAsReadAsync(Guid notificationId, CancellationToken ct)`
- `MarkAllAsReadAsync(Guid clientUserId, CancellationToken ct)`
- `GetByIdAsync(Guid id, CancellationToken ct) → Task<Notification?>`

**(3) `NotificationConfiguration` + migration + `NotificationRepository`** — in `Api.Infrastructure/`:
- `NotificationConfiguration`: `JiraIssueKey` max 20 required; `Message` max 500 required; `ClientUserId` non-unique index; `Type` stored as int
- `DbSet<Notification>` in `AppDbContext`; generate and apply EF Core migration
- `NotificationRepository` implementing `INotificationRepository`; cursor-based pagination on `GetByClientUserIdAsync` using `(CreatedAt DESC, Id DESC)` keyset encoded as base64 JSON cursor
- `MarkAllAsReadAsync` uses `ExecuteUpdateAsync` — not a per-row loop
- Register `INotificationRepository → NotificationRepository` in `AddInfrastructure`

**(4) `IClientProjectRepository`** — if not already created by TASK-07-B, define in `Api.Domain/Interfaces/IClientProjectRepository.cs`:
- `GetByClientIdAsync(Guid clientId, CancellationToken ct) → Task<ClientProject?>`
- `GetByJiraProjectKeyAsync(string jiraProjectKey, CancellationToken ct) → Task<ClientProject?>`
- `UpsertAsync(ClientProject entity, CancellationToken ct)`
Implement `ClientProjectRepository` and register in `AddInfrastructure`. Skip if already present from TASK-07-B.

**(5) `IWebhookSecretService`** — define in `Api.Application/Common/Interfaces/IWebhookSecretService.cs`:
- `SetSecretAsync(Guid clientId, string rawSecret, CancellationToken ct) → Task`
- `GetRawSecretAsync(Guid clientId, CancellationToken ct) → Task<string?>`
Implement `WebhookSecretService` in `Api.Infrastructure/Security/` using ASP.NET Core Data Protection (`IDataProtector`, purpose `"SupportHub.JiraWebhookSecret"`). Encrypts raw secret before persisting to `ClientProject.JiraWebhookSecret`; decrypts on read. Register in `AddInfrastructure`. Configure `AddDataProtection()` in `AddInfrastructure`. Raw secret must never appear in logs.

**(6) `IEmailService` — add `SendNotificationEmailAsync`** — if not present, add `SendNotificationEmailAsync(string toEmail, string subject, string body, CancellationToken ct)` to `IEmailService` in `Api.Application/Common/Interfaces/`. Update `NoOpEmailService` to implement as no-op with `Information` log.

**(7) Webhook infrastructure DTOs + `AdfPlainTextExtractor`** — create in `Api.Infrastructure/Jira/Webhook/`:
- Internal record types: `JiraWebhookPayload` (root), `JiraWebhookIssue`, `JiraWebhookChangelog`, `JiraWebhookChangelogItem` (`field`, `fromString`, `toString`), `JiraWebhookComment` (`id`, `body` as `JsonElement`, `author`), `JiraWebhookAuthor` (`displayName`)
- `AdfPlainTextExtractor` static class: recursively walks ADF JSON (`JsonElement`) and concatenates text node values with spaces; handles `doc`, `paragraph`, `bulletList`, `listItem`, `text` nodes; other nodes skipped; null/missing nodes return empty string, never throw
- Use `System.Text.Json` — no Newtonsoft

**(8) `ProcessJiraWebhookUseCase`** — create in `Api.Application/Webhooks/UseCases/`:
- Input: `ProcessJiraWebhookCommand` (`RawBody` byte[], `Signature` string, `EventType` string, `IssueKey` string, `ChangelogItems` parsed list, `CommentBody` string?, `CommentAuthor` string?)
- Flow: (1) look up `Ticket` by `IssueKey` via `ITicketRepository` — return `Result.Ok()` (silent ack) if not found; (2) resolve `ClientProject` by `Ticket.ClientId` via `IClientProjectRepository`; (3) get raw secret via `IWebhookSecretService.GetRawSecretAsync` — return `UnauthorizedError` if null; (4) verify HMAC-SHA256: `HMACSHA256(rawBody, secretBytes)` compared to `Signature` using `CryptographicOperations.FixedTimeEquals` — `UnauthorizedError` if mismatch; (5) route to `StatusChangedHandler` or `CommentCreatedHandler` based on `EventType`; unknown event types → `Result.Ok()` silently
- `StatusChangedHandler` sub-logic (inline or nested class): find changelog item where `field == "status"`; if none → return silently; map new status to portal labels (static dictionary: `Created`, `In Progress`, `Waiting for Client Info`, `Resolved`, `Discarded`; fallback to raw Jira name); create `Notification.Create(...)` with `Type = StatusChanged`; message: `"Ticket {key} status changed to {mappedStatus}."`; persist; call `IEmailService.SendNotificationEmailAsync` (fire-and-continue: catch exception, log `Error`, proceed)
- `CommentCreatedHandler` sub-logic: extract plain text from ADF comment body via `AdfPlainTextExtractor`; if starts with `[Portal]` (case-insensitive, trimmed) → return silently; if does NOT start with `[Client]` (case-insensitive, trimmed) → return silently; strip `[Client]` prefix + trim; create `Notification.Create(...)` with `Type = CommentAdded`; message: `"New comment on {key} from {authorDisplayName}: {strippedText}"` truncated to 500 chars; `authorDisplayName` defaults to `"Jira Team"` if null/empty; persist; call `IEmailService` (fire-and-continue)
- Single `ExecuteAsync(ProcessJiraWebhookCommand cmd, CancellationToken ct) → Task<Result>`; must respond within 2 seconds; no `HttpContext` or ASP.NET Core references

**(9) `JiraWebhookController`** — create in `Api.API/Controllers/Webhooks/`:
- `POST /api/webhooks/jira` — `[AllowAnonymous]` (no `[Authorize]`); route override: `[Route("api/webhooks")]`
- Call `Request.EnableBuffering()` at start; read body into `byte[]`; deserialise JSON to extract `webhookEvent`, `issue.key`, changelog items, comment body/author; extract `X-Hub-Signature` header
- Call `IProcessJiraWebhookUseCase.ExecuteAsync`
- Always return `200 OK` for `Result.Ok()` or silent acks; return `401` for `UnauthorizedError`
- Register rate limiting: named policy `"webhook"` — fixed-window 60 requests / 1 minute / IP via `AddRateLimiter` in `AddInfrastructure`; apply `[EnableRateLimiting("webhook")]` on the controller
- Log `webhookEvent` and `issue.key` at `Information` level; log validation failures at `Warning` with raw body (never log headers containing secrets)

**Constraints:**
- HMAC verification must use `CryptographicOperations.FixedTimeEquals` — never string equality
- `ProcessJiraWebhookUseCase` must not reference any ASP.NET Core types
- All notification domain transitions through `Notification.Create` factory and `MarkAsRead()` method only — no public setters
- Rate limiter registration via built-in `Microsoft.AspNetCore.RateLimiting` (available in .NET 7+/.NET 10)
- `API_BASE_URL` env var documented in `api/.env.example`

**Definition of Done:**
- [ ] `Notification` entity with factory and `MarkAsRead()` exists
- [ ] `INotificationRepository` and `NotificationRepository` with cursor pagination exist and are registered
- [ ] EF Core migration creates `Notifications` table with `ClientUserId` index
- [ ] `IWebhookSecretService` and `WebhookSecretService` exist; encrypt/decrypt round-trip works
- [ ] `IEmailService` has `SendNotificationEmailAsync`; `NoOpEmailService` implements as no-op
- [ ] `AdfPlainTextExtractor` returns plain text from ADF JSON without throwing
- [ ] `ProcessJiraWebhookUseCase` with both sub-handlers exists
- [ ] `issue_updated` with status changelog → `Notification` row with `Type = StatusChanged`
- [ ] `issue_updated` with no status changelog → no notification created
- [ ] `comment_created` starting with `[Client]` → `Notification` row with `Type = CommentAdded`; `[Client]` prefix stripped
- [ ] `comment_created` starting with `[Portal]` → no notification
- [ ] Unknown `webhookEvent` type → `200 OK`, no notification
- [ ] Invalid HMAC → `401`
- [ ] `POST /api/webhooks/jira` is `[AllowAnonymous]` and rate-limited
- [ ] `dotnet build` succeeds

---

### TASK-08-B — Notification UI + admin secret management
**Wave:** 4 (can start as soon as TASK-08-A is done)
**Repo:** api + client-portal
**Depends on:** TASK-08-A, TASK-02-B (portal header component exists)

**What to build:**

**(api) Notification read + mark-read use cases and endpoints**
- `GetNotificationsUseCase` (`GetNotificationsQuery`: `ClientUserId`, `Cursor?`, `Limit` clamped to max 50) → `Result<PagedNotificationsDto>`
- `GetUnreadCountUseCase` (`GetUnreadCountQuery`: `ClientUserId`) → `Result<int>`
- `MarkNotificationReadUseCase` (`MarkNotificationReadCommand`: `NotificationId`, `ClientUserId`) — look up by ID; verify `ClientUserId` matches — `ForbiddenError` if not; call `MarkAsRead()` + commit
- `MarkAllNotificationsReadUseCase` (`MarkAllNotificationsReadCommand`: `ClientUserId`) — call `INotificationRepository.MarkAllAsReadAsync` + commit
- `NotificationDto`: `Id`, `JiraIssueKey`, `Type` (string `"StatusChanged"|"CommentAdded"`), `Message`, `IsRead`, `CreatedAt`
- `PagedNotificationsDto`: `Items` (`IReadOnlyList<NotificationDto>`), `HasMore` (bool), `NextCursor` (string?)

- `NotificationsController` in `Api.API/Controllers/Notifications/`:
  - `GET /api/notifications` — query params: `cursor?`, `limit` (default 20). Extracts `ClientUserId` from JWT `sub` claim. Returns `200 OK` with `PagedNotificationsDto`.
  - `GET /api/notifications/unread-count` — returns `200 OK` with `{ "count": N }`.
  - `PATCH /api/notifications/{id}/read` — returns `204 No Content`; `403` if notification belongs to different user.
  - `PATCH /api/notifications/mark-all-read` — returns `204 No Content`.
  - All endpoints `[Authorize]`; `ClientUserId` from JWT `sub` — never from request body/query.

**(api) Webhook secret admin use cases and endpoints**
- `SetWebhookSecretUseCase` (`SetWebhookSecretCommand`: `ClientId`, `RawSecret` — min 16 chars, max 256 chars, non-empty) — validates then calls `IWebhookSecretService.SetSecretAsync`
- `GetWebhookConfigUseCase` (`GetWebhookConfigQuery`: `ClientId`) → `Result<WebhookConfigDto>`: `IsConfigured` (bool), `MaskedSecret` (`"••••••"` if configured, empty if not), `WebhookUrl` (string from `IWebhookUrlProvider`)
- `IWebhookUrlProvider` in `Api.Application/Common/Interfaces/`: `GetWebhookUrl() → string`. Implement in `Api.Infrastructure/` reading `API_BASE_URL` env var, returning `$"{apiBaseUrl}/api/webhooks/jira"`.
- Admin endpoints in `WebhookAdminController` at `Api.API/Controllers/Admin/`: `GET /api/admin/webhooks/config` and `PUT /api/admin/webhooks/secret`; both require `[Authorize(Roles = "Admin")]`; `403` for non-admin JWT.

**(client-portal) Notification bell + panel**
- `NotificationBell` component in the portal header:
  - Bell icon (`lucide-react Bell`) with red `Badge` showing unread count
  - Unread count polled every 30 seconds via `useQuery` with `refetchInterval: 30_000` on `GET /api/notifications/unread-count`
  - Clicking bell opens `NotificationPanel` (shadcn `Popover` or `Sheet`)
- `NotificationPanel`:
  - Fetches `GET /api/notifications` with `limit=50` on open
  - Each notification item: icon (status vs comment type), `message`, `jiraIssueKey` as React Router `<Link>` to `/tickets/{key}`, relative time via `date-fns/formatDistanceToNow`
  - On panel open: call `PATCH /api/notifications/mark-all-read` via `useMutation`; on success `invalidateQueries(['notifications/unread-count'])`
  - Empty state: `"You're all caught up."`
  - Per-item dismiss: `PATCH /api/notifications/{id}/read` via `useMutation`; on success remove from panel optimistically (or invalidate query)
  - "Mark all as read" action
  - Error and loading states handled gracefully
- All strings use i18n keys (per EPIC-10)
- Use shadcn primitives: `Popover`, `Badge`, `ScrollArea`, `Button` — no raw `<div>` for layout
- `NotificationBell` rendered inside existing portal header — no new layout wrapper

**Constraints:**
- Cursor-based pagination: `GetByClientUserIdAsync` uses `(CreatedAt DESC, Id DESC)` keyset encoded as base64 JSON; hard limit 50 items
- `PATCH /api/notifications/mark-all-read` route must be registered before `PATCH /api/notifications/{id}/read` to avoid ambiguous routing
- `GetWebhookConfigUseCase` must never return the raw secret — only masked display string `"••••••"`
- `date-fns` added as dependency if not already present
- Backoffice UI for webhook config remains delegated to EPIC-05B

**Definition of Done:**
- [ ] All four notification use cases exist and compile
- [ ] `GET /api/notifications` returns `200 OK` with `PagedNotificationsDto`; cursor pagination works
- [ ] `GET /api/notifications/unread-count` returns `{ "count": N }`
- [ ] `PATCH /api/notifications/{id}/read` returns `204`; wrong owner → `403`
- [ ] `PATCH /api/notifications/mark-all-read` returns `204`
- [ ] `SetWebhookSecretUseCase` stores encrypted secret; short secret (< 16 chars) → `ValidationError`
- [ ] `GetWebhookConfigUseCase` returns `isConfigured: false` when no secret; `isConfigured: true` with masked value after set
- [ ] `GET /api/admin/webhooks/config` and `PUT /api/admin/webhooks/secret` exist; non-admin → `403`
- [ ] `NotificationBell` renders in portal header with live unread count badge (30s poll)
- [ ] Opening panel marks all as read and clears badge
- [ ] Each notification links to the correct ticket detail route
- [ ] Empty state shown when no notifications
- [ ] `dotnet build` succeeds and `npm run build` succeeds with no TypeScript errors

---

> **Note for Tech Lead:**
>
> - **Webhook secret storage (TASK-08-A)**: ASP.NET Core Data Protection encrypts the raw secret at rest (AES-256-CBC + HMAC-SHA256). The raw secret is needed for HMAC verification — a hash-only approach would not work. Data Protection keys use the default filesystem key ring in Development; configure a persistent key ring (e.g. Azure Key Vault, AWS SSM) for Production.
> - **Raw body capture in controller (TASK-08-A)**: call `Request.EnableBuffering()` at the start of the action to allow re-reading the body stream. Read body into `byte[]` first (for HMAC), then deserialise JSON from the buffered stream.
> - **Tenant disambiguation (TASK-08-A)**: `JiraIssueKey` has a unique index across all tenants (TASK-07-A). The webhook handler resolves the client via `Ticket` → `ClientId` → `ClientProject` — no per-tenant webhook URL needed.
> - **`API_BASE_URL` env var**: add to `api/.env.example` in TASK-08-A. Development value: `http://localhost:5001`.
> - **Admin webhook config UI (EPIC-05B)**: `GET /api/admin/webhooks/config` and `PUT /api/admin/webhooks/secret` endpoints are delivered in TASK-08-B. The backoffice UI for these endpoints remains delegated to EPIC-05B.
