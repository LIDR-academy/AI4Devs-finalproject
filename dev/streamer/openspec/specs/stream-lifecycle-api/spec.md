# stream-lifecycle-api Specification

## Purpose
TBD - created by archiving change home-stream-lifecycle-v0. Update Purpose after archive.
## Requirements
### Requirement: List live streams
The service SHALL expose `GET /streams` returning `200 OK` with a JSON array of live streams, each object `{ "id": string, "username": string, "title": string, "description": string }`. A stream is live if and only if it exists in Valkey storage. `description` SHALL always be present, defaulting to `""`. The array SHALL be empty when no streams are live. Ordering of the array is unspecified in v0. `creatorKey` SHALL NEVER appear in this listing, and Valkey details SHALL NOT appear in the response.

#### Scenario: Two streams are live
- **WHEN** a client sends `GET /streams` and two streams are live
- **THEN** the response is `200` with a JSON array of two objects, each carrying `id`, `username`, `title`, and `description`, and no `creatorKey`

#### Scenario: No streams are live
- **WHEN** a client sends `GET /streams` and none are live
- **THEN** the response is `200` with an empty JSON array `[]`

### Requirement: Start a stream
The service SHALL expose `POST /streams` accepting a JSON body `{ "username": string, "title": string, "description"?: string }`. It SHALL enforce, at the boundary: request body at most 8 KB; `username` non-empty after trimming and at most 200 Unicode code points; `title` non-empty after trimming and at most 200 Unicode code points; `description` optional and at most 100 Unicode code points, defaulting to `""` when absent. On success the service SHALL persist the stream in Valkey — including a private `creatorKey` — and return `201 Created` with `{ "id": string, "username": string, "title": string, "description": string, "creatorKey": string }`, where `id` is an opaque, URL-safe string and `creatorKey` is an opaque credential generated with a cryptographic random source. On any validation failure it SHALL return `400 Bad Request` and create no stream. The stored `username` and `title` SHALL be the trimmed values. `creatorKey` SHALL be returned only in this `201` response and SHALL NEVER appear in any listing, history, error, or log. Unknown JSON fields SHALL be ignored.

#### Scenario: Valid start with username and title only
- **WHEN** a client sends `POST /streams` with a non-empty `username` and `title` and no `description`
- **THEN** the response is `201` with an `id`, the trimmed `username`, the trimmed `title`, `description` equal to `""`, and a `creatorKey`, and the stream then appears in `GET /streams` without `creatorKey`

#### Scenario: Valid start with description
- **WHEN** a client sends `POST /streams` with a non-empty `username` and `title` and a `description` of 100 code points or fewer
- **THEN** the response is `201` and the returned object echoes the trimmed `username`, the trimmed `title`, and the `description`

#### Scenario: Empty or whitespace-only username rejected
- **WHEN** a client sends `POST /streams` with a `username` that is empty or only whitespace
- **THEN** the response is `400`, the body is the standard error shape, and no stream is created

#### Scenario: Empty or whitespace-only title rejected
- **WHEN** a client sends `POST /streams` with a `title` that is empty or only whitespace
- **THEN** the response is `400`, the body is the standard error shape, and no stream is created

#### Scenario: Over-long title rejected
- **WHEN** a client sends `POST /streams` with a `title` longer than 200 Unicode code points
- **THEN** the response is `400` and no stream is created

#### Scenario: Over-long description rejected
- **WHEN** a client sends `POST /streams` with a `description` longer than 100 Unicode code points
- **THEN** the response is `400` and no stream is created

#### Scenario: Malformed or oversized body rejected
- **WHEN** a client sends `POST /streams` with a body that is not valid JSON or exceeds 8 KB
- **THEN** the response is `400` and no stream is created

### Requirement: End a stream
The service SHALL expose `DELETE /streams/{id}` requiring proof of ownership via the stream's `creatorKey`, presented as an `Authorization: Bearer <creatorKey>` header. The service SHALL verify the presented key against the stored key with a constant-time comparison. When the stream exists and the key matches, it SHALL be removed from Valkey — cascading to the room's stored messages and closing the room's live connections — and return `204 No Content`. When the stream exists but the key is missing or invalid, it SHALL return `403 Forbidden` and delete nothing (the stream stays live). When the stream does not exist, it SHALL return `404 Not Found`. Ownership is proven only by the memory-held `creatorKey`; a creator who has lost it (e.g. by reloading) can no longer end the stream, and no other participant can — an accepted v0 limitation until `security` provides real identity. Deleting a stream SHALL NOT leave orphaned message storage.

#### Scenario: Creator ends with a valid key
- **WHEN** a client sends `DELETE /streams/{id}` for a live stream with `Authorization: Bearer <valid creatorKey>`
- **THEN** the response is `204`, the stream no longer appears in `GET /streams`, the room's stored messages are removed, and its live connections are closed

#### Scenario: Non-owner cannot end
- **WHEN** a client sends `DELETE /streams/{id}` for a live stream with a missing or invalid `creatorKey`
- **THEN** the response is `403` with the standard error shape and the stream remains live with its messages intact

#### Scenario: End a nonexistent stream
- **WHEN** a client sends `DELETE /streams/{id}` for an id that is not live
- **THEN** the response is `404` with the standard error shape

### Requirement: Consistent length counting
The service SHALL count `title` and `description` length in Unicode code points (`utf8.RuneCountInString`), so that a `description` the portal accepts by code-point count the service also accepts, and vice versa.

#### Scenario: Multi-byte description at the boundary
- **WHEN** a `description` of exactly 100 code points containing multi-byte characters is submitted
- **THEN** the service accepts it with `201`, and a `description` of 101 code points is rejected with `400`

### Requirement: Stable error body
The service SHALL return every error response with a stable JSON body `{ "error": string }` carrying a human-readable message, using the same shape for `400`, `404`, `405`, and `500`. The message SHALL NOT contain Valkey details, secrets, or other sensitive data. Consumers depend only on the HTTP status and MAY display the message.

#### Scenario: Validation error body
- **WHEN** a request fails validation
- **THEN** the status is `400` and the body is a JSON object with a string `error` field

#### Scenario: Unsupported method
- **WHEN** a client sends an unsupported HTTP method to a streams route (for example `PUT /streams`)
- **THEN** the status is `405` and the body is the standard error shape

### Requirement: Health and readiness endpoints
The service SHALL expose `GET /healthz` returning `200` whenever the process is running (liveness), and `GET /readyz` returning `200` when Valkey is reachable and `503` when it is not (readiness). These endpoints are outside the §6 streams contract and SHALL NOT expose Valkey connection details.

#### Scenario: Liveness while running
- **WHEN** a client sends `GET /healthz` and the process is running
- **THEN** the response is `200`

#### Scenario: Readiness reflects Valkey reachability
- **WHEN** a client sends `GET /readyz` and Valkey is reachable
- **THEN** the response is `200`

#### Scenario: Readiness fails when Valkey is unreachable
- **WHEN** a client sends `GET /readyz` and Valkey is not reachable
- **THEN** the response is `503`

### Requirement: Environment-driven configuration with fail-fast startup
The service SHALL read its configuration only from environment variables: `VALKEY_ADDR` (required, host:port), `VALKEY_PASSWORD` (optional, default `""`), `VALKEY_DB` (optional integer, default `0`), and `STREAMER_ADDR` (optional, default `:8080`). It SHALL fail fast at startup with a clear error when `VALKEY_ADDR` is missing or unparsable. No secrets or connection details SHALL be logged.

#### Scenario: Missing required configuration
- **WHEN** the service starts without `VALKEY_ADDR` set
- **THEN** startup fails immediately with an error naming the missing variable, and no server begins listening

#### Scenario: Defaults applied for optional configuration
- **WHEN** the service starts with only `VALKEY_ADDR` set
- **THEN** it listens on `:8080`, uses Valkey DB `0`, and uses an empty password

### Requirement: HTTP server hardening
The service SHALL configure its `http.Server` with explicit ReadHeader, Read, Write, and Idle timeouts, and SHALL cap request bodies. It SHALL NOT run with the zero-value (unbounded) timeouts. The Valkey client SHALL use bounded operation timeouts. The server SHALL shut down gracefully on process termination so in-flight requests drain and no goroutine is leaked.

#### Scenario: Timeouts are configured
- **WHEN** the server is constructed
- **THEN** all of ReadHeaderTimeout, ReadTimeout, WriteTimeout, and IdleTimeout are set to non-zero values

#### Scenario: Graceful shutdown drains and stops cleanly
- **WHEN** the process receives a termination signal
- **THEN** the server stops accepting new connections, in-flight requests are given a bounded time to finish, and the process exits without leaking goroutines or Valkey connections

