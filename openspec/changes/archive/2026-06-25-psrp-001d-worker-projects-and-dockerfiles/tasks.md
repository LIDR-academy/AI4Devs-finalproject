## 1. Worker Projects

- [x] 1.1 Create `backend/workers/Aura.Workers.Email/` with .csproj (net10.0, references Aura.Core + Aura.Infrastructure) and Program.cs (minimal BackgroundService)
- [x] 1.2 Create `backend/workers/Aura.Workers.WhatsApp/` with .csproj and Program.cs (minimal BackgroundService)
- [x] 1.3 Create `backend/workers/Aura.Workers.SSG/` with .csproj and Program.cs (minimal BackgroundService)
- [x] 1.4 Verify `dotnet build` succeeds for all 3 worker projects

## 2. Dockerfiles

- [x] 2.1 Create `backend/src/Aura.Api/Dockerfile` (multi-stage: sdk:10.0 build → aspnet:10.0 runtime)
- [x] 2.2 Create `backend/workers/Aura.Workers.Email/Dockerfile` (multi-stage, same pattern)
- [x] 2.3 Create `backend/workers/Aura.Workers.WhatsApp/Dockerfile` (multi-stage, same pattern)
- [x] 2.4 Create `backend/workers/Aura.Workers.SSG/Dockerfile` (multi-stage, same pattern)
- [x] 2.5 Create `frontend/Dockerfile` (multi-stage: node:22-alpine build → nginx:alpine serve, copies nginx.conf)
- [x] 2.6 Verify `docker build` succeeds for all 6 images

## 3. CI Pipeline Update

- [x] 3.1 Add `docker-build` job to `.github/workflows/ci.yml` with matrix strategy (5 services)
- [x] 3.2 Add GHCR login step using `docker/login-action` with GITHUB_TOKEN
- [x] 3.3 Add docker push step tagging images with git SHA and latest
- [x] 3.4 Set `needs: [dotnet-build, angular-build]` on docker-build job
- [x] 3.5 Verify CI passes with dotnet + angular + docker build steps
