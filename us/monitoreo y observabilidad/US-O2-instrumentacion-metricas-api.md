# US-O2 — Instrumentación de Métricas en la API

**Fuente:** Epic monitoreo y observabilidad (Prometheus / Grafana) · **Prioridad:** Alta  
**Rama de implementación:** `finalproject-RFM`  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** desarrollador u operador de MecaTrack,  
**quiero** que la API exponga métricas en formato Prometheus,  
**para** medir tráfico, errores y latencia sin instrumentación ad-hoc.

## [original] Criterios de Aceptación

- [ ] La API expone métricas scrapeables por Prometheus.
- [ ] Se pueden observar requests, errores y latencias.
- [ ] El endpoint de métricas no filtra datos sensibles de clientes/vehículos.

---

## [enhanced] Historia de Usuario

**Como** desarrollador / operador responsable del taller digital,  
**quiero** `GET /api/metrics` en formato Prometheus text exposition, con métricas HTTP **RED** (Rate, Errors, Duration) y métricas default de proceso Node,  
**para** que Prometheus (US-O3) scrapee la API y Grafana (US-O4) muestre saturación, errores y latencia del flujo real (auth, clientes, vehículos, OT, delivery).

**Gap actual:** no hay `prom-client`, interceptor ni `/metrics` en `apps/api`.

**Alcance / fuera de alcance**

| Incluye | No incluye |
|---------|------------|
| `/api/metrics` + HTTP RED | Contenedor Prometheus (US-O3) |
| Normalización de rutas (baja cardinalidad) | Dashboards (US-O4) / alertas (US-O5) |
| `collectDefaultMetrics()` Node | Contadores de negocio (“OT/día”) |
| Postura de seguridad documentada | Instrumentación Next.js `apps/web` |
| Tests de incremento de contador | OpenTelemetry tracing |

**Dependencias:** US-O1 recomendada (health ≠ metrics). **Habilita:** US-O3–O5.

---

## [enhanced] Criterios de Aceptación

### Contrato `GET /api/metrics`

| | |
|--|--|
| **Method/Path** | `GET /api/metrics` |
| **Auth JWT taller** | No (ops endpoint) |
| **200 Content-Type** | `text/plain; version=0.0.4; charset=utf-8` (o el que emita `prom-client`) |
| **Body** | Exposition format parseable por Prometheus |
| **Errores** | No devolver JSON de negocio; fallos internos → 500 genérico |

### Métricas mínimas (nombres canónicos propuestos)

Documentar en README si se ajusta el prefijo; **recomendado:**

| Métrica | Tipo | Labels (baja cardinalidad) |
|---------|------|----------------------------|
| `mecatrack_http_requests_total` | Counter | `method`, `route`, `status_code` |
| `mecatrack_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |
| Default Node | via `collectDefaultMetrics({ prefix: 'mecatrack_' })` | — |

**Normalización de `route` (obligatoria):**

- Usar path template Nest (`/api/work-orders/:id`), **nunca** UUID/placa en el label.
- Rutas 404 desconocidas → label `route="unmatched"` (o similar) para no explotar series.

**Histogram buckets:** defaults de `prom-client` OK en MVP; documentar si se customizan.

### Interceptor / middleware

- [ ] Medir **todas** las requests HTTP que pasan por Nest (incl. `/api/auth/*`, `/api/health/*`, `/api/metrics` — o excluir `/metrics` del histograma de duración para no sesgar; **decidir y documentar**).
- [ ] Registrar status real de la respuesta (incl. excepciones filtradas por `HttpExceptionFilter`).

### Seguridad / NFR

- [ ] **Prohibido** en labels/logs de métricas: `licensePlate`, `nationalId`, email, tokens, passwords, bodies.
- [ ] En Docker prod, `/metrics` solo debe ser alcanzable en la red interna (`api:4000`); **no** mapear un puerto host dedicado solo para metrics.
- [ ] DEV (`PORT=4010`): scrapeo local documentado (`curl http://localhost:4010/api/metrics`).
- [ ] Overhead: instrumentación no debe añadir &gt; ~1–2ms p50 en local vacío (orden de magnitud; no microbenchmark formal requerido).

### Archivos a crear / modificar

```
apps/api/package.json                         # + prom-client (justify)
apps/api/src/modules/metrics/
  metrics.module.ts
  metrics.controller.ts                       # GET metrics
  metrics.service.ts                          # registry, counters, histogram
  http-metrics.interceptor.ts                 # or middleware
  metrics.service.spec.ts
  route-normalizer.ts                         # pure helper + unit tests
apps/api/src/app.module.ts                    # MetricsModule + APP_INTERCEPTOR
apps/api/README.md
docs/api-spec.metrics.yml                     # optional ops spec
apps/api/test/metrics.e2e-spec.ts             # optional
```

### Pasos de implementación (TDD)

1. Unit: `normalizeRoute('/api/work-orders/uuid')` → `/api/work-orders/:id` (tabla de casos: clients, vehicles, delivery).
2. Unit: tras `observeRequest`, `mecatrack_http_requests_total` incrementa con labels dados.
3. Implement registry singleton (evitar registros duplicados en tests hot-reload).
4. Controller `GET metrics` → `register.metrics()`.
5. Global interceptor wired in `MetricsModule` / `AppModule`.
6. E2E/smoke: hit `/api/health/live` luego scrape metrics contiene serie.

### Pruebas

| Tipo | Caso |
|------|------|
| Unit | route normalizer UUID / numeric ids |
| Unit | counter + histogram observe |
| E2E/smoke | metrics endpoint 200 + contains `mecatrack_http_requests_total` |
| Manual | Generar 401/500 y ver `status_code` |

### Documentación

- [ ] README: cómo scrapear DEV/PROD, nombres de métricas, política de labels.
- [ ] Nota de seguridad: no exponer metrics a Internet.

### Definition of Done

- [ ] `/api/metrics` RED + default Node + normalizer + tests + docs
- [ ] En `finalproject-RFM`

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| Backend developer | prom-client + interceptor |
| Security reviewer | Exposición / labels |
| Operador | Consume vía Prometheus |

## Ejemplo de salida (ilustrativo)

```text
# HELP mecatrack_http_requests_total Total HTTP requests
# TYPE mecatrack_http_requests_total counter
mecatrack_http_requests_total{method="GET",route="/api/health/live",status_code="200"} 3
```
