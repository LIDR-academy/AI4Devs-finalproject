## ADDED Requirements

### Requirement: security exposes a JWKS endpoint for stateless verification
The `security` service SHALL expose the SuperTokens SDK-provided JWKS endpoint so that consumers (notably `streamer`) can verify `Authorization: Bearer` access tokens statelessly, fetching the key set at startup and refreshing it, and making no per-request call back to `security`. The JWKS endpoint SHALL serve only public verification material and SHALL never expose any signing secret or the SuperTokens API key.

#### Scenario: JWKS is served for local verification
- **WHEN** a consumer fetches the JWKS endpoint
- **THEN** `security` returns the current public key set suitable for verifying access-token signatures, with no secret material in the response

#### Scenario: Tokens verify locally without calling security
- **WHEN** a consumer holding the cached JWKS receives a request bearing an access token issued by `security`
- **THEN** the consumer can verify the token's signature and claims against the cached JWKS without any request to `security`

### Requirement: Published verification contract is stable
The JWT claim set (`userId`, `username`) and the JWKS URL SHALL be treated as a published contract to consumers and SHALL NOT change unilaterally. Access tokens issued by `security` SHALL be signed such that a standard JWKS/JWT verifier can validate them and reject tampered or expired tokens.

#### Scenario: Tampered or expired token is rejectable
- **WHEN** a consumer verifies a tampered or expired access token against the published JWKS
- **THEN** verification fails and the token is rejected as unauthenticated

#### Scenario: Valid token exposes the agreed claims
- **WHEN** a consumer verifies a valid access token issued by `security`
- **THEN** the verified claims include `userId` and `username` as published
