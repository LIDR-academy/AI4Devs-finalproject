# Edge Simulation Test Results - Entrega 2

## Contexto

Fecha de ejecucion: 2026-06-09  
Agente: QA  
Alcance: validacion del flujo completo Backend + PostgreSQL + Edge en modo `simulation`.

Fuentes revisadas:

- `docs/delivery/01-alcance-entrega2.md`
- `docs/delivery/02-plan-delivery-entrega2.md`
- `docs/architecture/architecture-entrega2.md`
- `docs/api-design.md`
- `backend/README.md`
- `edge/README.md`
- `docs/evidence/backend-api-test-results.md`
- `backend/`
- `edge/`

Nota: `docs/delivery/roadmap-entregas.md` fue solicitado como contexto, pero no existe en el repositorio al momento de esta prueba.

## Comandos usados

### Verificar PostgreSQL en Docker

```powershell
docker compose ps
```

### Verificar backend

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/health"
```

### Ejecutar Edge simulation

```powershell
cd edge
python src\edge_runner.py --backend-url http://localhost:3000 --config config\edge.config.example.json
```

### Consultar dashboard operacional

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational" | ConvertTo-Json -Depth 10
```

## Resultados por criterio

| Criterio | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| 1. Docker PostgreSQL levantado | Contenedor PostgreSQL corriendo en host `5434` | `robodock-postgres` corriendo con `0.0.0.0:5434->5432/tcp` | OK |
| 2. Backend levantado | Backend disponible en `http://localhost:3000` | Healthcheck respondio correctamente | OK |
| 3. `GET /health` responde OK | JSON con `status=ok` | `{"status":"ok","service":"robodock-backend"}` | OK |
| 4. Edge simulation se ejecuta | Runner termina sin error | Exit code 0 y resumen final impreso | OK |
| 5. Crea sesion `TRUCK-001` | Sesion activa con `truckCode=TRUCK-001` | `UNLOAD-20260609-003` creada para `TRUCK-001` | OK |
| 6. Registra cubos simulados | Cubos red/blue/yellow registrados | 3 cubos registrados: red 1, blue 1, yellow 1 | OK |
| 7. Registra accion robot simulation | Accion `PICK_AND_DROP` con `mode=simulation` | `ACTION-001`, `status=SUCCESS`, `mode=simulation` | OK |
| 8. Dashboard refleja flujo | Dashboard muestra sesion, conteos y accion | Dashboard muestra sesion activa, total 3 y ultima accion | OK |
| 9. No ejecuta hardware real | Sin camara real ni MaxArm real | Runner y docs declaran solo `simulation`; metadata usa `dryRun=true` | OK |

## Evidencia de entorno

### Docker PostgreSQL

Resultado obtenido:

```text
NAME                IMAGE         COMMAND                  SERVICE    CREATED        STATUS        PORTS
robodock-postgres   postgres:16   "docker-entrypoint.s..." postgres   21 hours ago   Up 21 hours   0.0.0.0:5434->5432/tcp, [::]:5434->5432/tcp
```

### Healthcheck backend

Resultado obtenido:

```json
{
  "status": "ok",
  "service": "robodock-backend"
}
```

## Evidencia Edge simulation

### QR simulado

```json
{
  "mode": "simulation",
  "rawValue": "TRUCK-001",
  "truckCode": "TRUCK-001",
  "isValidTruckCode": true
}
```

### Sesion creada

```json
{
  "id": "7366f96f-ef77-4052-a63f-73c14710d973",
  "code": "UNLOAD-20260609-003",
  "status": "IN_PROGRESS",
  "truckCode": "TRUCK-001",
  "startedAt": "2026-06-09T21:53:52.729Z",
  "finishedAt": null,
  "cubes": [],
  "robotActions": []
}
```

### Cubos simulados registrados

```json
{
  "summary": {
    "red": 1,
    "blue": 1,
    "green": 0,
    "yellow": 1,
    "total": 3
  },
  "cubes": [
    {
      "code": "CUBE-001",
      "color": "red",
      "confidence": 0.9,
      "x": 143,
      "y": 323,
      "w": 84,
      "h": 68
    },
    {
      "code": "CUBE-002",
      "color": "blue",
      "confidence": 0.88,
      "x": 220,
      "y": 300,
      "w": 80,
      "h": 70
    },
    {
      "code": "CUBE-003",
      "color": "yellow",
      "confidence": 0.86,
      "x": 310,
      "y": 340,
      "w": 76,
      "h": 75
    }
  ]
}
```

### Accion robot simulada

```json
{
  "id": "8190aeb5-c008-4ec4-9790-ef52af17fe2b",
  "code": "ACTION-001",
  "sessionId": "7366f96f-ef77-4052-a63f-73c14710d973",
  "actionType": "PICK_AND_DROP",
  "status": "SUCCESS",
  "mode": "simulation",
  "color": "red",
  "createdAt": "2026-06-09T21:53:52.802Z"
}
```

## Evidencia dashboard operacional

Resultado obtenido desde `GET /dashboard/operational`:

```json
{
  "activeSession": {
    "id": "7366f96f-ef77-4052-a63f-73c14710d973",
    "code": "UNLOAD-20260609-003",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T21:53:52.729Z",
    "finishedAt": null
  },
  "counts": {
    "red": 1,
    "blue": 1,
    "green": 0,
    "yellow": 1,
    "total": 3
  },
  "lastActions": [
    {
      "id": "8190aeb5-c008-4ec4-9790-ef52af17fe2b",
      "code": "ACTION-001",
      "actionType": "PICK_AND_DROP",
      "status": "SUCCESS",
      "mode": "simulation",
      "color": "red",
      "createdAt": "2026-06-09T21:53:52.802Z"
    }
  ]
}
```

## Validacion de no hardware real

- No se invoco camara real.
- No se invoco OpenCV.
- No se abrio puerto serial.
- No se envio comando a MaxArm real.
- El payload de robot usa `mode=simulation`.
- La metadata de robot incluye `dryRun=true`.
- `edge/README.md` declara que camara real y MaxArm real quedan fuera de Entrega 2.

## Defectos encontrados

| ID | Severidad | Descripcion | Evidencia | Recomendacion |
|---|---|---|---|---|
| QA-EDGE-001 | Baja | `docs/delivery/roadmap-entregas.md` fue solicitado como contexto, pero no existe. | `Test-Path docs/delivery/roadmap-entregas.md` retorno `False`. | Crear roadmap o removerlo de prompts futuros. |
| QA-EDGE-002 | Baja | La prueba genera nuevas sesiones activas en cada ejecucion; el dashboard muestra la ultima sesion activa. | Sesion `UNLOAD-20260609-003` creada durante QA. | Para pruebas repetibles futuras, agregar endpoint o script de limpieza/cierre de sesion. |

## Recomendaciones minimas

- Mantener `simulation` como modo default del Edge.
- Agregar en una siguiente iteracion un comando de smoke test automatizado para Backend + Edge.
- Crear documentacion de roadmap si seguira usandose como contexto obligatorio.
- Para Entrega 3, agregar hardware real solo detras de una bandera explicita y con `dryRun` previo.
- Considerar endpoint de cierre de sesion o limpieza de datos de prueba para ciclos QA repetibles.

## Estado general

**APROBADO CON OBSERVACIONES**

El flujo completo de Entrega 2 queda validado:

```text
PostgreSQL Docker -> Backend -> Edge simulation -> sesion -> cubos -> accion robot simulation -> dashboard operacional
```
