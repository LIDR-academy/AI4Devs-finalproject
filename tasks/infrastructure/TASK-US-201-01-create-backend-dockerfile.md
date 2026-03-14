# TASK-US-201-01: Create Backend Dockerfile

Create a production-ready multi-stage Dockerfile for the Flask backend service.

[Trello Card](https://trello.com/c/KBReiyUZ)

## Parent User Story
[US-201: Docker Configuration](../../user-stories/infrastructure/US-201-docker-configuration.md)

## Description
Build a secure and efficient backend Docker image using a multi-stage strategy. Ensure runtime image size is minimized, dependencies are deterministic, and the container runs under a non-root user.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps
1. Create `deployment/docker/backend/Dockerfile` with build and runtime stages.
2. Use Python 3.11 slim base image and install required system packages.
3. Install backend dependencies in a deterministic way (requirements lock/versioned file).
4. Copy only required runtime artifacts into the final stage.
5. Create and use a non-root user in runtime stage.
6. Configure environment variables and default startup command for Flask app.
7. Build image locally and validate container boot.

## Acceptance Criteria
- [x] Multi-stage backend Dockerfile exists.
- [x] Runtime container runs as non-root user.
- [ ] Image builds successfully with `docker build`.
- [ ] Backend container starts without missing dependency errors.
- [x] Final runtime image is optimized (no build-only tooling).

## Notes
- Keep build context minimal using `.dockerignore`.
- Reuse existing backend entrypoint conventions already used by the project.
- Blocker: validation build cannot complete in this environment due Docker Hub layer download timeout (`context deadline exceeded`).

## Completion Status
- [ ] 80% - Implemented, pending runtime image pull/build validation
