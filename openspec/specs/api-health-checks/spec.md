## ADDED Requirements

### Requirement: Liveness probe endpoint
The API SHALL expose a `GET /health/live` endpoint that returns 200 OK when the application process is running. This endpoint SHALL NOT check external dependencies — it only verifies the process is alive.

#### Scenario: API process is running
- **WHEN** a GET request is made to `/health/live`
- **THEN** the response status is 200 OK

### Requirement: Readiness probe endpoint with dependency checks
The API SHALL expose a `GET /health/ready` endpoint that checks connectivity to all critical dependencies:
- PostgreSQL (via `AspNetCore.HealthChecks.NpgSql`)
- Dragonfly/Redis (via `AspNetCore.HealthChecks.Redis`)
- MinIO/S3 (via custom `IHealthCheck` using `AWSSDK.S3`)

The endpoint SHALL return 200 OK if all dependencies are healthy, or 503 Service Unavailable if any dependency is unhealthy. The response body SHALL include the status of each individual dependency.

#### Scenario: All dependencies healthy
- **WHEN** a GET request is made to `/health/ready` and PostgreSQL, Dragonfly, and MinIO are all reachable
- **THEN** the response status is 200 OK with body including `"status": "Healthy"` and per-dependency status

#### Scenario: PostgreSQL unreachable
- **WHEN** a GET request is made to `/health/ready` and PostgreSQL is unreachable
- **THEN** the response status is 503 Service Unavailable with body indicating PostgreSQL is `"Unhealthy"`

#### Scenario: Dragonfly unreachable
- **WHEN** a GET request is made to `/health/ready` and Dragonfly is unreachable
- **THEN** the response status is 503 Service Unavailable with body indicating Dragonfly is `"Unhealthy"`

#### Scenario: MinIO unreachable
- **WHEN** a GET request is made to `/health/ready` and MinIO is unreachable
- **THEN** the response status is 503 Service Unavailable with body indicating MinIO is `"Unhealthy"`
