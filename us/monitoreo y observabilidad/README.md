# Monitoreo y Observabilidad — User Stories

This folder contains user stories to incorporate **Prometheus** and **Grafana** into MecaTrack, so the workshop deployment can be observed in production and development without guessing from logs alone.

**Branch for implementation:** `finalproject-RFM`

**Refinement status:** Enhanced locally (2026-08-13) via `/enrich-us`. No Jira MCP available in this environment — stories live only as markdown under this folder (`[original]` + `[enhanced]` with endpoints, files, tests, NFRs, DoD).

## Story List

| ID | File | Title |
|----|------|-------|
| US-O1 | `US-O1-health-readiness-liveness.md` | Health checks (liveness / readiness) |
| US-O2 | `US-O2-instrumentacion-metricas-api.md` | Instrumentación de métricas en la API |
| US-O3 | `US-O3-prometheus-scrape-compose.md` | Prometheus scraping y Compose |
| US-O4 | `US-O4-grafana-dashboards.md` | Dashboards Grafana de MecaTrack |
| US-O5 | `US-O5-alertas-basicas.md` | Alertas básicas Prometheus / Grafana |

## Suggested delivery order

1. **US-O1** — Health endpoints (dependency for probes and “API up” panels).
2. **US-O2** — Expose `/metrics` from NestJS with RED/USE essentials.
3. **US-O3** — Add Prometheus service + scrape config in Docker Compose.
4. **US-O4** — Provision Grafana + datasource + starter dashboards.
5. **US-O5** — Alert rules for down / high error rate / latency.

## Cross-cutting notes

- **Stack:** NestJS API (`apps/api`), Next.js web (`apps/web`), PostgreSQL, Docker Compose (prod-style stack).
- **Ports (prod reference):** web `3000`, API internal `4000`, Postgres `5434` on localhost; DEV typically web `3010` / API `4010` / Postgres `5435`.
- **Security:** `/metrics` must not be publicly exposed on the internet without auth or network restriction (see US-O2 / US-O3).
- **Out of scope for this epic (unless a later US):** OpenTelemetry distributed tracing, ELK/Loki log stack, APM SaaS, multi-tenant SaaS metrics, mobile app monitoring.
- **Docs language:** technical artifacts in English (endpoints, metric names, compose keys); UI copy for Grafana panels may be Spanish for workshop operators.

## Relationship to existing product

These stories do **not** change workshop business flows (clients, vehicles, work orders). They add an **operations** capability so admins/devs can answer: *Is the API up? Is latency rising? Are 5xx increasing? Is Postgres reachable?*

**Frontend (`apps/web`):** out of scope for US-O1…O5. Operator UI is Prometheus/Grafana. See [`docs/plans/US-O_observability_frontend.md`](../../docs/plans/US-O_observability_frontend.md).
