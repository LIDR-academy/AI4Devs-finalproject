# Changelog

All notable changes to this project are documented in this file.

## [v1.0-final-GV] - 2026-07-22

### Added

- End-to-end MVP flow completed and validated: create project, add use cases, estimate, and report view.
- Final validation evidence document in `docs/evidence/final-validation.md`.
- Operational runbook for release, migration checks, and rollback in `docs/operations/release-runbook.md`.

### Changed

- Documentation aligned with current API and versioned estimations behavior.
- Data model docs updated to reflect that projects can have multiple estimation versions.
- Environment variable guidance aligned with conditional Azure OpenAI requirements.

### Security and Hardening

- Environment validation enforces secure values for `AUTH_LOGIN_PASSWORD` and `AUTH_TOKEN_SECRET` when `AUTH_ENABLED=true`.
- Dev fallback actor behavior reduced to a safer default role for local non-auth mode.
- Request correlation and telemetry paths documented for release verification.

### AI Estimation Reliability

- Estimation flow now records fallback telemetry reasons (`azure-disabled`, `azure-not-configured`, and request/parse failures).
- Azure estimation failure path logs warning details without exposing secrets.
- Heuristic fallback token cost calculation aligned with configured input/output token rates.

### Testing

- Backend tests stabilized and documented.
- Frontend unit tests and build validations documented.
- Frontend smoke/regression tests added for main flow and critical error/empty states.
- Playwright E2E flow documented with local PostgreSQL execution path.

### Notes

- Public deployment URLs are intentionally pending completion in `README.md`.
