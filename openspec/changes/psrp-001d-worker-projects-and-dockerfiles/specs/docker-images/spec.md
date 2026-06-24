## ADDED Requirements

### Requirement: Multi-stage Dockerfiles for all 6 deployable services
The project SHALL have Dockerfiles for: Aura.Api, Aura.Workers.Email, Aura.Workers.WhatsApp, Aura.Workers.SSG, and the Angular frontend. Class library projects (Aura.Core, Aura.Infrastructure) SHALL NOT have Dockerfiles.

#### Scenario: All 6 Dockerfiles exist
- **WHEN** the repository is searched for Dockerfiles
- **THEN** exactly 6 are found at: backend/src/Aura.Api/Dockerfile, backend/workers/Aura.Workers.Email/Dockerfile, backend/workers/Aura.Workers.WhatsApp/Dockerfile, backend/workers/Aura.Workers.SSG/Dockerfile, frontend/Dockerfile

#### Scenario: .NET Dockerfiles use multi-stage builds
- **WHEN** any .NET Dockerfile is inspected
- **THEN** it has at least 2 stages: build (sdk:10.0) and runtime (aspnet:10.0)

#### Scenario: Frontend Dockerfile uses multi-stage build
- **WHEN** frontend/Dockerfile is inspected
- **THEN** it has at least 2 stages: build (node:22-alpine) and serve (nginx:alpine)

### Requirement: Docker images build successfully
All 6 Docker images SHALL build without errors using `docker build`.

#### Scenario: API Docker image builds
- **WHEN** `docker build -t aura-api:test backend/src/Aura.Api/` is executed
- **THEN** exit code is 0

#### Scenario: Frontend Docker image builds
- **WHEN** `docker build -t aura-frontend:test frontend/` is executed
- **THEN** exit code is 0

### Requirement: Docker images use minimal runtime base images
.NET Dockerfiles SHALL use `mcr.microsoft.com/dotnet/aspnet:10.0` (not the SDK image) for the runtime stage. The frontend SHALL use `nginx:alpine` for the serve stage.

#### Scenario: .NET runtime stage uses aspnet image
- **WHEN** any .NET Dockerfile runtime stage is inspected
- **THEN** it uses `FROM mcr.microsoft.com/dotnet/aspnet:10.0`

#### Scenario: Frontend serve stage uses nginx alpine
- **WHEN** frontend/Dockerfile serve stage is inspected
- **THEN** it uses `FROM nginx:alpine`
