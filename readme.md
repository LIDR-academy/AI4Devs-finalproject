# RoboDock AI

RoboDock AI es el Proyecto Final de AI4Devs. En la rama `finalproject-ASP`, el
repositorio integra el flujo local de descarga asistida por vision: Backend REST
con PostgreSQL, dashboard operacional compacto, servicio Edge Vision con camara
OpenCV, lectura QR de camion, deteccion de cubos por color, planificacion
multi-cubo, drop zones por color, ejecucion MaxArm fisica bajo confirmaciones,
modos dry-run/hardware, confirmacion fisica por vision, reset operacional para
preparar un nuevo camion y feedback en vivo de ejecucion.

## Estado actual

El flujo final implementado combina componentes reales y controles de seguridad
locales:

```text
PostgreSQL Docker
-> Backend REST / Prisma
-> Edge Vision API
-> camara u origen fixture OpenCV
-> QR de camion
-> deteccion de cubos por color
-> planificacion multi-cubo por drop zone
-> dashboard operacional compacto
-> dry-run o ejecucion MaxArm fisica con confirmaciones
-> sync de acciones, conteos y feedback en vivo
-> reset operacional / preparar nuevo camion
```

Capacidades principales:

- Backend REST local con Node.js, Express, TypeScript, Prisma y PostgreSQL.
- Modelo operacional para camiones, sesiones, cubos detectados y acciones robot.
- Dashboard React/Vite con vista compacta de sesion, vision, plan, ejecucion,
  acciones, trazabilidad y reset.
- Edge Vision API con camara/OpenCV, QR de camion, deteccion HSV por color,
  snapshot polling y sincronizacion opt-in con Backend.
- Planificacion multi-cubo con seleccion de drop zones por color.
- Reset operacional para iniciar jornada o preparar un nuevo camion sin borrar
  historial.
- Modos `simulation`, `vision-dry-run` y flujo hardware con gates explicitos.
- Ejecucion fisica MaxArm desde Edge Vision usando configuracion local, puerto
  serial local y confirmaciones humanas.
- Confirmacion fisica por vision y feedback de estado de ejecucion en dashboard.

## Arquitectura resumida

```mermaid
flowchart LR
    Camera[Camara / Fixture OpenCV] --> Edge[Edge Vision API]
    Edge -->|HTTP JSON| Backend[Backend REST Express]
    Frontend[Dashboard React/Vite] -->|HTTP JSON| Backend
    Frontend -->|HTTP JSON| Edge
    Backend --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL 16)]
    Edge --> MaxArm[MaxArm fisico / dry-run]
```

Responsabilidades:

- `backend/`: API REST, validacion, persistencia, dashboard operacional y reset.
- `edge/`: vision, QR, deteccion de cubos, planificacion, drop zones, dry-run y
  adaptadores MaxArm.
- `frontend/`: dashboard operacional compacto para monitoreo, planificacion,
  ejecucion y reset.
- `docs/`: arquitectura, delivery, ADRs, API, evidencias y prompt-runs.
- `prompts/`: agentes, subagentes, skills, commands y playbooks usados.

## Estructura del repo

```text
backend/     API Express + TypeScript + Prisma
frontend/    Dashboard React + Vite + TypeScript
edge/        Edge Vision, OpenCV, QR, drop zones y MaxArm
docs/        Documentacion, arquitectura, decisiones y evidencias
prompts/     Agentes, subagentes, skills, commands y playbooks
spikes/      Experimentos de factibilidad
docker-compose.yml
```

## Requisitos

- Docker Desktop con Docker Compose.
- Node.js 20+.
- npm.
- Python 3.10+.
- PowerShell en Windows.
- Camara y MaxArm solo para modo hardware fisico.

## Configuracion local

Mantener los archivos `.env` y configuraciones locales fuera del repositorio.
Usar los `.example` como base:

- `backend/.env.example` para `DATABASE_URL`, `PORT` y CORS.
- `frontend/.env.example` para `VITE_BACKEND_URL`, `VITE_EDGE_VISION_URL` y
  polling.
- `edge/.env.example` para URL de backend y config Edge.
- `edge/config/edge.vision.example.json` como base de vision.
- `edge/config/single-cube-pick-drop.example.json` como base de descarga.
- `edge/config/drop_zones.example.json` como base de slots.

Los archivos locales de hardware/camara, como `*.local.json` y
`frontend/.env.local`, no deben commitearse.

## Levantar PostgreSQL

Desde la raiz del proyecto:

```powershell
docker compose up -d
docker compose ps
```

Configuracion incluida:

- DB: `robodockdb`
- User: `robodock_user`
- Password: `robodock_pass`
- Host port: `5434`
- Container port: `5432`
- Volumen: `robodock_postgres_data`

## Levantar backend

```powershell
cd backend
npm install
```

Crear `backend/.env` desde `backend/.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://robodock_user:robodock_pass@localhost:5434/robodockdb?schema=public"
CORS_ORIGIN="http://localhost:5173"
```

Preparar Prisma y datos demo:

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Ejecutar:

```powershell
npm run dev
```

Backend disponible en:

```text
http://localhost:3000
```

## Levantar Edge Vision

Instalar dependencias:

```powershell
cd edge
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Modo seguro con fixture/example:

```powershell
python src\service\vision_api.py --config config\edge.vision.example.json
```

Modo camara/dry-run con sincronizacion backend:

```powershell
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --unload-config config\single-cube-pick-drop.local.json `
  --allow-camera `
  --sync-backend `
  --backend-url http://localhost:3000
```

El servicio queda por defecto en:

```text
http://127.0.0.1:8001
```

## Levantar frontend

```powershell
cd frontend
npm install
```

Crear `frontend/.env` desde `frontend/.env.example` si necesitas configurar URLs:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_EDGE_VISION_URL=http://localhost:8001
VITE_DASHBOARD_REFRESH_MS=3000
VITE_EDGE_VISION_REFRESH_MS=2000
```

Ejecutar:

```powershell
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Simulacion vs hardware

`simulation` conserva el flujo inicial sin camara ni robot fisico. Sirve para QA,
demo y desarrollo sin hardware.

`vision-dry-run` usa vision real o fixture, QR y detecciones para planificar sin
abrir serial ni mover MaxArm. El Backend guarda acciones seguras con
`mode=simulation`, `dryRun=true`, `serialOpened=false` y
`hardwareMovement=false`.

El flujo hardware se ejecuta desde Edge Vision y requiere configuracion local,
camara autorizada con `--allow-camera`, puerto MaxArm, plan previo, QR valido,
cubos detectados y confirmaciones de seguridad. El dashboard no habla directo
con serial.

## Validar flujo completo

1. Levantar PostgreSQL:

```powershell
docker compose up -d
```

2. Levantar backend:

```powershell
cd backend
npm run dev
```

3. Verificar healthcheck:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/health"
```

4. Levantar Edge Vision en fixture, dry-run o camara segun el entorno.

5. Levantar frontend:

```powershell
cd frontend
npm run dev
```

6. Validar en dashboard:

- sesion activa o estado limpio segun reset;
- QR/truckCode cuando Edge Vision detecta camion;
- conteos de cubos registrados y detectados por vision;
- plan multi-cubo y drop zones por color cuando hay snapshot valido;
- estado de ejecucion fisica/dry-run;
- ultimas acciones robot y feedback de errores;
- reset operacional para iniciar jornada o preparar nuevo camion.

## Endpoints principales

Backend:

- `GET /health`
- `POST /sessions`
- `GET /sessions`
- `GET /sessions/:id`
- `PATCH /sessions/:id`
- `POST /sessions/:id/cubes`
- `POST /robot/actions`
- `PATCH /robot/actions/:id`
- `GET /dashboard/operational`
- `POST /dashboard/operational/reset`
- `POST /vision/snapshots/sync`

Edge Vision:

- `GET /health`
- `GET /vision/status`
- `GET /vision/snapshot`
- `GET /vision/snapshot/image`
- `POST /vision/sync-backend`
- `POST /vision/plan-dry-run`
- `POST /drop-zones/reset`
- `POST /operation/reset`
- `POST /robot/multi-cube/plan`
- `POST /robot/multi-cube/execute`
- `GET /robot/multi-cube/status`

## Limitaciones conocidas

- El sistema esta pensado para ejecucion local academica, no despliegue cloud.
- No incluye autenticacion, RBAC, auditoria empresarial, colas ni WebSockets.
- El dashboard usa polling, no streaming MJPEG ni eventos server-side.
- La calibracion de camara, ROI, HSV, pickup y workspace depende del montaje
  fisico local.
- El modo hardware requiere validacion operacional del entorno, zona despejada,
  puerto serial correcto y confirmaciones humanas.
- Los archivos `*.local.json` son responsabilidad local y no forman parte del
  repositorio.

## Antecedente Entrega 2

La Entrega 2 valido el MVP simulado inicial: PostgreSQL, Backend REST, dashboard
operacional, Edge en `simulation`, creacion de sesion por `truckCode`, registro
de cubos simulados, acciones robot simuladas y consulta del dashboard. Esa base
se mantiene como fallback para QA y demos sin hardware, pero ya no representa el
estado actual de la rama `finalproject-ASP`.

Documentacion historica:

- `docs/delivery/01-alcance-entrega2.md`
- `docs/delivery/02-plan-delivery-entrega2.md`
- `docs/architecture/architecture-entrega2.md`
- `docs/evidence/edge-simulation-test-results.md`

## Documentacion relacionada

- `docs/delivery/roadmap-entregas.md`
- `docs/api-design.md`
- `backend/README.md`
- `edge/README.md`
- `frontend/README.md`
