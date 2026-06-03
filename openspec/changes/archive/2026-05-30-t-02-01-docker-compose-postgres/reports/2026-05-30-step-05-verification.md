# Informe de verificación — Paso 5 · T-02-01

**Change:** `t-02-01-docker-compose-postgres`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-02-01-docker-compose-postgres`  
**Estado:** PASS

## Resumen

Implementación alineada al DoD: servicio Compose `db`, volumen `ConRutina_postgres_data`, health check `pg_isready -U $POSTGRES_USER`, scripts `npm run db:up` / `db:down` y documentación actualizada.

## Tests unitarios (paso 4)

**N/A — ticket de infraestructura.** No existen tests en el repositorio que referencien `docker-compose`, servicio `postgres` o scripts `docker:*`.

## Verificaciones ejecutadas

| ID | Comando / acción | Resultado |
|----|------------------|-----------|
| 5.1 | `npm run lint` | PASS — exit code 0 |
| 5.2 | `npm run db:up` + `docker compose ps` | PASS — servicio `db` Up (healthy) |
| 5.3 | `docker compose exec db pg_isready -U conrutina` | PASS — `accepting connections` |
| 5.4 | `docker compose exec db pg_isready -h localhost -p 5432 -U conrutina` | PASS — `accepting connections` |
| 5.5 | Tabla `_t02_persist_test`, `db:down`, `db:up`, `SELECT` | PASS — fila `42` persiste; volumen `conrutina_ConRutina_postgres_data` presente |
| 5.7 | `npm run dev:api` | PASS — log `[API] PostgreSQL → base de datos: conrutina` (puerto 3001 ya ocupado por otra instancia; conexión BD OK) |
| 5.8 | `npm run dev:web` | PASS — Vite arrancó (`http://localhost:5176/`; puertos 5173–5175 ocupados) |

## Entorno

- `.env` creado desde `.env.example`
- Coherencia `POSTGRES_*` ↔ `DATABASE_URL`: usuario `conrutina`, BD `conrutina`, puerto `5432`
- Contenedor huérfano `conrutina-postgres` (servicio antiguo) eliminado con `docker compose down --remove-orphans` antes del happy path

## Edge case — puerto ocupado (5.6, opcional)

Al intentar `db:up` con el contenedor legacy `conrutina-postgres` aún en ejecución en `:5432`, Docker respondió:

```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

Tras `--remove-orphans`, el arranque fue exitoso. Desarrolladores con conflicto de puerto pueden cambiar `POSTGRES_PORT` y alinear `DATABASE_URL` en `.env`.

## Pasos N/A

- **Paso curl N/A — T-02-01 no altera la API**
- **Paso E2E N/A — T-02-01 solo afecta Docker Compose y scripts npm**

## Ficheros modificados

- `docker-compose.yml` — servicio `db`, volumen `ConRutina_postgres_data`, health check
- `package.json` — scripts `db:up`, `db:down`; alias `docker:*` apuntan a `db`
- `README.md`, `docs/development_guide.md` — comandos canónicos y volumen
