## ADDED Requirements

### Requirement: Global exception handling middleware
The API SHALL include `ExceptionHandlingMiddleware` registered as the first middleware in the pipeline. It SHALL catch all unhandled exceptions and map them to appropriate HTTP status codes with a JSON error response body.

The mapping SHALL be:
- `ValidationException` → 400 Bad Request (with FluentValidation error details)
- `UnauthorizedAccessException` → 401 Unauthorized
- `ForbiddenAccessException` → 403 Forbidden
- `NotFoundException` → 404 Not Found
- `ConflictException` → 409 Conflict
- `RateLimitExceededException` → 429 Too Many Requests (with `Retry-After` header)
- All other exceptions → 500 Internal Server Error

In production, the 500 response SHALL NOT include stack traces or internal exception details. In development, exception details MAY be included.

#### Scenario: Unhandled domain exception returns mapped status code
- **WHEN** a controller action throws a `NotFoundException`
- **THEN** the response status is 404 with a JSON body containing `error` and `message` fields

#### Scenario: Unhandled unexpected exception returns 500 without stack trace in production
- **WHEN** a controller action throws an unexpected exception in production environment
- **THEN** the response status is 500 with a JSON body containing `error: "An unexpected error occurred"` and no stack trace

#### Scenario: Rate limit exception returns 429 with Retry-After header
- **WHEN** a controller action throws a `RateLimitExceededException` with retry-after seconds
- **THEN** the response status is 429 with a `Retry-After` header set to the specified seconds

### Requirement: Security headers middleware
The API SHALL include `SecurityHeadersMiddleware` that adds security-related HTTP headers to every response.

Headers added:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

#### Scenario: Every response includes security headers
- **WHEN** any HTTP request is made to the API
- **THEN** the response includes headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Requirement: CORS configuration
The API SHALL configure a CORS policy named `DefaultPolicy` with allowed origins based on the current environment.

- Development: allow `http://localhost:4200`, `http://localhost:5173`
- Production: allow `https://aura.planning`, `https://*.aura.planning`

Credentials SHALL be allowed. All headers and methods SHALL be allowed.

#### Scenario: Development CORS allows localhost origins
- **WHEN** the API runs in development environment and a request comes from `http://localhost:4200`
- **THEN** the response includes `Access-Control-Allow-Origin: http://localhost:4200` and `Access-Control-Allow-Credentials: true`

#### Scenario: Production CORS rejects non-whitelisted origins
- **WHEN** the API runs in production and a request comes from `https://evil.com`
- **THEN** the response does not include `Access-Control-Allow-Origin` header

### Requirement: Dragonfly-backed rate limiting middleware
The API SHALL include `RateLimitingMiddleware` that enforces request rate limits using Dragonfly (Redis-compatible) as a distributed counter store.

Global limit: 100 requests per minute per IP address.
Magic link limit: 3 requests per email per hour.

The pattern SHALL be: `INCR` on key with `EXPIRE` for window duration.

If Dragonfly is unreachable, the middleware SHALL fail open (allow the request) and log a warning.

When rate limit is exceeded, the response SHALL be 429 Too Many Requests with a `Retry-After` header indicating seconds until the window resets.

#### Scenario: Request within rate limit is allowed
- **WHEN** 50 requests have been made from IP `1.2.3.4` within the current minute and request 51 arrives
- **THEN** the request is processed normally

#### Scenario: Request exceeding rate limit returns 429
- **WHEN** 100 requests have been made from IP `1.2.3.4` within the current minute and request 101 arrives
- **THEN** the response status is 429 with a `Retry-After` header

#### Scenario: Dragonfly unavailable allows requests through
- **WHEN** Dragonfly is unreachable and a request arrives
- **THEN** the request is processed normally and a warning is logged
