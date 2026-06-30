## Why

The API currently has a minimal Program.cs with only OpenAPI and HTTPS redirection configured. Before implementing any business endpoints (auth, events, RSVP, etc.), the HTTP pipeline must be hardened with production-grade middleware — exception handling, rate limiting, security headers, JWT authentication with cookie extraction, CSRF protection, and health checks for Kubernetes probes. This is the foundation that every subsequent feature depends on.

## What Changes

- Add global exception handling middleware that maps domain exceptions to HTTP status codes (400, 401, 403, 404, 409, 429, 500)
- Add security headers middleware (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP, HSTS)
- Add Dragonfly-backed distributed rate limiting middleware (100 req/min per IP, 3 magic link requests per email per hour)
- Configure CORS policy with environment-based allowed origins
- Add JWT Bearer authentication reading from `aura_session` httpOnly cookie (not Authorization header)
- Add `OnTokenValidated` hook to check JWT against Dragonfly blacklist
- Add CSRF validation middleware comparing `X-CSRF-Token` header against `aura_csrf` cookie using timing-safe comparison
- Register authorization policies: EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit, ActiveAccomplice
- Add health check endpoints: `/health/live` (liveness) and `/health/ready` (readiness with PostgreSQL, Dragonfly, MinIO checks)
- Configure FluentValidation pipeline behavior for automatic DTO validation on POST/PUT endpoints
- Configure Swagger/OpenAPI with cookie-based auth security schemes
- Register all infrastructure services in DI container (DbContext, repositories, Dragonfly, MinIO)
- Configure Serilog structured JSON logging with correlation IDs
- Register middleware in exact order: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → CSRF → Authentication → Authorization → Routing

## Capabilities

### New Capabilities
- `api-middleware-pipeline`: Global exception handling, security headers, rate limiting, and CORS middleware registered in the correct order on the HTTP pipeline
- `api-auth-csrf`: JWT Bearer authentication with cookie extraction, Dragonfly-backed token blacklist, CSRF double-submit cookie validation, and authorization policies
- `api-health-checks`: Kubernetes liveness and readiness probe endpoints with dependency health checks for PostgreSQL, Dragonfly, and MinIO
- `api-validation-logging`: FluentValidation pipeline behavior for automatic DTO validation and Serilog structured JSON logging with correlation IDs

### Modified Capabilities
- `api-bootstrap`: Program.cs composition root is significantly expanded — middleware registration, DI services, authentication, authorization, and health checks replace the current minimal setup

## Impact

- **Code**: `Aura.Api/Program.cs` rewritten; new files under `Middleware/`, `Health/`, `Filters/`
- **Dependencies**: New NuGet packages — `AspNetCore.HealthChecks.NpgSql`, `AspNetCore.HealthChecks.Redis`, `FluentValidation.AspNetCore`, `Serilog.AspNetCore`, `StackExchange.Redis`
- **Infrastructure**: Requires running Dragonfly and PostgreSQL instances for health checks and rate limiting
- **APIs**: All subsequent API endpoints will inherit this middleware pipeline automatically
- **Breaking**: None — no existing consumers depend on the current minimal API
