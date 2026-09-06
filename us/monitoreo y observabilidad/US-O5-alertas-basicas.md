# US-O5 — Alertas Básicas (Prometheus / Grafana)

**Fuente:** Epic monitoreo y observabilidad (Prometheus / Grafana) · **Prioridad:** Media-Alta  
**Rama de implementación:** `finalproject-RFM`  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** operador de MecaTrack,  
**quiero** alertas cuando el servicio cae o se degrada,  
**para** enterarme antes de que los mecánicos reporten que “no funciona el sistema”.

## [original] Criterios de Aceptación

- [ ] Se dispara una alerta si la API deja de reportar métricas / está caída.
- [ ] Se dispara una alerta si la tasa de errores es anormalmente alta.
- [ ] Las reglas están en el repositorio y se cargan automáticamente.

---

## [enhanced] Historia de Usuario

**Como** operador / desarrollador del despliegue del taller,  
**quiero** tres reglas Prometheus (`MecaTrackApiDown`, `MecaTrackHighHttp5xx`, `MecaTrackHighLatencyP95`) versionadas, cargadas automáticamente, visibles en Grafana Alerting **y** un runbook corto,  
**para** detectar caídas y degradación con umbrales explícitos sin montar PagerDuty.

**Decisión MVP de notificación**

| Opción | Cuándo |
|--------|--------|
| **A (preferida MVP)** | Solo Prometheus rules + Grafana Unified Alerting UI (sin Alertmanager extra) |
| **B** | Añadir `alertmanager` en Compose con receiver webhook/email stub |

La implementación debe elegir **A** salvo que el entregable del curso exija Alertmanager; documentar la elección.

**Alcance / fuera de alcance**

| Incluye | No incluye |
|---------|------------|
| 3 alert rules + `rule_files` | PagerDuty / Opsgenie / SMS |
| Umbrales documentados + `for:` | Auto-restart / auto-heal |
| Runbook por alerta | Alertas de negocio (OT atascadas, D4) |
| Prueba controlada down→fire→resolve | SLO formales / error budgets |

**Dependencias:** US-O3 (Prometheus). US-O4 recomendada (UI). US-O1 útil en runbook (`/api/health/ready`).

---

## [enhanced] Criterios de Aceptación

### Ficheros

```
infra/observability/prometheus/
  prometheus.yml          # + rule_files
  rules/mecatrack.yml     # NEW
infra/observability/runbooks/
  alerts.md               # NEW — ES para operadores OK
```

### Reglas canónicas (ajustar umbrales en docs)

```yaml
groups:
  - name: mecatrack.api
    rules:
      - alert: MecaTrackApiDown
        expr: up{job="mecatrack-api"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "MecaTrack API scrape is down"
          description: "Prometheus target mecatrack-api has been down for >2m."

      - alert: MecaTrackHighHttp5xx
        expr: |
          (
            sum(rate(mecatrack_http_requests_total{status_code=~"5.."}[5m]))
            /
            clamp_min(sum(rate(mecatrack_http_requests_total[5m])), 0.001)
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High HTTP 5xx ratio on MecaTrack API"
          description: "5xx ratio >5% for 5m."

      - alert: MecaTrackHighLatencyP95
        expr: |
          histogram_quantile(
            0.95,
            sum(rate(mecatrack_http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High p95 latency on MecaTrack API"
          description: "p95 latency >2s for 10m."
```

- [ ] `prometheus.yml` incluye `rule_files: [ /etc/prometheus/rules/*.yml ]` y monta el directorio.
- [ ] Al arrancar, `http://127.0.0.1:9090/rules` muestra el group `mecatrack.api`.
- [ ] Nombres de métricas **alineados a US-O2**; si US-O2 cambió prefijo, actualizar rules en el mismo PR o follow-up inmediato.

### Umbrales (NFR de producto)

| Alerta | Default MVP | Notas |
|--------|-------------|-------|
| ApiDown | `for: 2m` | Evitar flapping en restart corto |
| HighHttp5xx | 5% / 5m | Exigir tráfico vía `clamp_min` |
| HighLatencyP95 | 2s / 10m | Ajustar tras medición real en taller |

- [ ] Documentar en runbook que son **puntos de partida**, no SLO contractuales.

### Runbook (`alerts.md`) — por cada alerta

- [ ] Síntomas
- [ ] Checks: Prometheus target, `curl /api/health/live`, `curl /api/health/ready`, `docker logs mecatrack-api`, Postgres `5434`
- [ ] Mitigación típica: `docker compose restart api` / verificar `.env` `DATABASE_URL` / disco
- [ ] Escalado: si ready 503 → DB; si live down → contenedor/crash loop

### Verificación

| Prueba | Esperado |
|--------|----------|
| `docker compose stop api` esperar &gt;2m | `MecaTrackApiDown` pending→firing |
| `docker compose start api` | Alerta resuelve |
| (Opcional) generar 5xx artificial en staging | HighHttp5xx (si reproducible sin hack peligroso) |

### Seguridad

- [ ] No poner webhooks con tokens en git.
- [ ] Annotations sin PII.

### Definition of Done

- [ ] 3 rules cargadas + prueba Down fire/resolve
- [ ] Runbook en repo
- [ ] En `finalproject-RFM`

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| DevOps | Rules + wiring |
| Operador | Ejecuta runbook |
| Backend | Valida PromQL vs métricas reales |

## Pasos de implementación

1. Crear `rules/mecatrack.yml` con las 3 alertas.
2. Montar `rules/` en Prometheus y referenciar `rule_files`.
3. Reload Prometheus (`/-/reload` si lifecycle enabled) o recrear contenedor.
4. Escribir runbook.
5. Ejecutar prueba controlada ApiDown y adjuntar nota/evidencia en PR description.
