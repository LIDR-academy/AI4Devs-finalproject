# Backend API Test Results - Entrega 2

## Contexto

Fecha de ejecucion: 2026-06-08  
Agente: QA  
Alcance: validacion funcional del backend MVP con PostgreSQL local en Docker y datos simulados tipo Edge.

Fuentes revisadas:

- `docs/delivery/04-backend-implementation-plan.md`
- `docs/architecture/architecture-entrega2.md`
- `backend/README.md`
- `backend/`

Nota: `docs/api-design.md` fue solicitado como contexto, pero no existe en el repositorio al momento de esta prueba.

## Preparacion del entorno

### Comandos usados

```powershell
docker version
docker compose up -d
cd backend
npm run build
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

### Resultado esperado

- Docker disponible.
- PostgreSQL levantado con `docker-compose.yml`.
- Backend compila.
- Prisma aplica migraciones.
- Seed carga datos demo.
- Backend queda escuchando en `http://localhost:3000`.

### Resultado obtenido

- Docker disponible.
- Contenedor `robodock-postgres` corriendo.
- `npm run build` OK.
- `npm run prisma:migrate -- --name init` reporto base sincronizada.
- Durante `prisma migrate dev`, Prisma mostro advertencia `EPERM` al renombrar `query_engine-windows.dll.node`, aunque el comando termino con exit code 0.
- `npm run prisma:seed` OK.
- Backend levantado correctamente para pruebas HTTP.

## Resumen de endpoints

| Endpoint | Estado QA |
|---|---|
| `GET /health` | OK |
| `POST /sessions` | OK |
| `GET /sessions` | OK |
| `GET /sessions/:id` | OK |
| `POST /sessions/:id/cubes` | OK |
| `POST /robot/actions` | OK |
| `GET /dashboard/operational` | OK |

## Flujo probado

### 1. `GET /health`

Comando PowerShell:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/health"
```

Comando curl:

```bash
curl http://localhost:3000/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "service": "robodock-backend"
}
```

Resultado obtenido:

```json
{
  "status": "ok",
  "service": "robodock-backend"
}
```

Estado: OK.

### 2. `POST /sessions`

Comando PowerShell:

```powershell
$session = Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/sessions" `
  -ContentType "application/json" `
  -Body '{"truckCode":"TRUCK-001"}'
```

Comando curl:

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"truckCode":"TRUCK-001"}'
```

Resultado esperado:

- HTTP 201.
- Sesion creada con `id` UUID.
- `code` funcional.
- `truckCode = TRUCK-001`.
- `status = IN_PROGRESS`.

Resultado obtenido:

```json
{
  "session": {
    "id": "cd3d3487-c216-47d7-9504-9a86a4d62aaf",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T01:06:25.803Z",
    "finishedAt": null,
    "cubes": [],
    "robotActions": []
  }
}
```

Estado: OK.

### 3. `GET /sessions`

Comando PowerShell:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions"
```

Comando curl:

```bash
curl http://localhost:3000/sessions
```

Resultado esperado:

- HTTP 200.
- Lista de sesiones.
- Incluye sesion creada y datos seed si existen.

Resultado obtenido:

- HTTP 200.
- Retorno lista con sesion creada `UNLOAD-20260608-001`.
- Retorno sesion seed `UNLOAD-DEMO-001`.

Estado: OK.

### 4. `GET /sessions/:id`

Comando PowerShell:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions/$($session.session.id)"
```

Comando curl:

```bash
curl http://localhost:3000/sessions/cd3d3487-c216-47d7-9504-9a86a4d62aaf
```

Resultado esperado:

- HTTP 200.
- Retorna la sesion solicitada por UUID.

Resultado obtenido:

```json
{
  "session": {
    "id": "cd3d3487-c216-47d7-9504-9a86a4d62aaf",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T01:06:25.803Z",
    "finishedAt": null,
    "cubes": [],
    "robotActions": []
  }
}
```

Estado: OK.

### 5. `POST /sessions/:id/cubes`

Comando PowerShell:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/sessions/$($session.session.id)/cubes" `
  -ContentType "application/json" `
  -Body '{
    "source": "simulation",
    "cubes": [
      { "color": "red", "x": 143, "y": 323, "w": 84, "h": 68, "confidence": 0.9 },
      { "color": "blue", "x": 220, "y": 300, "w": 80, "h": 70, "confidence": 0.88 }
    ]
  }'
```

Comando curl:

```bash
curl -X POST http://localhost:3000/sessions/cd3d3487-c216-47d7-9504-9a86a4d62aaf/cubes \
  -H "Content-Type: application/json" \
  -d '{"source":"simulation","cubes":[{"color":"red","x":143,"y":323,"w":84,"h":68,"confidence":0.9},{"color":"blue","x":220,"y":300,"w":80,"h":70,"confidence":0.88}]}'
```

Resultado esperado:

- HTTP 201.
- Cubos asociados a la sesion.
- Colores y bounding boxes persistidos.

Resultado obtenido:

```json
{
  "session": {
    "id": "cd3d3487-c216-47d7-9504-9a86a4d62aaf",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
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
      }
    ]
  }
}
```

Estado: OK.

### 6. `POST /robot/actions`

Comando PowerShell:

```powershell
$actionBody = @{
  sessionId = $session.session.id
  actionType = "PICK_AND_DROP"
  status = "SUCCESS"
  mode = "simulation"
  color = "red"
  metadata = @{
    dryRun = $true
    commandPreview = "POSE 32 -204 124 1"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/robot/actions" `
  -ContentType "application/json" `
  -Body $actionBody
```

Comando curl:

```bash
curl -X POST http://localhost:3000/robot/actions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"cd3d3487-c216-47d7-9504-9a86a4d62aaf","actionType":"PICK_AND_DROP","status":"SUCCESS","mode":"simulation","color":"red","metadata":{"dryRun":true,"commandPreview":"POSE 32 -204 124 1"}}'
```

Resultado esperado:

- HTTP 201.
- Accion robot asociada a la sesion.
- `mode = simulation`.
- No declara ni ejecuta hardware real.

Resultado obtenido:

```json
{
  "action": {
    "id": "73fa172a-300e-46bc-9905-06e5a7269884",
    "code": "ACTION-001",
    "sessionId": "cd3d3487-c216-47d7-9504-9a86a4d62aaf",
    "actionType": "PICK_AND_DROP",
    "status": "SUCCESS",
    "mode": "simulation",
    "color": "red",
    "createdAt": "2026-06-09T01:06:25.895Z"
  }
}
```

Estado: OK.

### 7. `GET /dashboard/operational`

Comando PowerShell:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational"
```

Comando curl:

```bash
curl http://localhost:3000/dashboard/operational
```

Resultado esperado:

- HTTP 200.
- Retorna sesion activa.
- Conteos por color.
- Ultimas acciones robot.

Resultado obtenido:

```json
{
  "activeSession": {
    "id": "cd3d3487-c216-47d7-9504-9a86a4d62aaf",
    "code": "UNLOAD-20260608-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T01:06:25.803Z",
    "finishedAt": null
  },
  "counts": {
    "red": 1,
    "blue": 1,
    "green": 0,
    "yellow": 0,
    "total": 2
  },
  "lastActions": [
    {
      "id": "73fa172a-300e-46bc-9905-06e5a7269884",
      "code": "ACTION-001",
      "actionType": "PICK_AND_DROP",
      "status": "SUCCESS",
      "mode": "simulation",
      "color": "red",
      "createdAt": "2026-06-09T01:06:25.895Z"
    }
  ]
}
```

Estado: OK.

## Defectos encontrados

| ID | Severidad | Descripcion | Evidencia | Recomendacion |
|---|---|---|---|---|
| QA-BE-001 | Baja | `backend/README.md` documenta `DATABASE_URL` antigua con usuario `robodock`, DB `robodock` y puerto `5432`. | `.env.example` usa correctamente `robodock_user`, `robodockdb`, puerto `5434`. | Actualizar README para evitar confusion al configurar entorno. |
| QA-BE-002 | Baja | `docs/api-design.md` fue solicitado como contexto pero no existe. | `Test-Path docs/api-design.md` retorno `False`. | Crear docs API o actualizar instrucciones para usar `backend/README.md` y arquitectura como fuente. |
| QA-BE-003 | Baja | `prisma migrate dev` mostro advertencia `EPERM` al renombrar `query_engine-windows.dll.node`, aunque termino con exit code 0. | Salida de migracion con `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`. | Si se repite, cerrar procesos Node/Prisma y ejecutar `npm run prisma:generate` manualmente. |
| QA-BE-004 | Media | La arquitectura documenta endpoints con prefijo `/api`, pero el backend implementado y README usan rutas sin prefijo (`/health`, `/sessions`, etc.). | `docs/architecture/architecture-entrega2.md` vs `backend/README.md`. | Alinear documentacion o agregar prefijo en una iteracion futura. No bloquea MVP porque endpoints esperados por esta prueba funcionan. |

## Recomendaciones minimas

- Actualizar `backend/README.md` para usar la `DATABASE_URL` vigente de Docker.
- Definir una fuente unica de verdad para endpoints: arquitectura con `/api` o backend actual sin prefijo.
- Crear `docs/api-design.md` si se seguira usando como documento de referencia QA/API.
- Agregar un script de smoke test automatizado cuando el flujo Edge simulado exista.
- Mantener `mode = simulation` como default y no declarar hardware real como implementado.

## Resultado QA

El backend MVP queda validado funcionalmente para el flujo principal de Entrega 2:

```text
crear sesion -> registrar cubos simulados -> registrar accion robot simulada -> consultar dashboard operacional
```

Estado general: **APROBADO CON OBSERVACIONES MENORES**.
