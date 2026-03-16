# TASK-US-009-01: Configure Rate Limiting

Configure endpoint-specific rate limiting policies and shared limiter infrastructure for the backend API.

[Trello Card](https://trello.com/c/zmAFF7tV)

## Pull Request
[PR #9](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/9)

## Parent User Story
[US-009: Rate Limiting and Security](../../user-stories/backend/US-009-rate-limiting-security.md)

## Description
Configure Flask-Limiter for the backend so all relevant endpoints are protected with the limits defined by US-009. The implementation should support endpoint-specific policies, expose rate-limit headers, use Redis-backed storage in non-local environments, and keep limit values configurable through environment variables.

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps
1. Review the current Flask app factory and identify where limiter initialization is configured.
2. Add configuration entries for default and endpoint-specific limits, storage backend, header exposure, and rate-limit strategy.
3. Apply the correct per-IP or per-API-key limits to registration, upload, retrieve, pin/unpin, status, renew, and admin endpoints.
4. Ensure `X-RateLimit-*` and `Retry-After` headers are returned consistently when supported by the limiter.
5. Verify `429 Too Many Requests` responses use the project error format.
6. Add or update tests covering allowed traffic, exceeded limits, and environment-driven overrides.
7. Document the new environment variables and expected operational defaults.

## Acceptance Criteria
- [x] Rate limiting is applied to all endpoints covered by US-009
- [x] Registration endpoints use per-IP limits
- [x] Authenticated file and admin endpoints use per-API-key limits
- [x] Response headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`
- [x] Exceeded limits return `429 Too Many Requests`
- [x] Limit values are configurable through environment variables
- [x] Tests cover both success and rate-limit-exceeded scenarios

## Implementation Notes
- Added centralized `configured_limit(...)` and API-key-aware limiter key resolution in the Flask app factory.
- Applied endpoint-specific limits to registration, uploads, retrieval, pinning, status, renewal, admin, and task routes.
- Kept tests isolated by disabling limiter enforcement in the shared testing config and re-enabling it only in suites that validate rate limiting.

## Notes
- Reuse the existing Flask-Limiter integration in the application factory instead of introducing parallel limiter instances.
- Prefer one shared configuration surface so future user stories can adjust limits without code changes.
- Redis should be the production-ready backend, while local test/dev defaults can remain lightweight if needed.

## Completion Status
- [x] 100% - Completed