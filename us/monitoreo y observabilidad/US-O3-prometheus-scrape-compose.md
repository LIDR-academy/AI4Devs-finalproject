# US-O3 — Prometheus Scraping y Docker Compose

**Fuente:** Epic monitoreo y observabilidad (Prometheus / Grafana) · **Prioridad:** Alta  
**Rama de implementación:** `finalproject-RFM`  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** operador de MecaTrack,  
**quiero** un Prometheus en el stack Docker que recolecte métricas de la API,  
**para** almacenar series temporales sin herramientas manuales externas.

## [original] Criterios de Aceptación

- [ ] Prometheus corre junto al stack de MecaTrack.
- [ ] Scrapea métricas de la API de forma periódica.
- [ ] La configuración está versionada en el repositorio.

---

## [enhanced] Historia de Usuario

**Como** operador / desarrollador del despliegue Compose (p. ej. `C:\Despliegues\AI4Devs-finalproject`),  
**quiero** un servicio **Prometheus** versionado que scrapee `http://api:4000/api/metrics` en la red Docker de MecaTrack,  
**para** retener series locales y alimentar Grafana/alertas sin scrapers manuales en el host.

**Gap actual:** `docker-compose.yml` solo tiene `postgres`, `api`, `web` + volumen `mecatrack_pg_data`. API **sin** puerto publicado al host (correcto); scrape debe ser **DNS interno** `api:4000`.

**Decisión de producto (obligatoria en la US):**

Usar **Compose profiles** para no obligar observabilidad en cada `up`:

```bash
docker compose --profile observability up -d
```

Servicios `prometheus` (y luego `grafana` en US-O4) con `profiles: ["observability"]`.

**Alcance / fuera de alcance**

| Incluye | No incluye |
|---------|------------|
| Servicio `prometheus` + volumen TSDB | Grafana (US-O4) |
| `infra/observability/prometheus/prometheus.yml` | Alertmanager multi-canal (US-O5 puede añadir rules) |
| Job scrape `mecatrack-api` | Thanos / Grafana Cloud |
| Bind host `127.0.0.1:9090:9090` (si se publica) | Scrape de Next.js |
| Docs de arranque | Cambiar puertos prod web `3000` / postgres `5434` |

**Dependencias:** US-O2. US-O1 recomendada (opcional scrape de ready más adelante). **Habilita:** US-O4, US-O5.

---

## [enhanced] Criterios de Aceptación

### Layout de ficheros (canónico)

```
infra/observability/
  prometheus/
    prometheus.yml
    rules/                 # vacío o placeholder; US-O5 llena
  README.md                # how to run profile
docker-compose.yml         # + service prometheus (profile observability)
```

### Servicio Compose

```yaml
# illustrative — pin exact image digest/tag in implementation
prometheus:
  image: prom/prometheus:v2.54.1
  container_name: mecatrack-prometheus
  profiles: ["observability"]
  restart: unless-stopped
  command:
    - --config.file=/etc/prometheus/prometheus.yml
    - --storage.tsdb.path=/prometheus
    - --web.enable-lifecycle
  volumes:
    - ./infra/observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - mecatrack_prometheus_data:/prometheus
  ports:
    - "127.0.0.1:9090:9090"
  depends_on:
    - api
```

- [ ] Imagen **pineada** (no `latest`).
- [ ] Misma red default del compose project (resuelve `api`).
- [ ] Volumen `mecatrack_prometheus_data` declarado en `volumes:`.

### `prometheus.yml` mínimo

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: mecatrack-api
    metrics_path: /api/metrics
    static_configs:
      - targets: ["api:4000"]
```

- [ ] Tras `compose --profile observability up -d`, UI `http://127.0.0.1:9090/targets` muestra job **UP**.
- [ ] PromQL: `up{job="mecatrack-api"}` → `1`.

### Healthcheck API (recomendado en esta US si US-O1 ya merged)

- [ ] Añadir a servicio `api`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:4000/api/health/ready || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 40s
```

(Ajustar si la imagen API no tiene `wget`; alternativa `node` fetch script. Documentar herramienta elegida.)

### Seguridad / NFR

- [ ] Prometheus UI solo en loopback del host.
- [ ] No montar `.env` de la app dentro de Prometheus.
- [ ] Retención default OK para taller local; documentar `--storage.tsdb.retention.time` si se cambia (p. ej. `15d`).

### Documentación

- [ ] `infra/observability/README.md` + mención en `readme.md` §2.4 infraestructura:
  - comando de arranque con profile
  - URL Prometheus
  - dependencia de US-O2

### Verificación

| Paso | Esperado |
|------|----------|
| `docker compose --profile observability up -d` | `mecatrack-prometheus` running |
| Targets UI | `mecatrack-api` UP |
| Query `mecatrack_http_requests_total` | Series tras tráfico |
| `docker compose stop api` | Target DOWN / `up==0` |

### Definition of Done

- [ ] Profile observability + scrape UP documentado
- [ ] Config en git; bind 127.0.0.1
- [ ] En `finalproject-RFM`

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| DevOps / backend | Compose + prometheus.yml |
| Operador | Verifica targets |

## Notas

Si el curso exige observability siempre-on, se puede quitar `profiles` **pero** debe quedar justificado en el PR; por defecto preferimos profile para no romper el flujo “solo taller” en `3000`.
