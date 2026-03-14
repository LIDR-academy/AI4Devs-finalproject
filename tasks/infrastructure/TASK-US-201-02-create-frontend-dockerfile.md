# TASK-US-201-02: Create Frontend Dockerfile

Create a multi-stage Dockerfile for the Next.js frontend optimized for production.

[Trello Card](https://trello.com/c/LXUvHXXR)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/29)

## Parent User Story
[US-201: Docker Configuration](../../user-stories/infrastructure/US-201-docker-configuration.md)

## Description
Implement a frontend Dockerfile that supports reproducible builds and a lightweight runtime image for Next.js. The image should be compatible with the project build output and runtime requirements.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps
1. Create `deployment/docker/frontend/Dockerfile` with build and runtime stages.
2. Use Node 20 Alpine image and install dependencies using lockfile.
3. Build Next.js app in builder stage.
4. Copy only runtime artifacts into final stage.
5. Run the app with a non-root user and explicit host/port configuration.
6. Validate image build and app startup locally.

## Acceptance Criteria
- [x] Multi-stage frontend Dockerfile exists.
- [ ] Frontend image builds successfully.
- [ ] Runtime container serves the app on configured port.
- [x] Non-root execution is used in final container.
- [x] Runtime image excludes unnecessary build dependencies.

## Notes
- Ensure alignment with existing Next.js `output` configuration.
- Keep `NODE_ENV=production` in runtime stage.
- Blocker: validation build cannot complete in this environment due Docker Hub layer download timeout (`context deadline exceeded`).

## Completion Status
- [ ] 80% - Implemented, pending runtime image pull/build validation
