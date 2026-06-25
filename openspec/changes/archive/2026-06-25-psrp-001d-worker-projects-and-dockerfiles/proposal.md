## Why

PSRP-001 bundles Dockerfile creation alongside solution scaffolding, Angular, K8s, and CI/CD. This change isolates containerization so it can be validated independently. Dockerfiles require the .NET projects (PSRP-001B) and Angular workspace (PSRP-001C) to exist first — this change runs after both are merged and validates that all 6 services can be built as Docker images.

## What Changes

- Creates 3 worker projects: Aura.Workers.Email, Aura.Workers.WhatsApp, Aura.Workers.SSG (minimal BackgroundService each)
- Creates 6 multi-stage Dockerfiles: Aura.Api, 3 workers, frontend (Angular → nginx)
- Dockerfiles use .NET 10 SDK for build stage, ASP.NET Core 10 runtime for production
- Frontend Dockerfile uses Node 22 for Angular build, nginx for serving
- CI pipeline adds docker build × 6 and GHCR push steps
- Class library projects (Aura.Core, Aura.Infrastructure) do not need Dockerfiles — they're referenced by projects that do

## Capabilities

### New Capabilities
- `worker-projects`: Three .NET 10 BackgroundService projects (Email, WhatsApp, SSG) with minimal startup, ready for PSRP-010 (email dispatcher), PSRP-012 (WhatsApp service), and PSRP-015 (static site generator).
- `docker-images`: Multi-stage Dockerfiles for all 6 deployable services (.NET API, 3 workers, Angular frontend) using minimal runtime images.
- `container-registry`: GitHub Container Registry (GHCR) integration for storing and versioning Docker images with git SHA and latest tags.

### Modified Capabilities
- `ci-pipeline`: Adds Docker build matrix (6 services), GHCR login, and image push steps to the CI workflow.

## Impact

- **New directories**: `backend/workers/` with 3 worker projects, `Dockerfile` in each deployable project root
- **CI**: Adds Docker build matrix, GHCR authentication, and image push steps
- **Dependencies**: PSRP-001E (K8s manifests) needs these images to exist
- **No breaking changes**: Purely additive
