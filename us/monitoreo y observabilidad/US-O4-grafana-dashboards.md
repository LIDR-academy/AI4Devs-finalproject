# US-O4 — Dashboards Grafana de MecaTrack

**Fuente:** Epic monitoreo y observabilidad (Prometheus / Grafana) · **Prioridad:** Alta  
**Rama de implementación:** `finalproject-RFM`  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** administrador técnico del taller,  
**quiero** dashboards en Grafana alimentados por Prometheus,  
**para** ver de un vistazo si MecaTrack está sano y cómo se comporta bajo uso.

## [original] Criterios de Aceptación

- [ ] Grafana está disponible junto al stack.
- [ ] Hay al menos un dashboard útil de la API.
- [ ] El datasource apunta a Prometheus sin configuración manual repetitiva.

---

## [enhanced] Historia de Usuario

**Como** operador / desarrollador de MecaTrack,  
**quiero** Grafana en el profile `observability` con datasource Prometheus **provisionado** y un dashboard JSON **MecaTrack API Overview**,  
**para** ver UP, RPS, errores 5xx y latencia p95 sin configurar Grafana a mano tras cada redeploy.

**Constraint de puertos (prod local):**

| Servicio | Puerto host típico |
|----------|-------------------|
| MecaTrack web | `3000` |
| Grafana | **`127.0.0.1:3001`** (evitar colisión) |
| Prometheus | `127.0.0.1:9090` (US-O3) |

**Alcance / fuera de alcance**

| Incluye | No incluye |
|---------|------------|
| Servicio `grafana` + profile | SSO / OAuth / LDAP |
| Provisioning datasource + dashboard | Dashboards de negocio OT/día |
| Admin user/password vía `.env` | App móvil Grafana |
| Docs de acceso | Alert rules (US-O5; paneles de alertas opcionales vacíos) |

**Dependencias:** US-O3. **Habilita:** operación diaria + visualización de alertas US-O5.

---

## [enhanced] Criterios de Aceptación

### Layout de ficheros

```
infra/observability/
  grafana/
    provisioning/
      datasources/datasource.yml
      dashboards/dashboards.yml
    dashboards/
      mecatrack-api-overview.json
  README.md
docker-compose.yml   # + grafana service (profile observability)
```

### Servicio Compose (ilustrativo)

```yaml
grafana:
  image: grafana/grafana:11.2.0
  container_name: mecatrack-grafana
  profiles: ["observability"]
  restart: unless-stopped
  environment:
    GF_SECURITY_ADMIN_USER: ${GRAFANA_ADMIN_USER:-admin}
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?GRAFANA_ADMIN_PASSWORD is required}
    GF_USERS_ALLOW_SIGN_UP: "false"
    GF_SERVER_ROOT_URL: http://127.0.0.1:3001
  volumes:
    - ./infra/observability/grafana/provisioning:/etc/grafana/provisioning:ro
    - ./infra/observability/grafana/dashboards:/var/lib/grafana/dashboards:ro
    - mecatrack_grafana_data:/var/lib/grafana
  ports:
    - "127.0.0.1:3001:3000"
  depends_on:
    - prometheus
```

- [ ] Imagen pineada.
- [ ] Password **obligatorio** desde `.env` (no default débil committed).
- [ ] Añadir `GRAFANA_ADMIN_*` a `.env.example` / docs **sin** valores secretos reales.
- [ ] Volumen `mecatrack_grafana_data`.

### Datasource provisioned

`datasource.yml`:

- type `prometheus`
- url `http://prometheus:9090`
- access `proxy`
- isDefault `true`

### Dashboard “MecaTrack API Overview” — paneles mínimos

| Panel | PromQL orientativo (ajustar a nombres US-O2) |
|-------|-----------------------------------------------|
| API Up | `up{job="mecatrack-api"}` |
| Request rate | `sum(rate(mecatrack_http_requests_total[5m]))` |
| 5xx rate | `sum(rate(mecatrack_http_requests_total{status_code=~"5.."}[5m]))` |
| 5xx ratio | 5xx / total (evitar div/0) |
| Latency p95 | `histogram_quantile(0.95, sum(rate(mecatrack_http_request_duration_seconds_bucket[5m])) by (le))` |
| (Opcional) RSS/CPU | métricas `mecatrack_process_*` / `nodejs_*` |

- [ ] Dashboard UID estable (p. ej. `mecatrack-api-overview`) para no duplicar en cada boot.
- [ ] Títulos claros (ES u EN consistente; preferir ES para operador de taller: “API arriba”, “Peticiones/s”, “Errores 5xx”, “Latencia p95”).

### Seguridad / NFR

- [ ] Bind solo `127.0.0.1`.
- [ ] `GF_USERS_ALLOW_SIGN_UP=false`.
- [ ] No commitear `grafana.db` con sesiones reales.
- [ ] Documentar cambio de password tras primer login en entornos compartidos.

### Verificación

| Paso | Esperado |
|------|----------|
| Compose profile up | Grafana listening `:3001` |
| Login admin | Entra al UI |
| Dashboards → MecaTrack API Overview | Visible sin import manual |
| Tráfico login/clientes | Paneles se mueven |
| Restart grafana | Dashboard sigue (provisioning) |

### Documentación

- [ ] `infra/observability/README.md`: URL, user env vars, profile command.
- [ ] Mencionar en `readme.md` § infraestructura.

### Definition of Done

- [ ] Grafana + datasource + overview usable
- [ ] Secrets vía env; bind localhost
- [ ] En `finalproject-RFM`

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| DevOps | Compose + provisioning JSON |
| Operador | Consume dashboard |
| Backend | Valida nombres de métricas vs US-O2 |

## Pasos de implementación

1. Añadir servicio Grafana al compose (profile).
2. Crear datasource + provider YAML.
3. Exportar/construir JSON del dashboard con paneles mínimos.
4. Probar cold start: `down -v` de grafana volume + `up` → dashboard reaparece por provisioning de ficheros.
5. Documentar.
