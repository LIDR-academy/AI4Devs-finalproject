# RoboDock AI

RoboDock AI es el proyecto final de AI4Devs. El objetivo es demostrar un MVP local que integra backend, base de datos, dashboard web y un modulo Edge para simular la lectura QR, deteccion de cubos por color y acciones de un brazo MaxArm durante una descarga.

## Estado de Entrega 2

La Entrega 2 implementa desarrollo funcional, no solo documentacion. El flujo validado es:

```text
PostgreSQL Docker
-> Backend API
-> Edge simulation
-> crear sesion por truckCode
-> registrar cubos simulados
-> registrar accion robot en mode=simulation
-> consultar dashboard operacional
-> visualizar estado en frontend
```

La arquitectura funcional completa queda conectada con contratos HTTP reales. El Edge de Entrega 2 corre en modo `simulation`: no usa camara real, no ejecuta OpenCV productivo y no mueve un MaxArm fisico.

## Alcance Entrega 2

- Backend local con Node.js, Express, TypeScript, Prisma y PostgreSQL.
- Modelo minimo con camiones, sesiones de descarga, cubos detectados y acciones robot.
- Endpoints REST reales sin prefijo `/api`.
- Edge Python en modo `simulation`, consumiendo los endpoints reales del backend.
- Frontend React/Vite con dashboard operacional.
- Evidencias QA para backend, Edge simulation y frontend.
- Documentacion de ejecucion local y contratos.

## Roadmap Entrega 3

Entrega 3 debe reemplazar o complementar los adapters simulados por adapters hardware, manteniendo estables los contratos ya validados:

- lectura QR real con camara;
- deteccion de cubos por color con OpenCV;
- integracion MaxArm real solo con bandera explicita;
- dry run previo antes de cualquier movimiento fisico;
- validacion de coordenadas y condiciones seguras.

La simulacion de Entrega 2 no es trabajo desechable: es el primer adapter funcional y sirve como fallback permanente para QA, demo y desarrollo sin hardware.

## Arquitectura resumida

```mermaid
flowchart LR
    Edge[Edge Python simulation] -->|HTTP JSON| Backend[Backend API Express]
    Frontend[Dashboard React/Vite] -->|HTTP JSON| Backend
    Backend --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL 16)]
```

Responsabilidades:

- `backend/`: API, validacion, persistencia, dashboard operacional.
- `edge/`: simulacion QR, cubos y accion robot contra el backend.
- `frontend/`: dashboard operacional consumiendo `GET /dashboard/operational`.
- `docs/`: arquitectura, delivery, ADRs, API y evidencias.
- `prompts/`: agentes, subagentes, skills, commands y playbooks usados.

## Estructura del repo

```text
backend/     API Express + TypeScript + Prisma
frontend/    Dashboard React + Vite + TypeScript
edge/        Runner Python en modo simulation
docs/        Documentacion, arquitectura, decisiones y evidencias
prompts/     Agentes, subagentes, skills, commands y playbooks
spikes/      Experimentos de factibilidad para Entrega 3
docker-compose.yml
```

## Requisitos

- Docker Desktop con Docker Compose.
- Node.js 20+.
- npm.
- Python 3.10+.
- PowerShell en Windows.

## Levantar PostgreSQL con Docker

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

## Ejecutar Edge simulation

Con el backend levantado:

```powershell
cd edge
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python src\edge_runner.py --backend-url http://localhost:3000 --config config\edge.config.example.json
```

El runner simula `truckCode=TRUCK-001`, registra cubos y registra una accion `PICK_AND_DROP` con `mode=simulation`.

## Levantar frontend

```powershell
cd frontend
npm install
```

Crear `frontend/.env` desde `frontend/.env.example` si necesitas configurar la URL:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Ejecutar:

```powershell
npm run dev
```

Abrir:

```text
http://localhost:5173
```

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

4. Ejecutar Edge simulation:

```powershell
cd edge
python src\edge_runner.py --backend-url http://localhost:3000 --config config\edge.config.example.json
```

5. Consultar dashboard operacional:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational" | ConvertTo-Json -Depth 10
```

6. Levantar frontend y validar visualmente:

```powershell
cd frontend
npm run dev
```

El dashboard debe mostrar sesion activa, `TRUCK-001`, estado `IN_PROGRESS`, conteos por color, total de cubos, ultimas acciones robot y `mode=simulation`.

## Endpoints implementados

Base URL local:

```text
http://localhost:3000
```

Rutas implementadas:

- `GET /health`
- `POST /sessions`
- `GET /sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/cubes`
- `POST /robot/actions`
- `GET /dashboard/operational`

La fuente detallada de contratos esta en `docs/api-design.md`.

## Evidencias QA disponibles

- `docs/evidence/backend-api-test-results.md`: backend aprobado con observaciones menores.
- `docs/evidence/edge-simulation-test-results.md`: flujo Backend + PostgreSQL + Edge simulation aprobado con observaciones.
- `docs/evidence/frontend-dashboard-test-results.md`: frontend aprobado con observaciones.

## Que esta implementado

- PostgreSQL 16 via Docker Compose.
- Backend API funcional con persistencia Prisma.
- Migracion inicial y seed demo.
- Flujo de sesiones de descarga por `truckCode`.
- Registro de cubos simulados por color.
- Registro de acciones robot simuladas.
- Dashboard operacional agregado.
- Edge runner en modo `simulation`.
- Frontend operacional consumiendo backend real.
- Documentacion de arquitectura, delivery, ADRs, API y evidencias.

## Fuera de alcance de Entrega 2

- Movimiento fisico real del MaxArm.
- Lectura real de camara como parte del flujo MVP.
- Deteccion OpenCV productiva integrada al runner principal.
- Calibracion completa camara -> cubo -> robot.
- Seguridad fisica completa para operacion robotica real.
- Autenticacion, RBAC, auditoria empresarial, WebSockets, colas o despliegue cloud.
- Dashboard historico o analytics avanzado.

## Prompts y agentes usados

Agentes principales:

- `prompts/agents/po.md`
- `prompts/agents/delivery-manager.md`
- `prompts/agents/architect.md`
- `prompts/agents/governance.md`
- `prompts/agents/backend.md`
- `prompts/agents/edge.md`
- `prompts/agents/frontend.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

Subagentes y skills relevantes:

- `prompts/subagents/backend-prisma.md`
- `prompts/subagents/backend-api.md`
- `prompts/subagents/edge-vision.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`
- `prompts/skills/api-design.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/react-dashboard.md`
- `prompts/skills/documentation.md`

Commands y playbooks usados:

- `prompts/commands/refine-story.md`
- `prompts/commands/implement-feature.md`
- `prompts/commands/create-endpoint.md`
- `prompts/commands/test-flow.md`
- `prompts/playbooks/delivery-2.md`

## Documentacion relacionada

- `docs/delivery/roadmap-entregas.md`
- `docs/delivery/01-alcance-entrega2.md`
- `docs/delivery/02-plan-delivery-entrega2.md`
- `docs/architecture/architecture-entrega2.md`
- `docs/api-design.md`
- `backend/README.md`
- `edge/README.md`
- `frontend/README.md`
