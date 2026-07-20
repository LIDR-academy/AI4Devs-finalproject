## MODIFIED Requirements

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

### Requirement: End a stream
The system SHALL expose `DELETE /streams/{id}` requiring proof of ownership via the stream's `creatorKey`, presented as `Authorization: Bearer <creatorKey>`. When the stream exists and the presented key matches (constant-time), it SHALL be removed — cascading to the room's messages and closing its live connections — and return `204 No Content`. When the stream exists but the key is missing or invalid, it SHALL return `403 Forbidden` and delete nothing. When the stream does not exist, it SHALL return `404 Not Found`. Ownership is proven only by the memory-held `creatorKey`; a creator who has lost the key (e.g. by reloading) can no longer end the stream, and no other participant can — an accepted v0 limitation until `security` provides real identity.

#### Scenario: Creator ends with a valid key
- **WHEN** the creator sends `DELETE /streams/{id}` with `Authorization: Bearer <valid creatorKey>`
- **THEN** the response is `204`, the stream and its messages are gone, live connections are closed, and it no longer appears in `GET /streams`

#### Scenario: Non-owner cannot end
- **WHEN** a caller sends `DELETE /streams/{id}` for an existing stream with a missing or invalid `creatorKey`
- **THEN** the response is `403` and the stream remains live

#### Scenario: Ending a nonexistent stream
- **WHEN** a caller sends `DELETE /streams/{id}` for an id that does not exist
- **THEN** the response is `404`
