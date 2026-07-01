## ADDED Requirements

### Requirement: JWT Bearer authentication with cookie extraction
The API SHALL configure JWT Bearer authentication that reads the JWT token from the `aura_session` httpOnly cookie instead of the `Authorization` header.

`TokenValidationParameters` SHALL validate issuer, audience, lifetime, and signing key from `Configuration["Jwt:Key"]`. `ClockSkew` SHALL be `TimeSpan.Zero`.

#### Scenario: Valid JWT in cookie authenticates the request
- **WHEN** a request includes a valid JWT in the `aura_session` cookie and targets an `[Authorize]` endpoint
- **THEN** the request is authenticated and `User` claims are populated

#### Scenario: Missing or invalid JWT returns 401
- **WHEN** a request to an `[Authorize]` endpoint has no `aura_session` cookie or an invalid JWT
- **THEN** the response status is 401 Unauthorized

### Requirement: JWT blacklist check on token validation
The API SHALL check each validated JWT against the Dragonfly blacklist (`auth:blacklist:{jwt_hash}`) in the `OnTokenValidated` event. If the token hash exists in Dragonfly, authentication SHALL fail.

#### Scenario: Blacklisted JWT is rejected
- **WHEN** a request includes a JWT whose hash exists in Dragonfly key `auth:blacklist:{hash}`
- **THEN** authentication fails and the response status is 401 Unauthorized

#### Scenario: Non-blacklisted JWT is accepted
- **WHEN** a request includes a valid JWT whose hash does not exist in Dragonfly
- **THEN** authentication succeeds normally

### Requirement: CSRF validation middleware
The API SHALL include `CsrfValidationMiddleware` that validates the `X-CSRF-Token` header against the `aura_csrf` cookie for state-changing HTTP methods (POST, PUT, PATCH, DELETE).

The comparison SHALL use `CryptographicOperations.FixedTimeEquals` for timing-safe comparison.

GET, HEAD, and OPTIONS requests SHALL be exempt from CSRF validation.

If validation fails (missing cookie, missing header, or mismatch), the response SHALL be 403 Forbidden with JSON body `{ "error": "CSRF validation failed", "code": "CSRF_INVALID" }`.

#### Scenario: Valid CSRF token allows state-changing request
- **WHEN** a POST request includes `X-CSRF-Token` header matching the `aura_csrf` cookie value
- **THEN** the request proceeds to the next middleware

#### Scenario: Missing CSRF header returns 403
- **WHEN** a POST request has a valid `aura_csrf` cookie but no `X-CSRF-Token` header
- **THEN** the response status is 403 with body `{ "error": "CSRF validation failed", "code": "CSRF_INVALID" }`

#### Scenario: Mismatched CSRF token returns 403
- **WHEN** a POST request includes `X-CSRF-Token` header that does not match the `aura_csrf` cookie
- **THEN** the response status is 403 with body `{ "error": "CSRF validation failed", "code": "CSRF_INVALID" }`

#### Scenario: GET request bypasses CSRF validation
- **WHEN** a GET request is made without any CSRF token
- **THEN** the request proceeds to the next middleware without CSRF validation

### Requirement: Authorization policies
The API SHALL register the following authorization policies:

- **EventOwner**: Requires `role` claim equal to `host`
- **AccompliceScoped**: Requires `role` claim equal to `accomplice` and non-empty `eventId` claim
- **PublishedEvent**: Always passes (verified at service layer)
- **DraftGuestLimit**: Always passing (verified at service layer)
- **ActiveAccomplice**: Requires `role` claim equal to `accomplice`

#### Scenario: EventOwner policy allows host role
- **WHEN** a JWT with `role: "host"` claim accesses an endpoint with `[Authorize(Policy = "EventOwner")]`
- **THEN** authorization succeeds

#### Scenario: EventOwner policy rejects accomplice role
- **WHEN** a JWT with `role: "accomplice"` claim accesses an endpoint with `[Authorize(Policy = "EventOwner")]`
- **THEN** authorization fails with 403 Forbidden

#### Scenario: AccompliceScoped policy requires accomplice role and eventId
- **WHEN** a JWT with `role: "accomplice"` and `eventId: "01J..."` claims accesses an endpoint with `[Authorize(Policy = "AccompliceScoped")]`
- **THEN** authorization succeeds
