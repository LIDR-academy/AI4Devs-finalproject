# EPIC-07 — Jira Integration: Outbound (Portal → Jira)
> Priority: 3 | Status: ✅ Stories + tasks defined

---

## Overview

Covers all write operations from the portal to Jira: creating an issue when a client opens a ticket, posting a comment when a client replies, and attaching files when a client uploads a document.

**Architectural foundation of the entire product:** Jira is the single source of truth for all ticket data. SupportHub does not maintain a parallel ticket store — it is a UI and experience layer over Jira's API. The team works in Jira as always; the client works in the portal. There is no sync, no eventual consistency, and no duplicate data to reconcile.

This epic establishes the `IJiraClient` abstraction and write operations that EPIC-02 (ticket list/detail reads), EPIC-03 (comment/attachment reads), and EPIC-08 (inbound webhook for notifications) all depend on.

---

## Architecture Note

**Architectural decisions resolved for this epic:**

- **Jira is the database for ticket data**: tickets, comments, and attachments are not stored in SupportHub's PostgreSQL database. They are written to and read from Jira via the REST API. SupportHub's DB owns only identity and access data (users, client accounts, project mappings — EPIC-01, EPIC-05, EPIC-05B).
- **Jira API target**: Jira Cloud REST API v3. All calls are made server-side from the `api` service — no Jira credentials are ever sent to the browser.
- **Authentication to Jira**: Basic Auth using an Atlassian API token (`JIRA_USER_EMAIL` + `JIRA_API_TOKEN` environment variables). The `api` service holds these credentials; they are never exposed to clients.
- **Jira base URL**: provided via `JIRA_BASE_URL` environment variable (e.g. `https://yourcompany.atlassian.net`).
- **Project key mapping**: each portal client (company/tenant) is associated with a Jira project key configured by an admin in EPIC-05B. The `JiraProjectKey` is stored on the `ClientProject` entity and is the runtime source for all Jira API calls — it is never hardcoded or read from an environment variable. This epic reads that mapping; it does not define it (EPIC-05B does).
- **Jira issue key as the portal's ticket identifier**: when a Jira issue is created, the returned key (e.g. `ACME-42`) is the stable identifier used throughout the portal to reference that ticket. It is stored on the `Ticket` entity — the only ticket-related data kept in SupportHub's DB, used as a lookup key by EPIC-02 (reads), EPIC-03 (comments/attachments), and EPIC-08 (webhook matching).
- **Synchronous Jira calls, user-facing errors**: because Jira is the system of record, write operations are synchronous — the portal API waits for the Jira call to complete before responding. If Jira is unavailable or rejects the request, the client receives a meaningful error. There is no fallback local store.
- **Jira issue type**: controlled by the `JIRA_ISSUE_TYPE` environment variable (default `Story`). Configurable to accommodate different Jira project schemes.
- **Comment attribution**: comments posted via the integration service account. The Jira comment body is prefixed with `[Portal] <user display name>:` so the Jira team can distinguish portal comments from internal ones.
- **Attachment flow**: files are uploaded to S3 first (portal controls the URL and access), then pushed to Jira via `POST /rest/api/3/issue/{issueKey}/attachments` so the Jira team has the file in their tool. S3 is the durable store; Jira holds a copy for team convenience.
- **Jira client abstraction**: all Jira HTTP calls are encapsulated behind `IJiraClient` in `Api.Application` (contract) with the implementation in `Api.Infrastructure/Jira/`. This keeps use cases testable without hitting Jira.

**Cross-cutting dependencies:**
- EPIC-05B must define the `ClientProject.JiraProjectKey` mapping; this epic reads it.
- EPIC-02 (ticket list/detail) depends on `IJiraClient` read methods established here — tickets are read from Jira, not from a local table.
- EPIC-03 (comments/attachments) depends on `IJiraClient` comment and attachment read methods — same principle.
- EPIC-08 (inbound webhook) uses the Jira issue key stored by US-07.1 to match webhook payloads to the right client. EPIC-08's only job is triggering notifications — it does not sync data back to a local store.
- EPIC-01 must be complete (JWT auth) so the `api` endpoints in this epic are protected.

---

## ⚠️ Notes for EPIC-02, EPIC-03, and EPIC-08 agents

> **Read this before defining those epics.**
>
> **EPIC-02 (Client Portal: Ticket Management)** — There is no `Ticket` table in SupportHub beyond a minimal `Ticket` record holding `Id`, `JiraIssueKey`, `ClientId`, and `CreatedAt`. The ticket list, ticket detail, status, and priority are all read from Jira via `IJiraClient`. EPIC-02's read use cases call `IJiraClient.GetIssueAsync` / `IJiraClient.ListIssuesAsync` (filtered by the client's Jira project). Do not design a local ticket store.
>
> **EPIC-03 (Client Portal: Comments & Attachments)** — Comments and attachments have no local SupportHub table. They are read from and written to Jira. Comment creation calls `IJiraClient.AddCommentAsync` (defined in this epic). Attachment upload goes to S3 first, then `IJiraClient.AddAttachmentAsync`. Reading comments and attachments queries Jira. Do not design a local comment or attachment store.
>
> **EPIC-08 (Jira Integration: Inbound)** — This epic is **not** a sync engine. Its sole purpose is to receive Jira webhook events and trigger client notifications (in-app and/or email via EPIC-04). When Jira fires a webhook (status change, new comment from the team), EPIC-08 looks up the matching client by `JiraIssueKey`, writes a `Notification` record to SupportHub's DB, and triggers an email via EPIC-04. No ticket data is written back to SupportHub's DB — only notification records. The `Notification` module is a separate concern to be defined by the PO agent.

---

## User Stories

---

### US-07.1 — Ticket creation creates a Jira issue
> *As a client, I want my support ticket to immediately appear in Jira so that the technical team can start working on it without any manual step.*

**Acceptance Criteria:**
- [ ] When a client submits a new ticket in the portal, a corresponding issue is created in the Jira project linked to that client.
- [ ] The Jira issue title matches the ticket title submitted in the portal.
- [ ] The Jira issue description contains the ticket description submitted in the portal.
- [ ] The Jira issue includes the portal ticket ID as a label so the Jira team can trace it back to SupportHub.
- [ ] The client can optionally attach files (images, documents) at ticket creation time; each file is uploaded to S3 and pushed to Jira's Attachments panel on the newly created issue.
- [ ] If one or more file uploads fail at creation time, the ticket is still created and the response indicates which files failed — the client can re-attach them via the ticket detail view.
- [ ] On success, the client sees a confirmation and can immediately view the ticket in the portal.
- [ ] If the Jira call fails (e.g. misconfigured project key, Jira unavailable), the client sees a clear error message and the ticket is not created — there is no partial state.

**Story Points:** 5

#### TASK-07.1.1 — `IJiraClient` interface (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-01.6.1

**What to build:**
Define the `IJiraClient` interface in `Api.Application/Common/Interfaces/`. Declares all async methods needed across the Jira integration: `CreateIssueAsync`, `GetIssueAsync`, `ListIssuesAsync`, `AddCommentAsync`, `ListCommentsAsync`, `AddAttachmentAsync`, `ListAttachmentsAsync`, and `CheckConnectionAsync`. This is the contract used by all application-layer use cases — no implementation here.

**Constraints:**
- Interface lives in `Api.Application/Common/Interfaces/` — no Infrastructure references in Application (per backend-guidelines §2).
- All methods follow the Result pattern and accept `CancellationToken ct` as last parameter (per backend-guidelines §14).
- Read methods (`GetIssueAsync`, `ListIssuesAsync`, `ListCommentsAsync`, `ListAttachmentsAsync`) return Result-wrapped DTOs defined in `Api.Application/Jira/Dtos/`.
- `CheckConnectionAsync` returns the display name of the authenticated Jira account on success.

**Definition of Done:**
- [ ] `IJiraClient` exists at `Api.Application/Common/Interfaces/IJiraClient.cs` with all eight method signatures.
- [ ] Jira DTOs directory exists at `Api.Application/Jira/Dtos/`.
- [ ] `dotnet build` succeeds with no Infrastructure references in Application.

---

#### TASK-07.1.2 — `JiraClient` HTTP implementation and DI registration (api)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-07.1.1

**What to build:**
Implement `JiraClient` in `Api.Infrastructure/Jira/` as a typed `HttpClient` that fulfils `IJiraClient`. Configure it with the Jira Cloud REST API v3 base URL and a Basic Auth header built from `JIRA_USER_EMAIL` and `JIRA_API_TOKEN`. Register `IJiraClient → JiraClient` in `AddInfrastructure` via `AddHttpClient<JiraClient>`. Fail fast at startup if any required variable is missing. Document all Jira env vars in `api/.env.example`.

**Constraints:**
- `JiraClient` lives in `Api.Infrastructure/Jira/JiraClient.cs` (per backend-guidelines §6).
- Use `AddHttpClient<JiraClient>` — never `new HttpClient()`.
- Basic Auth header set once at `HttpClient` configuration time, not per request.
- Fail-fast: throw `InvalidOperationException` inside `AddInfrastructure` if `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, or `JIRA_API_TOKEN` is missing or empty.
- Jira credentials must never appear in any log output at any severity level (per backend-guidelines §10).
- `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_TOKEN`, `JIRA_ISSUE_TYPE` must be documented in `api/.env.example`.

**Definition of Done:**
- [ ] `JiraClient` exists at `Api.Infrastructure/Jira/JiraClient.cs` and implements `IJiraClient`.
- [ ] `IJiraClient` registered via `AddHttpClient<JiraClient>` in `AddInfrastructure`.
- [ ] `api/.env.example` contains all four Jira env var entries.
- [ ] Removing a required env var causes the app to throw on startup.
- [ ] `dotnet build` succeeds.

---

#### TASK-07.1.3 — Minimal `Ticket` entity (api)
**Layer:** Domain + Infrastructure (DB migration)
**Repo:** api
**Depends on:** TASK-01.6.1

**What to build:**
Define a minimal `Ticket` entity in `Api.Domain/` that acts as the portal's anchor record for a Jira issue. It holds only: `Id` (Guid), `JiraIssueKey` (string), `ClientId` (Guid), and `CreatedAt` (DateTimeOffset). This record exists solely so the portal can associate a SupportHub ticket ID with a Jira issue key and filter tickets by client. All other ticket data (title, description, status, priority, comments, attachments) is read from Jira. Add EF Core configuration and a migration.

**Constraints:**
- Entity inherits from `BaseEntity` (per backend-guidelines §5).
- `JiraIssueKey` is non-nullable and unique — a portal ticket always has a Jira issue key (creation fails atomically if Jira rejects the call).
- `JiraIssueKey` maximum length: 20 characters.
- No `Title`, `Description`, `Status`, or `Priority` fields on this entity — those live in Jira.
- EF Core configuration in `Api.Infrastructure/Persistence/Configurations/TicketConfiguration.cs` (per backend-guidelines §7).
- Unique index on `JiraIssueKey`.

**Definition of Done:**
- [ ] `Ticket` entity exists in `Api.Domain/` with only `JiraIssueKey`, `ClientId`, and the `BaseEntity` fields.
- [ ] `TicketConfiguration` defines the unique index on `JiraIssueKey` and max-length constraint.
- [ ] EF Core migration applies cleanly.
- [ ] `dotnet build` succeeds.

---

#### TASK-07.1.4 — `FileUploadItem` value record + `CreateTicketCommand` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.1.3

**What to build:**
Define a `FileUploadItem` internal record in `Api.Application/Tickets/` that carries a file's stream, filename, and content type without importing any Infrastructure or ASP.NET Core types. Define `CreateTicketCommand` (title, description, clientId, and an optional `IReadOnlyList<FileUploadItem>` for files uploaded at creation time) and its FluentValidation validator in the same folder. Define the `TicketDto` response record in `Api.Application/Jira/Dtos/` — it includes the created ticket's portal ID, Jira issue key, title, description, and an `IReadOnlyList<AttachmentResultDto>` that reports per-file success/failure for files submitted at creation.

**Constraints:**
- `FileUploadItem` is an `internal record` — it must not reference `IFormFile` or any ASP.NET Core type (Application has no API layer dependency).
- `CreateTicketCommand` is a `record` with `IReadOnlyList<FileUploadItem>? Files` (nullable — creation without files is valid).
- Validator enforces: `Title` non-empty, max 200 chars; `Description` max 5000 chars; `Files` count ≤ 10 per request; each file `FileName` non-empty and `ContentType` non-empty.
- `AttachmentResultDto` carries `FileName`, `Success` (bool), and `Error` (string?, populated only when `Success` is false).
- No Infrastructure references in Application (per backend-guidelines §2).

**Definition of Done:**
- [ ] `FileUploadItem` record exists at `Api.Application/Tickets/FileUploadItem.cs`.
- [ ] `CreateTicketCommand` record and its validator exist at `Api.Application/Tickets/UseCases/CreateTicketUseCase.cs` (or co-located files in that folder).
- [ ] `TicketDto` and `AttachmentResultDto` records exist in `Api.Application/Jira/Dtos/`.
- [ ] `dotnet build` succeeds with no Infrastructure references in Application.

---

#### TASK-07.1.5 — `CreateTicketUseCase` implementation (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.1.2, TASK-07.1.4

**What to build:**
Implement `CreateTicketUseCase` in `Api.Application/Tickets/UseCases/`. The use case executes this sequence: (1) resolve `JiraProjectKey` from the client's `ClientProject` — fail fast if missing; (2) call `IJiraClient.CreateIssueAsync` — if it fails, return `Result.Fail` immediately, no DB record is written; (3) save the minimal `Ticket` record (`JiraIssueKey` + `ClientId`) to the DB; (4) for each file in `cmd.Files` (if any), call `IS3Service.UploadAsync` then `IJiraClient.AddAttachmentAsync` — individual file failures are collected into `AttachmentResultDto` entries with `Success: false` and do **not** roll back the ticket; (5) return `Result.Ok(TicketDto)` with the full attachment result list.

**Constraints:**
- Jira project key resolved inside the use case from `ClientProject` — never caller-supplied.
- The DB `Ticket` record is saved **only after** `CreateIssueAsync` succeeds — sequencing preserves atomicity without a cross-system transaction.
- The Jira issue description uses ADF format (plain-text paragraph node). Include labels `portal-id:<ticketId>` and `supporthub`. Issue type from `JIRA_ISSUE_TYPE` env var (default `Story`).
- File upload loop: S3 upload happens first per file; if S3 fails the Jira attachment call is skipped for that file. Both failures are recorded in `AttachmentResultDto` with the reason. The loop continues for remaining files.
- The S3 key for each file uses `attachments/<jiraIssueKey>/<fileName>`.
- The `X-Atlassian-Token: no-check` header is set per-request inside `IJiraClient.AddAttachmentAsync` — not on the base `HttpClient`.
- Errors from `CreateIssueAsync` propagate as `Result.Fail` and are mapped to HTTP via `ResultExtensions` (per api-conventions.md §2).
- Single `ExecuteAsync(CreateTicketCommand cmd, CancellationToken ct)` method returning `Task<Result<TicketDto>>`.

**Definition of Done:**
- [ ] `CreateTicketUseCase` exists at `Api.Application/Tickets/UseCases/CreateTicketUseCase.cs` and implements `ICreateTicketUseCase`.
- [ ] Creating a ticket with no files creates the Jira issue and saves the `Ticket` record — `TicketDto.Attachments` is empty.
- [ ] Creating a ticket with files creates the Jira issue, saves the `Ticket` record, uploads each file to S3, and pushes each to Jira — `TicketDto.Attachments` contains one entry per file with `Success: true`.
- [ ] If `CreateIssueAsync` fails, no `Ticket` row is written and the portal API returns an error.
- [ ] If `JiraProjectKey` is not configured, the portal API returns a meaningful error without calling Jira.
- [ ] A file-level S3 or Jira failure does not fail the overall result — the ticket is returned with the failed file's `AttachmentResultDto` showing `Success: false`.
- [ ] `dotnet build` succeeds.

---

#### TASK-07.1.6 — `TicketsController` — `POST /api/tickets` with multipart/form-data (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-07.1.5

**What to build:**
Create `TicketsController` in `Api.API/Controllers/Tickets/` with a `POST /api/tickets` action that accepts a `multipart/form-data` request. The action binds `title` and `description` as `[FromForm]` string fields and `files` as `IFormFileCollection` (zero or more files). It maps the form data to a `CreateTicketCommand` — converting each `IFormFile` to a `FileUploadItem` (opening the stream inline) — then calls `ICreateTicketUseCase.ExecuteAsync` and maps the result to `IActionResult` via `ResultExtensions`.

**Constraints:**
- Controller inherits from `ApiControllerBase` (per api-conventions.md §1).
- Endpoint is `[Authorize]` — client JWT required; `client_id` claim is extracted in the controller and passed as `clientId` in the command.
- File size limit enforced at the controller/middleware level: reject requests where any individual file exceeds 10 MB — return `422` before calling the use case. Configure Kestrel or `[RequestSizeLimit]` as appropriate.
- The controller does not open or buffer streams beyond what is needed to construct `FileUploadItem` — it does not validate file content (that belongs to the use case validator).
- Content-Type for the endpoint must be `multipart/form-data` — do not accept `application/json` on this action.
- Route: `POST /api/tickets` (per api-conventions.md §4).
- On success, return `201 Created` with the `TicketDto` body.
- Controller must not contain business logic — stream-to-`FileUploadItem` mapping is the only non-trivial line permitted.

**Definition of Done:**
- [ ] `TicketsController` exists at `Api.API/Controllers/Tickets/TicketsController.cs`.
- [ ] `POST /api/tickets` with a valid multipart form (title + description, no files) returns `201 Created` with a `TicketDto`.
- [ ] `POST /api/tickets` with files returns `201 Created` with a `TicketDto` whose `attachments` array contains one entry per file.
- [ ] A file exceeding 10 MB is rejected with `422` before the use case is invoked.
- [ ] An unauthenticated request returns `401`.
- [ ] `dotnet build` succeeds.

---

### US-07.2 — Client comment is posted to Jira
> *As a client, I want my comments on a ticket to appear in Jira so that the technical team can see all communication in one place.*

**Acceptance Criteria:**
- [ ] When a client posts a comment on a ticket in the portal, that comment is immediately posted to the corresponding Jira issue.
- [ ] The Jira comment body is prefixed with `[Portal] <user display name>:` so the team can distinguish portal comments from internal Jira comments.
- [ ] On success, the client sees the comment in the portal thread immediately.
- [ ] If the Jira call fails, the client sees a clear error message and the comment is not saved locally — there is no partial state.

**Story Points:** 2

#### TASK-07.2.1 — `AddCommentUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.1.2

**What to build:**
Create `AddCommentUseCase` in `Api.Application/Tickets/UseCases/`. It receives an `AddCommentCommand` (jiraIssueKey, commentText, authorDisplayName) and calls `IJiraClient.AddCommentAsync`. On success, returns the created `CommentDto` (populated from the Jira response). On failure, returns `Result.Fail` — no local record is saved.

**Constraints:**
- No `Comment` table or entity in SupportHub's DB — comments live in Jira exclusively.
- The Jira comment body uses ADF format with a plain-text paragraph node, prefixed with `[Portal] <authorDisplayName>:`.
- Errors from Jira propagate as `Result.Fail` — mapped to HTTP via `ResultExtensions`.
- Single `ExecuteAsync(AddCommentCommand cmd, CancellationToken ct)` method returning `Task<Result<CommentDto>>`.

**Definition of Done:**
- [ ] `AddCommentUseCase` exists at `Api.Application/Tickets/UseCases/AddCommentUseCase.cs`.
- [ ] Posting a comment via the portal API results in a Jira comment on the linked issue.
- [ ] If `AddCommentAsync` fails, the portal API returns an error and no data is persisted locally.
- [ ] `dotnet build` succeeds.

---

### US-07.3 — File attachment is pushed to Jira
> *As a client, I want files I attach to a ticket to also be available in the Jira issue so that the technical team has all relevant files in their own tool.*

**Acceptance Criteria:**
- [ ] When a client uploads an attachment to a ticket in the portal, the file is stored in S3 and pushed to the corresponding Jira issue.
- [ ] The attachment is available in Jira under the issue's "Attachments" section with its original filename.
- [ ] On success, the client can see and download the attachment from the portal.
- [ ] If the S3 upload fails, the Jira push is not attempted and the client sees a clear error.
- [ ] If the Jira push fails after a successful S3 upload, the client sees a clear error. The S3 file is retained for retry (out of scope for v1) but is not surfaced to the client as a visible attachment.

**Story Points:** 3

#### TASK-07.3.1 — `UploadAttachmentUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.1.2

**What to build:**
Create `UploadAttachmentUseCase` in `Api.Application/Tickets/UseCases/`. It receives an `UploadAttachmentCommand` (jiraIssueKey, fileStream, fileName, contentType) and: (1) uploads the file to S3 via `IS3Service`; (2) calls `IJiraClient.AddAttachmentAsync` with the S3 key, filename, and content type. On full success, returns an `AttachmentDto`. If S3 upload fails, returns `Result.Fail` immediately. If Jira push fails after S3 succeeds, returns `Result.Fail` — the S3 file is retained but the attachment is not considered created.

**Constraints:**
- No `Attachment` table or entity in SupportHub's DB — attachments are stored in S3 and referenced via Jira.
- S3 upload happens before the Jira call — sequence is intentional (S3 is the durable store).
- `AddAttachmentAsync` sends the file as `multipart/form-data`. The `X-Atlassian-Token: no-check` header must be set per-request on the Jira call, not on the base `HttpClient`.
- The S3 key uses a path structure that includes the Jira issue key for traceability (e.g. `attachments/<jiraIssueKey>/<fileName>`).
- Errors from either S3 or Jira propagate as `Result.Fail` — mapped to HTTP via `ResultExtensions`.
- File size validation is owned by the controller/request validation layer — not this use case.
- Single `ExecuteAsync(UploadAttachmentCommand cmd, CancellationToken ct)` method returning `Task<Result<AttachmentDto>>`.

**Definition of Done:**
- [ ] `UploadAttachmentUseCase` exists at `Api.Application/Tickets/UseCases/UploadAttachmentUseCase.cs`.
- [ ] Uploading a file via the portal API results in the file in S3 and as an attachment on the Jira issue.
- [ ] If S3 upload fails, the Jira call is not made and the portal API returns an error.
- [ ] If Jira push fails, the portal API returns an error.
- [ ] `dotnet build` succeeds.

---

### US-07.4 — Admin can verify Jira connectivity
> *As an admin, I want to test the Jira connection from the admin panel so that I can confirm the integration is working before clients start submitting tickets.*

**Acceptance Criteria:**
- [ ] The admin panel has a "Test Jira connection" action accessible from the Jira settings section.
- [ ] Clicking it triggers a live connectivity check against the configured Jira instance.
- [ ] On success, the admin sees: "Jira connection successful. Authenticated as: `<jiraUser>`."
- [ ] On failure (bad credentials, unreachable host, wrong URL), the admin sees a diagnostic error message.
- [ ] The check is accessible only to admins; a non-admin request returns 403.

**Story Points:** 2

#### TASK-07.4.1 — Jira connectivity check endpoint (api)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-07.1.2

**What to build:**
Add `CheckJiraConnectionUseCase` in `Api.Application/Jira/UseCases/` that calls `IJiraClient.CheckConnectionAsync`. On success returns `Result.Ok(displayName)`; on failure returns `Result.Fail(reason)`. Expose via `GET /api/admin/jira/connection-status` in a new `JiraAdminController` in `Api.API/Controllers/Admin/`. Define a dedicated `JiraConnectionStatusDto` response record rather than mapping through `ResultExtensions`.

**Constraints:**
- Endpoint requires `[Authorize(Roles = "Admin")]` — non-admin JWT returns `403` (per api-conventions.md §6).
- This is a status probe: the controller always returns `200 OK` regardless of Jira outcome, using `JiraConnectionStatusDto` to surface the result. This is an intentional deviation from `ResultExtensions` — implement directly in the controller action, do not modify `ResultExtensions`.
- `JiraConnectionStatusDto`: `status` (`"ok"` or `"error"`), plus `jiraUser` on success or `reason` on failure.
- Credentials must not appear in any log output or error response (per backend-guidelines §10).
- Controller inherits from `ApiControllerBase` (per api-conventions.md §1).

**Definition of Done:**
- [ ] `GET /api/admin/jira/connection-status` with valid credentials returns `200 OK` with `status: "ok"` and the Jira account display name.
- [ ] With invalid credentials returns `200 OK` with `status: "error"` and a human-readable reason.
- [ ] Non-admin JWT returns `403`.
- [ ] `dotnet build` succeeds.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-07.1 | Ticket creation creates a Jira issue | 5 |
| US-07.2 | Client comment is posted to Jira | 2 |
| US-07.3 | File attachment is pushed to Jira | 3 |
| US-07.4 | Admin can verify Jira connectivity | 2 |
| **Total** | | **12** |

### Task breakdown

| Task | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-07.1.1 | `IJiraClient` interface | US-07.1 | api | TASK-01.6.1 |
| TASK-07.1.2 | `JiraClient` HTTP implementation and DI registration | US-07.1 | api | TASK-07.1.1 |
| TASK-07.1.3 | Minimal `Ticket` entity and migration | US-07.1 | api | TASK-01.6.1 |
| TASK-07.1.4 | `FileUploadItem` record + `CreateTicketCommand` + `TicketDto` | US-07.1 | api | TASK-07.1.3 |
| TASK-07.1.5 | `CreateTicketUseCase` implementation (with at-creation file uploads) | US-07.1 | api | TASK-07.1.2, TASK-07.1.4 |
| TASK-07.1.6 | `TicketsController` — `POST /api/tickets` multipart endpoint | US-07.1 | api | TASK-07.1.5 |
| TASK-07.2.1 | `AddCommentUseCase` | US-07.2 | api | TASK-07.1.2 |
| TASK-07.3.1 | `UploadAttachmentUseCase` (post-creation attachments) | US-07.3 | api | TASK-07.1.2 |
| TASK-07.4.1 | Jira connectivity check endpoint | US-07.4 | api | TASK-07.1.2 |
| TASK-07.4.2 | Jira connectivity check UI | US-07.4 | backoffice | **Moved to EPIC-05** — scheduled with all backoffice UI work |

---

> **Note for Tech Lead:**
>
> - **ADF builder**: Jira Cloud REST API v3 requires description and comment bodies in Atlassian Document Format (ADF) JSON — not plain text. No official .NET ADF library exists; a minimal internal DTO class (e.g. `AdfDocument`, `AdfParagraph`, `AdfText`) in `Api.Infrastructure/Jira/` is sufficient for the plain-text paragraph nodes needed here.
> - **Ticket creation is multipart/form-data (TASK-07.1.6)**: the `POST /api/tickets` endpoint accepts `multipart/form-data`, not JSON. Clients send `title` and `description` as form fields and zero or more files. The controller converts `IFormFile` to `FileUploadItem` — an Application-layer record with no ASP.NET Core dependency. This is intentional: Application stays framework-agnostic.
> - **Files at creation — partial success semantics (TASK-07.1.5)**: the Jira issue creation and the local `Ticket` record are all-or-nothing. File uploads (S3 + Jira attachment) at creation time are best-effort per file: a single file failure does not roll back the ticket. The `TicketDto.Attachments` array carries per-file `Success`/`Error` status. The frontend should inspect this array and surface any per-file warnings to the user.
> - **ADF inline media / image embedding — deferred to post-v1**: Jira Cloud ADF supports `mediaSingle` and `media` nodes for images embedded within description body text. Implementing this requires the Atlassian Media API (a separate authentication context from the REST API) and a two-step flow (upload media → reference by media ID in ADF). This complexity is out of scope for v1. All files submitted at ticket creation or via `UploadAttachmentUseCase` appear in Jira's standard **Attachments panel**, which is the correct UX for support tickets.
> - **S3 + Jira attachment atomicity**: if the S3 upload succeeds but the Jira push fails (TASK-07.1.5, TASK-07.3.1), the S3 file is orphaned. For v1 this is acceptable — the failure is reported in `AttachmentResultDto` and no invisible data exists from the client's perspective. A cleanup or retry mechanism can be added in a later version.
> - **`IJiraClient` read methods**: `GetIssueAsync`, `ListIssuesAsync`, `ListCommentsAsync`, `ListAttachmentsAsync` are declared in TASK-07.1.1 but implemented in TASK-07.1.2. Their concrete implementations will be exercised in EPIC-02 and EPIC-03 — ensure the `JiraClient` implementation stubs them as `NotImplementedException` initially so the build passes, then EPIC-02/03 tasks fill them in.
> - **EPIC-08 scope**: the inbound webhook epic's only job is to receive Jira events and write `Notification` records + trigger emails (EPIC-04). It does not sync ticket data. The `Notification` entity and module will be defined by the PO agent separately.
