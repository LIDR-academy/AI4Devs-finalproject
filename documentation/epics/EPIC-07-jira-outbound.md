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

> **Implementation:** covered by TASK-07-B (Wave 3). See Task Breakdown section below.

---

### US-07.2 — Client comment is posted to Jira
> *As a client, I want my comments on a ticket to appear in Jira so that the technical team can see all communication in one place.*

**Acceptance Criteria:**
- [ ] When a client posts a comment on a ticket in the portal, that comment is immediately posted to the corresponding Jira issue.
- [ ] The Jira comment body is prefixed with `[Portal] <user display name>:` so the team can distinguish portal comments from internal Jira comments.
- [ ] On success, the client sees the comment in the portal thread immediately.
- [ ] If the Jira call fails, the client sees a clear error message and the comment is not saved locally — there is no partial state.

**Story Points:** 2

> **Implementation:** covered by TASK-07-B (Wave 3). See Task Breakdown section below.

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

> **Implementation:** covered by TASK-07-B (Wave 3). See Task Breakdown section below.

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

> **Implementation:** covered by TASK-07-C (Wave 5). See Task Breakdown section below.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-07.1 | Ticket creation creates a Jira issue | 5 |
| US-07.2 | Client comment is posted to Jira | 2 |
| US-07.3 | File attachment is pushed to Jira | 3 |
| US-07.4 | Admin can verify Jira connectivity | 2 |
| **Total** | | **12** |

---

## Task Breakdown

> **Merged task structure.** Original 9 tasks collapsed to 3 to maximise AI-assisted throughput. Each merged task is a complete, independently deliverable unit — the AI agent receives a single context and produces all files for that task in one pass.

| Task | Title | Wave | Repo | Depends on | Parent Story |
|---|---|---|---|---|---|
| TASK-07-A | Jira read foundation — `IJiraClient`, `JiraClient` read methods, `Ticket` entity | Wave 2 | api | TASK-01.6.1 | US-07.1 |
| TASK-07-B | Jira write path — write methods, commands, use cases, `POST /api/tickets` + comment + attachment endpoints | Wave 3 | api | TASK-07-A | US-07.1 |
| TASK-07-C | Jira connectivity check endpoint | Wave 5 | api | TASK-07-A | US-07.4 |

---

### TASK-07-A — Jira read foundation
**Wave:** 2 — must complete before EPIC-02 tasks start
**Repo:** api
**Depends on:** TASK-01.6.1

**What to build:**

**(1) `IJiraClient` interface** — define in `Api.Application/Common/Interfaces/IJiraClient.cs` with the following async methods, all accepting `CancellationToken ct` as last param and returning Result-wrapped types:
- `CreateIssueAsync(CreateIssueRequest request, CancellationToken ct) → Task<Result<string>>` (returns Jira issue key)
- `GetIssueAsync(string issueKey, CancellationToken ct) → Task<Result<JiraIssueDto>>`
- `ListIssuesAsync(ListIssuesRequest request, CancellationToken ct) → Task<Result<PagedTicketResult>>`
- `AddCommentAsync(string issueKey, string adfBody, CancellationToken ct) → Task<Result<JiraCommentDto>>`
- `GetCommentsAsync(string issueKey, int startAt, int pageSize, CancellationToken ct) → Task<Result<JiraCommentListDto>>`
- `AddAttachmentAsync(string issueKey, Stream fileStream, string fileName, string contentType, CancellationToken ct) → Task<Result<AttachmentDto>>`
- `ListAttachmentsAsync(string issueKey, CancellationToken ct) → Task<Result<IReadOnlyList<AttachmentDto>>>`
- `UpdateIssueAsync(string issueKey, UpdateIssueFieldsRequest request, CancellationToken ct) → Task<Result>`
- `CheckConnectionAsync(CancellationToken ct) → Task<Result<string>>`

**(2) Jira DTOs** — create in `Api.Application/Jira/Dtos/`:
- `JiraIssueDto`: `JiraIssueKey` (string), `Summary` (string), `Description` (string? — raw ADF JSON), `Status` (string), `Priority` (string), `IssueType` (string), `CreatedAt` (DateTimeOffset), `ResolutionDate` (DateTimeOffset?), `ReporterDisplayName` (string), `Attachments` (`IReadOnlyList<AttachmentDto>`)
- `JiraCommentDto`: `Id` (string), `AuthorDisplayName` (string), `Body` (string — raw ADF JSON), `CreatedAt` (DateTimeOffset)
- `JiraCommentListDto`: `Items` (`IReadOnlyList<JiraCommentDto>`), `Total` (int), `StartAt` (int), `MaxResults` (int)
- `PagedTicketResult`: `Items` (`IReadOnlyList<JiraIssueDto>`), `Total` (int), `StartAt` (int), `MaxResults` (int)
- `AttachmentDto`: `Id` (string), `FileName` (string), `MimeType` (string), `DownloadUrl` (string — proxy URL `/api/tickets/{key}/attachments/{id}`)
- `UpdateIssueFieldsRequest`: `Priority` (string?) — only non-null fields serialised in the JSON body
- `ListIssuesRequest`: `JiraProjectKey` (string), `StartAt` (int), `MaxResults` (int), `StatusFilter` (string[]?), `DateFrom` (DateOnly?), `DateTo` (DateOnly?), `SortBy` (string), `SortDir` (string)

**(3) `JiraClient` implementation** — create in `Api.Infrastructure/Jira/JiraClient.cs` as a typed `HttpClient` implementing `IJiraClient`:
- Configure with Jira Cloud REST API v3 base URL and Basic Auth header (`JIRA_USER_EMAIL` + `JIRA_API_TOKEN`) set once at `HttpClient` configuration time
- Fail fast at startup: throw `InvalidOperationException` inside `AddInfrastructure` if `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, or `JIRA_API_TOKEN` is missing
- **Implement fully** all read methods: `GetIssueAsync` (`GET /rest/api/3/issue/{issueKey}?expand=renderedFields,attachment`), `ListIssuesAsync` (JQL via `GET /rest/api/3/search`), `GetCommentsAsync` (`GET /rest/api/3/issue/{issueKey}/comment?orderBy=-created&startAt={n}&maxResults={n}`), `ListAttachmentsAsync` (extracted from `GetIssueAsync` attachment field), `UpdateIssueAsync` (`PUT /rest/api/3/issue/{issueKey}`), `CheckConnectionAsync` (`GET /rest/api/3/myself`)
- **Stub** write methods as `NotImplementedException` for now — they are implemented in TASK-07-B: `CreateIssueAsync`, `AddCommentAsync`, `AddAttachmentAsync`
- Register `IJiraClient → JiraClient` via `AddHttpClient<JiraClient>` in `AddInfrastructure`
- Jira credentials must never appear in any log output at any severity level
- Document all Jira env vars in `api/.env.example`

**(4) `Ticket` entity** — create in `Api.Domain/`:
- Fields: `Id` (Guid), `JiraIssueKey` (string, max 20, non-nullable, unique), `ClientId` (Guid), `CreatedAt` (DateTimeOffset)
- Inherits from `BaseEntity`; no `Title`, `Description`, `Status`, or `Priority` fields
- EF Core configuration in `Api.Infrastructure/Persistence/Configurations/TicketConfiguration.cs` with unique index on `JiraIssueKey`
- Generate and apply EF Core migration

**(5) `ITicketRepository`** — define in `Api.Domain/Interfaces/ITicketRepository.cs` with:
- `GetByJiraIssueKeyAsync(string jiraIssueKey, CancellationToken ct) → Task<Ticket?>`
- `AddAsync(Ticket ticket, CancellationToken ct) → Task`
Implement `TicketRepository` in `Api.Infrastructure/Persistence/Repositories/` and register in `AddInfrastructure`.

**Constraints:**
- No Infrastructure references in Application layer (per backend-guidelines §2)
- All methods follow the Result pattern (per backend-guidelines §14)
- `AddHttpClient<JiraClient>` — never `new HttpClient()`
- `GetCommentsAsync` always appends `orderBy=-created` so comments arrive newest-first
- Use `System.Text.Json` for all Jira JSON deserialization — no Newtonsoft

**Definition of Done:**
- [ ] `IJiraClient` exists with all 9 method signatures
- [ ] All Jira DTOs exist in `Api.Application/Jira/Dtos/`
- [ ] `JiraClient` is fully implemented for all read methods; write methods stub with `NotImplementedException`
- [ ] `Ticket` entity exists with unique index on `JiraIssueKey`
- [ ] EF Core migration applies cleanly
- [ ] `ITicketRepository` and `TicketRepository` exist and are registered
- [ ] App throws on startup if any required Jira env var is missing
- [ ] Jira credentials never appear in logs
- [ ] `dotnet build` succeeds

---

### TASK-07-B — Jira write path
**Wave:** 3 — builds on TASK-07-A; unlocks EPIC-02 ticket creation and EPIC-03
**Repo:** api
**Depends on:** TASK-07-A

**What to build:**

**(1) Complete `JiraClient` write methods** — replace the `NotImplementedException` stubs from TASK-07-A:
- `CreateIssueAsync`: `POST /rest/api/3/issue` — body includes `project.key`, `summary`, `description` (ADF), `issuetype.name` (from `JIRA_ISSUE_TYPE` env var, default `Story`), `priority.name`, `labels` (`["portal-id:<ticketId>", "supporthub"]`). Returns the created issue key.
- `AddCommentAsync`: `POST /rest/api/3/issue/{issueKey}/comment` — body is ADF with the comment text. Returns `JiraCommentDto`.
- `AddAttachmentAsync`: `POST /rest/api/3/issue/{issueKey}/attachments` — multipart/form-data. Sets `X-Atlassian-Token: no-check` header per-request (not on base `HttpClient`). Returns `AttachmentDto`.
- Build a minimal internal `AdfBuilder` utility in `Api.Infrastructure/Jira/` producing paragraph and text nodes for plain-text bodies.

**(2) Application layer — commands, DTOs, and use cases** — create in `Api.Application/Tickets/`:
- `FileUploadItem` internal record (`Stream`, `FileName`, `ContentType`) — no ASP.NET Core types
- `CreateTicketCommand` record (`Title`, `Description` (HTML), `ClientId`, `Priority`, `TicketType`, `Files IReadOnlyList<FileUploadItem>?`) + FluentValidation validator (title non-empty max 200, description max 5000, files count ≤ 10)
- `TicketDto` response: `Id` (Guid), `JiraIssueKey` (string), `Attachments` (`IReadOnlyList<AttachmentResultDto>`)
- `AttachmentResultDto`: `FileName`, `Success` (bool), `Error` (string?)
- `AddCommentCommand` record (`JiraIssueKey`, `CommentHtml`, `AuthorDisplayName`, `ClientId`)
- `UploadAttachmentCommand` record (`JiraIssueKey`, `FileStream`, `FileName`, `ContentType`, `ClientId`)

- **`CreateTicketUseCase`**: (1) resolve `JiraProjectKey` from `ClientProject` via `IClientProjectRepository` — fail if not configured; (2) call `IJiraClient.CreateIssueAsync` — if it fails, return `Result.Fail`, no DB write; (3) save `Ticket` anchor record; (4) for each file: call S3 upload then `AddAttachmentAsync` — per-file failures collected into `AttachmentResultDto` with `Success: false`, do not roll back; (5) return `Result.Ok(TicketDto)`. HTML→ADF conversion for description: build ADF paragraph wrapping the HTML's text content via `AdfBuilder`.
- **`AddCommentUseCase`**: (1) look up `Ticket` by `jiraIssueKey` — `NotFoundError` if absent; (2) verify `Ticket.ClientId == cmd.ClientId` — `ForbiddenError` if not; (3) convert `commentHtml` to ADF via `AdfBuilder`, prefix with `[Portal] <authorDisplayName>:`; (4) call `IJiraClient.AddCommentAsync`; (5) return `Result.Ok(CommentDto)`.
- **`UploadAttachmentUseCase`**: (1) look up `Ticket` — `NotFoundError`; (2) ownership check — `ForbiddenError`; (3) S3 upload first (`IS3Service`), S3 key `attachments/<jiraIssueKey>/<fileName>`; (4) `AddAttachmentAsync`; (5) return `Result.Ok(AttachmentDto)`. S3 failure skips Jira call.

**(3) `IClientProjectRepository`** — define in `Api.Domain/Interfaces/` with `GetByClientIdAsync(Guid clientId, CancellationToken ct) → Task<ClientProject?>`. Implement `ClientProjectRepository` and register in `AddInfrastructure`. (`ClientProject` entity already exists from EPIC-00.)

**(4) API endpoints** — add to `TicketsController` in `Api.API/Controllers/Tickets/`:
- `POST /api/tickets` — `multipart/form-data`; bind `title`, `description` as `[FromForm]`, files as `IFormFileCollection`; convert each `IFormFile` to `FileUploadItem`; inject `clientId` from JWT `client_id` claim; call `ICreateTicketUseCase`; return `201 Created` with `TicketDto`. Reject any file > 10 MB with `422` before invoking use case.
- `POST /api/tickets/{jiraIssueKey}/comments` — `application/json` body `{ "commentHtml": "..." }`; inject `clientId` from JWT, `authorDisplayName` from JWT `name` claim (fallback: `given_name + " " + family_name`); call `IAddCommentUseCase`; return `201 Created` with `CommentDto`.
- `POST /api/tickets/{jiraIssueKey}/attachments` — `multipart/form-data`; validate count ≤ 10 and size ≤ 10 MB per file at controller level; call `IUploadAttachmentUseCase` sequentially per file; return `200 OK` with array of `AttachmentUploadResultDto`.

All endpoints: `[Authorize]`, controller inherits `ApiControllerBase`, errors mapped via `ResultExtensions`.

**Constraints:**
- `FileUploadItem` must not reference `IFormFile` or any ASP.NET Core type — Application stays framework-agnostic
- HTML→ADF conversion via `AdfBuilder` (plain-text paragraph node) — not a full HTML parser; strip tags if needed using `HtmlAgilityPack` or `Regex.Replace`
- `CreateIssueAsync` failure prevents any DB write — atomicity preserved by sequencing
- File upload loop: individual file failure does not roll back the ticket
- Write methods in `JiraClient`: use `System.Text.Json` for serialisation
- `X-Atlassian-Token: no-check` header set per-request on `AddAttachmentAsync` — not on the base `HttpClient`

**Definition of Done:**
- [ ] `CreateIssueAsync`, `AddCommentAsync`, `AddAttachmentAsync` fully implemented in `JiraClient`
- [ ] `AdfBuilder` exists in `Api.Infrastructure/Jira/`
- [ ] All commands, DTOs, and use cases exist and compile
- [ ] `IClientProjectRepository` exists and is registered
- [ ] `POST /api/tickets` returns `201 Created` with a `TicketDto` (no files)
- [ ] `POST /api/tickets` with files returns `201 Created` with per-file `AttachmentResultDto`
- [ ] File > 10 MB returns `422` before use case is called
- [ ] `POST /api/tickets/{key}/comments` returns `201 Created` with `CommentDto`
- [ ] Comment on ticket belonging to different client returns `403`
- [ ] `POST /api/tickets/{key}/attachments` returns `200 OK` with result array
- [ ] Unauthenticated requests return `401`
- [ ] `dotnet build` succeeds

---

### TASK-07-C — Jira connectivity check endpoint
**Wave:** 5 (admin panel wave)
**Repo:** api
**Depends on:** TASK-07-A

**What to build:**
Add `CheckJiraConnectionUseCase` in `Api.Application/Jira/UseCases/` that calls `IJiraClient.CheckConnectionAsync`. On success returns `Result.Ok(displayName)`; on failure returns `Result.Fail(reason)`. Expose via `GET /api/admin/jira/connection-status` in a new `JiraAdminController` in `Api.API/Controllers/Admin/`. Return `200 OK` in both cases using `JiraConnectionStatusDto { status ("ok"|"error"), jiraUser?, reason? }` — this is an intentional deviation from `ResultExtensions` (status probe pattern). Endpoint requires `[Authorize(Roles = "Admin")]`.

**Constraints:**
- Credentials must not appear in any log output or error response
- Controller inherits from `ApiControllerBase`
- Non-admin JWT returns `403`

**Definition of Done:**
- [ ] `GET /api/admin/jira/connection-status` with valid credentials returns `200 OK` with `status: "ok"` and Jira account display name
- [ ] With invalid credentials returns `200 OK` with `status: "error"` and human-readable reason
- [ ] Non-admin JWT returns `403`
- [ ] `dotnet build` succeeds

---

> **Note for Tech Lead:**
>
> - **Execution order is critical**: TASK-07-A (read foundation) must be completed and verified before EPIC-02 tasks start. TASK-07-B (write path) must complete before EPIC-02-C (ticket creation form) and all EPIC-03 tasks.
> - **ADF builder (TASK-07-B)**: Jira Cloud REST API v3 requires ADF for description and comment bodies. The `AdfBuilder` utility in `Api.Infrastructure/Jira/` only needs to produce paragraph + text nodes for v1. For HTML→text extraction before wrapping in ADF, use `HtmlAgilityPack` or a simple regex strip — do not write a full HTML→ADF converter here; that complexity lives in EPIC-02's `AdfToHtmlConverter` for the reverse path.
> - **Files at creation — partial success semantics (TASK-07-B)**: Jira issue creation and the `Ticket` DB record are all-or-nothing. Per-file upload failures do not roll back the ticket. The `TicketDto.Attachments` array reports per-file status.
> - **S3 + Jira attachment atomicity**: if S3 succeeds but Jira attachment push fails, the S3 file is orphaned. Acceptable for v1 — failure is surfaced in `AttachmentResultDto`. No cleanup mechanism in this version.
> - **EPIC-08 scope**: the inbound webhook epic's only job is to receive Jira events and write `Notification` records + trigger emails (EPIC-04). It does not sync ticket data.
