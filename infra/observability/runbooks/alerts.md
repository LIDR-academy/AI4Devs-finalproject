# Runbook — alertas básicas MecaTrack (US-O5)

MVP de notificación: **opción A** — reglas Prometheus + UI de Prometheus/Grafana (sin Alertmanager ni PagerDuty).

Los umbrales son **puntos de partida** para un taller local, no SLOs contractuales. Ajústalos tras medir tráfico real.

| Alerta | Expresión / umbral | `for` | Severidad |
|--------|--------------------|-------|-----------|
| `MecaTrackApiDown` | `up{job="mecatrack-api"} == 0` | 2m | critical |
| `MecaTrackHighHttp5xx` | ratio 5xx > 5% | 5m | warning |
| `MecaTrackHighLatencyP95` | p95 > 2s | 10m | warning |

Reglas versionadas: `infra/observability/prometheus/rules/mecatrack.yml`  
Prometheus UI: http://127.0.0.1:9090/alerts · http://127.0.0.1:9090/rules  
Grafana UI: http://127.0.0.1:3001

---

## MecaTrackApiDown

### Síntomas

- Prometheus target `mecatrack-api` en **DOWN**.
- Panel Grafana “API arriba” en rojo / `up == 0`.
- El taller no puede usar la app (login / API vía proxy).

### Checks

1. Targets: http://127.0.0.1:9090/targets
2. Contenedor API: `docker ps -a --filter name=mecatrack-api`
3. Liveness (desde el host solo si publicaste la API; en prod Compose suele ser solo red interna):
   - Dentro de la red: `docker compose exec api node -e "fetch('http://127.0.0.1:4000/api/health/live').then(r=>r.json()).then(console.log)"`
4. Readiness: mismo patrón contra `/api/health/ready` — `200` = DB OK; `503` = DB down.
5. Logs: `docker logs mecatrack-api --tail 200`
6. Postgres: `docker ps --filter name=mecatrack-postgres` y puerto host `127.0.0.1:5434`

### Mitigación típica

- `docker compose restart api`
- Verificar `.env`: `DATABASE_URL`, secretos JWT, disco del host
- Si Postgres caído: `docker compose up -d postgres` y esperar healthcheck

### Escalado

| Señál | Interpretación |
|-------|----------------|
| `live` no responde | Contenedor parado o crash loop |
| `live` OK, `ready` 503 | Problema de base de datos / red a Postgres |
| Target DOWN pero contenedor Up | Scrape path / red Compose / proceso API |

---

## MecaTrackHighHttp5xx

### Síntomas

- Ratio de respuestas 5xx > 5% durante más de 5 minutos.
- Mecánicos ven errores al guardar clientes, OT, etc.

### Checks

1. PromQL: `sum(rate(mecatrack_http_requests_total{status_code=~"5.."}[5m]))`
2. Logs API alrededor del pico de errores
3. `/api/health/ready` — si 503, priorizar DB
4. Revisar cambios recientes de deploy / migraciones

### Mitigación típica

- Corregir causa (migración fallida, excepción no controlada, dependencia)
- `docker compose restart api` solo si es inestable por OOM/crash
- No reiniciar a ciegas si hay corrupción de datos en curso

### Escalado

- 5xx generalizados + ready 503 → DB / conexión
- 5xx en rutas concretas → bug de aplicación (revisar series por `route`)

---

## MecaTrackHighLatencyP95

### Síntomas

- p95 HTTP > 2s durante más de 10 minutos.
- UI “lenta” aunque no falle del todo.

### Checks

1. PromQL p95 del dashboard Grafana “Latencia p95”
2. CPU/RSS del proceso (`mecatrack_process_*`)
3. Carga de Postgres / consultas lentas
4. Disco / I/O del host Docker

### Mitigación típica

- Reducir carga concurrente de pruebas
- Revisar consultas N+1 o endpoints pesados (historial, listados)
- Reiniciar API solo si hay fuga de memoria evidente

### Escalado

- Latencia alta + ready OK → cuello de botella app/DB
- Latencia alta + ready flaky → saturación o red a Postgres

---

## Prueba controlada (ApiDown)

```bash
docker compose --profile observability up -d
docker compose stop api
# Esperar > 2 minutos
# En http://127.0.0.1:9090/alerts → MecaTrackApiDown pending → firing
docker compose start api
# La alerta debe resolverse tras scrape exitoso
```

No incluir webhooks con tokens en el repositorio. Annotations de alerta no deben contener PII.
