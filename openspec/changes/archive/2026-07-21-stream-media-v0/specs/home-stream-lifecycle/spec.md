## MODIFIED Requirements

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
