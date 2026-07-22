## MODIFIED Requirements

### Requirement: Mint a media access token
The system SHALL expose `POST /streams/{id}/media-token` with an **empty body** and **optional** authentication (`Authorization: Bearer <access token>`; `creatorKey` is retired). The room MUST exist in Valkey, else `404` (and no LiveKit room is created). On success it SHALL return `200 { "token": string, "url": string, "identity": string, "role": "streamer" | "viewer" }`. A valid token whose `userId` is the stream owner SHALL grant publish + subscribe with `identity = the account username`, `role = "streamer"`. A valid token for a non-owner SHALL grant subscribe-only with `identity = the account username`, `role = "viewer"`. No/invalid token (anonymous) SHALL grant subscribe-only with a generated word+alphanumeric `identity`, `role = "viewer"` — not an error. The LiveKit API secret SHALL NEVER appear in the response, logs, or errors.

#### Scenario: Owner gets a publish token
- **WHEN** the stream owner POSTs the media-token endpoint with a valid token
- **THEN** the response is `200` with a publish+subscribe token, `identity` = the account username, `role` = "streamer"

#### Scenario: Signed-in non-owner gets subscribe-only
- **WHEN** a signed-in non-owner POSTs the media-token endpoint
- **THEN** the response is `200` with a subscribe-only token, `identity` = their account username, `role` = "viewer"

#### Scenario: Anonymous gets subscribe-only
- **WHEN** a client with no/invalid token POSTs the media-token endpoint for an existing room
- **THEN** the response is `200` with a subscribe-only token, a generated `identity`, `role` = "viewer", and no error

#### Scenario: Token for a nonexistent room
- **WHEN** a client POSTs the media-token endpoint for a room id that does not exist
- **THEN** the response is `404`
