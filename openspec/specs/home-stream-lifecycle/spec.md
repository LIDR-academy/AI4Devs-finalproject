# home-stream-lifecycle Specification

## Purpose
TBD - created by archiving change home-stream-lifecycle-v0. Update Purpose after archive.
## Requirements
### Requirement: List live streams
The system SHALL expose `GET /streams` returning `200 OK` with a JSON array of live streams, each `{ "id": string, "username": string, "title": string, "description": string }`, and an empty array when none are live. A stream is live if and only if it exists in streamer's storage. `description` SHALL always be present, defaulting to `""`. `creatorKey` SHALL NEVER appear in this listing.

#### Scenario: Streams are live
- **WHEN** a client sends `GET /streams` and two streams are live
- **THEN** the response is `200` with a JSON array of two objects, each carrying `id`, `username`, `title`, and `description`, and no `creatorKey`

#### Scenario: No streams are live
- **WHEN** a client sends `GET /streams` and none are live
- **THEN** the response is `200` with an empty JSON array `[]`

### Requirement: Start a stream
The system SHALL expose `POST /streams` accepting `{ "username": string, "title": string, "description"?: string }`. `username` and `title` MUST be non-empty after trimming; `description` MUST be at most 100 Unicode code points. On success the system SHALL create the stream and return `201 Created` with `{ "id": string, "username": string, "title": string, "description": string, "creatorKey": string }`, where `id` is an opaque URL-safe string and `creatorKey` is an opaque credential. On validation failure it SHALL return `400 Bad Request`. `description` defaults to `""` when absent. `creatorKey` SHALL be returned only in this `201` response and never elsewhere.

#### Scenario: Valid start with username and title only
- **WHEN** a client sends `POST /streams` with a non-empty `username` and `title` and no `description`
- **THEN** the response is `201` with an `id`, the `username`, the `title`, `description` equal to `""`, and a `creatorKey`, and the stream then appears in `GET /streams` (without `creatorKey`)

#### Scenario: Valid start with description
- **WHEN** a client sends `POST /streams` with non-empty `username` and `title` and a `description` of 100 code points or fewer
- **THEN** the response is `201` and the returned object echoes `username`, `title`, and `description`

#### Scenario: Empty username rejected
- **WHEN** a client sends `POST /streams` with a `username` that is empty or whitespace-only
- **THEN** the response is `400` and no stream is created

#### Scenario: Empty title rejected
- **WHEN** a client sends `POST /streams` with a `title` that is empty or whitespace-only
- **THEN** the response is `400` and no stream is created

#### Scenario: Over-long description rejected
- **WHEN** a client sends `POST /streams` with a `description` longer than 100 Unicode code points
- **THEN** the response is `400` and no stream is created

### Requirement: End a stream
The system SHALL expose `DELETE /streams/{id}`. When the room has an **active LiveKit publisher**, the request MUST prove ownership via the stream's `creatorKey` as `Authorization: Bearer <creatorKey>` (constant-time match) — match → delete, missing/invalid → `403 Forbidden` (delete nothing). When the room has **no active publisher** (abandoned), the request MAY succeed **without** a key (the escape hatch, so a reloaded creator's room is never un-endable). On a successful delete the system SHALL remove the stream and cascade — deleting the room's messages, closing its live chat connections, and **deleting the LiveKit room via the server API so all media participants are disconnected** — and return `204 No Content`. If LiveKit is unreachable, the Valkey delete SHALL still succeed and the error SHALL be logged (the room dies with its token source regardless). When the stream does not exist, it SHALL return `404 Not Found`.

#### Scenario: Creator ends a live room with a valid key
- **WHEN** the creator sends `DELETE /streams/{id}` with `Authorization: Bearer <valid creatorKey>` for a room with an active publisher
- **THEN** the response is `204`, the stream and its messages are gone, the LiveKit room is deleted (participants disconnected), live chat connections are closed, and it no longer appears in `GET /streams`

#### Scenario: Non-owner cannot end a live room
- **WHEN** a caller sends `DELETE /streams/{id}` for a room with an active publisher, with a missing or invalid `creatorKey`
- **THEN** the response is `403` and nothing is deleted

#### Scenario: Abandoned room can be ended without a key
- **WHEN** a caller sends `DELETE /streams/{id}` for an existing room that has no active LiveKit publisher
- **THEN** the response is `204` and the stream, its messages, and its LiveKit room are removed

#### Scenario: LiveKit unreachable during delete
- **WHEN** a delete is authorized but the LiveKit server API is unreachable
- **THEN** the Valkey stream and messages are still deleted, the response is `204`, and the LiveKit error is logged (not surfaced in the body)

#### Scenario: Ending a nonexistent stream
- **WHEN** a caller sends `DELETE /streams/{id}` for an id that does not exist
- **THEN** the response is `404`

### Requirement: Consistent length counting across scopes
The system SHALL count `description` length in Unicode code points identically on the client and the server, so that any value the client accepts the server also accepts and vice versa.

#### Scenario: Multi-byte description at the boundary
- **WHEN** a `description` of exactly 100 code points containing multi-byte characters is submitted
- **THEN** both client-side validation and server-side validation accept it, and 101 code points is rejected by both

### Requirement: Stable error body
The system SHALL return error responses with a stable JSON body `{ "error": string }` carrying a human-readable message, using the same shape for 400, 404, 405, and 500. Consumers SHALL depend only on the HTTP status and MAY display the message, but SHALL NOT depend on any other body internals.

#### Scenario: Validation error body
- **WHEN** a request fails validation
- **THEN** the response status is `400` and the body is a JSON object with a string `error` field

### Requirement: Home page lists live streams
The portal Home page (`/`) SHALL fetch `GET /streams` once on load with no polling, and render each live stream showing its `username` (as a mono label, per style §5) and its `title`. Each listed stream SHALL be a clickable, keyboard-accessible control (with a visible focus state per the style law) that navigates to that stream's room at `/stream/{id}`. When the array is empty it SHALL show a single calm empty-state line. It SHALL present a **Start streaming** primary action. `description` is received but not shown.

#### Scenario: Home with live streams
- **WHEN** a visitor opens `/` and streams are live
- **THEN** each stream's username and title are listed as a clickable item, and the Start streaming action is visible

#### Scenario: Clicking a stream enters its room
- **WHEN** a visitor clicks (or activates via keyboard) a listed stream
- **THEN** the portal navigates to that stream's room at `/stream/{id}`

#### Scenario: Home with no streams
- **WHEN** a visitor opens `/` and no streams are live
- **THEN** a single calm empty-state line is shown and the Start streaming action is visible

### Requirement: Start flow
The portal SHALL provide a start flow with a required `username` (first field), a required `title`, and an optional `description` (≤ 100 code points, validated client-side before submit), displayed in the order username, title, description, and a confirmation "Are you sure to start stream?" with **Start** and **Cancel**. On **Start** it SHALL `POST /streams` and, on `201`, keep the returned `creatorKey` in memory only (never localStorage) and redirect to `/stream/{id}` using the returned `id`; on `400` it SHALL show the validation error calmly. On **Cancel** it SHALL create nothing and send no request.

#### Scenario: Start succeeds
- **WHEN** the visitor confirms Start with a valid username and title
- **THEN** the portal POSTs, receives `201`, retains `creatorKey` in memory, and navigates to `/stream/{id}`

#### Scenario: Cancel creates nothing
- **WHEN** the visitor cancels the start flow
- **THEN** no request is sent and no stream is created

#### Scenario: Client blocks invalid input
- **WHEN** the visitor submits an empty username, an empty title, or a description over 100 code points
- **THEN** the portal blocks submission client-side and shows a calm validation message

### Requirement: Stream page and end
The portal stream page (`/stream/{id}`) SHALL show placeholder content and an **End stream** action that sends `DELETE /streams/{id}`, redirecting to `/` on both `204` and `404`.

#### Scenario: End from the stream page
- **WHEN** the visitor clicks End stream and the server returns `204`
- **THEN** the portal redirects to `/` where the stream no longer appears

#### Scenario: End an already-removed stream
- **WHEN** End stream returns `404`
- **THEN** the portal still redirects to `/` without showing an error

### Requirement: Single-origin runtime brings the slice up end to end
`docker compose up` SHALL bring up Valkey, streamer, the portal (served static), and a reverse proxy that presents a single browser-facing origin, routing `/streams*` to streamer and all other paths to the portal (with SPA fallback). Streamer SHALL be reachable by the browser without CORS, and SHALL only be considered ready once Valkey is reachable.

#### Scenario: Compose end to end
- **WHEN** an operator runs `docker compose up`
- **THEN** Valkey and streamer come up wired together, streamer's `/readyz` returns `200`, and the portal works against the API end to end through the single origin

#### Scenario: Streamer waits for Valkey
- **WHEN** streamer starts before Valkey is reachable
- **THEN** `/readyz` returns `503` until Valkey is reachable, and compose does not report streamer ready

