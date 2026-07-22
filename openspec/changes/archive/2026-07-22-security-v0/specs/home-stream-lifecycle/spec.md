## MODIFIED Requirements

### Requirement: Start a stream
The system SHALL expose `POST /streams` requiring authentication via `Authorization: Bearer <access token>` — `401 Unauthorized` without a valid session. The body accepts `{ "title": string, "description"?: string }` (no `username` — it comes from the token's `username` claim). `title` MUST be non-empty after trimming; `description` MUST be at most 100 Unicode code points. The stream's owner SHALL be the token's `userId` claim. If the user already owns an active stream, the system SHALL return `409 Conflict` and create nothing. On success it SHALL return `201 Created` with `{ "id": string, "username": string, "title": string, "description": string }` (the owner's account username; **no `creatorKey`** — that field is retired). On validation failure it SHALL return `400 Bad Request`; `description` defaults to `""` when absent.

#### Scenario: Authenticated create
- **WHEN** a signed-in user sends `POST /streams` with a non-empty `title`
- **THEN** the response is `201` with `id`, the account `username`, `title`, and `description`, no `creatorKey`, owned by the user's `userId`, and it appears in `GET /streams`

#### Scenario: Unauthenticated create rejected
- **WHEN** a client sends `POST /streams` with no or an invalid access token
- **THEN** the response is `401` and no stream is created

#### Scenario: One active stream per user
- **WHEN** a signed-in user who already owns an active stream sends `POST /streams`
- **THEN** the response is `409` and no second stream is created

#### Scenario: Empty title rejected
- **WHEN** a signed-in user sends `POST /streams` with an empty or whitespace-only `title`
- **THEN** the response is `400` and no stream is created

#### Scenario: Over-long description rejected
- **WHEN** a signed-in user sends `POST /streams` with a `description` longer than 100 Unicode code points
- **THEN** the response is `400` and no stream is created

### Requirement: End a stream
The system SHALL expose `DELETE /streams/{id}` requiring authentication (`401` without a valid session) and **owner-only** authorization — the token's `userId` MUST equal the stream's owner, else `403 Forbidden`. The `creatorKey` escape-hatch is retired: there is no keyless delete. On a successful (owner) delete the system SHALL remove the stream and cascade — deleting the room's messages, closing its live chat connections, and deleting the LiveKit room via the server API so all media participants are disconnected — and return `204 No Content`. If LiveKit is unreachable, the Valkey delete SHALL still succeed and the error SHALL be logged. When the stream does not exist, it SHALL return `404 Not Found`. (Abandoned streams are cleaned up by the reaper and by sign-out, not by a keyless delete.)

#### Scenario: Owner ends their stream
- **WHEN** the owner sends `DELETE /streams/{id}` with a valid access token whose `userId` matches the stream owner
- **THEN** the response is `204`, and the stream, its messages, and its LiveKit room are removed (participants disconnected)

#### Scenario: Non-owner cannot end
- **WHEN** a signed-in user whose `userId` is not the owner sends `DELETE /streams/{id}`
- **THEN** the response is `403` and nothing is deleted

#### Scenario: Unauthenticated delete rejected
- **WHEN** a client sends `DELETE /streams/{id}` with no or an invalid token
- **THEN** the response is `401` and nothing is deleted

#### Scenario: LiveKit unreachable during delete
- **WHEN** an owner delete is authorized but the LiveKit server API is unreachable
- **THEN** the Valkey stream and messages are still deleted, the response is `204`, and the LiveKit error is logged

#### Scenario: Ending a nonexistent stream
- **WHEN** an authenticated caller sends `DELETE /streams/{id}` for an id that does not exist
- **THEN** the response is `404`
