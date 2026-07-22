# token-verification Specification

## Purpose
TBD - created by archiving change security-v0. Update Purpose after archive.
## Requirements
### Requirement: Local stateless JWT verification against JWKS
The service SHALL verify `Authorization: Bearer <access token>` values statelessly against `security`'s JWKS, fetched from `SECURITY_JWKS_URL` at startup and refreshed in the background, making **no per-request call** to `security`. A token SHALL be accepted only when its signature verifies against a current JWKS key and it is unexpired; the service SHALL extract the `userId` and `username` claims. A tampered, expired, wrong-signature, or malformed token, or one missing either claim, SHALL be treated as unauthenticated. Identity SHALL reach the request path only via the verified claims.

#### Scenario: Valid token verifies without calling security
- **WHEN** a request carries a valid, unexpired Bearer token and the JWKS is cached
- **THEN** the service verifies it against the cached JWKS with no call to `security` and reads the `userId` and `username` claims

#### Scenario: Tampered token rejected
- **WHEN** a request carries a token whose signature does not verify against the JWKS
- **THEN** the token is treated as unauthenticated

#### Scenario: Expired token rejected
- **WHEN** a request carries a token whose expiry is in the past
- **THEN** the token is treated as unauthenticated

#### Scenario: Missing claim rejected
- **WHEN** a request carries a validly signed token that lacks the `userId` or `username` claim
- **THEN** the token is treated as unauthenticated

### Requirement: JWKS configuration with fail-fast startup and a bounded refresh lifecycle
The service SHALL read `SECURITY_JWKS_URL` from the environment and fail fast at startup when it is missing. The JWKS refresh SHALL run on a background worker with a defined stop path, cancelled at shutdown so no goroutine leaks. A transient JWKS-fetch failure SHALL NOT crash the service; until a key set is available, tokens SHALL be treated as unauthenticated (protected actions gated) rather than accepted.

#### Scenario: Missing JWKS URL fails fast
- **WHEN** the service starts without `SECURITY_JWKS_URL` set
- **THEN** startup fails immediately with an error naming the variable, and no server begins listening

#### Scenario: Refresh worker stops at shutdown
- **WHEN** the service shuts down
- **THEN** the JWKS refresh worker stops and leaks no goroutine

