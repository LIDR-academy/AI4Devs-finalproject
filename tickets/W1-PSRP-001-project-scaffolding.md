## PSRP-001: chore(infra): project-scaffolding

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** None

## Feature Summary
Set up the complete project skeleton including .NET 10 solution structure, Angular 22 workspace, Dockerfiles for all services, Kubernetes base manifests with Kustomize, and GitHub Actions CI/CD pipeline. This is the foundation that all other tickets depend on.

## Requirements
- [ ] Create .NET 10 solution with projects: Aura.Api, Aura.Core, Aura.Infrastructure, Aura.Workers.Email, Aura.Workers.WhatsApp, Aura.Workers.SSG
- [ ] Create Angular 22 workspace with standalone components, signals, and strict mode enabled
- [ ] Create Dockerfiles for all 5 .NET projects (multi-stage builds) and Angular frontend (nginx)
- [ ] Create Kubernetes base manifests: namespace, API deployment, 3 worker deployments, PostgreSQL StatefulSet, Dragonfly StatefulSet, MinIO StatefulSet, frontend deployment
- [ ] Create Kustomize overlays for local (Rancher Desktop) and production environments
- [ ] Create GitHub Actions workflow for build, test, Docker image push to GHCR, and kubectl apply
- [ ] Configure environment variables and appsettings.json structure for all services
- [ ] Set up .editorconfig, .gitignore, and code formatting rules

## Technical Notes
- **Backend:** Solution file at `backend/AuraPlanning.sln`. Projects follow Clean Architecture: Api (presentation), Core (domain/application), Infrastructure (data access, external services), Workers (separate entry points)
- **Frontend:** Angular workspace at `frontend/` with `src/app/core/`, `src/app/features/`, `src/app/shared/`
- **Database:** PostgreSQL 16 StatefulSet with PVC, connection string in K8s Secret
- **Integrations:** Dragonfly (Redis-compatible) for queue/cache, MinIO for object storage
- **Key files:** 
  - `backend/AuraPlanning.sln`
  - `backend/src/Aura.Api/Program.cs`
  - `backend/src/Aura.Core/Aura.Core.csproj`
  - `backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj`
  - `backend/workers/Aura.Workers.*/Program.cs`
  - `frontend/angular.json`
  - `frontend/package.json`
  - `k8s/base/kustomization.yaml`
  - `k8s/overlays/local/kustomization.yaml`
  - `k8s/overlays/production/kustomization.yaml`
  - `.github/workflows/build-and-test.yml`
  - `Dockerfile` files in each project root

## Acceptance Criteria
- [ ] AC1: Given the repository is cloned, when `dotnet build backend/AuraPlanning.sln` is run, then all 5 .NET projects build successfully with no errors
- [ ] AC2: Given the frontend directory, when `npm install && npm run build` is run, then Angular builds successfully with no errors
- [ ] AC3: Given Docker is installed, when `docker build` is run for each service, then all 6 Docker images (5 .NET + 1 Angular) build successfully
- [ ] AC4: Given Kubernetes cluster is running, when `kubectl apply -k k8s/overlays/local` is run, then all pods start and reach Ready state
- [ ] AC5: Given a push to main branch, when GitHub Actions workflow runs, then build, test, and Docker push steps complete successfully

## Related Items
- **PRD section:** 07-work-breakdown.md (Infrastructure/DevOps)
- **Architecture:** 03-project-structure.md, 04-infrastructure-deployment.md
- **Data model:** N/A (no entities yet)

## Blockers
None

## Branch Name
`feature/PSRP-001-project-scaffolding`
