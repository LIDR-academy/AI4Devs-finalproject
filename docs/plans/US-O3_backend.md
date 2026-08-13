# Backend Implementation Plan: US-O3 Prometheus Scrape / Compose

## Overview

**NestJS application code: none** for this ticket beyond consuming US-O2’s `GET /api/metrics`.

US-O3 is **infrastructure / DevOps**: Compose profile `observability`, Prometheus service, scrape config under `infra/observability/prometheus/`, bind `127.0.0.1:9090`.

**User story:** [`us/monitoreo y observabilidad/US-O3-prometheus-scrape-compose.md`](../../us/monitoreo%20y%20observabilidad/US-O3-prometheus-scrape-compose.md)

**Backend verification only (after US-O2):**

1. From inside the Compose network, Prometheus can reach `http://api:4000/api/metrics`.
2. Optional: add `api` service `healthcheck` using `GET /api/health/ready` (US-O1) — still Compose YAML, not Nest.

## Branch

If any Compose/docs changes are made by the same developer: prefer `feature/US-O3-backend` **only if** the team insists on `-backend` naming; otherwise treat as ops branch `feature/US-O3-observability`. No Nest module work.

## Implementation Order

1. Confirm US-O2 merged and scrape path correct.
2. Add Prometheus + profile (see US story).
3. Smoke: Prometheus targets UI shows `mecatrack-api` UP.
4. Document in `infra/observability/README.md`.

## Out of scope for Nest

Controllers, services, Prisma, Jest unit tests in `apps/api`.

---

# Related

- Nest plans: [`US-O1_backend.md`](./US-O1_backend.md), [`US-O2_backend.md`](./US-O2_backend.md)
- Grafana / alerts: [`US-O4_backend.md`](./US-O4_backend.md), [`US-O5_backend.md`](./US-O5_backend.md) (also non-Nest)
