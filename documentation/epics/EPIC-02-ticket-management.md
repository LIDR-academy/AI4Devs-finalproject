# EPIC-02 — Client Portal: Ticket Management
> Priority: 4 | Status: ✅ Stories + tasks defined

---

## Overview

Covers the full ticket lifecycle from the client's perspective in the portal: creating a new support request, browsing the list of their tickets, and viewing the full detail of a specific ticket (description, status, priority, thread). All ticket data — title, description, status, priority — is read live from Jira via `IJiraClient`; the portal never caches or duplicates it locally.

This epic is the primary daily-use surface for client users. It depends on EPIC-07 for `IJiraClient` read and write implementations and EPIC-01 for authenticated routes and route guards.

---

## Architecture Note

**Decisions resolved for this epic (sourced from the PO's "Note for Architect" block):**

### Pagination strategy
The `api-conventions.md` default is cursor-based pagination. However, US-02.1 requires page-size selection (10/20/50), total page count display, and direct page navigation — none of which are compatible with cursor-based pagination. **This epic uses offset/page-based pagination** for the ticket list endpoint, following Jira's native `startAt`/`maxResults` model. This is a deliberate, story-driven deviation from the api-conventions default; cursor-based pagination remains the default for all other list endpoints.

`ListIssuesAsync` parameters: `startAt` (int), `maxResults` (int), `statusFilter` (string[]?), `dateFrom` (DateOnly?), `dateTo` (DateOnly?), `sortBy` (string), `sortDir` (string). Response envelope: `PagedTicketResult` with `Items`, `TotalCount`, `StartAt`, `MaxResults`.

Frontend query params contract:
- `page` (int, default 1)
- `pageSize` (int: 10/20/50, default 20)
- `sortBy` (string: `created`|`resolutiondate`|`priority`|`status`|`summary`, default `created`)
- `sortDir` (string: `asc`|`desc`, default `desc`)
- `status` (string[], optional — multi-value)
- `dateRange` (string: `today`|`yesterday`|`last7days`|`thisMonth`|`lastMonth`|`custom`, optional)
- `dateFrom` (ISO date string, only when `dateRange=custom`)
- `dateTo` (ISO date string, only when `dateRange=custom`)

### Sorting
Jira JQL `ORDER BY` supports all required columns. The backend appends `ORDER BY <sortBy> <sortDir>` to the JQL query. Valid `sortBy` values: `created`, `resolutiondate`, `priority`, `status`, `summary`. The sort parameters are validated in the use case — unknown sort fields return `422`.

### Date range filter
Applies to the `created` JQL field. The 6-month (184-day) cap is enforced in the backend use case — requests exceeding the range return `422`. The frontend enforces it in the date picker as a secondary guard. JQL clause: `created >= "YYYY-MM-DD" AND created <= "YYYY-MM-DD"`.

### Status label mapping
For v1, Jira project statuses are configured to exactly match the portal vocabulary: `Created`, `In Progress`, `Waiting for Client Info`, `Resolved`, `Discarded`. No mapping table is needed. **Assumption documented**: admins setting up a new client's Jira project must configure these status names exactly. The `status` filter passes the portal label directly as the JQL `status` value. This assumption is flagged as an admin setup requirement.

### Resolution date
Jira exposes `resolutiondate` on issues — `null` until resolved. `JiraIssueDto` includes a nullable `DateTimeOffset? ResolutionDate`. Passed through to the frontend as a nullable ISO string.

### Inline priority change (US-02.2)
Requires `IJiraClient.UpdateIssueAsync(string issueKey, UpdateIssueRequest request, CancellationToken ct)` — declared in `IJiraClient` but not yet implemented. **This epic adds this method** to `IJiraClient` as a new task (TASK-02.2.1). The Jira endpoint is `PUT /rest/api/3/issue/{issueKey}` with `{ "fields": { "priority": { "name": "<value>" } } }`. The eligibility check (status not `Resolved`/`Discarded`) is enforced in the backend use case.

### Ownership check on ticket detail (US-02.4)
Access is granted to any user in the same client organisation as the ticket. The use case resolves `ClientId` from the `Ticket` anchor record (by `JiraIssueKey`) and compares it against the calling user's `client_id` JWT claim. A mismatch returns `ForbiddenError` → `403`. No extra Jira call is needed.

### Rich text / WYSIWYG (US-02.3, US-02.4)
**Strategy (b) — backend ADF conversion**: the frontend WYSIWYG editor (Tiptap) produces HTML; the `api` converts HTML → ADF before calling Jira's `CreateIssueAsync`. On the read path, the `api` converts ADF → HTML before returning the description to the frontend. The frontend renders the HTML description using a sanitized `dangerouslySetInnerHTML` (DOMPurify). This keeps the frontend decoupled from Jira's ADF format. The plain-text character count for the 5 000-character limit is measured on the HTML's text content in the browser.

A minimal internal ADF builder (`AdfBuilder`) already exists in `Api.Infrastructure/Jira/` from EPIC-07 (used for comment bodies). A reverse converter (`AdfToHtmlConverter`) is added in this epic for the read path. No third-party ADF library — both converters are lightweight internal utilities sufficient for paragraph, bold, italic, bullet-list, and code-span nodes.

### Type and priority fields (US-02.3)
For v1, valid values are hardcoded in the frontend. The portal `type` field (Bug, Question, Feature Request) maps to a Jira **label** (e.g. `type:bug`) — not a Jira issue type — since `JIRA_ISSUE_TYPE` is global. The backend `CreateTicketUseCase` (TASK-07.1.5) applies this mapping when building the Jira payload.

### Attachments on detail page (US-02.4)
Attachment downloads are proxied through `api` — Jira attachment URLs require credentials and must not be exposed to the browser. `GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}` fetches the file from Jira and streams it to the client. EPIC-02 owns the read-only proxy; EPIC-03 owns the write path.

### Comment thread ordering (US-02.4)
`GetCommentsAsync` passes `orderBy=-created` to Jira so comments arrive newest-first from the API. The backend does not sort in memory. The `api` converts each comment's ADF body to HTML before returning the DTO.

### Image attachments in comments (US-02.4)
For v1, inline ADF `mediaSingle`/`media` nodes in comment bodies are not rendered inline. The `AdfToHtmlConverter` extracts image references from ADF and appends them as labelled download links (`<a href="/api/tickets/{key}/attachments/{id}">Attachment: filename.png</a>`). No attachment referenced in a comment may be silently omitted (per AC).

### Comment DTO
`CommentDto` includes: `id`, `authorName`, `isPortalComment` (bool — true if body starts with `[Portal]`), `body` (HTML, converted from ADF), `createdAt`, and `attachments` (array of `AttachmentLinkDto` — extracted from ADF media nodes for v1 fallback).

### v2 comment pagination (US-02.6)
`GetCommentsAsync` is implemented with `startAt` and `pageSize` parameters for v1, defaulting to `startAt=0` / `pageSize=200` so all comments load in a single request. This makes adding scroll-triggered pagination in v2 non-breaking — the parameters are already wired.

---

## User Stories

---

### US-02.1 — View my list of tickets
> *As a client, I want to see a paginated, filterable, and sortable list of all my support tickets so that I can quickly find and track any request.*

**Acceptance Criteria:**
- [ ] After logging in, the client lands on the ticket list page showing all their tickets.
- [ ] Each ticket row displays: title, status, priority, creation date, and resolution date (date the ticket was closed; empty if not yet resolved).
- [ ] The list is paginated server-side. The client can select the page size: 10, 20, or 50 rows per page. The default is 20.
- [ ] Pagination controls show the current page, total pages, and allow navigating to the previous and next page.
- [ ] The list is sorted by creation date descending by default. The client can sort by any column (title, status, priority, creation date, resolution date) by clicking the column header; clicking again toggles ascending/descending order.
- [ ] The list has a filter panel with the following controls:
  - **Status**: multi-select from the full status set — Created, In Progress, Waiting for Client Info, Resolved, Discarded. Defaults to all statuses shown.
  - **Date range**: predefined options — Today, Yesterday, Last 7 days, This Month, Last Month, Custom. Custom allows the client to pick a start and end date. The maximum selectable range is 6 months. The date filter applies to the ticket creation date.
- [ ] Changing any filter or page size resets the current page to 1.
- [ ] If the filtered result set is empty, a friendly empty state is shown (not a blank table).
- [ ] If the client has no tickets at all, a distinct empty state is shown with a call-to-action to create the first ticket.
- [ ] Status values in the list are displayed using the portal's defined labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded) — never raw Jira internal identifiers.
- [ ] The list is read live from Jira — no stale data from a local cache.
- [ ] If Jira is temporarily unavailable, the client sees a clear error message rather than an empty or broken list.
- [ ] The page is only accessible to authenticated client users; unauthenticated access redirects to the login page.
- [ ] Active filters, sort column/direction, and page size are preserved in the URL query string so the view is shareable and survives a browser refresh.

**Story Points:** 5

#### TASK-02.1.1 — `UpdateIssueAsync` method added to `IJiraClient` and `JiraClient` (api)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** TASK-07.1.2

**What to build:**
Add `UpdateIssueAsync(string issueKey, UpdateIssueFieldsRequest request, CancellationToken ct)` to the `IJiraClient` interface in `Api.Application/Common/Interfaces/`. Implement it in `JiraClient` using `PUT /rest/api/3/issue/{issueKey}` with a JSON body containing the fields to update. Also add `GetCommentsAsync(string issueKey, int startAt, int pageSize, CancellationToken ct)` if not already fully implemented in TASK-07.1.2. This task completes the `IJiraClient` contract that EPIC-02 requires beyond what EPIC-07 declared.

**Constraints:**
- `UpdateIssueFieldsRequest` is a record in `Api.Application/Common/Interfaces/` containing a `Priority` (string?) and any other nullable updatable fields — only non-null fields are serialized in the JSON body sent to Jira.
- `IJiraClient.UpdateIssueAsync` returns `Task<Result>` (not `Result<T>`) — Jira's `PUT /rest/api/3/issue/{issueKey}` returns `204 No Content` on success.
- `GetCommentsAsync` signature: `Task<Result<JiraCommentListDto>> GetCommentsAsync(string issueKey, int startAt, int pageSize, CancellationToken ct)` — `orderBy=-created` query param must always be appended so comments arrive newest-first.
- `JiraCommentListDto` (in `Api.Application/Jira/Dtos/`) contains `IReadOnlyList<JiraCommentDto>`, `int Total`, `int StartAt`, `int MaxResults`.
- No Infrastructure references in Application (per backend-guidelines §2).

**Definition of Done:**
- [ ] `IJiraClient` has `UpdateIssueAsync` and `GetCommentsAsync` signatures.
- [ ] `JiraClient` implements both methods.
- [ ] `JiraCommentListDto` and `JiraCommentDto` exist in `Api.Application/Jira/Dtos/`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.1.2 — `ListIssuesAsync` full implementation in `JiraClient` + `AdfToHtmlConverter` (api)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-07.1.2

**What to build:**
Implement `ListIssuesAsync` and `GetIssueAsync` in `JiraClient` (stubbed in TASK-07.1.2). `ListIssuesAsync` composes a JQL query from the project key, status filter, date range, and sort params, then calls `GET /rest/api/3/search`. `GetIssueAsync` calls `GET /rest/api/3/issue/{issueKey}` and returns a `JiraIssueDto`. Also add `AdfToHtmlConverter` in `Api.Infrastructure/Jira/` that converts Jira ADF JSON (description and comment bodies) to sanitized HTML for the frontend. The converter handles: paragraph, heading, strong, em, underline, bullet list, ordered list, and inline code nodes. Unknown nodes are rendered as their text content; `mediaSingle`/`media` nodes are converted to anchor links using the attachment proxy URL pattern.

**Constraints:**
- `JiraIssueDto` fields (in `Api.Application/Jira/Dtos/`): `JiraIssueKey` (string), `Summary` (string), `Description` (string? — ADF JSON from Jira, stored as raw string), `Status` (string), `Priority` (string), `IssueType` (string), `CreatedAt` (DateTimeOffset), `ResolutionDate` (DateTimeOffset?), `ReporterDisplayName` (string).
- `ListIssuesAsync` must pass `startAt`, `maxResults`, and `ORDER BY <sortBy> <sortDir>` in the JQL string — no in-memory sorting.
- `ListIssuesAsync` returns `Task<Result<PagedTicketResult>>` where `PagedTicketResult` (in `Api.Application/Jira/Dtos/`) contains `IReadOnlyList<JiraIssueDto>`, `int Total`, `int StartAt`, `int MaxResults`.
- The JQL base filter is `project = "<key>"`. Status filter appends `AND status IN ("s1","s2")`. Date range appends `AND created >= "YYYY-MM-DD" AND created <= "YYYY-MM-DD"`.
- `AdfToHtmlConverter` is an internal utility class — no public interface needed. For `media` nodes, emit `<a href="/api/tickets/{issueKey}/attachments/{mediaId}">Attachment: {fileName}</a>`.
- HTML output from `AdfToHtmlConverter` is not sanitized server-side (that is the frontend's responsibility with DOMPurify).

**Definition of Done:**
- [ ] `ListIssuesAsync` and `GetIssueAsync` are fully implemented (no `NotImplementedException`).
- [ ] `PagedTicketResult` and updated `JiraIssueDto` exist in `Api.Application/Jira/Dtos/`.
- [ ] `AdfToHtmlConverter` exists at `Api.Infrastructure/Jira/AdfToHtmlConverter.cs`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.1.3 — `ListTicketsUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-02.1.2, TASK-07.1.3

**What to build:**
Create `ListTicketsUseCase` in `Api.Application/Tickets/UseCases/`. It receives a `ListTicketsQuery` (clientId, page, pageSize, sortBy, sortDir, statusFilter[], dateFrom?, dateTo?) and: (1) resolves `JiraProjectKey` from `ClientProject` — fail fast if not configured; (2) validates date range ≤ 184 days — return `ValidationError` if exceeded; (3) validates `sortBy` against the allowed set — return `ValidationError` if unknown; (4) calls `IJiraClient.ListIssuesAsync` with computed `startAt = (page-1) * pageSize`; (5) maps each `JiraIssueDto` to `TicketListItemDto` using `AdfToHtmlConverter` for the description; (6) returns `Result.Ok(PagedTicketListDto)`.

**Constraints:**
- `TicketListItemDto` (in `Api.Application/Tickets/Dtos/`): `jiraIssueKey`, `summary`, `status`, `priority`, `createdAt`, `resolutionDate` (nullable).
- `PagedTicketListDto` wraps `IReadOnlyList<TicketListItemDto>`, `totalCount`, `page`, `pageSize`, `totalPages`.
- Allowed `sortBy` values: `created`, `resolutiondate`, `priority`, `status`, `summary`. Case-insensitive. Return `ValidationError` for any other value.
- The 184-day cap check: if both `dateFrom` and `dateTo` are provided, compute `(dateTo - dateFrom).TotalDays > 184`. If only one is provided and `dateRange` is `custom`, return `ValidationError`.
- `clientId` is extracted from the JWT claim in the controller — never from the query body.
- Validator for `ListTicketsQuery` enforces: `pageSize` in `{10, 20, 50}`, `page >= 1`, `sortDir` in `{"asc", "desc"}`.

**Definition of Done:**
- [ ] `ListTicketsUseCase` exists at `Api.Application/Tickets/UseCases/ListTicketsUseCase.cs`.
- [ ] `TicketListItemDto` and `PagedTicketListDto` exist in `Api.Application/Tickets/Dtos/`.
- [ ] A date range exceeding 184 days returns a failed `Result` with `ValidationError`.
- [ ] An unknown `sortBy` value returns a failed `Result` with `ValidationError`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.1.4 — `GET /api/tickets` list endpoint (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-02.1.3, TASK-07.1.6

**What to build:**
Add `GET /api/tickets` action to `TicketsController`. It reads all query parameters (`page`, `pageSize`, `sortBy`, `sortDir`, `status` multi-value, `dateRange`, `dateFrom`, `dateTo`) from the query string, maps them to a `ListTicketsQuery` (injecting `clientId` from the JWT `client_id` claim), calls `IListTicketsUseCase.ExecuteAsync`, and returns the result via `ResultExtensions`.

**Constraints:**
- Controller inherits from `ApiControllerBase`; endpoint requires `[Authorize]` (per api-conventions.md §1, §6).
- `client_id` is read from the JWT claim — never from the query string.
- `status` can be a multi-value query param (`?status=Created&status=In+Progress`); bind as `[FromQuery] string[] status`.
- Default values applied in the controller if params are absent: `page=1`, `pageSize=20`, `sortBy=created`, `sortDir=desc`.
- On success, returns `200 OK` with `PagedTicketListDto`.
- Route: `GET /api/tickets` (per api-conventions.md §4).

**Definition of Done:**
- [ ] `GET /api/tickets` with valid JWT returns `200 OK` with `PagedTicketListDto`.
- [ ] `GET /api/tickets?dateFrom=X&dateTo=Y` where range > 184 days returns `422`.
- [ ] `GET /api/tickets?sortBy=invalid` returns `422`.
- [ ] Unauthenticated request returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.1.5 — Ticket list page — layout, table, and URL state (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.6.2, TASK-02.1.4

**What to build:**
Create the `/tickets` route in `client-portal`. The page contains a shadcn/ui `DataTable` rendering ticket rows (title, status, priority, creation date, resolution date). All filter/sort/pagination state lives exclusively in URL search params via React Router's `useSearchParams` — no `useState` for these values. Derive state from URL params on every render. Changing a filter or page calls `setSearchParams` with the updated params and resets `page` to `1`. The page is protected by the route guard from TASK-01.6.2.

**Constraints:**
- State management: `useSearchParams` is the single source of truth for `page`, `pageSize`, `sortBy`, `sortDir`, `status[]`, `dateRange`, `dateFrom`, `dateTo` — no `useState` duplication (per Architecture Note on URL state persistence).
- Data fetching: `useQuery` from TanStack Query with query key `['tickets', searchParams.toString()]` so the cache key changes with URL params.
- Column headers are clickable for sort; clicking the active sort column toggles `sortDir`; clicking a different column sets `sortBy` to that column and `sortDir` to `desc`.
- Page size selector uses shadcn `Select` with options `[10, 20, 50]`.
- Jira-unavailable error: show a shadcn `Alert` with the error message — not an empty table.
- "No tickets" empty state: shadcn `Card` with a "Create your first ticket" call-to-action button navigating to `/tickets/new`.
- "No results for filters" empty state: distinct message with a "Clear filters" action that resets all filter params.
- All user-visible strings use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] `/tickets` route renders a paginated table of tickets from the API.
- [ ] Filter, sort, and page state round-trip through the URL — a browser refresh restores the exact view.
- [ ] Changing `pageSize` or any filter resets `page` to `1`.
- [ ] Empty state shown when no tickets exist; error state shown when API fails.
- [ ] Unauthenticated access redirects to `/login`.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-02.1.6 — Ticket list filter panel (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.1.5

**What to build:**
Add a filter panel component to the `/tickets` page containing: (1) a multi-select status filter using shadcn `Popover` + `Command` (checkbox list) with options `Created`, `In Progress`, `Waiting for Client Info`, `Resolved`, `Discarded`; (2) a date range selector using shadcn `Select` for presets (`Today`, `Yesterday`, `Last 7 days`, `This Month`, `Last Month`, `Custom`) and shadcn `Popover` + `Calendar` for the custom date range picker. The custom range picker enforces a 6-month maximum selection in the UI. All selections update URL params via `setSearchParams`.

**Constraints:**
- Multi-select status filter must set the `status` param as repeated keys (`?status=Created&status=Resolved`) — not a comma-separated string.
- Custom date range: start and end date are stored as `dateFrom` and `dateTo` ISO date strings in the URL; the calendar `Calendar` component disables dates > 184 days from the selected start.
- Changing any filter calls `setSearchParams` with `page` reset to `1`.
- All filter labels use i18n keys (per EPIC-10 note).
- Filter panel state is derived entirely from URL params — no internal `useState` for filter values.

**Definition of Done:**
- [ ] Status multi-select correctly filters the table and persists in URL.
- [ ] Date range presets set correct `dateFrom`/`dateTo` values in URL.
- [ ] Custom range picker prevents selecting a range > 6 months.
- [ ] Clearing filters resets all filter-related params and returns to page 1.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-02.2 — Change ticket priority from the list
> *As a client, I want to update the priority of a ticket directly from the ticket list so that I can reprioritise my requests without having to open each one.*

**Acceptance Criteria:**
- [ ] The priority cell in the ticket list is an inline selector for tickets with an eligible status (Created or In Progress or Waiting for Client Info).
- [ ] For tickets with status Resolved or Discarded, the priority cell is read-only (no selector is shown).
- [ ] The selector offers the same priority values available at ticket creation: Low, Medium, High, Critical.
- [ ] Selecting a new priority immediately sends the update to Jira. While the request is in progress, the selector shows a loading state.
- [ ] On success, the row reflects the new priority without a full page reload.
- [ ] If the Jira update fails, the priority reverts to the previous value and the client sees an inline error message on that row.
- [ ] Changing priority from the list does not navigate away from the list page.

**Story Points:** 3

#### TASK-02.2.1 — `UpdateTicketPriorityUseCase` (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-02.1.1, TASK-07.1.3

**What to build:**
Create `UpdateTicketPriorityUseCase` in `Api.Application/Tickets/UseCases/`. It receives an `UpdateTicketPriorityCommand` (jiraIssueKey, newPriority, clientId) and: (1) looks up the `Ticket` anchor record by `JiraIssueKey` — returns `NotFoundError` if not found; (2) verifies `Ticket.ClientId` matches the calling user's `clientId` — returns `ForbiddenError` if not; (3) fetches the current issue via `IJiraClient.GetIssueAsync` — returns `NotFoundError` if Jira returns not found; (4) checks issue status is not `Resolved` or `Discarded` — returns a `ConflictError` if it is; (5) calls `IJiraClient.UpdateIssueAsync` with the new priority; (6) returns `Result.Ok()`.

**Constraints:**
- `newPriority` must be one of `Low`, `Medium`, `High`, `Critical` — validated via FluentValidation in the use case.
- The eligibility check (status not `Resolved`/`Discarded`) is performed in the use case, not the controller (per Architecture Note).
- Returns `ConflictError` (→ `409`) when the ticket status makes priority updates ineligible.
- No EF Core writes — the `Ticket` anchor record is read-only in this use case.
- Single `ExecuteAsync(UpdateTicketPriorityCommand cmd, CancellationToken ct)` returning `Task<Result>`.

**Definition of Done:**
- [ ] `UpdateTicketPriorityUseCase` exists at `Api.Application/Tickets/UseCases/UpdateTicketPriorityUseCase.cs`.
- [ ] An invalid `newPriority` value returns a failed `Result` with `ValidationError`.
- [ ] Attempting to update priority on a `Resolved` or `Discarded` ticket returns a `ConflictError`.
- [ ] A `jiraIssueKey` not belonging to the calling user's client returns `ForbiddenError`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.2.2 — `PATCH /api/tickets/{jiraIssueKey}/priority` endpoint (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-02.2.1

**What to build:**
Add a `PATCH /api/tickets/{jiraIssueKey}/priority` action to `TicketsController`. It accepts a JSON body `{ "priority": "High" }`, maps to `UpdateTicketPriorityCommand` (injecting `clientId` from the JWT `client_id` claim), calls `IUpdateTicketPriorityUseCase.ExecuteAsync`, and returns the result via `ResultExtensions`.

**Constraints:**
- Route: `PATCH /api/tickets/{jiraIssueKey}/priority` (per api-conventions.md §4).
- `[Authorize]` required; `client_id` from JWT claim — never from request body.
- On success returns `200 OK` with no body (the frontend updates the row from the request params, not from a response payload).
- `jiraIssueKey` is a path param; `priority` is the only body field.
- `ForbiddenError` → `403`, `NotFoundError` → `404`, `ConflictError` → `409`, `ValidationError` → `422`.

**Definition of Done:**
- [ ] `PATCH /api/tickets/{jiraIssueKey}/priority` with valid payload returns `200 OK`.
- [ ] Invalid `priority` value returns `422`.
- [ ] Ticket with status `Resolved` returns `409`.
- [ ] Ticket belonging to a different client returns `403`.
- [ ] Unauthenticated request returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.2.3 — Inline priority selector in ticket list (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.1.5, TASK-02.2.2

**What to build:**
Replace the read-only priority cell in the ticket table with an inline shadcn `Select` component for tickets whose status is `Created`, `In Progress`, or `Waiting for Client Info`. For `Resolved` or `Discarded` tickets, render the priority as a plain text badge. The selector calls `PATCH /api/tickets/{jiraIssueKey}/priority` on change via a `useMutation`. While the mutation is in flight, the selector shows a loading state. On success, `invalidateQueries(['tickets'])` to refresh the list. On error, roll back the selector value to the previous priority and show an inline error message on that row.

**Constraints:**
- Use TanStack Query `useMutation` with optimistic rollback: `onMutate` snapshots the previous priority; `onError` restores it via `setQueryData`; `onSettled` calls `invalidateQueries`.
- Loading state: disable the `Select` and show a spinner adjacent to it while `isPending` is true.
- Error message is row-level — shown below or beside the selector for that specific row only, not as a global toast.
- The selector must not navigate away from the list page on change.
- Priority options: `Low`, `Medium`, `High`, `Critical` — i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] Priority `Select` is rendered only for eligible statuses.
- [ ] Selecting a new priority calls the PATCH endpoint and shows a loading state.
- [ ] On success, the row reflects the new priority without a full page reload.
- [ ] On API error, the priority reverts to the previous value and an inline error is displayed.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-02.3 — Create a new support ticket
> *As a client, I want to submit a new support ticket from the portal so that the technical team receives my request in Jira without me needing an account there.*

**Acceptance Criteria:**
- [ ] The ticket list page has a visible "New ticket" button that opens the creation form.
- [ ] The form requires a title (plain text, up to 200 characters).
- [ ] The description field is a rich text editor (WYSIWYG) that supports at minimum: bold, italic, underline, bullet lists, numbered lists, and inline code.
- [ ] The description editor enforces a maximum content length of 5 000 characters (measured on the plain-text equivalent, not the raw markup). The editor shows a live character count and prevents submission once the limit is reached.
- [ ] The form includes a type selector (e.g. Bug, Question, Feature Request) and a priority selector (Low, Medium, High, Critical).
- [ ] The client can optionally attach one or more files (images, documents); file size limit per file is 10 MB and the number of files per submission is limited to 10.
- [ ] Submitting the form creates the corresponding issue in the client's Jira project in real time.
- [ ] On success, the client is redirected to the new ticket's detail page and sees a confirmation message.
- [ ] If the Jira call fails, the client sees a clear error; no ticket is partially created.
- [ ] Inline validation prevents submission when required fields are empty or the description exceeds its character limit.
- [ ] The "Submit" button is disabled and shows a loading indicator while the request is in progress.

**Story Points:** 8

#### TASK-02.3.1 — `CreateTicketRequest` multipart binding + Tiptap WYSIWYG editor component (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.6.2

**What to build:**
Create a reusable `RichTextEditor` component in `client-portal/src/components/` wrapping the Tiptap editor. Configure it with extensions: `StarterKit` (bold, italic, bullet list, ordered list, paragraph), `Underline`, `Code`. The component accepts `value` (HTML string), `onChange` (callback), `maxLength` (number), and `disabled` (bool) props. Display a live character count below the editor, counting the plain-text content (`editor.getText().length`). Prevent further input when the character count reaches `maxLength` and show a visual warning.

**Constraints:**
- Install Tiptap via `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-code`.
- The `RichTextEditor` outputs HTML (via `editor.getHTML()`) — not ADF, not Markdown. The backend converts HTML → ADF (per Architecture Note).
- Character count is measured via `editor.getText().length` on the plain-text equivalent.
- When `editor.getText().length >= maxLength`, disable the editor's input and show a warning label. The `onChange` must still fire with the current content so the parent form can maintain state.
- Component uses shadcn/ui styling tokens for border, background, and focus ring — no inline `style` props.
- All i18n strings (placeholder, counter label, limit warning) use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] `RichTextEditor` component exists at `client-portal/src/components/RichTextEditor.tsx`.
- [ ] Bold, italic, underline, bullet list, numbered list, inline code toolbar buttons work.
- [ ] Live character count updates as user types.
- [ ] Input is blocked and a warning is shown when count reaches `maxLength`.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-02.3.2 — New ticket form page `/tickets/new` (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.3.1, TASK-02.1.4

**What to build:**
Create the `/tickets/new` route. The form contains: title (shadcn `Input`, max 200 chars), description (`RichTextEditor`, max 5 000 chars), type (shadcn `Select`: `Bug`, `Question`, `Feature Request`), priority (shadcn `Select`: `Low`, `Medium`, `High`, `Critical`), and a file attachment area (shadcn `Input type="file"` with `multiple`, max 10 files, max 10 MB each). On submit, POST `multipart/form-data` to `POST /api/tickets` via a `useMutation`. On success, navigate to `/tickets/{jiraIssueKey}` and show a success toast. On error, show a clear error message. The submit button is disabled and shows a loading spinner while `isPending`.

**Constraints:**
- Form uses React Hook Form for field state and submission — `RichTextEditor` is integrated as a controlled component via `Controller`.
- File validation is enforced client-side before submit: reject files > 10 MB per file, reject more than 10 files. Show a per-file error list.
- The request body is `FormData` — title and description as string fields, files as file entries. Description is sent as HTML (the backend converts to ADF).
- `useMutation` `mutationFn` builds and posts `FormData` via the Axios instance configured in TASK-01.3.1.
- Inline validation: title required, description required, at least one of type/priority required. Errors shown below each field.
- If any file upload partially fails (per-file `success: false` in `AttachmentResultDto`), navigate to the new ticket detail page and show a warning toast listing the failed filenames — do not block navigation.
- All labels and error messages use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] `/tickets/new` route renders the creation form.
- [ ] Submitting valid form data creates the ticket and navigates to `/tickets/{jiraIssueKey}`.
- [ ] Files > 10 MB are rejected client-side before submit.
- [ ] More than 10 files are rejected client-side.
- [ ] Submit button is disabled while the mutation is in flight.
- [ ] Jira API failure shows an error message with no navigation.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-02.4 — View the detail of a ticket
> *As a client, I want to open a ticket and see its full detail — description, current status, and the comment thread — so that I can follow the progress and context of my request.*

**Acceptance Criteria:**
- [ ] Clicking any ticket in the list navigates to a detail page showing the full ticket content.
- [ ] The detail page displays: title, description (rendered as rich text preserving the formatting submitted at creation), status, priority, type, creation date, resolution date (if applicable), and the comment thread.
- [ ] The comment thread is rendered inside a fixed-height scrollable container so that a ticket with many comments does not push the rest of the page content out of view.
- [ ] Comments are shown in reverse-chronological order (newest first), so the most recent activity is immediately visible without scrolling.
- [ ] Each comment shows the author's name, the timestamp, and the comment body.
- [ ] Comments clearly distinguish client comments from team (Jira) comments (e.g. via visual styling or a role label).
- [ ] If a comment contains an image attachment, the image is displayed inline within the comment body.
- [ ] If inline image rendering is not feasible for v1, each image attachment in a comment is shown as a clearly labelled link that opens or downloads the image — no attachment referenced in a comment may be silently omitted.
- [ ] Non-image attachments referenced in a comment are shown as downloadable links within the comment body.
- [ ] Attachments on the ticket that are not tied to a specific comment (uploaded at creation or outside a comment) are listed in a dedicated attachments section and available for download.
- [ ] Status values on the detail page are displayed using the portal's defined labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded) — never raw Jira internal identifiers.
- [ ] The detail data is read live from Jira on every page visit — the client always sees the latest state set by the team, including after a manual browser refresh.
- [ ] If Jira is temporarily unavailable, the client sees a clear error message rather than stale or empty content.
- [ ] The ticket detail page is accessible to any authenticated user who belongs to the same client organisation as the ticket — not only the user who created it.
- [ ] A user from a different client organisation attempting to access the ticket receives a "not found" or "forbidden" view.

**Story Points:** 5

#### TASK-02.4.1 — `GetTicketDetailUseCase` + attachment proxy endpoint (api)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-02.1.2, TASK-07.1.3

**What to build:**
Create `GetTicketDetailUseCase` in `Api.Application/Tickets/UseCases/`. It receives a `GetTicketDetailQuery` (jiraIssueKey, clientId) and: (1) looks up the `Ticket` anchor record — returns `NotFoundError` if absent; (2) verifies `Ticket.ClientId` matches `clientId` — returns `ForbiddenError` if not; (3) calls `IJiraClient.GetIssueAsync` for the full issue; (4) calls `IJiraClient.GetCommentsAsync(issueKey, startAt=0, pageSize=200)` for the comment thread; (5) calls `IJiraClient.ListAttachmentsAsync` for ticket-level attachments; (6) converts all ADF content to HTML via `AdfToHtmlConverter`; (7) returns `Result.Ok(TicketDetailDto)`.

Also add `GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}` to `TicketsController` as a proxy action: it verifies ownership via the `Ticket` anchor record, then fetches the attachment stream from Jira and streams it to the response with the correct `Content-Type` and `Content-Disposition` headers.

**Constraints:**
- `TicketDetailDto` (in `Api.Application/Tickets/Dtos/`): `jiraIssueKey`, `summary`, `description` (HTML), `status`, `priority`, `issueType`, `createdAt`, `resolutionDate`?, `comments` (`IReadOnlyList<CommentDto>`), `attachments` (`IReadOnlyList<AttachmentLinkDto>`).
- `CommentDto`: `id`, `authorName`, `isPortalComment` (bool), `body` (HTML), `createdAt`, `attachments` (`IReadOnlyList<AttachmentLinkDto>` — media extracted from ADF by `AdfToHtmlConverter`).
- `AttachmentLinkDto`: `id`, `fileName`, `mimeType`, `downloadUrl` (`/api/tickets/{key}/attachments/{id}`).
- Ownership check in the attachment proxy action: resolve `clientId` from JWT, look up `Ticket` by `JiraIssueKey`, compare `ClientId`. Return `403` if mismatch — same logic as the use case, implemented inline in the controller action.
- The proxy streams the Jira response body directly — do not buffer the full file in memory. Use `HttpClient.GetStreamAsync` and copy to `Response.Body`.
- `isPortalComment`: true if the ADF text content of the comment body starts with `[Portal]`.

**Definition of Done:**
- [ ] `GetTicketDetailUseCase` exists at `Api.Application/Tickets/UseCases/GetTicketDetailUseCase.cs`.
- [ ] `GET /api/tickets/{jiraIssueKey}` with a valid JWT returns `200 OK` with `TicketDetailDto`.
- [ ] A `jiraIssueKey` belonging to a different client returns `403`.
- [ ] A non-existent `jiraIssueKey` returns `404`.
- [ ] `GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}` streams the file with correct headers.
- [ ] `dotnet build` succeeds.

---

#### TASK-02.4.2 — Ticket detail page `/tickets/:jiraIssueKey` (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.1.5, TASK-02.4.1

**What to build:**
Create the `/tickets/:jiraIssueKey` route. The page fetches `GET /api/tickets/:jiraIssueKey` via `useQuery` and renders: title, description (HTML via `dangerouslySetInnerHTML` sanitized with DOMPurify), status badge, priority badge, type, creation date, resolution date (if present), a fixed-height scrollable comment thread, and a ticket-level attachments section. The comment thread renders comments newest-first (as returned by the API) inside a shadcn `ScrollArea` with a fixed height. Each comment shows author name, timestamp, body (HTML sanitized), a role label/style distinguishing portal vs. team comments, and any attachment links. If Jira is unavailable, show a clear error state.

**Constraints:**
- Install and use DOMPurify (`dompurify` + `@types/dompurify`) to sanitize all HTML before rendering via `dangerouslySetInnerHTML`. Never render raw unsanitized HTML.
- `useQuery` query key: `['ticket', jiraIssueKey]`. `staleTime`: 0 (live read on every visit per AC).
- The comment container uses shadcn `ScrollArea` with a fixed `max-h` (e.g. `max-h-[600px]`) — not a full-height layout.
- Comment role distinction: portal comments rendered with a different background or a `[Portal]` label badge; team comments styled differently.
- Attachment links for both ticket-level and comment-level attachments use the `/api/tickets/{key}/attachments/{id}` proxy URL — not direct Jira URLs.
- Error state: shadcn `Alert` with destructive variant and a "Retry" button that calls `refetch()`.
- All user-visible strings use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] `/tickets/:jiraIssueKey` renders the full ticket detail from the API.
- [ ] All HTML content is sanitized with DOMPurify before rendering.
- [ ] Comment thread is in a fixed-height scrollable container.
- [ ] Portal vs. team comments are visually distinguished.
- [ ] Attachment links open/download via the proxy.
- [ ] Jira error shows an error state with a retry action.
- [ ] Unauthenticated access redirects to `/login`; forbidden ticket shows a "Not found" view.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-02.5 — Navigate back to the ticket list from a ticket detail
> *As a client, I want a clear way to return to my ticket list from any ticket detail page so that I can easily switch between tickets.*

**Acceptance Criteria:**
- [ ] The ticket detail page contains a visible "Back to my tickets" link or breadcrumb.
- [ ] Clicking it returns the client to the ticket list, preserving the active filters, sort order, and page size they had selected.
- [ ] The browser back button also navigates to the ticket list with state preserved.

**Story Points:** 1

#### TASK-02.5.1 — "Back to my tickets" navigation with preserved state (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.4.2

**What to build:**
Add a "Back to my tickets" link/breadcrumb to the ticket detail page that navigates to `/tickets` with the previously active filter, sort, and page state restored. Store the serialized list URL (including query string) in React Router's `location.state` when navigating from the list to a detail page. On the detail page, read `location.state.listUrl` and use it as the href for the back link. If `listUrl` is absent (direct navigation to detail), fall back to `/tickets` with no query string.

**Constraints:**
- Use React Router `useLocation` to read `state.listUrl` on the detail page.
- The list page must pass `state: { listUrl: location.pathname + location.search }` when navigating to a detail (via `<Link>` or `navigate()`).
- The browser back button provides the same behaviour natively — no additional handling required.
- The back link is rendered as a shadcn `Button` variant `ghost` or as a breadcrumb component — not a plain `<a>` tag.
- All labels use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] "Back to my tickets" link is visible on the detail page.
- [ ] Clicking it returns to the list with the original URL query string intact.
- [ ] Direct navigation to a detail URL (no prior list visit) falls back to `/tickets`.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-02.6 — Load more comments by scrolling *(v2 desirable)*
> *As a client, I want the comment thread to load additional comments automatically as I scroll so that I can browse a long thread without clicking through pages.*

**Acceptance Criteria:**
- [ ] On initial load, the comment thread displays the most recent N comments (page size TBD by architect, suggested 20).
- [ ] When the client scrolls to the bottom of the comment container, the next batch of older comments is fetched and appended below the already-loaded ones.
- [ ] A loading indicator is shown at the bottom of the container while the next batch is being fetched.
- [ ] If there are no more comments to load, the loading indicator is replaced by a clear end-of-thread message (e.g. "No more comments").
- [ ] If fetching the next batch fails, an inline error is shown with a retry option — already-loaded comments remain visible.
- [ ] Scroll position is preserved after new comments are appended; the view does not jump to the top.

> **Note:** This story is scoped to **v2**. v1 (US-02.4) loads all comments in a single request. This story depends on the backend adding cursor- or offset-based pagination to the `GetCommentsAsync` method. Previously numbered US-02.7.

**Story Points:** 3

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-02.1 | View my list of tickets | 5 |
| US-02.2 | Change ticket priority from the list | 3 |
| US-02.3 | Create a new support ticket | 8 |
| US-02.4 | View the detail of a ticket | 5 |
| US-02.5 | Navigate back to the ticket list from a ticket detail | 1 |
| US-02.6 *(v2)* | Load more comments by scrolling | 3 |
| **Total** | | **25** |

---

## Task Breakdown

| Task | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-02.1.1 | `UpdateIssueAsync` + `GetCommentsAsync` added to `IJiraClient`/`JiraClient` | US-02.1 | api | TASK-07.1.2 |
| TASK-02.1.2 | `ListIssuesAsync`/`GetIssueAsync` full impl + `AdfToHtmlConverter` | US-02.1 | api | TASK-07.1.2 |
| TASK-02.1.3 | `ListTicketsUseCase` | US-02.1 | api | TASK-02.1.2, TASK-07.1.3 |
| TASK-02.1.4 | `GET /api/tickets` list endpoint | US-02.1 | api | TASK-02.1.3, TASK-07.1.6 |
| TASK-02.1.5 | Ticket list page — layout, table, URL state | US-02.1 | client-portal | TASK-01.6.2, TASK-02.1.4 |
| TASK-02.1.6 | Ticket list filter panel | US-02.1 | client-portal | TASK-02.1.5 |
| TASK-02.2.1 | `UpdateTicketPriorityUseCase` | US-02.2 | api | TASK-02.1.1, TASK-07.1.3 |
| TASK-02.2.2 | `PATCH /api/tickets/{jiraIssueKey}/priority` endpoint | US-02.2 | api | TASK-02.2.1 |
| TASK-02.2.3 | Inline priority selector in ticket list | US-02.2 | client-portal | TASK-02.1.5, TASK-02.2.2 |
| TASK-02.3.1 | `RichTextEditor` Tiptap component | US-02.3 | client-portal | TASK-01.6.2 |
| TASK-02.3.2 | New ticket form page `/tickets/new` | US-02.3 | client-portal | TASK-02.3.1, TASK-02.1.4 |
| TASK-02.4.1 | `GetTicketDetailUseCase` + attachment proxy endpoint | US-02.4 | api | TASK-02.1.2, TASK-07.1.3 |
| TASK-02.4.2 | Ticket detail page `/tickets/:jiraIssueKey` | US-02.4 | client-portal | TASK-02.1.5, TASK-02.4.1 |
| TASK-02.5.1 | "Back to my tickets" navigation with preserved state | US-02.5 | client-portal | TASK-02.4.2 |

> US-02.6 (scroll pagination) is v2 — no tasks defined here. Prerequisites: `GetCommentsAsync` already accepts `startAt`/`pageSize` (established in TASK-02.1.1), making v2 non-breaking.

---

> **i18n note (EPIC-10):** All user-visible strings in this epic — including status labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded), priority labels (Low, Medium, High, Critical), type labels (Bug, Question, Feature Request), empty-state messages, error messages, button labels, and date format patterns — must use i18n translation keys. The WYSIWYG description editor (US-02.3) should be configured with the user's active locale for correct spell-checking and input behaviour. The date range filter (US-02.1) date picker labels and predefined range names must also be translated. Status label mapping (US-02.1, US-02.4) must map Jira status values to translated portal labels — the mapping layer must look up the translated string from the i18n resources, not hardcode Spanish text.

> **Note for Architect:**
>
> **Dependencies to confirm before writing tasks:**
>
> - **`IJiraClient` read methods** (`GetIssueAsync`, `ListIssuesAsync`) are declared in TASK-07.1.1 and stubbed in TASK-07.1.2. EPIC-02 tasks must implement them fully. Confirm the DTO shapes (`JiraIssueDto`, `JiraIssueListDto`) — required fields: summary, description, status name, priority name, issue type, created date, resolution date (`resolutiondate` field in Jira), reporter.
>
> - **Pagination (US-02.1)**: `ListIssuesAsync` must support server-side pagination via Jira's `startAt` / `maxResults` query parameters and return total count so the frontend can render page controls. JQL base: `project = "<key>"` with appended clauses for status filter and date range filter. Confirm the full JQL composition strategy (multiple `AND` clauses) and how the backend exposes `totalCount`, `page`, `pageSize` in its response envelope (per api-conventions.md pagination pattern).
>
> - **Sorting (US-02.1)**: Jira JQL supports `ORDER BY` on a limited set of fields. Confirm which columns map to valid JQL sort fields — `created`, `resolutiondate`, `priority`, `status`, `summary` are all valid Jira JQL fields. The `ORDER BY` clause is appended to the JQL query based on the sort parameter received from the frontend. Define the sort parameter contract (`sortBy` + `sortDir` query params).
>
> - **Date range filter (US-02.1)**: applies to ticket creation date (`created` JQL field). JQL clause: `created >= "YYYY-MM-DD" AND created <= "YYYY-MM-DD"`. The 6-month cap is enforced in the backend use case — reject requests where the range exceeds 184 days and return a `422`. The frontend enforces it in the date picker UI as a secondary guard.
>
> - **Status label mapping (US-02.1, US-02.4)**: the portal defines a fixed status vocabulary (Created, In Progress, Waiting for Client Info, Resolved, Discarded). The architect must decide whether: (a) Jira project statuses are configured to match these exact names, or (b) the backend maintains a mapping table. For v1, option (a) is simpler and avoids a mapping layer — document this as an assumption and call it out as a setup requirement for admins. The status filter passes the portal label directly as the JQL `status` value.
>
> - **Resolution date (US-02.1, US-02.4)**: Jira exposes `resolutiondate` on issues. This field is `null` until the issue is resolved. Confirm it is included in the `JiraIssueDto` and passed through to the frontend as a nullable date.
>
> - **Inline priority change (US-02.2)**: requires `IJiraClient.UpdateIssueAsync` (or a dedicated `UpdatePriorityAsync`) — not yet defined in TASK-07.1.1. The architect must add this method to `IJiraClient` as part of EPIC-02 tasks. The Jira REST API endpoint is `PUT /rest/api/3/issue/{issueKey}` with a `priority.name` field in the request body. The eligibility check (status not Resolved/Discarded) is enforced in the backend use case — not only in the frontend.
>
> - **Ownership check on ticket detail (US-02.4)**: access is granted to any user belonging to the same client organisation as the ticket — not just the creator. The use case must verify that the `JiraIssueKey` belongs to a Jira project configured for the calling user's `ClientId` (via the `ClientProject` entity — EPIC-05B). The `Ticket` anchor record (`Ticket` table — TASK-07.1.3) can be used as a fast lookup to resolve `ClientId` from `JiraIssueKey` without an extra Jira API call. This check is performed in the use case, not the controller.
>
> - **Rich text / WYSIWYG description (US-02.3, US-02.4)**: the description is authored in a WYSIWYG editor on the frontend and must be stored/sent to Jira. Jira Cloud's REST API v3 accepts the `description` field as **Atlassian Document Format (ADF)** — a structured JSON format, not HTML or Markdown. The architect must decide the conversion strategy: (a) the frontend editor produces ADF directly (e.g. using a Tiptap + Jira-ADF serialiser), (b) the frontend sends HTML/Markdown and the backend `api` converts it to ADF before calling Jira, or (c) a hybrid. Option (b) keeps the frontend decoupled from Jira's format and is recommended. On the read path (US-02.4), the description returned by Jira is ADF — confirm whether `api` converts it back to HTML/Markdown for the frontend, or the frontend renders ADF directly. The plain-text character count for the 5 000-character limit must be computed consistently on whichever representation the frontend operates on.
>
> - **Type and priority fields for creation form (US-02.3)**: confirm whether valid values are hardcoded in the frontend or fetched from Jira's metadata API. For v1, hardcoded is simplest. Also confirm how the portal `type` field (Bug, Question, etc.) maps to Jira — given that `JIRA_ISSUE_TYPE` is global, the portal "type" likely becomes a Jira label rather than a Jira issue type.
>
> - **Attachments on detail page (US-02.4)**: attachment listing is read from Jira (`ListAttachmentsAsync`). Jira attachment URLs require credentials — confirm whether downloads are proxied through `api` (recommended) or use pre-signed S3 URLs. EPIC-03 owns the write path; EPIC-02 reads only.
>
> - **Comment thread — order and scrollable container (US-02.4)**: comments are now displayed newest-first inside a fixed-height scrollable container. Jira's `GET /rest/api/3/issue/{issueKey}/comment` returns comments in ascending order by default; the `orderBy` parameter (`-created`) can reverse this at the API level — confirm this is applied in `GetCommentsAsync` so the backend handles ordering rather than the frontend sorting an in-memory array.
>
> - **Image attachments in comments (US-02.4)**: Jira comment bodies (ADF) can reference attached images via their Jira media ID. The architect must decide the v1 fallback strategy: if inline image rendering (fetching media through the proxy) is deferred, the backend must still parse the ADF body to extract any image/media references and expose them as attachment links alongside the comment DTO. Silently dropping them is not acceptable per the AC. Define whether the comment DTO includes a `attachments` array listing media referenced in that comment body.
>
> - **Comment pagination — v2 (US-02.6)**: Jira's comment endpoint supports `startAt` / `maxResults` / `total` for offset-based pagination. For v2, `GetCommentsAsync` must accept `startAt` and `pageSize` parameters and return `totalCount` so the frontend can implement scroll-triggered loading. The v1 implementation should be written in a way that makes adding these parameters non-breaking (e.g. default `maxResults` to a high value in v1 rather than omitting the param entirely).
>
> - **Filter and sort state persistence (US-02.1, US-02.5)**: all filter/sort/page state lives in URL query params (`?status=open&sortBy=created&sortDir=desc&pageSize=20&page=2&dateRange=last7days`). This makes the view shareable and allows US-02.5 back-navigation to restore state via React Router history. The architect should define the full query param contract.
>
> - **Frontend repo**: all UI tasks target `client-portal`. Backend tasks target `api`. Proposed route structure: `/tickets` (list), `/tickets/new` (creation form), `/tickets/:jiraIssueKey` (detail).
