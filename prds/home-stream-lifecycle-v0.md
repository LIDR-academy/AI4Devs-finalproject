# PRD — Home + Stream Lifecycle v0

- **Feature ID**: `home-stream-lifecycle-v0`
- **Status**: Approved by human
- **Scopes involved**: `qc-portal`, `streamer`, `devops`
- **Scopes NOT involved**: `security`, `users` (must not be touched)
- **Constitutions in force**: `CONSTITUTION.md`, `CONSTITUTION.ts.md` (qc-portal),
  `CONSTITUTION.go.md` (streamer), `CONSTITUTION.style.md` (qc-portal)

## 1. Summary

The first user-facing slice of QuickChat: a Home page listing live streams, the
ability to start a stream (title + optional description), and the ability to end
it. Streams are anonymous and stored in Valkey by the `streamer` service.
Deliberately minimal: no login, no security, no pagination, no realtime, no TTL.

## 2. Goals

- A visitor can see which streams are live right now.
- A visitor can start a stream with a title and optional description.
- A streamer can end their stream from the stream page.
- Valkey is part of the local environment, wired to `streamer`.

## 3. Non-Goals (explicitly out of scope)

- Authentication, authorization, user identity (anonymous streams are allowed
  and confirmed for this stage; ownership arrives with `security` later).
- Pagination, search, filtering.
- Realtime updates (no polling, no WebSocket on Home; refresh = reload).
- Stream TTL / automatic expiry. Lifecycle is manual: create and delete only.
- Actual media/streaming functionality. `/stream/{id}` is a placeholder page.
- Valkey persistence (ephemeral container, no volume).

## 4. User Stories

1. As a visitor, I open Home and see a list of live streams, each showing its title.
2. As a visitor, when no one is streaming, I see a single calm empty-state line.
3. As a visitor, I click **Start streaming** (top-right), fill in a required
   title and an optional description (≤ 100 chars), confirm, and land on my
   stream page.
4. As a visitor, I cancel the start flow and nothing is created.
5. As a streamer on `/stream/{id}`, I click **End stream**, the stream is
   removed, and I'm redirected to Home where it no longer appears.

## 5. Functional Requirements

### 5.1 qc-portal

**Home (`/`)**

- Fetches `GET /streams` once on page load. No polling.
- Renders the list of live streams: **title** is the displayed field.
  (`description` is received and stored client-side but not displayed in v0.)
- Empty state: one calm line (exact wording is the teammate's choice, within
  `CONSTITUTION.style.md`), e.g. "No one is streaming right now."
- Top-right of the page: **Start streaming** button (primary button per style law).

**Start flow**

- Triggered by the Start streaming button. Presentation (modal vs. inline) is
  the teammate's choice within the style constitution.
- Fields:
  - **Title** — required, non-empty. Client-side validation before submit.
  - **Description** — optional, max 100 characters. Enforced client-side
    (and by the server regardless).
- Confirmation copy: "Are you sure to start stream?" with actions
  **Start** / **Cancel**.
- **Start** → `POST /streams` → on `201`, redirect to `/stream/{id}` using the
  returned `id`. On `400`, show the validation error calmly (no alarm styling
  beyond what the style law allows).
- **Cancel** → close the flow, nothing created, no request sent.

**Stream page (`/stream/{id}`)**

- Placeholder content: a short text of the teammate's choosing.
- **End stream** button → `DELETE /streams/{id}` → on `204`, redirect to `/`.
  On `404` (already ended), also redirect to `/`.
- Anonymous model: anyone on this page can end the stream. This is accepted
  for v0 and will change when `security` enters.

### 5.2 streamer

- Owns the HTTP API and **Valkey as private storage**. The portal knows only
  the HTTP contract; Valkey never leaks into responses or errors.
- Endpoints per the wire contract (§6), with validation at the boundary:
  - `title`: required, non-empty after trimming.
  - `description`: optional, ≤ 100 characters.
- `id` generation is the service's choice (opaque string; URL-safe).
- A stream exists in Valkey ⇔ it is live. `DELETE` removes it. No TTL.
- Connection configuration for Valkey comes from environment variables
  (host/port/etc.), provided by the compose environment.

### 5.3 devops

- Add a **Valkey** container to the compose environment:
  - Ephemeral: no persistence volume.
  - Reachable by the `streamer` service; connection details exposed to
    `streamer` via environment variables.
- Read-only on all project code, as always. Environment files only.

## 6. Wire Contract — Law

Both `qc-portal` and `streamer` implement against this exactly. Any change is a
contract change and must go back through the team lead. `description` is
included in `GET` responses by design (stored now, displayed later) to avoid a
future contract change.

```
GET  /streams
  → 200 OK
    [ { "id": string, "title": string, "description": string } ]
    (empty array when no streams are live)

POST /streams
  body: { "title": string, "description"?: string }
  constraints: title required & non-empty (trimmed); description ≤ 100 chars
  → 201 Created
    { "id": string, "title": string, "description": string }
  → 400 Bad Request on validation failure

DELETE /streams/{id}
  → 204 No Content
  → 404 Not Found if the stream doesn't exist
```

Notes:

- `description` defaults to `""` when not provided.
- Error bodies: a small JSON shape of streamer's choice, stable and documented
  in its openspec — qc-portal must not depend on error body internals beyond
  displaying a message.

## 7. Style Requirements (qc-portal)

`CONSTITUTION.style.md` applies in full. Highlights the lead will check:

- Tokens only — no arbitrary colors or sizes. AA contrast. Visible focus states.
- 0 border radius, hairline borders, no shadows, no decorative motion.
- Start streaming = primary button; Cancel = secondary; forms per §6 of the
  style law. Empty state and placeholder page: calm, minimal, boring on purpose.

## 8. Acceptance Criteria

1. With no streams: Home shows the empty state and the Start streaming button.
2. Starting a stream with a valid title (with and without description) creates
   it, redirects to `/stream/{id}`, and it appears on Home afterward.
3. Starting with an empty title is blocked client-side; the server also rejects
   it with `400` (verified by streamer's tests).
4. Description over 100 chars is blocked client-side and rejected server-side.
5. Cancel creates nothing.
6. End stream removes the stream (gone from Valkey, gone from Home) and
   redirects to `/`. Ending an already-ended stream redirects home without error.
7. `docker compose up` brings up Valkey + streamer wired together; the portal
   works against it end to end.
8. Full test suites pass: `bun test` (qc-portal), `go test -race ./...` +
   `go vet` + linter (streamer). Evidence included in done reports.
9. qc-portal's done report explicitly states style-law compliance.

## 9. Delegation Plan (team lead)

- Record this feature in openspec; break into three deliverables:
  - `qc-portal`: Home, start flow, stream page (§5.1, §7).
  - `streamer`: API + Valkey storage (§5.2, §6).
  - `devops`: Valkey in compose (§5.3).
- Teammates run their own openspec workflow (proposal → spec → tasks →
  implementation) before any code.
- Sequencing is self-organized. The contract (§6) is already law, so qc-portal
  and streamer can build in parallel against it; teammates coordinate directly
  if blocked, keeping the lead informed.
- Feature stays **pending** until all three report done with evidence; the lead
  then presents the final summary. **The human has the final word on shipped.**

## 10. Resolved Decisions (for the record)

- Title/description are collected in the start flow (gap #1) — title required,
  description optional ≤ 100 chars.
- No TTL; manual end via button (gap #2). Kept extremely simple by design.
- Anonymous streams confirmed (gap #3).
- Route is `/stream/{id}`, id returned by the create endpoint (gap #4).
- Fetch-once list, no realtime; calm empty state (gap #5).
- Scope split confirmed (gap #6): streamer owns endpoints + Valkey privately;
  devops owns the container; security/users uninvolved.
- Dialog presentation delegated to qc-portal (gap #7).
- End-stream placement and semantics (lead's call, accepted by human): button
  on `/stream/{id}`, delete + redirect home, anyone can end (anonymous v0).
