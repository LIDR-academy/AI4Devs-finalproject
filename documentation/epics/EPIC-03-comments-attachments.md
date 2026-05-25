# EPIC-03 — Client Portal: Comments & Attachments
> Priority: 6 | Status: ✅ Stories + tasks defined

---

## Overview

Covers the interactive communication layer on an open ticket: clients can post comments and attach files to an existing ticket from the portal. The read side (rendering the comment thread and attachment list) is delivered by EPIC-02 (US-02.4); this epic owns the **write paths** for both comments and attachments on already-created tickets.

All comment and attachment data lives in Jira — there is no local `Comment` or `Attachment` table in SupportHub. The use cases for posting comments (`AddCommentUseCase`) and uploading attachments (`UploadAttachmentUseCase`) are defined in EPIC-07 and consumed here.

---

## Architecture Note

**Decisions resolved for this epic (sourced from the PO's "Note for Architect" block):**

### Ownership verification on comment post (US-03.1)
`AddCommentUseCase` (TASK-07.2.1) does not include an ownership guard — it accepts a `jiraIssueKey` directly. EPIC-03 adds this check: before calling `IJiraClient.AddCommentAsync`, the use case looks up the `Ticket` anchor record by `jiraIssueKey` and verifies that `Ticket.ClientId` matches the calling user's `clientId` (extracted from JWT in the controller). A mismatch returns `ForbiddenError`. This logic is added as an ownership-guard wrapper in `AddCommentUseCase` itself (the use case receives `clientId` in its command). No separate use case is needed.

### Ownership verification on attachment upload (US-03.2)
Same pattern as comments. `UploadAttachmentUseCase` (TASK-07.3.1) is extended to accept `clientId` in its command and performs the same `Ticket.ClientId` vs. JWT `clientId` check before calling S3 or Jira. If the `Ticket` anchor record is not found, the use case returns `NotFoundError`. If the `ClientId` does not match, it returns `ForbiddenError`.

> **Note on TASK-07.2.1 and TASK-07.3.1 modification:** EPIC-03 tasks will modify the command records and use case implementations defined in EPIC-07. The EPIC-07 tasks are the foundational definitions; EPIC-03 tasks add the ownership guard. This is captured as a constraint in the relevant tasks below.

### Comment post endpoint
`AddCommentUseCase` (TASK-07.2.1) exists in the application layer but no HTTP endpoint was defined in EPIC-07. EPIC-03 adds `POST /api/tickets/{jiraIssueKey}/comments` to `TicketsController`. Route follows the sub-collection convention from api-conventions.md §4.

### Attachment upload endpoint
`UploadAttachmentUseCase` (TASK-07.3.1) exists in the application layer but no HTTP endpoint was defined in EPIC-07. EPIC-03 adds `POST /api/tickets/{jiraIssueKey}/attachments` to `TicketsController`. The request is `multipart/form-data` (same pattern as `POST /api/tickets`). File size and count validation is enforced at the controller level — identical to TASK-07.1.6.

### Author display name
`AddCommentUseCase` accepts `authorDisplayName` in its command. The controller extracts this from the authenticated user's JWT `name` claim (or concatenates `given_name` + `family_name` as a fallback). It is never taken from a client-supplied request field.

### US-03.3 — attachment proxy
Confirmed: the attachment proxy endpoint (`GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}`) is fully implemented in TASK-02.4.1. The frontend download-link wiring was established in TASK-02.4.2. US-03.3 has no additional backend tasks. The only EPIC-03 work for US-03.3 is verifying that the download links are correctly wired in the comment input area and newly uploaded attachment list (covered by the frontend tasks below).

### RichTextEditor reuse for comment input (US-03.1)
The `RichTextEditor` component built in TASK-02.3.1 is reused for the comment input. A `compact` prop (or `minHeight` override) is added so it can render at a reduced height appropriate for an inline comment box, as opposed to the full-height creation form in `/tickets/new`. The same props interface (`value`, `onChange`, `maxLength`, `disabled`) is preserved — the `compact` prop is additive.

### Optimistic update vs. query invalidation (US-03.1)
**Decision: query invalidation** after a successful comment post. The frontend calls `invalidateQueries(['ticket', jiraIssueKey])` on success. This triggers a re-fetch of the full `TicketDetailDto`, which includes the fresh comment thread from Jira. Rationale: constructing a `CommentDto` client-side for optimistic insertion would require replicating server-side logic (ADF conversion, `isPortalComment` flag, timestamp formatting). The additional Jira round-trip is acceptable given the synchronous nature of comment posts and the low frequency of posting. The AC only requires the comment to appear "immediately" — a fast query invalidation + re-fetch satisfies this.

### v2 story (US-03.4)
Edit comment requires `IJiraClient.UpdateCommentAsync` — not yet declared. No tasks defined in this epic for US-03.4.

---

## User Stories

---

### US-03.1 — Post a comment on a ticket
> *As a client, I want to write and submit a comment on one of my tickets so that I can communicate with the support team directly in the portal without switching to email or WhatsApp.*

**Acceptance Criteria:**
- [ ] The ticket detail page (US-02.4) has a comment input area below the existing comment thread.
- [ ] The comment input is a rich text editor (WYSIWYG) supporting at minimum: bold, italic, underline, bullet lists, numbered lists, and inline code — the same editor used for ticket descriptions (US-02.3).
- [ ] The comment editor enforces a maximum content length of 5 000 characters (measured on the plain-text equivalent). A live character count is shown and submission is blocked once the limit is reached.
- [ ] A "Post comment" button submits the comment. The button is disabled and shows a loading indicator while the request is in progress.
- [ ] On success, the new comment appears at the top of the comment thread immediately (newest-first order) without a full page reload.
- [ ] The new comment shows the correct author name (the logged-in client user's display name) and the current timestamp.
- [ ] The new comment is visually styled as a portal comment, consistent with how other portal comments are displayed (US-02.4).
- [ ] If the Jira call fails, the client sees a clear inline error message and the comment input retains its content so the client can retry.
- [ ] After a successful submission, the comment input is cleared and ready for a new comment.
- [ ] Posting a comment does not navigate away from the ticket detail page.
- [ ] An empty comment cannot be submitted — the "Post comment" button remains disabled until the editor contains at least one non-whitespace character.
- [ ] The comment input area is only shown to authenticated client users; unauthenticated access redirects to the login page.

**Story Points:** 3

#### TASK-03.1.1 — Extend `AddCommentCommand` and `AddCommentUseCase` with ownership guard (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.2.1, TASK-07.1.3

**What to build:**
Extend the existing `AddCommentCommand` record (from TASK-07.2.1) to include a `ClientId` (Guid) field. Modify `AddCommentUseCase.ExecuteAsync` to: (1) look up the `Ticket` anchor record by `jiraIssueKey` — return `NotFoundError` if absent; (2) verify `Ticket.ClientId` matches `cmd.ClientId` — return `ForbiddenError` if not; (3) then call `IJiraClient.AddCommentAsync` as before. The `authorDisplayName` field in the command is already defined — no change needed there.

**Constraints:**
- `AddCommentCommand` is a `record` type — add `ClientId` as a positional or named property without breaking existing callers (per backend-guidelines §14 record conventions).
- The `Ticket` anchor record lookup uses the existing `ITicketRepository` already registered in DI — no new repository interface needed.
- `NotFoundError` and `ForbiddenError` are the typed error classes from `Application/Common/Errors/` (per backend-guidelines §3).
- No `Comment` table or entity — comments live in Jira exclusively (per Architecture Note).
- Single `ExecuteAsync(AddCommentCommand cmd, CancellationToken ct)` method returning `Task<Result<CommentDto>>`.

**Definition of Done:**
- [ ] `AddCommentCommand` has a `ClientId` (Guid) field.
- [ ] `AddCommentUseCase` performs the `Ticket` lookup and ownership check before calling Jira.
- [ ] A mismatched `ClientId` causes the use case to return a `ForbiddenError` result.
- [ ] A non-existent `jiraIssueKey` causes the use case to return a `NotFoundError` result.
- [ ] `dotnet build` succeeds.

---

#### TASK-03.1.2 — `POST /api/tickets/{jiraIssueKey}/comments` endpoint (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-03.1.1, TASK-07.1.6

**What to build:**
Add a `POST /api/tickets/{jiraIssueKey}/comments` action to `TicketsController`. It accepts a JSON body with a single `commentHtml` string field, maps it to an `AddCommentCommand` (injecting `jiraIssueKey` from the route, `clientId` from the JWT `client_id` claim, and `authorDisplayName` from the JWT `name` claim), calls `IAddCommentUseCase.ExecuteAsync`, and returns the result via `ResultExtensions`.

**Constraints:**
- Route: `POST /api/tickets/{jiraIssueKey}/comments` (per api-conventions.md §4 sub-collection create convention).
- `[Authorize]` required — JWT must be present; `client_id` claim populates `clientId`; `name` claim (fallback: `given_name` + `" "` + `family_name`) populates `authorDisplayName`. Never read these values from the request body.
- Request body is `application/json` — a simple record `AddCommentRequest(string CommentHtml)`. No file upload on this endpoint.
- `ForbiddenError` → `403`, `NotFoundError` → `404`, validation errors → `422`, Jira failures → `400`.
- On success, returns `201 Created` with the `CommentDto` body.
- Controller must not contain business logic — claim extraction and command mapping are the only non-trivial lines.

**Definition of Done:**
- [ ] `POST /api/tickets/{jiraIssueKey}/comments` with a valid JWT and body returns `201 Created` with a `CommentDto`.
- [ ] Empty or whitespace-only `commentHtml` returns `422`.
- [ ] A `jiraIssueKey` belonging to a different client returns `403`.
- [ ] A non-existent `jiraIssueKey` returns `404`.
- [ ] An unauthenticated request returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-03.1.3 — `compact` prop on `RichTextEditor` (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.3.1

**What to build:**
Add a `compact` boolean prop to the existing `RichTextEditor` component (`client-portal/src/components/RichTextEditor.tsx`). When `compact` is `true`, the editor renders with a reduced minimum height suitable for an inline comment input (e.g. `min-h-[120px]` instead of the full form height). All other props and behaviour (`value`, `onChange`, `maxLength`, `disabled`, live character count, input blocking at limit) are unchanged. The `compact` prop defaults to `false` so existing usages are unaffected.

**Constraints:**
- The `compact` prop is additive — do not modify any existing prop or behaviour.
- Use a shadcn/ui-compatible Tailwind class for the height override — no inline `style` props.
- The component must still display the character counter and toolbar in compact mode.
- `npm run build` must succeed with no TypeScript errors after the change.

**Definition of Done:**
- [ ] `RichTextEditor` accepts a `compact` boolean prop (default `false`).
- [ ] When `compact={true}`, the editor renders at a visually smaller height.
- [ ] Existing `RichTextEditor` usages (in `/tickets/new`) are unaffected.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-03.1.4 — Comment input and post action on ticket detail page (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-03.1.3, TASK-02.4.2, TASK-03.1.2

**What to build:**
Add a comment input section below the comment thread on the `/tickets/:jiraIssueKey` detail page. The section contains: a compact `RichTextEditor` (`compact={true}`, `maxLength={5000}`), a "Post comment" shadcn `Button` that is disabled when the editor is empty (plain-text length is zero) or when a submission is in flight. On submit, call `POST /api/tickets/{jiraIssueKey}/comments` via a `useMutation`. On success, call `invalidateQueries(['ticket', jiraIssueKey])` to refresh the thread, then clear the editor. On error, display a shadcn `Alert` (destructive variant) inline below the editor — do not clear the editor content on error.

**Constraints:**
- The `RichTextEditor` value is controlled by local `useState` (comment body only — not URL-persisted).
- "Post comment" button is disabled when `editor.getText().trim().length === 0` or when `isPending` is `true`. Show a spinner inside the button while `isPending`.
- On success: call `invalidateQueries(['ticket', jiraIssueKey])` then reset the editor to an empty string — do not navigate away.
- On error: show an inline shadcn `Alert` with the API error message below the editor. The editor content must not be cleared.
- The comment input section is visible only to authenticated users (route is already protected by TASK-02.4.2's route guard — no additional guard needed here).
- All user-visible strings (button label, error message, counter label) use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] The compact comment editor appears below the comment thread on the ticket detail page.
- [ ] "Post comment" button is disabled while the editor is empty or while the mutation is in flight.
- [ ] A successful post invalidates the ticket query and the new comment appears in the refreshed thread.
- [ ] After success, the editor is cleared.
- [ ] On API failure, the editor content is retained and an inline error is displayed.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-03.2 — Attach a file to an existing ticket
> *As a client, I want to upload additional files to an existing ticket so that I can share further evidence or documents with the support team even after the ticket has been created.*

**Acceptance Criteria:**
- [ ] The ticket detail page has an "Attach file" action (e.g. a button or drag-and-drop zone) in the attachments section.
- [ ] The client can select one or more files to attach. File size limit per file is 10 MB; maximum number of files per upload action is 10.
- [ ] Accepted file types are not restricted in v1 (any MIME type is allowed subject to the size limit).
- [ ] While files are uploading, a per-file progress indicator or loading state is shown and the attach action is disabled to prevent duplicate submissions.
- [ ] On success, the newly attached file(s) appear in the ticket's attachments section immediately, with their filename and a download link.
- [ ] If the upload fails (S3 error or Jira push error), the client sees a clear error message identifying which files failed. Successfully uploaded files are still shown; the client can retry failed files.
- [ ] Files are rejected client-side before submission if they exceed the size limit — the client sees a per-file validation error before the request is made.
- [ ] More than 10 files selected in a single action triggers a client-side validation error, not a server round-trip.
- [ ] Uploading a file does not navigate away from the ticket detail page and does not affect the comment thread.
- [ ] The attach action is only visible to authenticated client users.

**Story Points:** 3

#### TASK-03.2.1 — Extend `UploadAttachmentCommand` and `UploadAttachmentUseCase` with ownership guard (api)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-07.3.1, TASK-07.1.3

**What to build:**
Extend the existing `UploadAttachmentCommand` record (from TASK-07.3.1) to include a `ClientId` (Guid) field. Modify `UploadAttachmentUseCase.ExecuteAsync` to: (1) look up the `Ticket` anchor record by `jiraIssueKey` — return `NotFoundError` if absent; (2) verify `Ticket.ClientId` matches `cmd.ClientId` — return `ForbiddenError` if not; (3) then proceed with S3 upload then Jira attachment push as before.

**Constraints:**
- `UploadAttachmentCommand` is a `record` — add `ClientId` as a field without breaking the existing command shape (per backend-guidelines §14).
- The `Ticket` anchor record lookup uses the existing `ITicketRepository` — no new repository interface needed.
- `NotFoundError` and `ForbiddenError` are typed error classes from `Application/Common/Errors/` (per backend-guidelines §3).
- S3 upload and Jira push sequence is unchanged from TASK-07.3.1: S3 first, then Jira — ownership check runs before both.
- No `Attachment` table or entity — attachments live in S3 and Jira (per Architecture Note).
- Single `ExecuteAsync(UploadAttachmentCommand cmd, CancellationToken ct)` returning `Task<Result<AttachmentDto>>`.

**Definition of Done:**
- [ ] `UploadAttachmentCommand` has a `ClientId` (Guid) field.
- [ ] `UploadAttachmentUseCase` performs the `Ticket` lookup and ownership check before any S3 or Jira call.
- [ ] A mismatched `ClientId` returns `ForbiddenError` — no S3 or Jira call is made.
- [ ] A non-existent `jiraIssueKey` returns `NotFoundError` — no S3 or Jira call is made.
- [ ] `dotnet build` succeeds.

---

#### TASK-03.2.2 — `POST /api/tickets/{jiraIssueKey}/attachments` endpoint (api)
**Layer:** API
**Repo:** api
**Depends on:** TASK-03.2.1, TASK-07.1.6

**What to build:**
Add a `POST /api/tickets/{jiraIssueKey}/attachments` action to `TicketsController`. It accepts a `multipart/form-data` request with one or more files (bound as `IFormFileCollection`). The action validates file count (≤ 10) and per-file size (≤ 10 MB) at the controller level before invoking any use case. For each valid file, it builds an `UploadAttachmentCommand` (injecting `jiraIssueKey` from the route, `clientId` from the JWT `client_id` claim) and calls `IUploadAttachmentUseCase.ExecuteAsync`. Collects results per file (success + `AttachmentDto`, or failure + error reason) and returns a unified response.

**Constraints:**
- Route: `POST /api/tickets/{jiraIssueKey}/attachments` (per api-conventions.md §4).
- `[Authorize]` required; `client_id` from JWT claim — never from request body.
- Per-file size validation: reject files > 10 MB with `422` before any use case call. Per api-conventions §1, use `[RequestSizeLimit]` or Kestrel config appropriate for up to 10 files × 10 MB.
- File count validation: if `files.Count > 10`, return `422` immediately before any use case call.
- Files are processed sequentially (not in parallel) to avoid overwhelming S3 or Jira with concurrent uploads.
- Response shape: a JSON array of `AttachmentUploadResultDto` (`fileName`, `success` bool, `attachment` (nullable `AttachmentDto`), `error` (nullable string)). Return `200 OK` if at least one file succeeds; `422` if all files fail validation; `400` if all files fail at the use case level (Jira/S3 failure).
- Content-Type for the endpoint must be `multipart/form-data`.

**Definition of Done:**
- [ ] `POST /api/tickets/{jiraIssueKey}/attachments` with one valid file returns `200 OK` with a single-entry result array containing `success: true`.
- [ ] A file exceeding 10 MB is rejected with `422` before the use case is invoked.
- [ ] More than 10 files returns `422` before any use case call.
- [ ] A `jiraIssueKey` belonging to a different client returns `403`.
- [ ] An unauthenticated request returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-03.2.3 — File attachment UI on ticket detail page (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-02.4.2, TASK-03.2.2

**What to build:**
Add an "Attach file" section to the attachments area of the `/tickets/:jiraIssueKey` detail page. The section contains a shadcn `Input type="file" multiple` (or a styled drop zone using shadcn primitives) and an "Attach" button. Client-side validation runs before the request: reject files > 10 MB per file or > 10 files total, showing a per-file error list. On submit, POST `multipart/form-data` to `POST /api/tickets/{jiraIssueKey}/attachments` via a `useMutation`. While the mutation is in flight, disable the attach button and show a loading state. On success, call `invalidateQueries(['ticket', jiraIssueKey])` to refresh the attachment list. On partial or full failure, show a per-file error message identifying which files failed; successfully attached files appear in the refreshed list.

**Constraints:**
- Client-side validation runs synchronously on file selection change — before the user clicks "Attach". Show errors inline below the file input.
- File size limit display: show the 10 MB limit and 10-file maximum as helper text next to the input.
- While mutation is in flight: disable the attach button, show a spinner or loading indicator. The comment input area must remain functional — the two sections are independent.
- On success: `invalidateQueries(['ticket', jiraIssueKey])`, then clear the file input. Do not navigate away.
- On partial failure: the error list names each failed file and its reason. Already-successful files are shown in the attachment list from the re-fetched query.
- All user-visible strings use i18n keys (per EPIC-10 note).

**Definition of Done:**
- [ ] "Attach file" input and button appear in the attachments section of the ticket detail page.
- [ ] Files > 10 MB are rejected with a per-file error before the request is sent.
- [ ] More than 10 files selected triggers an error before the request is sent.
- [ ] On success, the attachment list refreshes showing the new file(s) with download links.
- [ ] On API failure, per-file errors are displayed and the page does not navigate away.
- [ ] The comment input area is unaffected during file upload.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-03.3 — Download a ticket attachment
> *As a client, I want to download any file attached to a ticket so that I can retrieve documents, screenshots, or evidence that I or the team added to the request.*

**Acceptance Criteria:**
- [ ] Every attachment listed on the ticket detail page — whether attached at creation or afterwards, and whether attached by the client or visible in the comment thread — has a clearly labelled download link or button.
- [ ] Clicking the link downloads (or opens in browser) the file with its original filename preserved.
- [ ] Attachment downloads are served via the portal's own API proxy — Jira credentials are never exposed to the browser.
- [ ] A client can only download attachments belonging to their own tickets — attempting to access an attachment on a ticket from a different client organisation returns a "not found" or "forbidden" response.
- [ ] Download links work for both ticket-level attachments and for attachment links extracted from comment bodies (v1 fallback for ADF media nodes, as defined in EPIC-02 Architecture Note).

**Story Points:** 1

> **No additional backend tasks.** The attachment proxy endpoint (`GET /api/tickets/{jiraIssueKey}/attachments/{attachmentId}`) is fully implemented in TASK-02.4.1, including ownership verification. Download link rendering for ticket-level and comment-level attachments is implemented in TASK-02.4.2. US-03.3 is satisfied by the existing EPIC-02 implementation.

> The only EPIC-03 verification needed is that newly uploaded attachments (from US-03.2) appear in the refreshed attachment list with correct proxy URLs — confirmed by TASK-03.2.3's `invalidateQueries` on success.

---

### US-03.4 — Edit a previously posted comment *(v2 desirable)*
> *As a client, I want to correct a comment I posted so that I can fix typos or clarify what I wrote without the conversation becoming confusing.*

**Acceptance Criteria:**
- [ ] Each portal comment authored by the logged-in user has an "Edit" action visible only to its author.
- [ ] Activating the edit action opens the comment body in an inline editor pre-filled with the existing content.
- [ ] The same character limit (5 000 characters) and editor capabilities apply as for posting a new comment (US-03.1).
- [ ] Saving the edit updates the comment in Jira. An "(edited)" indicator is visible on the comment after saving.
- [ ] Cancelling the edit discards changes and restores the read-only view without any network call.
- [ ] If the Jira update fails, the client sees a clear error message and the original comment text is preserved.
- [ ] Comments posted by the Jira team cannot be edited from the portal — no edit action is shown on team comments.

> **Note:** This story is scoped to **v2**. v1 delivers comment creation (US-03.1) only. This story depends on the backend adding an update-comment method to `IJiraClient`. The Jira endpoint is `PUT /rest/api/3/issue/{issueKey}/comment/{commentId}`.

**Story Points:** 3

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-03.1 | Post a comment on a ticket | 3 |
| US-03.2 | Attach a file to an existing ticket | 3 |
| US-03.3 | Download a ticket attachment | 1 |
| US-03.4 *(v2)* | Edit a previously posted comment | 3 |
| **Total (v1)** | | **7** |

---

## Task Breakdown

| Task | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-03.1.1 | Extend `AddCommentCommand`/`AddCommentUseCase` with ownership guard | US-03.1 | api | TASK-07.2.1, TASK-07.1.3 |
| TASK-03.1.2 | `POST /api/tickets/{jiraIssueKey}/comments` endpoint | US-03.1 | api | TASK-03.1.1, TASK-07.1.6 |
| TASK-03.1.3 | `compact` prop on `RichTextEditor` | US-03.1 | client-portal | TASK-02.3.1 |
| TASK-03.1.4 | Comment input and post action on ticket detail page | US-03.1 | client-portal | TASK-03.1.3, TASK-02.4.2, TASK-03.1.2 |
| TASK-03.2.1 | Extend `UploadAttachmentCommand`/`UploadAttachmentUseCase` with ownership guard | US-03.2 | api | TASK-07.3.1, TASK-07.1.3 |
| TASK-03.2.2 | `POST /api/tickets/{jiraIssueKey}/attachments` endpoint | US-03.2 | api | TASK-03.2.1, TASK-07.1.6 |
| TASK-03.2.3 | File attachment UI on ticket detail page | US-03.2 | client-portal | TASK-02.4.2, TASK-03.2.2 |
| *(no tasks)* | US-03.3 covered by TASK-02.4.1 + TASK-02.4.2 (EPIC-02) | US-03.3 | — | TASK-02.4.1, TASK-02.4.2 |

---

> **Note for Tech Lead:**
>
> - **Modifying EPIC-07 use cases**: TASK-03.1.1 and TASK-03.2.1 modify the command records and use case implementations that were defined in EPIC-07. This is intentional — the ownership guard is a EPIC-03 concern (the portal UI layer), not EPIC-07 (the pure Jira integration layer). Openspec should treat these tasks as patches to existing files, not new files.
>
> - **No HTML→ADF conversion for comments**: the comment body is sent as HTML from the frontend (same as descriptions). The existing `AddCommentUseCase` already converts the body to ADF via the `AdfBuilder` internal utility (established in EPIC-07's Architecture Note). No new ADF tooling is needed for EPIC-03. TASK-03.1.2 passes the raw HTML from the request body as `commentHtml` to the command; the use case performs the ADF conversion before calling Jira.
>
> - **`AttachmentUploadResultDto` vs `AttachmentDto`**: the endpoint in TASK-03.2.2 returns a per-file result array. Define `AttachmentUploadResultDto` in `Api.Application/Tickets/Dtos/` (reusing `AttachmentDto` for the success payload). This is a new DTO not previously defined — add it in TASK-03.2.2.
>
> - **JWT claim for author display name**: the `name` standard claim should be issued by OpenIddict's identity server (EPIC-01). If `name` is not present in the token, the fallback concatenation (`given_name` + `" "` + `family_name`) is performed in the controller. Document this fallback in TASK-03.1.2's constraints so openspec applies it correctly.
>
> - **US-03.3 is a zero-task story**: the backend proxy and frontend wiring are covered by EPIC-02. The story's acceptance criteria are verified through TASK-02.4.1 and TASK-02.4.2. No EPIC-03 tasks are opened for US-03.3 — the story closes when its ACs are verified against the existing EPIC-02 implementation.
>
> - **v2 story (US-03.4)**: edit comment requires `IJiraClient.UpdateCommentAsync` — not yet declared. Flag for EPIC-03 v2 planning. No tasks in this epic.
