# API Bootstrap

## Purpose
TBD

## Requirements

### Requirement: API starts and responds to HTTP requests
The Aura.Api project SHALL start as an ASP.NET Core Web Application with controllers, configured with the complete middleware pipeline: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → CSRF → Authentication → Authorization → Routing.

The API SHALL register all infrastructure services in the DI container: DbContext (PostgreSQL), all repositories, Dragonfly connection (StackExchange.Redis), MinIO S3 client (AWSSDK.S3), JWT authentication, authorization policies, FluentValidation, health checks, and Serilog logging.

#### Scenario: GET / returns 200 OK
- **WHEN** the API is running and a GET request is made to `/`
- **THEN** the response status is 200 with body "OK"

#### Scenario: API starts without errors
- **WHEN** `dotnet run --project backend/src/Aura.Api` is executed
- **THEN** the application starts and listens on a port without throwing exceptions

#### Scenario: Middleware pipeline is registered in correct order
- **WHEN** the API processes an HTTP request
- **THEN** middleware executes in order: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → CSRF → Authentication → Authorization → Routing

### Requirement: API has appsettings.json with all required configuration keys
The API SHALL have `appsettings.json` and `appsettings.Development.json` with stub values for all configuration keys defined in conventions: ConnectionStrings, Jwt, MagicLink, WhatsApp, Smtp, Minio, Dragonfly, Stripe, GoogleMaps.

#### Scenario: appsettings.json contains all key sections
- **WHEN** appsettings.json is read
- **THEN** it contains sections for: ConnectionStrings, Jwt, MagicLink, WhatsApp, Smtp, Minio, Dragonfly, Stripe, GoogleMaps

#### Scenario: appsettings.Development.json overrides for local dev
- **WHEN** appsettings.Development.json is read
- **THEN** it contains development-specific overrides (e.g., localhost connection strings)
