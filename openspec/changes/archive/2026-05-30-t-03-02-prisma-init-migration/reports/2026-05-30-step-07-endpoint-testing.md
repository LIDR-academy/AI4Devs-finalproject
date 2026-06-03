# Informe de pruebas de endpoints — Paso 7 · T-03-02

**Change:** `t-03-02-prisma-init-migration`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-03-02-prisma-init-migration`  
**Estado:** PASS

## Alcance

Sin cambios de contrato API. Verificar regresión de `GET /api/profile` contra tablas migradas en PostgreSQL.

## Precondiciones

| Elemento | Estado |
| -------- | ------ |
| PostgreSQL | `conrutina-db` Up (healthy) |
| Backend | `npm run dev:api` en puerto 3001 |
| Usuario `id=1` | Insertado: `demo@conrutina.local`, `Demo User` |

## Prueba ejecutada

**Request:**

```bash
curl.exe -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3001/api/profile
```

**Response:**

```json
{"id":1,"name":"Demo User","email":"demo@conrutina.local"}
HTTP_STATUS:200
```

## Resultado

| Endpoint | Método | HTTP | Cuerpo esperado | Resultado |
| -------- | ------ | ---- | --------------- | --------- |
| `/api/profile` | GET | 200 | `{ id, name, email }` del usuario `id=1` | PASS |

## Notas

- El usuario demo se insertó manualmente (T-03-03 aportará seed oficial).
- No se modificó `docs/api-spec.yml` (sin cambios de contrato).
