# MecaTrack observability (Prometheus)

Optional Docker Compose profile that scrapes the NestJS API metrics endpoint added in **US-O2**.

## Prerequisites

- Docker Compose stack with services `postgres`, `api`, and `web` (root `docker-compose.yml`).
- API image includes `GET /api/metrics` (US-O2) and preferably `GET /api/health/ready` (US-O1).

## Start with observability

From the repository root (or the production deploy copy that uses this compose file):

```bash
docker compose --profile observability up -d
```

Core workshop services (`postgres`, `api`, `web`) start as usual. Prometheus starts only when the `observability` profile is enabled.

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

## API readiness healthcheck

The `api` service healthcheck calls `GET /api/health/ready` with Node’s built-in `fetch` (Alpine image has no `wget`). Healthy = HTTP 2xx from readiness.

## Security notes

- Prometheus UI binds to `127.0.0.1:9090` only (not published on all interfaces).
- Do not mount the app `.env` into Prometheus.
- Prefer scraping on the Docker network; do not publish a dedicated host port for `/api/metrics`.
- Default TSDB retention is fine for a local workshop; override with `--storage.tsdb.retention.time` (e.g. `15d`) if needed.

## Out of scope here

- Grafana dashboards → **US-O4**
- Alert rules / runbooks → **US-O5**
