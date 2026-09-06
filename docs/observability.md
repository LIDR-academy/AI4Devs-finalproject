# Observability (US-O1 … US-O5)

Technical overview of MecaTrack health probes, Prometheus metrics, and the optional Docker Compose `observability` profile.

## Scope

| ID | Capability | Primary artifacts |
|----|------------|-------------------|
| US-O1 | Liveness / readiness | `GET /api/health/live`, `GET /api/health/ready` |
| US-O2 | Prometheus exposition | `GET /api/metrics` (`prom-client`) |
| US-O3 | Prometheus scrape | Compose profile + `infra/observability/prometheus/` |
| US-O4 | Grafana dashboards | Compose Grafana + provisioned **MecaTrack API Overview** |
| US-O5 | Basic alerts + runbook | `rules/mecatrack.yml`, `runbooks/alerts.md` |

User stories: [`us/monitoreo y observabilidad/`](../us/monitoreo%20y%20observabilidad/).  
Operator guide: [`infra/observability/README.md`](../infra/observability/README.md).  
Alert runbook (Spanish for workshop operators): [`infra/observability/runbooks/alerts.md`](../infra/observability/runbooks/alerts.md).

## API contracts (OpenAPI fragments)

| File | Endpoints |
|------|-----------|
| [`docs/api-spec.health.yml`](api-spec.health.yml) | `/health/live`, `/health/ready` |
| [`docs/api-spec.metrics.yml`](api-spec.metrics.yml) | `/metrics` |

Both are **public ops** endpoints (no workshop JWT). Protect them with network controls in production (Docker internal network; Prometheus/Grafana bound to `127.0.0.1`).

## Canonical metric names (US-O2)

| Metric | Type | Labels |
|--------|------|--------|
| `mecatrack_http_requests_total` | counter | `method`, `route`, `status_code` |
| `mecatrack_http_request_duration_seconds` | histogram | `method`, `route`, `status_code` |
| `mecatrack_*` defaults | process/Node | via `collectDefaultMetrics({ prefix: 'mecatrack_' })` |

Route labels use Nest path templates (e.g. `/api/work-orders/:id`) or `unmatched`. Never put UUIDs, license plates, emails, or tokens in labels. The scrape path `/api/metrics` is excluded from HTTP RED observation.

## Compose profile

```bash
# Host .env must include GRAFANA_ADMIN_PASSWORD (see .env.example)
docker compose --profile observability up -d
```

| Service | Host URL (loopback) |
|---------|---------------------|
| Prometheus | http://127.0.0.1:9090 |
| Grafana | http://127.0.0.1:3001 |

Scrape target (Docker DNS): `http://api:4000/api/metrics` (job `mecatrack-api`).

## Alert rules (US-O5)

Loaded from `infra/observability/prometheus/rules/mecatrack.yml`:

- `MecaTrackApiDown` — target down > 2m  
- `MecaTrackHighHttp5xx` — 5xx ratio > 5% for > 5m  
- `MecaTrackHighLatencyP95` — p95 > 2s for > 10m  

MVP notification: Prometheus/Grafana UI only (no Alertmanager / PagerDuty).

## Implementation plans

- [`docs/plans/US-O1_backend.md`](plans/US-O1_backend.md) … [`US-O5_backend.md`](plans/US-O5_backend.md)

## Data model

No Prisma schema changes. Observability is process/ops only.
