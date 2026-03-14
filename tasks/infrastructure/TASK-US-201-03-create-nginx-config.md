# TASK-US-201-03: Create Nginx Config

Create Nginx reverse proxy configuration and container setup for frontend/backend routing.

[Trello Card](https://trello.com/c/5BVuL6Df)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/29)

## Parent User Story
[US-201: Docker Configuration](../../user-stories/infrastructure/US-201-docker-configuration.md)

## Description
Define Nginx configuration and Docker image artifacts to route public traffic to frontend and backend services. Include security and proxy defaults suitable for containerized deployment.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create `deployment/docker/nginx/nginx.conf` with upstream definitions.
2. Route root/frontend traffic to frontend service and API traffic to backend service.
3. Configure proxy headers and timeouts.
4. Add basic hardening headers where applicable.
5. Create `deployment/docker/nginx/Dockerfile` to package custom config.
6. Validate routing behavior in local compose setup.

## Acceptance Criteria
- [x] Nginx config file created with frontend and backend routing rules.
- [x] Nginx Dockerfile created and buildable.
- [ ] API and frontend routes proxy correctly.
- [x] Required proxy headers are set.
- [ ] No startup errors in Nginx container logs.

## Notes
- Keep paths and service names consistent with compose definitions.
- Plan for TLS termination extension in future deployment story.
- Blocker: end-to-end runtime validation pending due Docker Hub image pull timeout in this environment.

## Completion Status
- [ ] 85% - Config implemented, pending integrated runtime validation
