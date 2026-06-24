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

> **Implementation:** covered by TASK-02-A (api) and TASK-02-B (client-portal). See Task Breakdown section below.

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

> **Implementation:** `UpdateTicketPriorityUseCase` and `PATCH /api/tickets/{key}/priority` are covered by TASK-02-A (api). The inline priority selector in the list is covered by TASK-02-B (client-portal). See Task Breakdown section below.

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

> **Implementation:** covered by TASK-02-C (Wave 3 — blocked on TASK-07-B). See Task Breakdown section below.

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

> **Implementation:** covered by TASK-02-A (api) and TASK-02-B (client-portal). See Task Breakdown section below.

---

### US-02.5 — Navigate back to the ticket list from a ticket detail
> *As a client, I want a clear way to return to my ticket list from any ticket detail page so that I can easily switch between tickets.*

**Acceptance Criteria:**
- [ ] The ticket detail page contains a visible "Back to my tickets" link or breadcrumb.
- [ ] Clicking it returns the client to the ticket list, preserving the active filters, sort order, and page size they had selected.
- [ ] The browser back button also navigates to the ticket list with state preserved.

**Story Points:** 1

> **Implementation:** covered by TASK-02-B (client-portal). See Task Breakdown section below.

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

> **Merged task structure.** Original 14 tasks collapsed to 3 to maximise AI-assisted throughput. Each task is a complete, independently deliverable unit. Task A and B (Wave 2) deliver the visible ticket list and detail against real Jira data. Task C (Wave 3) adds the write paths and depends on TASK-07-B completing first.

| Task | Title | Wave | Repo | Depends on |
|---|---|---|---|---|
| TASK-02-A | Ticket read API — use cases, `AdfToHtmlConverter`, all read + priority endpoints | Wave 2 | api | TASK-07-A |
| TASK-02-B | Ticket list + detail frontend — list page, filter panel, detail page, back navigation | Wave 2 | client-portal | TASK-02-A, TASK-01.6.2 |
| TASK-02-C | Ticket creation — priority update use case + endpoint, `RichTextEditor`, `/tickets/new` form | Wave 3 | api + client-portal | TASK-07-B, TASK-02-B |

---

### TASK-02-A — Ticket read API
**Wave:** 2 — delivers working backend for ticket list and detail
**Repo:** api
**Depends on:** TASK-07-A (`IJiraClient` read methods, `Ticket` entity, `ITicketRepository` all exist)

**What to build:**

**(1) `AdfToHtmlConverter`** — create in `Api.Infrastructure/Jira/AdfToHtmlConverter.cs` as an internal utility class:
- Converts Jira ADF JSON (description and comment bodies) to HTML for the frontend
- Handles: `doc`, `paragraph`, `heading`, `text` (with `strong`, `em`, `underline`, `code` marks), `bulletList`, `orderedList`, `listItem`, `codeBlock`
- Unknown nodes: render text content only; do not throw
- `mediaSingle`/`media` nodes: emit `<a href="/api/tickets/{issueKey}/attachments/{mediaId}">Attachment: {fileName}</a>`
- HTML output is NOT sanitised server-side (DOMPurify handles that on the frontend)
- Extract a static helper `ExtractPlainText(string adfJson)` that concatenates text node values — used by EPIC-08's `AdfPlainTextExtractor`

**(2) Application DTOs** — create in `Api.Application/Tickets/Dtos/`:
- `TicketListItemDto`: `JiraIssueKey`, `Summary`, `Status`, `Priority`, `CreatedAt`, `ResolutionDate?`
- `PagedTicketListDto`: `Items` (`IReadOnlyList<TicketListItemDto>`), `TotalCount`, `Page`, `PageSize`, `TotalPages`
- `TicketDetailDto`: `JiraIssueKey`, `Summary`, `Description` (HTML), `Status`, `Priority`, `IssueType`, `CreatedAt`, `ResolutionDate?`, `Comments` (`IReadOnlyList<CommentDto>`), `Attachments` (`IReadOnlyList<AttachmentLinkDto>`)
- `CommentDto`: `Id`, `AuthorName`, `IsPortalComment` (bool — true if ADF text starts with `[Portal]`), `Body` (HTML), `CreatedAt`, `Attachments` (`IReadOnlyList<AttachmentLinkDto>`)
- `AttachmentLinkDto`: `Id`, `FileName`, `MimeType`, `DownloadUrl` (`/api/tickets/{key}/attachments/{id}`)

**(3) `ListTicketsUseCase`** — create in `Api.Application/Tickets/UseCases/`:
- Input: `ListTicketsQuery` (`ClientId`, `Page`, `PageSize`, `SortBy`, `SortDir`, `StatusFilter[]?`, `DateFrom?`, `DateTo?`)
- Flow: (1) resolve `JiraProjectKey` from `ClientProject` via `IClientProjectRepository` — fail if not configured; (2) validate `SortBy` against allowed set (`created`, `resolutiondate`, `priority`, `status`, `summary`) — `ValidationError` on unknown; (3) validate date range ≤ 184 days if both provided — `ValidationError` if exceeded; (4) call `IJiraClient.ListIssuesAsync` with `startAt = (page-1) * pageSize`; (5) map to `PagedTicketListDto`
- Validator: `pageSize` in `{10, 20, 50}`, `page >= 1`, `sortDir` in `{"asc","desc"}`

**(4) `GetTicketDetailUseCase`** — create in `Api.Application/Tickets/UseCases/`:
- Input: `GetTicketDetailQuery` (`JiraIssueKey`, `ClientId`)
- Flow: (1) look up `Ticket` anchor by `JiraIssueKey` — `NotFoundError` if absent; (2) verify `Ticket.ClientId == clientId` — `ForbiddenError` if not; (3) call `IJiraClient.GetIssueAsync`; (4) call `IJiraClient.GetCommentsAsync(issueKey, startAt: 0, pageSize: 200)` (default full load for v1); (5) convert all ADF fields to HTML via `AdfToHtmlConverter`; (6) return `Result.Ok(TicketDetailDto)`

**(5) `UpdateTicketPriorityUseCase`** — create in `Api.Application/Tickets/UseCases/`:
- Input: `UpdateTicketPriorityCommand` (`JiraIssueKey`, `NewPriority`, `ClientId`)
- Flow: (1) look up `Ticket` — `NotFoundError`; (2) ownership check — `ForbiddenError`; (3) `GetIssueAsync` to fetch current status; (4) if status is `Resolved` or `Discarded` — `ConflictError`; (5) call `IJiraClient.UpdateIssueAsync` with new priority; (6) return `Result.Ok()`
- Validator: `NewPriority` must be one of `Low`, `Medium`, `High`, `Critical`

**(6) `TicketsController`** — create in `Api.API/Controllers/Tickets/TicketsController.cs` with the following actions (all `[Authorize]`, `client_id` from JWT claim):
- `GET /api/tickets` — query params: `page` (default 1), `pageSize` (default 20), `sortBy` (default `created`), `sortDir` (default `desc`), `status[]`, `dateRange`, `dateFrom`, `dateTo`. Calls `IListTicketsUseCase`. Returns `200 OK` with `PagedTicketListDto`.
- `GET /api/tickets/{jiraIssueKey}` — calls `IGetTicketDetailUseCase`. Returns `200 OK` with `TicketDetailDto`. Mismatch → `403`; not found → `404`.
- `GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}` — proxy: verify ownership via `Ticket` anchor, fetch attachment stream from Jira via `IJiraClient`, stream response with correct `Content-Type` and `Content-Disposition` headers. Do not buffer in memory — use `HttpClient.GetStreamAsync` and copy to `Response.Body`.
- `PATCH /api/tickets/{jiraIssueKey}/priority` — JSON body `{ "priority": "High" }`. Calls `IUpdateTicketPriorityUseCase`. Returns `200 OK` on success.

Error mappings via `ResultExtensions`: `ForbiddenError → 403`, `NotFoundError → 404`, `ConflictError → 409`, `ValidationError → 422`.

**Constraints:**
- `AdfToHtmlConverter` is internal — no public interface needed
- `GetCommentsAsync` is always called with `orderBy=-created` (established in TASK-07-A) so comments arrive newest-first; the use case does not re-sort
- `isPortalComment`: true if the ADF plain-text of the comment body starts with `[Portal]` (case-insensitive, after trimming)
- The attachment proxy must verify ownership before streaming — return `403` on mismatch, never expose Jira attachment URLs to the browser
- All use cases are `internal`, injected via interfaces (per backend-guidelines §2)

**Definition of Done:**
- [ ] `AdfToHtmlConverter` exists and handles all specified ADF node types
- [ ] All application DTOs exist in `Api.Application/Tickets/Dtos/`
- [ ] `ListTicketsUseCase` validates sort fields and date range; unknown sort → `422`; range > 184 days → `422`
- [ ] `GetTicketDetailUseCase` returns `403` for wrong client, `404` for missing ticket
- [ ] `UpdateTicketPriorityUseCase` returns `409` for closed ticket, `422` for invalid priority value
- [ ] `GET /api/tickets` returns `200 OK` with `PagedTicketListDto`
- [ ] `GET /api/tickets/{key}` returns `200 OK` with `TicketDetailDto` including HTML-converted description and comments
- [ ] `GET /api/tickets/{key}/attachments/{id}` streams the file with correct headers; wrong client → `403`
- [ ] `PATCH /api/tickets/{key}/priority` returns `200 OK` on success
- [ ] All endpoints return `401` for unauthenticated requests
- [ ] `dotnet build` succeeds

---

### TASK-02-B — Ticket list + detail frontend
**Wave:** 2 — delivers the client-facing ticket list and detail UI against real Jira data
**Repo:** client-portal
**Depends on:** TASK-02-A (all read endpoints live), TASK-01.6.2 (route guard)

**What to build:**

**(1) `/tickets` route — ticket list page**
- `DataTable` (shadcn/ui) rendering columns: title (clickable → detail), status (badge), priority (badge or inline selector — see inline selector below), creation date, resolution date (empty if null)
- **Filter panel**: multi-select status filter (`Popover` + `Command` checkbox list — options: `Created`, `In Progress`, `Waiting for Client Info`, `Resolved`, `Discarded`); date range `Select` with presets (`Today`, `Yesterday`, `Last 7 days`, `This Month`, `Last Month`, `Custom`); custom picker uses shadcn `Calendar`, disables dates > 184 days from selected start
- **Sort**: column headers are clickable; clicking active column toggles `sortDir`; clicking other column sets `sortBy` + resets `sortDir` to `desc`
- **Pagination**: page size selector (`Select`: 10/20/50); page controls (prev/next + current page / total pages)
- **URL state**: all filter, sort, and pagination values live exclusively in URL search params via `useSearchParams` — no `useState` duplication. `TanStack Query` key: `['tickets', searchParams.toString()]`
- **Inline priority selector**: for tickets with status `Created`, `In Progress`, `Waiting for Client Info` — render shadcn `Select` with options `Low`, `Medium`, `High`, `Critical`; call `PATCH /api/tickets/{key}/priority` via `useMutation` with optimistic rollback (`onMutate` snapshots prev value, `onError` restores via `setQueryData`, `onSettled` calls `invalidateQueries`); loading state disables selector and shows spinner; error shows row-level inline message
- **Empty states**: (a) no tickets at all — `Card` with "Create your first ticket" CTA to `/tickets/new`; (b) no results for filters — message + "Clear filters" action resetting all filter params
- **Error state**: shadcn `Alert` when API fails (Jira unavailable)
- Changing any filter or page size resets `page` to `1`
- All strings use i18n keys (per EPIC-10)

**(2) `/tickets/:jiraIssueKey` route — ticket detail page**
- Fetch `GET /api/tickets/:jiraIssueKey` via `useQuery` with `staleTime: 0` (always fresh)
- Render: title, description (HTML via `dangerouslySetInnerHTML` sanitised with DOMPurify), status badge, priority badge, type, creation date, resolution date (if present)
- **Comment thread**: `ScrollArea` with `max-h-[600px]`; comments rendered newest-first (as returned by API); each comment shows author name, relative timestamp, HTML body (DOMPurify sanitised), role distinction (portal comments vs team comments via different background or `[Portal]` label badge); attachment links within comments use proxy URL pattern
- **Attachments section**: ticket-level attachments listed with filename + download link (proxy URL)
- **Back navigation**: "Back to my tickets" button (`Button` variant `ghost`) that reads `location.state.listUrl` set by the list page when navigating; falls back to `/tickets` on direct navigation. List page passes `state: { listUrl: location.pathname + location.search }` when navigating to detail.
- **Error state**: `Alert` destructive variant + "Retry" button calling `refetch()`
- **Forbidden/not-found**: show a "Not found" view (no redirect loop)
- All strings use i18n keys (per EPIC-10)

**Constraints:**
- Install and use DOMPurify (`dompurify` + `@types/dompurify`) for all HTML rendering — never raw `dangerouslySetInnerHTML` without sanitisation
- Status filter multi-select must use repeated query params (`?status=Created&status=Resolved`), not comma-separated
- All URL-param-driven state derived from `useSearchParams` on every render — no `useState` mirroring
- Inline priority selector uses TanStack Query `useMutation` with optimistic rollback pattern
- Both routes protected by route guard from TASK-01.6.2

**Definition of Done:**
- [ ] `/tickets` renders paginated table with working sort, filter, and page size controls
- [ ] Filter, sort, and page state round-trip through URL — browser refresh restores the exact view
- [ ] Inline priority selector updates Jira and rolls back on error with row-level error message
- [ ] Empty state (no tickets) and error state (Jira down) are both shown correctly
- [ ] `/tickets/:jiraIssueKey` renders full ticket detail with HTML description and comment thread
- [ ] DOMPurify sanitises all HTML before rendering
- [ ] Comment thread is in a fixed-height scrollable container; portal vs team comments are visually distinguished
- [ ] "Back to my tickets" restores the list URL query string
- [ ] Unauthenticated access redirects to `/login`
- [ ] `npm run build` succeeds with no TypeScript errors

---

### TASK-02-C — Ticket creation
**Wave:** 3 — write path; blocked on TASK-07-B (write methods on `JiraClient` must exist)
**Repo:** api + client-portal
**Depends on:** TASK-07-B, TASK-02-B

**What to build:**

**(api) `UpdateTicketPriorityUseCase` and `PATCH /api/tickets/{key}/priority` endpoint** — already fully specified in TASK-02-A; these are implemented as part of TASK-02-A's backend output. No additional API work needed here — this entry is here for cross-reference only.

**(client-portal) `RichTextEditor` component**
- Create `client-portal/src/components/RichTextEditor.tsx` wrapping Tiptap
- Extensions: `StarterKit` (bold, italic, bullet list, ordered list, paragraph), `Underline`, `Code`
- Props: `value` (HTML string), `onChange` (callback), `maxLength` (number), `disabled` (bool), `compact` (bool, default `false`)
- Live character count via `editor.getText().length`; when count reaches `maxLength`, disable input and show warning label
- `compact={true}` renders at reduced minimum height (`min-h-[120px]`) — used for comment input in EPIC-03
- Shadcn/ui styling tokens for border, background, focus ring — no inline `style` props
- All i18n strings (placeholder, counter label, limit warning) use i18n keys

**(client-portal) `/tickets/new` route — ticket creation form**
- Form fields: title (`Input`, max 200 chars), description (`RichTextEditor`, max 5000 chars), type (`Select`: `Bug`, `Question`, `Feature Request`), priority (`Select`: `Low`, `Medium`, `High`, `Critical`), file input (`Input type="file" multiple`, max 10 files, max 10 MB each)
- React Hook Form for state; `RichTextEditor` integrated via `Controller`
- Client-side validation before submit: title required, description required, file count ≤ 10, file size ≤ 10 MB per file (show per-file error list)
- On submit: POST `multipart/form-data` to `POST /api/tickets` via `useMutation` with `FormData`
- On success: navigate to `/tickets/{jiraIssueKey}` and show success toast; if any file in `AttachmentResultDto` has `success: false`, show warning toast listing failed filenames alongside the navigation (do not block navigation)
- On Jira failure: show inline error message; do not navigate
- Submit button disabled + spinner while `isPending`
- "New ticket" button on the `/tickets` list page opens this route
- All labels and error messages use i18n keys

**Constraints:**
- `RichTextEditor` `compact` prop is additive — all existing prop behaviour unchanged for the creation form usage
- `FormData` POST: `title` and `description` as string fields, files as file entries
- Character count for description enforced on `editor.getText().length` (plain-text equivalent, not HTML markup length)

**Definition of Done:**
- [ ] `RichTextEditor` component exists with `compact` prop support
- [ ] Bold, italic, underline, bullet list, numbered list, inline code toolbar buttons work
- [ ] Live character count blocks input at `maxLength`
- [ ] `/tickets/new` form renders and submits `multipart/form-data`
- [ ] Files > 10 MB rejected client-side before submit
- [ ] More than 10 files rejected client-side
- [ ] Successful submission navigates to `/tickets/{jiraIssueKey}` with success toast
- [ ] Partial file failure shows warning toast but still navigates to the new ticket
- [ ] Jira failure shows inline error with no navigation
- [ ] `npm run build` succeeds with no TypeScript errors

> US-02.6 (scroll pagination) is v2 — no tasks defined here. `GetCommentsAsync` already accepts `startAt`/`pageSize` (TASK-07-A), making v2 non-breaking.

---

> **i18n note (EPIC-10):** All user-visible strings in this epic — including status labels (Created, In Progress, Waiting for Client Info, Resolved, Discarded), priority labels (Low, Medium, High, Critical), type labels (Bug, Question, Feature Request), empty-state messages, error messages, button labels, and date format patterns — must use i18n translation keys. The WYSIWYG description editor (US-02.3) should be configured with the user's active locale for correct spell-checking and input behaviour. The date range filter (US-02.1) date picker labels and predefined range names must also be translated. Status label mapping (US-02.1, US-02.4) must map Jira status values to translated portal labels — the mapping layer must look up the translated string from the i18n resources, not hardcode Spanish text.

> **Note for Architect:**
>
> **Dependencies to confirm before writing tasks:**
>
> **All decisions resolved.** The Architecture Note above and the merged tasks (TASK-02-A, TASK-02-B, TASK-02-C) encode the full resolution of all original open questions. Key decisions in summary:
> - `IJiraClient` read methods fully implemented in TASK-07-A (not stubbed). TASK-02-A consumes them directly.
> - Pagination: offset-based (`startAt`/`maxResults`) via Jira JQL, exposed as `page`/`pageSize` to frontend. Response envelope: `PagedTicketListDto` with `TotalCount`, `Page`, `PageSize`, `TotalPages`.
> - Sort: JQL `ORDER BY` clause; valid fields: `created`, `resolutiondate`, `priority`, `status`, `summary`.
> - Date range: `created` JQL field; 184-day cap enforced in use case (422) and UI (calendar disable).
> - Status mapping: Jira project statuses configured to match portal labels exactly (admin setup requirement).
> - Resolution date: nullable `DateTimeOffset?` in `JiraIssueDto`, passed through as nullable ISO string.
> - Priority change: `IJiraClient.UpdateIssueAsync` is defined in TASK-07-A; eligibility check in use case.
> - Ownership: `Ticket` anchor record lookup by `JiraIssueKey`, compare `ClientId` vs JWT `client_id`.
> - ADF conversion: frontend sends HTML; `api` converts HTML→ADF via `AdfBuilder` (write); Jira ADF→HTML via `AdfToHtmlConverter` (read).
> - Type field: maps to Jira label (`type:bug`, etc.) — not Jira issue type.
> - Attachment downloads: proxied through `GET /api/tickets/{key}/attachments/{id}` — never direct Jira URLs.
> - Comment order: `GetCommentsAsync` always sends `orderBy=-created`; no frontend sorting.
> - Comment attachments: `AdfToHtmlConverter` extracts `mediaSingle`/`media` nodes as anchor links; never silently dropped.
> - URL state: all filter/sort/page params live in URL search params via `useSearchParams`; back-navigation via `location.state.listUrl`.
> - Routes: `/tickets`, `/tickets/new`, `/tickets/:jiraIssueKey`.
