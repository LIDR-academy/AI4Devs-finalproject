# TASK-US-201-05: Create Compose Prod

Create production Docker Compose configuration for stable deployment behavior.

[Trello Card](https://trello.com/c/mDkhntuG)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/29)

## Parent User Story
[US-201: Docker Configuration](../../user-stories/infrastructure/US-201-docker-configuration.md)

## Description
Implement `docker-compose.prod.yml` with production-oriented settings such as restart policies, resource limits, health checks, and secure defaults for services used in deployment.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create `deployment/docker-compose.prod.yml`.
2. Define all required runtime services and dependencies.
3. Add restart policies, resource constraints, and health checks.
4. Remove dev-only mounts and debug settings.
5. Ensure environment variables and secrets strategy are documented.
6. Validate compose syntax and run a production-like startup test.

## Acceptance Criteria
- [x] Production compose file exists and is valid.
- [x] Services run with production-safe defaults.
- [x] Health checks and restart policies are configured.
- [x] Dev-only configuration is excluded.
- [ ] Stack starts cleanly in a production-like environment.

## Notes
- Keep production compose compatible with deployment automation planned in US-202.
- Document assumptions for external TLS and DNS handling.
- `docker compose config --quiet` validation passed.
- Blocker: full startup validation cannot complete in this environment due Docker Hub pull timeouts.

## Completion Status
- [ ] 90% - Compose validated, pending runtime startup validation
