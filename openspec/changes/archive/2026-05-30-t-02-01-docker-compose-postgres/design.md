# Design — T-02-01 · Docker Compose para PostgreSQL 16 con volumen persistente

**Ticket:** T-02-01 · **User Story:** US-02 · **Change:** `t-02-01-docker-compose-postgres`

## Context

Tras T-01-04 el repositorio dispone de `.env.example` con `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` y `DATABASE_URL` coherentes. Sin embargo, el entorno Docker aún no cumple el DoD de T-02-01:

| Elemento | Estado actual | Objetivo (DoD T-02-01) |
|----------|---------------|-------------------------|
| `docker-compose.yml` | ✅ Existe | Renombrar servicio `postgres` → **`db`** |
| Imagen | ✅ `postgres:16-alpine` | Sin cambio |
| Variables env | ✅ `${POSTGRES_*}` desde `.env` | Sin cambio |
| Volumen | ⚠️ `conrutina_postgres_data` | **`ConRutina_postgres_data`** |
| Health check | ⚠️ `pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB` | **`pg_isready -U ${POSTGRES_USER}`** (DoD) |
| Scripts npm | ⚠️ `docker:up`, `docker:down`, `docker:logs` | Añadir **`db:up`**, **`db:down`** |
| `container_name` | `conrutina-postgres` | Opcional mantener o alinear a `conrutina-db` (no exigido por DoD) |
| Documentación | Referencia `docker:up` | Actualizar a `db:up` como comando canónico |

Referencias: `docker-compose.yml`, `package.json`, `.env.example`, `docs/development_guide.md`, `docs/product-backlog.md` (T-02-01, US-02).

**Dependencia previa:** T-01-04 (`.env.example`) — ✅ implementado.

## Goals / Non-Goals

**Goals:**

- Entregar `docker-compose.yml` conforme al DoD: servicio `db`, volumen `ConRutina_postgres_data`, health check `pg_isready -U ${POSTGRES_USER}`, puerto configurable.
- Añadir scripts `npm run db:up` y `npm run db:down` en la raíz.
- Verificar happy path: `db:up` → ~15 s → `pg_isready` acepta conexiones; persistencia tras `db:down` + `db:up`.
- Actualizar documentación de setup para usar los scripts del DoD.

**Non-Goals:**

- Prisma, migraciones, seed (T-03-xx).
- Cambios en código backend/frontend.
- CI/CD o despliegue a producción.
- Forzar eliminación de scripts `docker:*` si se mantienen como alias (ver decisión 4).

## Decisions

### 1. Renombrar servicio `postgres` → `db`

**Decisión:** Renombrar el servicio en `docker-compose.yml` a `db` tal como exige el backlog. Los scripts `db:up` / `db:down` apuntarán explícitamente a ese nombre.

**Alternativa descartada:** Mantener `postgres` como nombre — incumple el DoD y los AC Gherkin que referencian `docker compose up -d db`.

**Impacto:** Actualizar referencias en docs y cualquier script que invoque `docker compose up -d` sin nombre de servicio (hoy `docker:up` levanta todos los servicios).

### 2. Volumen nombrado `ConRutina_postgres_data`

**Decisión:** Declarar el volumen con el nombre exacto del ticket:

```yaml
volumes:
  ConRutina_postgres_data:
```

y montarlo en el servicio `db`:

```yaml
volumes:
  - ConRutina_postgres_data:/var/lib/postgresql/data
```

**Alternativa descartada:** Conservar `conrutina_postgres_data` — no cumple DoD; además el ticket usa convención PascalCase para el volumen del proyecto.

**Migración:** Desarrolladores con volumen antiguo pueden tener datos en `conrutina_postgres_data`. Documentar en `development_guide.md` que, si ya tenían datos locales bajo el nombre anterior, pueden migrar con `docker volume ls` o recrear el volumen (aceptable en desarrollo).

### 3. Health check según DoD

**Decisión:** Configurar:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
  interval: 5s
  timeout: 5s
  retries: 5
```

En Compose, usar la forma que resuelva la variable en runtime (`$$POSTGRES_USER` en el YAML si Compose expande en el host vs contenedor — validar en apply que el check funciona dentro del contenedor).

**Alternativa descartada:** Incluir `-d ${POSTGRES_DB}` — el DoD del ticket especifica solo `-U ${POSTGRES_USER}`.

### 4. Scripts npm `db:up` y `db:down`

**Decisión:** Añadir en `package.json` raíz:

```json
"db:up": "docker compose up -d db",
"db:down": "docker compose stop db"
```

`db:down` usa `stop` para no eliminar el volumen; coherente con persistencia del AC.

**Scripts `docker:*` existentes:** Mantener `docker:up` / `docker:down` / `docker:logs` como alias retrocompatibles **solo si** no contradicen el DoD — opcionalmente redirigirlos a `db` o documentarlos como deprecated en development_guide. El DoD no exige eliminarlos; prioridad: cumplir `db:up` / `db:down`.

**Alternativa descartada:** Renombrar `docker:up` → `db:up` sin alias — rompe referencias ya documentadas hasta actualizar docs en el mismo change.

### 5. Contenido objetivo de `docker-compose.yml`

Borrador alineado al DoD:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: conrutina-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - ConRutina_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  ConRutina_postgres_data:
```

Nota: en el YAML de Compose, `$$POSTGRES_USER` dentro del contenedor es el patrón habitual para que la variable se evalúe en el shell del contenedor (donde `POSTGRES_USER` está definida por `environment`).

### 6. Verificación en apply (infra)

**Decisión:** Pruebas manuales ejecutadas por el agente:

1. Copiar `.env.example` → `.env` si no existe.
2. `npm run db:up` → esperar health `healthy` o `pg_isready`.
3. Crear tabla de prueba o usar `psql` / `pg_isready -h localhost -p $POSTGRES_PORT`.
4. `npm run db:down` → `npm run db:up` → confirmar persistencia (p. ej. datos de prueba siguen presentes).
5. (Opcional edge) Simular puerto ocupado documentando salida Docker.

No aplica curl ni E2E (sin cambios API/UI). Paso curl/E2E: N/A documentado en informe.

### 7. Documentación

**Decisión:** Actualizar:

| Fichero | Cambio |
|---------|--------|
| `README.md` | Sección BD: `npm run db:up` / `db:down`; volumen `ConRutina_postgres_data` |
| `docs/development_guide.md` | §4 Base de datos: comandos canónicos `db:up`/`db:down`; nombre servicio `db` |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Renombre de volumen pierde datos locales previos | Documentar en development_guide; entorno dev puede recrear BD |
| Renombre de servicio rompe scripts/docs antiguos | Actualizar docs en el mismo change; alias `docker:*` opcionales |
| `pg_isready` no instalado en host Windows | Usar `docker compose exec db pg_isready -U $POSTGRES_USER` en verificación |
| Puerto 5432 ocupado | AC Scenario 3 — cambiar `POSTGRES_PORT` y alinear `DATABASE_URL` en `.env` |

## Migration Plan

1. Detener contenedor actual: `docker compose down` (servicio `postgres`).
2. Aplicar nuevo `docker-compose.yml` con servicio `db` y volumen `ConRutina_postgres_data`.
3. `npm run db:up` y verificar conexión con credenciales de `.env.example`.
4. Actualizar `DATABASE_URL` en `.env` si cambió `POSTGRES_PORT`.

Rollback: restaurar `docker-compose.yml` y `package.json` desde Git; volúmenes Docker no se versionan.

## Open Questions

- Ninguna bloqueante. En apply, confirmar sintaxis exacta del health check (`$$POSTGRES_USER` vs interpolación Compose) con `docker compose ps` mostrando `healthy`.
