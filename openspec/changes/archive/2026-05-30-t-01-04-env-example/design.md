# Design — T-01-04 · Crear .env.example con todas las variables documentadas

**Ticket:** T-01-04 · **User Stories:** US-01, US-23 · **Change:** `t-01-04-env-example`

## Context

Tras T-01-01 a T-01-03 el monorepo arranca con toolchain operativo, pero falta la plantilla de entorno exigida por el backlog:

| Elemento | Estado actual |
|----------|---------------|
| `.env.example` en raíz | ❌ No existe |
| `.env` en `.gitignore` | ✅ Líneas 18–20: `.env`, `.env.*`, excepción `!.env.example` |
| Carga de env en runtime | ✅ `backend/src/loadEnv.ts` → `dotenv.config({ path: repoRoot/.env })` |
| `docker-compose.yml` | ✅ Usa `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB:-conrutina}`, `${POSTGRES_PORT:-5432}` |
| `README.md` Instalación | ⚠️ Pide crear `.env` manualmente; advierte que no hay `.env.example` |
| `docs/development_guide.md` | ⚠️ Bloque `.env` embebido con credenciales `ConRutinaUser`/`ConRutina2` (inconsistente con default `conrutina` de Compose) |
| Uso de `CORS_ORIGIN` / `NODE_ENV` en código | Parcial — `NODE_ENV` en `main.ts`; `CORS_ORIGIN` documentado en backlog para tickets posteriores |

Referencias: `docs/development_guide.md`, `docker-compose.yml`, `backend/src/main.ts`, `backend/src/loadEnv.ts`.

## Goals / Non-Goals

**Goals:**

- Entregar `.env.example` con las 8 variables del DoD y comentarios de una línea.
- Valores de ejemplo **coherentes entre sí** y con `docker-compose.yml` (usuario/contraseña/base/puerto).
- Actualizar `README.md` (Instalación) y alinear `docs/development_guide.md` con la plantilla.
- Confirmar que `.gitignore` sigue cumpliendo el DoD sin cambios estructurales.

**Non-Goals:**

- Validación Zod al arranque (T-06-01).
- Nuevas variables fuera del DoD.
- Modificar `docker-compose.yml` ni scripts npm de Docker.
- Commitear `.env` real.

## Decisions

### 1. Ubicación y formato del fichero

**Decisión:** Un único `.env.example` en la **raíz** del monorepo (misma ruta que lee `loadEnv.ts` y que usa Docker Compose vía env del shell).

Formato propuesto:

- Comentarios `#` en español, una línea por variable.
- Agrupación lógica: base de datos → API → CORS → Docker PostgreSQL → entorno Node.
- Valores sin comillas innecesarias salvo en `DATABASE_URL` (cadena con caracteres especiales).

### 2. Valores de ejemplo seguros y coherentes

**Decisión:** Usar credenciales de **desarrollo local obvias**, alineadas con el default `POSTGRES_DB=conrutina` de `docker-compose.yml`:

```env
# Cadena de conexión PostgreSQL para Prisma y el API (obligatoria para npm run dev:api)
DATABASE_URL=postgresql://conrutina:conrutina_dev_pass@localhost:5432/conrutina

# Puerto del servidor Express; debe coincidir con server.proxy en vite.config.ts
API_PORT=3001

# Origen permitido para CORS en desarrollo (URL del frontend Vite)
CORS_ORIGIN=http://localhost:5173

# Usuario del contenedor PostgreSQL (docker-compose.yml)
POSTGRES_USER=conrutina

# Contraseña del contenedor PostgreSQL — solo desarrollo local
POSTGRES_PASSWORD=conrutina_dev_pass

# Nombre de la base de datos en el contenedor
POSTGRES_DB=conrutina

# Puerto expuesto en el host para PostgreSQL
POSTGRES_PORT=5432

# Entorno Node: development | production | test
NODE_ENV=development
```

**Alternativa descartada:** Mantener `ConRutinaUser`/`ConRutina2` del development_guide — genera fricción con el default `conrutina` del Compose y confunde a nuevos desarrolladores.

### 3. Cambios mínimos en documentación

**Decisión:**

| Fichero | Cambio |
|---------|--------|
| `README.md` | Paso 3 de Instalación: `cp .env.example .env` (y nota Windows `copy .env.example .env`); eliminar advertencia de ausencia de plantilla; mantener tabla Configuración como referencia ampliada opcional |
| `docs/development_guide.md` | Sección §2: reemplazar bloque embebido por “copiar `.env.example` → `.env`” y enlace a la plantilla; unificar credenciales con la plantilla |

No modificar `docs/infrastructure.md` salvo inconsistencia crítica detectada en verificación (fuera del DoD mínimo).

### 4. Verificación en apply

**Decisión:** Pruebas de infraestructura/documentación:

1. Comprobar presencia de las 8 claves y comentarios (`grep` o revisión manual).
2. `git check-ignore -v .env` → ignorado; `git check-ignore -v .env.example` → no ignorado.
3. Copia temporal `.env` desde plantilla + `npm run dev:api` (si PostgreSQL disponible) o verificar al menos que `loadEnv` resuelve la ruta (sin commitear `.env`).
4. Revisión visual de README Instalación.

No aplica curl ni E2E (sin cambios de API/UI).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Desarrolladores con `.env` antiguo incompatible | Documentar en development_guide que pueden regenerar desde `.env.example` |
| `CORS_ORIGIN` aún no leída en código | Incluirla igualmente — DoD explícito y prepara T-06-01 / middleware CORS |
| Divergencia entre docs e infra | Una sola fuente canónica: `.env.example` |

## Open Questions

- Ninguna bloqueante. Si en apply el equipo prefiere otro prefijo de contraseña de ejemplo, mantener coherencia entre `DATABASE_URL` y `POSTGRES_*`.

## Dependencias

- **T-01-01** (monorepo, `.gitignore`) — ✅ implementado.
- **T-02-01** (scripts `db:up`) — pendiente; la plantilla ya habilita `docker compose up` manual.
