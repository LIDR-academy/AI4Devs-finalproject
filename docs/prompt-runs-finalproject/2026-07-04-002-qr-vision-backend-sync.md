# Prompt Run - QR Vision Backend Sync

## Fecha

2026-07-04

## Objetivo

Implementar integracion de QR real y sincronizacion de snapshot de vision con
Backend para que el Dashboard Operacional muestre camion y cubos persistidos
coherentes con Edge Vision, sin duplicados por polling y sin mover MaxArm.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/backend.md`
- `prompts/agents/frontend.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/backend-api.md`
- `prompts/subagents/backend-prisma.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/opencv.md`
- `prompts/skills/api-design.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/react-dashboard.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- N/A

## Playbook

- N/A

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-07-04-vision-color-tuning.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `backend/`
- `backend/README.md`
- `frontend/`
- `frontend/README.md`
- `_local_context/spikes/experiments/truck_code_detection/`
- `_local_context/spikes/experiments/integrated_vision_detection/`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/`

## Archivo destino

- `backend/src/modules/vision/vision.validators.ts`
- `backend/src/modules/vision/vision.service.ts`
- `backend/src/modules/vision/vision.routes.ts`
- `backend/src/modules/vision/vision.validators.test.ts`
- `backend/src/modules/vision/vision.service.test.ts`
- `backend/src/app.ts`
- `backend/src/lib/validators.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`
- `edge/src/api_client.py`
- `edge/src/service/vision_api.py`
- `edge/src/vision/pipeline.py`
- `edge/tests/test_vision_api.py`
- `edge/tests/test_vision_pipeline.py`
- `frontend/src/types/dashboard.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/CountsPanel.tsx`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `backend/README.md`
- `edge/README.md`
- `frontend/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-07-04-qr-vision-backend-sync.md`
- `docs/prompt-runs-finalproject/2026-07-04-002-qr-vision-backend-sync.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como edge, backend, frontend, architect, qa y documenter.
Usa subagentes edge-vision, backend-api, backend-prisma y qa-api.
Usa skills opencv, api-design, prisma-postgres, react-dashboard,
documentation y gitflow.

Objetivo:
Implementar la integracion de QR real y sincronizacion de snapshot de vision con
Backend, para que el Dashboard Operacional pueda mostrar el camion real
detectado por QR y los cubos reales detectados por camara, evitando duplicados
por polling y sin mover MaxArm.

Fecha: 2026-07-04
Correlativo prompt run del dia: 002

Crear:
* docs/evidence/finalproject/2026-07-04-qr-vision-backend-sync.md
* docs/prompt-runs-finalproject/2026-07-04-002-qr-vision-backend-sync.md

Requisitos clave:
* Edge Vision lee QR desde qrRoi y cubos desde cargoRoi.
* Snapshot incluye truckCode, QR status, counts, camera metadata y firma estable.
* Sync con Backend es explicito u opt-in por CLI.
* Backend crea/reutiliza sesion activa por truckCode.
* Backend registra cubos reales sin duplicarlos por polling.
* Dashboard distingue cubos registrados en Backend de cubos detectados en vivo.
* Sin serial, sin MaxArm, sin mode=hardware, sin commit/push.
```

## Resultado

- Nuevo endpoint Backend `POST /vision/snapshots/sync`.
- Nuevo endpoint Edge `POST /vision/sync-backend` y flags `--sync-backend`,
  `--backend-url`.
- `snapshotSignature` estable e idempotencia por `skipDuplicates`.
- Dashboard expone QR y sync de vision sin controles fisicos.
- Validacion:
  - Edge: `86 passed`.
  - Backend: `3 files / 12 tests passed`.
  - Backend build: PASS.
  - Frontend build: PASS.
- Conclusion: **APROBADO CON OBSERVACIONES**.
