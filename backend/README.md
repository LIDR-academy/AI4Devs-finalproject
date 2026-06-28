# RoboDock AI Backend

Backend MVP para Entrega 2. Implementa API REST local con Express, TypeScript, Prisma y PostgreSQL para registrar sesiones de descarga, cubos detectados y acciones simuladas del robot.

## Alcance

- Modo principal: simulation.
- No implementa control real del MaxArm.
- No implementa autenticacion, RBAC, WebSockets ni streaming.
- Recibe datos simulados como si fueran enviados por Edge.

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

### Dashboard operacional

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational"
```

```bash
curl http://localhost:3000/dashboard/operational
```

## Flujo de prueba recomendado

1. `GET /health`
2. `POST /sessions`
3. Guardar el `session.id`
4. `POST /sessions/:id/cubes`
5. `POST /robot/actions`
6. `GET /dashboard/operational`

## Pendientes

- Integracion con Edge real queda para una fase posterior.
- Control fisico de MaxArm no esta implementado.
- Autenticacion, RBAC y auditoria avanzada quedan fuera de Entrega 2.
