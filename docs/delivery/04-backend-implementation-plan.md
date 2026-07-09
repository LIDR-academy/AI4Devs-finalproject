# Backend Implementation Plan - Entrega 2

> Snapshot historico: este plan refleja la propuesta previa a la implementacion. El backend MVP validado finalmente usa rutas REST granulares sin prefijo `/api`: `GET /health`, `POST /sessions`, `POST /sessions/:id/cubes`, `POST /robot/actions` y `GET /dashboard/operational`.

## 1. Estructura backend propuesta

El backend debe implementarse de forma minima, ejecutable y facil de probar. La estructura propuesta evita capas innecesarias, pero separa rutas, servicios, validaciones y acceso a datos.

```text
backend/
  package.json
  tsconfig.json
  .env.example
  prisma/
    schema.prisma
    seed.ts
  src/
    server.ts
    app.ts
    config/
      env.ts
    lib/
      prisma.ts
      http-error.ts
      async-handler.ts
      code-generator.ts
    middleware/
      error-handler.ts
      request-logger.ts
      correlation-id.ts
    modules/
      health/
        health.routes.ts
      unload-sessions/
        unload-sessions.routes.ts
        unload-sessions.service.ts
        unload-sessions.validators.ts
      edge-events/
        edge-events.routes.ts
        edge-events.service.ts
        edge-events.validators.ts
      dashboard/
        dashboard.routes.ts
        dashboard.service.ts
```

Alcance inicial:

- No crear autenticacion.
- No crear RBAC.
- No crear modulos para entidades futuras como `EdgeNode`, `RobotArm`, `DropZone` o `SystemLog`.
- No implementar WebSockets ni colas.
- Mantener `GET /health` como endpoint tecnico auxiliar.

## 2. Modelo Prisma minimo

Modelo objetivo para Entrega 2:

- `Truck`
- `UnloadSession`
- `DetectedCube`
- `RobotAction`

Enums sugeridos:

```prisma
enum SessionStatus {
  IN_PROGRESS
  COMPLETED
  ERROR
}

enum CubeColor {
  red
  blue
  green
  yellow
}

enum RobotActionType {
  PICK_AND_DROP
}

enum RobotActionStatus {
  PLANNED
  SUCCESS
  ERROR
}

enum ExecutionMode {
  simulation
  hardware
}
```

Modelos sugeridos:

```prisma
model Truck {
  id        String          @id @default(uuid()) @db.Uuid
  code      String          @unique
  sessions  UnloadSession[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model UnloadSession {
  id           String          @id @default(uuid()) @db.Uuid
  code         String          @unique
  status       SessionStatus   @default(IN_PROGRESS)
  truckId      String          @db.Uuid
  truck        Truck           @relation(fields: [truckId], references: [id])
  startedAt    DateTime        @default(now())
  finishedAt   DateTime?
  cubes        DetectedCube[]
  robotActions RobotAction[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model DetectedCube {
  id         String        @id @default(uuid()) @db.Uuid
  code       String
  sessionId  String        @db.Uuid
  session    UnloadSession @relation(fields: [sessionId], references: [id])
  color      CubeColor
  confidence Float?
  x          Int?
  y          Int?
  w          Int?
  h          Int?
  metadata   Json?
  detectedAt DateTime      @default(now())
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@unique([sessionId, code])
  @@index([sessionId])
  @@index([color])
}

model RobotAction {
  id         String            @id @default(uuid()) @db.Uuid
  code       String
  sessionId  String            @db.Uuid
  session    UnloadSession     @relation(fields: [sessionId], references: [id])
  actionType RobotActionType
  status     RobotActionStatus
  mode       ExecutionMode     @default(simulation)
  color      CubeColor?
  metadata   Json?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  @@unique([sessionId, code])
  @@index([sessionId])
  @@index([status])
}
```

Seed minimo:

- Crear camiones `TRUCK-001`, `TRUCK-002`, `TRUCK-003`.
- Opcional: crear una sesion demo con cubos y accion simulada para validar dashboard.

Reglas:

- `id` es UUID tecnico.
- `code` es identificador funcional.
- `metadata` permite conservar datos de simulacion/spikes sin ampliar el modelo.
- No crear entidades futuras hasta que el flujo MVP lo exija.

## 3. Endpoints

### Endpoints principales

#### `POST /sessions`

Crea o reutiliza un camion por `truckCode` y crea una sesion en estado `IN_PROGRESS`.

Request:

```json
{
  "truckCode": "TRUCK-001"
}
```

Respuesta `201`:

```json
{
  "session": {
    "id": "uuid",
    "code": "UNLOAD-20260607-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-07T21:00:00.000Z"
  }
}
```

Validaciones:

- `truckCode` requerido.
- Formato recomendado: `TRUCK-001`.

#### `POST /sessions/:id/cubes`

Registra detecciones de cubos enviadas por Edge.

Request:

```json
{
  "source": "simulation",
  "detections": [
    {
      "color": "red",
      "x": 143,
      "y": 323,
      "w": 84,
      "h": 68,
      "confidence": 0.9
    }
  ]
}
```

Respuesta `201`:

```json
{
  "session": {
    "id": "uuid",
    "code": "UNLOAD-20260607-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-07T21:00:00.000Z",
    "finishedAt": null,
    "cubes": [
      {
        "id": "uuid",
        "code": "CUBE-001",
        "color": "red",
        "confidence": 0.9,
        "x": 143,
        "y": 323,
        "w": 84,
        "h": 68,
        "detectedAt": "2026-06-07T21:00:10.000Z"
      }
    ],
    "robotActions": []
  }
}
```

Validaciones:

- `:id` debe corresponder a una sesion existente.
- `cubes` o `detections` requerido y no vacio.
- `color` permitido: `red`, `blue`, `green`, `yellow`.
- No exponer errores internos de Prisma.

#### `POST /robot/actions`

Registra acciones ejecutadas o simuladas por el robot.

Request:

```json
{
  "sessionId": "uuid",
  "actionType": "PICK_AND_DROP",
  "status": "SUCCESS",
  "mode": "simulation",
  "color": "red",
  "metadata": {
    "source": "simulation",
    "commandPreview": "POSE 32 -204 124 1"
  }
}
```

Respuesta `201`:

```json
{
  "action": {
    "id": "uuid",
    "code": "ACTION-001",
    "sessionId": "uuid",
    "actionType": "PICK_AND_DROP",
    "status": "SUCCESS",
    "mode": "simulation",
    "color": "red"
  }
}
```

Validaciones:

- `sessionId` requerido y existente.
- `actionType` permitido: `PICK_AND_DROP`.
- `status` permitido: `PLANNED`, `SUCCESS`, `ERROR`.
- `mode` permitido: `simulation`, `hardware`.
- No exponer errores internos de Prisma.

#### `GET /dashboard/operational`

Entrega estado operacional agregado para el frontend.

Respuesta `200`:

```json
{
  "activeSession": {
    "id": "uuid",
    "code": "UNLOAD-20260607-001",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-07T21:00:00.000Z"
  },
  "counts": {
    "red": 1,
    "blue": 2,
    "green": 0,
    "yellow": 1,
    "total": 4
  },
  "lastActions": [
    {
      "id": "uuid",
      "code": "ACTION-001",
      "actionType": "PICK_AND_DROP",
      "status": "SUCCESS",
      "mode": "simulation",
      "createdAt": "2026-06-07T21:01:00.000Z"
    }
  ]
}
```

### Endpoint tecnico auxiliar

#### `GET /health`

Respuesta `200`:

```json
{
  "status": "ok",
  "service": "robodock-api"
}
```

Nota: aunque el agente backend puede mencionar endpoints auxiliares de consulta para soporte de prueba, para Entrega 2 se recomienda mantener como contrato documentado las rutas activas del MVP: `GET /health`, `POST /sessions`, `POST /sessions/:id/cubes`, `POST /robot/actions` y `GET /dashboard/operational`.

## 4. Variables de entorno

Archivo: `backend/.env.example`

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://robodock:robodock@localhost:5432/robodock?schema=public"
CORS_ORIGIN="http://localhost:5173"
```

Reglas:

- No versionar `backend/.env`.
- Documentar cualquier variable nueva en `.env.example`.
- No guardar secretos reales en docs ni seeds.

## 5. Comandos de instalacion

Desde `backend/`:

```bash
npm install
```

Dependencias runtime sugeridas:

```bash
npm install express cors dotenv @prisma/client
```

Dependencias desarrollo sugeridas:

```bash
npm install -D typescript tsx prisma @types/node @types/express @types/cors
```

Inicializacion Prisma, si no existe:

```bash
npx prisma init
```

Migracion inicial:

```bash
npx prisma migrate dev --name init
```

Seed:

```bash
npx prisma db seed
```

## 6. Comandos de ejecucion

Scripts sugeridos en `backend/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/src/server.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:seed": "prisma db seed"
  }
}
```

Ejecucion local:

```bash
npm run dev
```

Healthcheck:

```bash
curl http://localhost:3000/health
```

## 7. Plan de pruebas

### Pruebas manuales minimas

1. Verificar healthcheck.
2. Crear sesion con `TRUCK-001`.
3. Registrar evento `CUBES_DETECTED`.
4. Registrar evento `ROBOT_ACTION_RECORDED`.
5. Consultar `GET /dashboard/operational`.
6. Verificar que el dashboard operacional pueda consumir esa respuesta.

### Casos negativos minimos

- Crear sesion sin `truckCode` debe responder `400`.
- Enviar `eventType` desconocido debe responder `400`.
- Enviar `sessionId` inexistente debe responder `404`.
- Enviar color no permitido debe responder `400`.
- Error de Prisma no debe exponerse crudo al cliente.

### Pruebas automatizadas opcionales para Entrega 2

Si el tiempo alcanza:

- Unit test para generacion de `UnloadSession.code`.
- Unit test para validacion de colores.
- Test de servicio para conteo por color.
- Test de integracion para `POST /sessions`.

### Evidencia esperada

- Salida de `npm run dev`.
- Payloads usados.
- Respuestas JSON.
- Captura o salida de `GET /dashboard/operational`.

## 8. Riesgos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Implementar demasiados endpoints | Medio | Mantener 3 endpoints principales y healthcheck auxiliar |
| Modelo Prisma crece mas de lo necesario | Alto | Limitar a 4 modelos MVP |
| PostgreSQL local bloquea avance | Medio | Documentar `DATABASE_URL`, migracion y seed; usar datos demo simples |
| Validaciones quedan dispersas | Medio | Crear validators por modulo y servicios pequeños |
| `payload` de Edge queda demasiado libre | Medio | Validar `eventType` y campos minimos por tipo |
| Dashboard necesita datos agregados no disponibles | Medio | Implementar `GET /dashboard/operational` despues de cubos/acciones |
| Claims de hardware se mezclan con simulacion | Alto | Persistir `mode` en `RobotAction` y usar `simulation` por defecto |
| Errores internos se filtran al cliente | Medio | Usar middleware central de errores |

## Orden sugerido de implementacion posterior

1. Scaffold backend y TypeScript.
2. Configurar Prisma y `.env.example`.
3. Crear schema minimo y migracion.
4. Crear seed con camiones demo.
5. Implementar healthcheck.
6. Implementar `POST /sessions`.
7. Implementar `POST /sessions/:id/cubes` y `POST /robot/actions`.
8. Implementar `GET /dashboard/operational`.
9. Ejecutar pruebas manuales del flujo completo.
