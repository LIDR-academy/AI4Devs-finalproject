# MecaTrack observability (Prometheus + Grafana)

Optional Docker Compose profile that scrapes NestJS API metrics (**US-O2**) and visualizes them in Grafana (**US-O4**), with alert rules (**US-O5**).

English technical overview: [`docs/observability.md`](../../docs/observability.md).  
User stories: [`us/monitoreo y observabilidad/`](../../us/monitoreo%20y%20observabilidad/).

## Prerequisites

- Docker Compose stack with services `postgres`, `api`, and `web` (root `docker-compose.yml`).
- API image includes `GET /api/metrics` (US-O2) and preferably `GET /api/health/ready` (US-O1).
- Host `.env` must define `GRAFANA_ADMIN_PASSWORD` (required when starting Grafana). See `.env.example`.

## Start with observability

From the repository root (or the production deploy copy that uses this compose file):

```bash
docker compose --profile observability up -d
```

Core workshop services (`postgres`, `api`, `web`) start as usual. Prometheus and Grafana start only when the `observability` profile is enabled.

## Prometheus

| Item | Value |
|------|--------|
| Container | `mecatrack-prometheus` |
| Image | `prom/prometheus:v2.54.1` (pinned) |
| UI (host loopback only) | http://127.0.0.1:9090 |
| Scrape target | `http://api:4000/api/metrics` (Docker network DNS) |
| Job name | `mecatrack-api` |
| Config (versioned) | `infra/observability/prometheus/prometheus.yml` |
| TSDB volume | `mecatrack_prometheus_data` |

### Verify

1. Open http://127.0.0.1:9090/targets — job `mecatrack-api` should be **UP**.
2. Query: `up{job="mecatrack-api"}` → `1`.
3. After API traffic: `mecatrack_http_requests_total`.
4. `docker compose stop api` → target becomes **DOWN** / `up == 0`.

### Reload config (optional)

Lifecycle is enabled (`--web.enable-lifecycle`). After editing `prometheus.yml` and recreating/reloading the container:

```bash
curl -X POST http://127.0.0.1:9090/-/reload
```

## Grafana (US-O4)

| Item | Value |
|------|--------|
| Container | `mecatrack-grafana` |
| Image | `grafana/grafana:11.2.0` (pinned) |
| UI (host loopback only) | http://127.0.0.1:3001 |
| Admin user | `GRAFANA_ADMIN_USER` (default `admin`) |
| Admin password | `GRAFANA_ADMIN_PASSWORD` (**required**, no weak default in compose) |
| Datasource | Provisioned Prometheus at `http://prometheus:9090` (uid `mecatrack-prometheus`) |
| Dashboard | **MecaTrack API Overview** (uid `mecatrack-api-overview`) |
| Data volume | `mecatrack_grafana_data` |

Sign-up is disabled (`GF_USERS_ALLOW_SIGN_UP=false`). On shared hosts, change the admin password after first login.

### Verify

1. Open http://127.0.0.1:3001 and log in with admin credentials from `.env`.
2. Dashboards → folder **MecaTrack** → **MecaTrack API Overview** (no manual import).
3. Generate API traffic; panels for UP, RPS, 5xx, and p95 should move.
4. Restart Grafana; the provisioned dashboard remains available.

Cold start of dashboards comes from files under `infra/observability/grafana/` (not from a committed `grafana.db`).

## API readiness healthcheck

The `api` service healthcheck calls `GET /api/health/ready` with Node’s built-in `fetch` (Alpine image has no `wget`). Healthy = HTTP 2xx from readiness.

## Security notes

- Prometheus UI binds to `127.0.0.1:9090`; Grafana UI to `127.0.0.1:3001` (not published on all interfaces).
- Do not mount the app `.env` into Prometheus/Grafana beyond the Compose-injected Grafana admin vars.
- Prefer scraping on the Docker network; do not publish a dedicated host port for `/api/metrics`.
- Default Prometheus TSDB retention is fine for a local workshop; override with `--storage.tsdb.retention.time` (e.g. `15d`) if needed.

## Out of scope here

- SSO / OAuth / LDAP for Grafana
- Business dashboards (work orders per day, etc.)
- PagerDuty / Alertmanager multi-channel receivers (MVP is Prometheus rules + UI only)

## Alert rules (US-O5)

Prometheus loads `infra/observability/prometheus/rules/mecatrack.yml` via `rule_files`.

| Alert | Meaning |
|-------|---------|
| `MecaTrackApiDown` | Scrape target down for >2m |
| `MecaTrackHighHttp5xx` | 5xx ratio >5% for >5m |
| `MecaTrackHighLatencyP95` | p95 latency >2s for >10m |

- Rules UI: http://127.0.0.1:9090/rules (group `mecatrack.api`)
- Alerts UI: http://127.0.0.1:9090/alerts
- Operator runbook (Spanish): [`runbooks/alerts.md`](runbooks/alerts.md)

Notification MVP: **Prometheus/Grafana UI only** (no Alertmanager service in Compose).
