# Informe de pruebas de endpoints — paso 7 (T-03-03)

**Fecha:** 2026-05-30  
**Change:** `t-03-03-dev-seed`  
**Rama:** `feature/T-03-03-dev-seed`  
**Resultado:** PASS

## Precondiciones

- PostgreSQL activo (`npm run db:up`)
- Seed aplicado (`npm run db:seed`)
- API en `http://localhost:3001` (instancia en ejecución en puerto 3001)

## Regresión: GET /api/profile

**Comando:**

```bash
curl.exe -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3001/api/profile
```

**Respuesta:**

```json
{"id":1,"name":"Demo User","email":"demo@ConRutina.app"}
```

**HTTP:** 200

## Criterios DoD

| Campo | Esperado | Obtenido |
|-------|----------|----------|
| `id` | 1 | 1 |
| `email` | `demo@ConRutina.app` | `demo@ConRutina.app` |
| `name` | `Demo User` | `Demo User` |

## Notas

- No hay endpoints nuevos; solo validación de regresión con usuario del seed.
- `docs/api-spec.yml` sin cambios (sin alteración de contrato API).
