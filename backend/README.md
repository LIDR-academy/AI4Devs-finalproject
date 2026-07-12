# RoboDock AI Backend

Backend MVP para Entrega 2. Implementa API REST local con Express, TypeScript, Prisma y PostgreSQL para registrar sesiones de descarga, cubos detectados y acciones simuladas del robot.

## Alcance

- Modo principal: simulation.
- No implementa control real del MaxArm.
- No implementa autenticacion, RBAC, WebSockets ni streaming.
- Recibe datos simulados como si fueran enviados por Edge.
- Recibe trazabilidad saneada de `edge_dry_run.py` sin controlar hardware.
- Sanitiza metadata de acciones robot antes de guardarla con Prisma/PostgreSQL.

## Requisitos

- Node.js 20+
- npm
- PostgreSQL local o via Docker

## Variables de entorno

Crear `backend/.env` a partir de `backend/.env.example`.

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://robodock_user:robodock_pass@localhost:5434/robodockdb?schema=public"
CORS_ORIGIN="http://localhost:5173"
```

## Instalacion

```bash
cd backend
npm install
```

## Prisma

Generar cliente:

```bash
npm run prisma:generate
```

Ejecutar migracion:

```bash
npm run prisma:migrate -- --name init
```

En Windows, Prisma puede mostrar una advertencia no bloqueante `EPERM` al regenerar el cliente si algun proceso Node/Prisma mantiene bloqueado `query_engine-windows.dll.node`. Si se repite, cerrar procesos Node/Prisma y ejecutar:

```bash
npm run prisma:generate
```

Cargar seed:

```bash
npm run prisma:seed
```

## Ejecutar backend

```bash
npm run dev
```

El servidor queda disponible en:

```text
http://localhost:3000
```

## Endpoints

### Healthcheck

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/health"
```

```bash
curl http://localhost:3000/health
```

### Crear sesion

```powershell
$session = Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/sessions" `
  -ContentType "application/json" `
  -Body '{"truckCode":"TRUCK-001"}'

$session.session.id
```

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"truckCode":"TRUCK-001"}'
```

### Listar sesiones

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions"
```

```bash
curl http://localhost:3000/sessions
```

### Obtener sesion por id

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/sessions/$($session.session.id)"
```

```bash
curl http://localhost:3000/sessions/SESSION_ID
```

### Registrar cubos simulados

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

```bash
curl -X POST http://localhost:3000/sessions/SESSION_ID/cubes \
  -H "Content-Type: application/json" \
  -d '{"source":"simulation","cubes":[{"color":"red","x":143,"y":323,"w":84,"h":68,"confidence":0.9}]}'
```

### Registrar accion robot simulada

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/robot/actions" `
  -ContentType "application/json" `
  -Body "{
    `"sessionId`": `"$($session.session.id)`",
    `"actionType`": `"PICK_AND_DROP`",
    `"status`": `"SUCCESS`",
    `"mode`": `"simulation`",
    `"color`": `"red`",
    `"metadata`": {
      `"dryRun`": true,
      `"commandPreview`": `"POSE 32 -204 124 1`"
    }
  }"
```

```bash
curl -X POST http://localhost:3000/robot/actions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SESSION_ID","actionType":"PICK_AND_DROP","status":"SUCCESS","mode":"simulation","color":"red","metadata":{"dryRun":true,"commandPreview":"POSE 32 -204 124 1"}}'
```

`POST /robot/actions` y las transiciones de acciones robot normalizan metadata
antes de persistir. La defensa reemplaza recursivamente caracteres de control
no seguros para PostgreSQL, incluido el caracter nulo real `\u0000`, por
marcadores como `<0x00>`. Unicode normal, acentos, saltos de linea, retornos de
carro y tabs se conservan. Si la metadata fue modificada, se marca con
`metadataSanitized=true` y `sanitizedFields`; en respuestas firmware tambien se
agregan flags diagnosticos como `firmwareResponseSanitized` y
`firmwareResponseRawLength`.

### Dashboard operacional

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational"
```

```bash
curl http://localhost:3000/dashboard/operational
```

Cuando no existe una sesion `IN_PROGRESS`, el dashboard responde
`activeSession: null`, conteos en cero y `lastActions: []`. Las sesiones,
cubos y acciones historicas siguen disponibles por los endpoints de sesiones.

### Reset operacional

Limpia la operacion actual sin borrar historial:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/dashboard/operational/reset" `
  -ContentType "application/json" `
  -Body '{"mode":"start-day","closeActiveSessionAs":"cancelled"}'
```

Body:

```json
{
  "mode": "start-day",
  "closeActiveSessionAs": "cancelled"
}
```

`mode` acepta `start-day` o `next-truck`. `closeActiveSessionAs` acepta
`completed` o `cancelled`. Como el enum actual de Prisma no tiene `CANCELLED`,
`cancelled` se persiste como `ERROR` para cerrar la sesion descartada sin
migraciones y sin eliminar datos. `completed` se persiste como `COMPLETED`.

Respuesta esperada:

```json
{
  "status": "OK",
  "mode": "start-day",
  "closedSessions": 1,
  "activeSession": null
}
```

### Sincronizar snapshot de vision

Endpoint usado por Edge Vision cuando hay QR valido. Crea o reutiliza una sesion
activa para el `truckCode` detectado y mantiene los cubos OpenCV como estado
actual de camara, no como historico acumulativo.

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/vision/snapshots/sync" `
  -ContentType "application/json" `
  -Body '{
    "runId": "run-001",
    "snapshotSignature": "sig-001",
    "timestamp": "2026-07-04T12:00:00.000Z",
    "source": "opencv-camera",
    "truckCode": "TRUCK-001",
    "qrDetected": true,
    "qrValid": true,
    "qrStatus": "OK",
    "cameraIndex": 1,
    "detections": [
      { "color": "red", "x": 10, "y": 20, "w": 30, "h": 30, "confidence": 0.9 }
    ]
  }'
```

La respuesta incluye `sessionId`, `sessionCode`, `truckCode`, `counts`,
`detectionsRegistered`, `replaced`, `alreadyProcessed` e `ignored`. Repetir el
mismo `snapshotSignature` no escribe datos. Un snapshot nuevo valido reemplaza
los cubos previos de fuente `opencv-file`/`opencv-camera` de esa sesion por los
cubos actuales del snapshot.

## Flujo de prueba recomendado

1. `GET /health`
2. `POST /sessions`
3. Guardar el `session.id`
4. `POST /sessions/:id/cubes`
5. `POST /robot/actions`
6. `GET /dashboard/operational`

## Dry-run integrado y transiciones

El payload histórico de `POST /robot/actions` sigue vigente. Para trazabilidad se
puede crear una acción `PLANNED` con `metadata.profile=vision-dry-run` y finalizarla:

```powershell
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:3000/robot/actions/ACTION_ID" `
  -ContentType "application/json" `
  -Body '{"status":"SUCCESS","metadata":{"outcome":"DRY_RUN_PLANNED"}}'
```

La sesión puede cerrarse explícitamente con:

```powershell
Invoke-RestMethod -Method PATCH `
  -Uri "http://localhost:3000/sessions/SESSION_ID" `
  -ContentType "application/json" `
  -Body '{"status":"COMPLETED"}'
```

Estados permitidos: acción `PLANNED -> SUCCESS|ERROR`; sesión
`IN_PROGRESS -> COMPLETED|ERROR`. Las repeticiones del mismo estado terminal son
idempotentes. No se requirió migración Prisma: `metadata`, estados y `finishedAt`
ya existían.

Metadata adicional para planes desde vision real:

```json
{
  "runId": "run-001",
  "snapshotSignature": "sig-001",
  "truckCode": "TRUCK-001",
  "profile": "vision-dry-run",
  "dryRun": true,
  "source": "opencv-camera",
  "selectedCube": { "color": "red", "x": 10, "y": 20, "w": 30, "h": 40 },
  "selectedCubeCenter": { "x": 25, "y": 40 },
  "selectedCubeBoundingBox": { "x": 10, "y": 20, "w": 30, "h": 40 },
  "dropZoneCode": "DROP_RED_01",
  "dropZonePose": { "x": 1, "y": 2, "z": 3 },
  "positionOrder": 1,
  "sequencePreview": ["ready_to_take", "cube_target_pick"],
  "commandsPreview": ["POSE 0 0 220 0"],
  "serialOpened": false,
  "hardwareMovement": false
}
```

El Backend conserva estos campos en `metadata` y el dashboard proyecta los datos
seguros. Para `profile=vision-dry-run`, el servidor impone `mode=simulation`,
`dryRun=true`, `serialOpened=false` y `hardwareMovement=false`.

## Tests

```powershell
npm test
npm run build
```

## Pendientes

- Idempotencia general por `runId` para dry-run; vision snapshots ya usan `snapshotSignature`.
- Evidencia E2E reproducible con QR/cámara reales.
- Control fisico de MaxArm no esta implementado.
- Autenticacion, RBAC y auditoria avanzada quedan fuera de Entrega 2.
