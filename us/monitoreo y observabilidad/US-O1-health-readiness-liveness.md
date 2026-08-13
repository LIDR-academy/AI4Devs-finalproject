# US-O1 — Health Checks (Liveness / Readiness)

**Fuente:** Epic monitoreo y observabilidad (Prometheus / Grafana) · **Prioridad:** Alta (fundación)  
**Rama de implementación:** `finalproject-RFM`  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno

---

## [original] Historia de Usuario

**Como** operador o desarrollador de MecaTrack,  
**quiero** endpoints de salud que indiquen si la API está viva y lista para tráfico,  
**para** detectar caídas y fallos de dependencia (p. ej. base de datos) sin revisar logs a ciegas.

## [original] Criterios de Aceptación

- [ ] Existe un endpoint de liveness que responde OK si el proceso API está en ejecución.
- [ ] Existe un endpoint de readiness que falla si la base de datos no responde.
- [ ] Los códigos HTTP permiten automatizar probes (`200` sano, no-2xx si no listo).

---

## [enhanced] Historia de Usuario

**Como** operador del taller / desarrollador que despliega MecaTrack,  
**quiero** que la API NestJS exponga **liveness** y **readiness** bajo el prefijo global `/api`, con comprobación real de PostgreSQL vía Prisma en readiness,  
**para** que Docker Compose, Prometheus y Grafana distingan “proceso arriba” vs “listo para servir” y las alertas/dashboards no mientan cuando la API escucha pero la DB está caída.

**Contexto / gap actual**

- `apps/api` usa `app.setGlobalPrefix('api')` en `main.ts`.
- `AppModule` no importa ningún módulo health/metrics.
- `docker-compose.yml` solo tiene `healthcheck` en `postgres` (`pg_isready`); el servicio `api` **no** declara healthcheck.
- Sin esto, US-O3/O4/O5 no tienen señal canónica de “API lista”.

**Alcance**

| Incluye | No incluye (otra US / más tarde) |
|---------|----------------------------------|
| `GET /api/health/live` | `/api/metrics` (US-O2) |
| `GET /api/health/ready` + check DB | Contenedores Prometheus/Grafana (US-O3/O4) |
| DTOs JSON estables + tests | Health del contenedor `web` (Next.js) |
| Docs en `apps/api/README.md` | Deep checks (disco, email D2, Redis) |
| OpenAPI ops opcional | Autenticación JWT en probes |

**Dependencias:** US-001 (API Nest + Prisma). **Habilita:** US-O3 (healthcheck Compose), US-O4/O5.

---

## [enhanced] Criterios de Aceptación

### Contratos HTTP (canónicos)

Prefijo: `/api`. **Sin** `Authorization`. Mensajes/claves JSON en **inglés**.

#### `GET /api/health/live`

| | |
|--|--|
| **Propósito** | Liveness: el proceso Node/Nest responde |
| **200** | `{ "status": "ok" }` |
| **DB** | **No** consultar Prisma |
| **Auth** | Público (probe) |

#### `GET /api/health/ready`

| | |
|--|--|
| **Propósito** | Readiness: API + PostgreSQL utilizable |
| **Check** | `prisma.$queryRaw\`SELECT 1\`` (o equivalente) |
| **200** | `{ "status": "ok", "checks": { "database": "up" } }` |
| **503** | `{ "status": "error", "checks": { "database": "down" } }` |
| **Auth** | Público (probe) |
| **Timeout** | Fallar ready si la query supera ~2–3s (documentar) |

### Seguridad / NFR

- [ ] No devolver `DATABASE_URL`, stack traces, ni nombres de tablas en el body de error.
- [ ] No registrar PII en logs del health module.
- [ ] Latencia del ready check en happy path típicamente &lt; 100ms en local.
- [ ] Rate: probes frecuentes OK; no abrir conexiones Prisma nuevas por request si el pool ya existe.

### Archivos a crear / modificar (arquitectura actual)

```
apps/api/src/modules/health/
  health.module.ts
  health.controller.ts
  health.service.ts
  health.service.spec.ts
  dto/health-live-response.dto.ts
  dto/health-ready-response.dto.ts
apps/api/src/app.module.ts          # import HealthModule
apps/api/README.md                  # document endpoints
docs/api-spec.health.yml            # NEW (opcional pero recomendado)
apps/api/test/health.e2e-spec.ts    # NEW (recomendado)
```

**Decisión de implementación (elegir una y documentarla en el PR):**

1. **Preferida MVP:** módulo custom ligero + `PrismaService` (menos deps).
2. **Alternativa:** `@nestjs/terminus` + `PrismaHealthIndicator` custom.

### Pasos de implementación (orden TDD)

1. Red: test unitario `HealthService.checkDatabase` OK / throw → down.
2. Red: controller specs o e2e live `200`, ready `200` con DB, ready `503` con Prisma mockeado a fallo.
3. Green: implementar service + controller + module; registrar en `AppModule`.
4. Docs: README + OpenAPI health.
5. (Opcional en esta US o US-O3) añadir `healthcheck` al servicio `api` en Compose usando `wget`/`curl` a `/api/health/ready`.

### Pruebas

| Tipo | Caso |
|------|------|
| Unit | DB up → `{ database: 'up' }` |
| Unit | Prisma reject → ready status error |
| E2E | `GET /api/health/live` → 200 sin login |
| E2E | `GET /api/health/ready` → 200 con Postgres de test |
| Manual | Detener Postgres → ready 503; live sigue 200 |

### Documentación

- [ ] `apps/api/README.md`: tabla live vs ready, códigos, ejemplo `curl`.
- [ ] Mencionar uso futuro por Docker/Prometheus.

### Definition of Done

- [ ] AC enhanced cumplidos
- [ ] Tests unit (+ e2e si viable) en verde
- [ ] Docs actualizadas
- [ ] Disponible en rama `finalproject-RFM`

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| Backend developer | Módulo health + tests |
| Operador / DevOps | Consume probes en deploy |
| QA | Smoke curl live/ready |

## Notas de producto

Distinguir live/ready evita reinicios innecesarios: si la DB cae, orquestadores pueden marcar **unready** (dejar de enviar tráfico) sin matar el proceso hasta política de restart.
