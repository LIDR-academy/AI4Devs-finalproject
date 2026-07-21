## MODIFIED Requirements

### Requirement: End a stream
The service SHALL expose `DELETE /streams/{id}`. Authorization depends on whether the room has an **active LiveKit publisher**:

- When the room **has** an active publisher, the request MUST prove ownership via the stream's `creatorKey` as an `Authorization: Bearer <creatorKey>` header, verified with a constant-time comparison. A match authorizes the delete; a missing or invalid key SHALL return `403 Forbidden` and delete nothing.
- When the room has **no** active publisher (abandoned — e.g. a creator reloaded and lost the key), the request MAY be authorized **without** a key (the escape hatch), so such a room is never un-endable.
- If the service cannot determine publisher state (e.g. LiveKit is unreachable), it SHALL fail closed and require a valid key.

On an authorized delete the service SHALL remove the stream from Valkey and cascade — deleting the room's stored messages, closing its live chat connections, and **deleting the LiveKit room via the server API so all media participants are disconnected** — and return `204 No Content`. If LiveKit is unreachable during the cascade, the Valkey deletion SHALL still succeed, the response SHALL still be `204`, and the LiveKit error SHALL be logged (never surfaced in the body). When the stream does not exist, it SHALL return `404 Not Found`. Deleting a stream SHALL NOT leave orphaned message storage.

#### Scenario: Creator ends a live room with a valid key
- **WHEN** a client sends `DELETE /streams/{id}` for a room with an active publisher and `Authorization: Bearer <valid creatorKey>`
- **THEN** the response is `204`, the stream and its messages are gone, its live chat connections are closed, the LiveKit room is deleted, and it no longer appears in `GET /streams`

#### Scenario: Non-owner cannot end a live room
- **WHEN** a client sends `DELETE /streams/{id}` for a room with an active publisher with a missing or invalid `creatorKey`
- **THEN** the response is `403` with the standard error shape and nothing is deleted

#### Scenario: Abandoned room can be ended without a key
- **WHEN** a client sends `DELETE /streams/{id}` for an existing room that has no active LiveKit publisher, with no key
- **THEN** the response is `204` and the stream, its messages, and its LiveKit room are removed

#### Scenario: LiveKit unreachable during delete
- **WHEN** a delete is authorized but the LiveKit server API is unreachable
- **THEN** the Valkey stream and messages are still deleted, the response is `204`, and the LiveKit error is logged and not surfaced in the body

#### Scenario: End a nonexistent stream
- **WHEN** a client sends `DELETE /streams/{id}` for an id that is not live
- **THEN** the response is `404` with the standard error shape
