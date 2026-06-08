## PSRP-003: feat(api): base-api-infrastructure

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W1
**Dependencies:** PSRP-001, PSRP-002

## Feature Summary
Implement the base API infrastructure layer including health check endpoints for Kubernetes probes, global exception handling middleware, CORS configuration, rate limiting middleware backed by Dragonfly, security headers middleware, FluentValidation integration, and Swagger/OpenAPI documentation. This establishes the HTTP pipeline that all API endpoints will use.

## Requirements
- [ ] Configure health check endpoints: `/health/live` (liveness) and `/health/ready` (readiness with PostgreSQL, Dragonfly, MinIO checks)
- [ ] Implement global exception handling middleware that maps domain exceptions to HTTP status codes (400, 401, 403, 404, 409, 429, 500)
- [ ] Configure CORS policy with environment-based allowed origins (localhost for dev, aura.planning for production)
- [ ] Implement rate limiting middleware backed by Dragonfly: 100 req/min per IP globally, 3 magic link requests per email per hour
- [ ] Implement security headers middleware: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy, Strict-Transport-Security
- [ ] Configure FluentValidation pipeline behavior for automatic DTO validation on all POST/PUT endpoints
- [ ] Configure Swagger/OpenAPI with JWT bearer auth support
- [ ] Register all services in DI container: DbContext, repositories, Dragonfly connection, MinIO client
- [ ] Configure Serilog for structured JSON logging with correlation IDs
- [ ] Implement authorization policies: EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit, ActiveAccomplice

## Technical Notes
- **Backend:** ASP.NET Core minimal API or controllers. Program.cs is the composition root. Middleware order matters: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → Auth → Routing
- **Frontend:** N/A
- **Database:** Health checks query PostgreSQL, Dragonfly, MinIO connectivity
- **Integrations:** Dragonfly for distributed rate limiting (INCR + EXPIRE pattern)
- **Key files:**
  - `backend/src/Aura.Api/Program.cs`
  - `backend/src/Aura.Api/Middleware/ExceptionHandlingMiddleware.cs`
  - `backend/src/Aura.Api/Middleware/RateLimitingMiddleware.cs`
  - `backend/src/Aura.Api/Middleware/SecurityHeadersMiddleware.cs`
  - `backend/src/Aura.Api/Health/HealthChecksSetup.cs`
  - `backend/src/Aura.Api/Filters/ValidationFilter.cs`
  - `backend/src/Aura.Api/appsettings.json`
  - `backend/src/Aura.Api/appsettings.Development.json`

## Acceptance Criteria
- [ ] AC1: Given the API is running, when `GET /health/live` is called, then 200 OK is returned
- [ ] AC2: Given the API is running and PostgreSQL is reachable, when `GET /health/ready` is called, then 200 OK is returned with status of each dependency
- [ ] AC3: Given the API is running, when a request triggers an unhandled exception, then 500 is returned with a JSON error body (no stack trace in production)
- [ ] AC4: Given 101 requests are sent within 1 minute from the same IP, then the 101st request returns 429 with Retry-After header
- [ ] AC5: Given a POST request with invalid DTO (missing required field), then 400 is returned with FluentValidation error details
- [ ] AC6: Given any API response, then response includes headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Strict-Transport-Security

## Related Items
- **PRD section:** 07-work-breakdown.md (Security/Compliance)
- **Architecture:** 05-security.md (rate limiting, security headers, authorization policies), 03-project-structure.md (Aura.Api structure)
- **Data model:** N/A

## Blockers
Blocked by: PSRP-001, PSRP-002

## Branch Name
`feature/PSRP-003-base-api-infrastructure`
