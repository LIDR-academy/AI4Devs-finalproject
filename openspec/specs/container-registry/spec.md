## ADDED Requirements

### Requirement: CI pushes Docker images to GHCR
The CI workflow SHALL build all 6 Docker images and push them to GitHub Container Registry (GHCR) under the `ghcr.io/pedrosrp/` namespace.

#### Scenario: CI builds images in a matrix
- **WHEN** the CI workflow runs the docker-build job
- **THEN** it uses a matrix strategy with 5 services: api, frontend, worker-email, worker-whatsapp, worker-ssg

#### Scenario: Images are tagged with git SHA and latest
- **WHEN** images are pushed to GHCR
- **THEN** each image has two tags: `ghcr.io/pedrosrp/aura-{service}:{git-sha}` and `ghcr.io/pedrosrp/aura-{service}:latest`

#### Scenario: CI authenticates to GHCR
- **WHEN** the CI workflow runs the docker-build job
- **THEN** it uses `docker/login-action` with `GITHUB_TOKEN` to authenticate to `ghcr.io`

### Requirement: Docker build job depends on language build jobs
The docker-build job SHALL only run after dotnet-build and angular-build jobs succeed.

#### Scenario: Docker build waits for language builds
- **WHEN** the CI workflow runs
- **THEN** docker-build has `needs: [dotnet-build, angular-build]`
