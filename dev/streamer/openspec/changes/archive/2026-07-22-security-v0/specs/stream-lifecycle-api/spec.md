## MODIFIED Requirements

### Requirement: Start a stream
The service SHALL expose `POST /streams` requiring authentication via `Authorization: Bearer <access token>`; without a valid token it SHALL return `401 Unauthorized` and create nothing. It SHALL accept a JSON body `{ "title": string, "description"?: string }` — **no `username`** (it comes from the token's `username` claim) and **no `creatorKey`** (that field is retired). It SHALL enforce, at the boundary: request body at most 8 KB; `title` non-empty after trimming and at most 200 Unicode code points; `description` optional and at most 100 Unicode code points, defaulting to `""` when absent. The stream's owner SHALL be the token's `userId` claim. If the user already owns an active stream, the service SHALL return `409 Conflict` and create nothing. On success it SHALL persist the stream in Valkey and return `201 Created` with `{ "id": string, "username": string, "title": string, "description": string }` where `username` is the owner's account username and `id` is an opaque, URL-safe string. On validation failure it SHALL return `400 Bad Request` and create no stream. The stored `title` SHALL be the trimmed value. Unknown JSON fields SHALL be ignored.

#### Scenario: Authenticated create
- **WHEN** a signed-in user sends `POST /streams` with a non-empty `title` and no `description`
- **THEN** the response is `201` with an `id`, the account `username`, the trimmed `title`, `description` equal to `""`, and no `creatorKey`, owned by the token's `userId`, and it appears in `GET /streams`

#### Scenario: Unauthenticated create rejected
- **WHEN** a client sends `POST /streams` with no or an invalid access token
- **THEN** the response is `401` and no stream is created

#### Scenario: One active stream per user
- **WHEN** a signed-in user who already owns an active stream sends `POST /streams`
- **THEN** the response is `409` and no second stream is created

#### Scenario: Empty or whitespace-only title rejected
- **WHEN** a signed-in user sends `POST /streams` with a `title` that is empty or only whitespace
- **THEN** the response is `400`, the body is the standard error shape, and no stream is created

#### Scenario: Over-long title rejected
- **WHEN** a signed-in user sends `POST /streams` with a `title` longer than 200 Unicode code points
- **THEN** the response is `400` and no stream is created

#### Scenario: Over-long description rejected
- **WHEN** a signed-in user sends `POST /streams` with a `description` longer than 100 Unicode code points
- **THEN** the response is `400` and no stream is created

#### Scenario: Malformed or oversized body rejected
- **WHEN** a signed-in user sends `POST /streams` with a body that is not valid JSON or exceeds 8 KB
- **THEN** the response is `400` and no stream is created

### Requirement: End a stream
The service SHALL expose `DELETE /streams/{id}` requiring authentication (`401` without a valid token) and **owner-only** authorization: the token's `userId` MUST equal the stream's owner, else `403 Forbidden` and nothing is deleted. The `creatorKey` escape hatch is retired — there is **no keyless delete**. On an authorized (owner) delete the service SHALL remove the stream from Valkey and cascade — deleting the room's stored messages, closing its live chat connections, deleting the LiveKit room via the server API so all media participants are disconnected, and freeing the owner's active-stream slot — and return `204 No Content`. If LiveKit is unreachable during the cascade, the Valkey deletion SHALL still succeed, the response SHALL still be `204`, and the LiveKit error SHALL be logged. When the stream does not exist, it SHALL return `404 Not Found`. Deleting a stream SHALL NOT leave orphaned message storage. Abandoned streams are cleaned up by the reaper and by sign-out, not by a keyless delete.

#### Scenario: Owner ends their stream
- **WHEN** the owner sends `DELETE /streams/{id}` with a valid token whose `userId` matches the stream owner
- **THEN** the response is `204`, the stream, its messages, and its LiveKit room are removed (participants disconnected), the owner's active-stream slot is freed, and it no longer appears in `GET /streams`

#### Scenario: Non-owner cannot end
- **WHEN** a signed-in user whose `userId` is not the owner sends `DELETE /streams/{id}`
- **THEN** the response is `403` and nothing is deleted

#### Scenario: Unauthenticated delete rejected
- **WHEN** a client sends `DELETE /streams/{id}` with no or an invalid token
- **THEN** the response is `401` and nothing is deleted

#### Scenario: LiveKit unreachable during delete
- **WHEN** an owner delete is authorized but the LiveKit server API is unreachable
- **THEN** the Valkey stream and messages are still deleted, the response is `204`, and the LiveKit error is logged and not surfaced in the body

#### Scenario: End a nonexistent stream
- **WHEN** an authenticated caller sends `DELETE /streams/{id}` for an id that is not live
- **THEN** the response is `404` with the standard error shape
