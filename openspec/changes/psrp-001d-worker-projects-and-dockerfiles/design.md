## Context

The worker projects (Email, WhatsApp, SSG) and Dockerfiles do not exist. The architecture docs define 3 worker deployments as separate .NET BackgroundService projects, each with its own Dockerfile. Dockerfiles require the .NET projects (PSRP-001B) and Angular workspace (PSRP-001C) to exist first.

## Goals / Non-Goals

**Goals:**
- Create 3 worker projects as minimal .NET 10 BackgroundService applications
- Create 6 multi-stage Dockerfiles (API, 3 workers, frontend) that build successfully
- Docker images use minimal runtime base images for security and size
- CI builds all 6 images and pushes to GHCR
- Worker projects reference Aura.Infrastructure (shared code) and Aura.Core (domain models)

**Non-Goals:**
- No email dispatch logic (PSRP-010)
- No WhatsApp API integration (PSRP-012)
- No static site generation logic (PSRP-015)
- No docker-compose.yml (K8s is the deployment target from day one)
- No multi-arch builds (linux/amd64 only for MVP)

## Decisions

### 1. Worker projects as separate .csproj files
Each worker is a separate project under `backend/workers/` with its own `.csproj`, `Program.cs`, and `Dockerfile`. They reference `Aura.Core` and `Aura.Infrastructure` for shared code. This matches the architecture docs' "Worker Projects" section.

### 2. Multi-stage Docker builds for .NET
Stage 1: `mcr.microsoft.com/dotnet/sdk:10.0` — build and publish
Stage 2: `mcr.microsoft.com/dotnet/aspnet:10.0` — runtime only
This produces small images (~200MB) without the SDK.

### 3. Multi-stage Docker build for Angular
Stage 1: `node:22-alpine` — npm ci + ng build
Stage 2: `nginx:alpine` — serve dist/ with custom nginx.conf
This produces tiny images (~25MB).

### 4. GHCR image naming
Images are tagged as `ghcr.io/pedrosrp/aura-{service}:{git-sha}` and `ghcr.io/pedrosrp/aura-{service}:latest`. Services: `api`, `frontend`, `worker-email`, `worker-whatsapp`, `worker-ssg`.

### 5. No docker-compose.yml
The architecture docs specify K8s from day one with Rancher Desktop for local development. Adding docker-compose creates double maintenance and divergence risk. Local dev runs API/frontend with `dotnet run` / `ng serve` against K8s-hosted data tier.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| GHCR free tier is 500MB — 6 images may exceed | Monitor usage; use slim base images; clean old images in CI |
| Docker build cache in CI can be slow | Use `--cache-from` with GHCR; layer ordering optimized for cache |
| Worker projects have no business logic yet | They're placeholders — BackgroundService that logs "Worker started" |
