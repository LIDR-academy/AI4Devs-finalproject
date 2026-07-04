# Prompt Run - Vision Sync Idempotency

## Fecha

2026-07-04

## Objetivo

Corregir la duplicacion de cubos registrados en sesion cuando Edge Vision o el
dashboard refrescan el snapshot de camara cada pocos segundos.

## Agente

- `prompts/agents/backend.md`
- `prompts/agents/edge.md`
- `prompts/agents/frontend.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/backend-api.md`
- `prompts/subagents/backend-prisma.md`
- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/api-design.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/opencv.md`
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
- `docs/evidence/finalproject/2026-07-04-qr-vision-backend-sync.md`
- `docs/evidence/finalproject/2026-07-04-vision-roi-overlay.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `backend/`
- `backend/README.md`
- `frontend/`
- `frontend/README.md`

## Archivo destino

- `backend/src/modules/vision/vision.service.ts`
- `backend/src/modules/vision/vision.service.test.ts`
- `backend/src/modules/dashboard/dashboard.service.ts`
- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `edge/tests/test_vision_pipeline.py`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `edge/README.md`
- `backend/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-07-04-vision-sync-idempotency.md`
- `docs/prompt-runs-finalproject/2026-07-04-004-vision-sync-idempotency.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Objetivo:
Corregir la duplicacion de cubos registrados en sesion cuando el dashboard o
Edge Vision actualiza el snapshot de camara cada pocos segundos.

Comportamiento esperado:
* mismo snapshot no duplica;
* snapshot repetido responde ignored/alreadyProcessed;
* snapshot nuevo actualiza estado actual de vision;
* conteos registrados no crecen indefinidamente;
* QR_NOT_DETECTED no sincroniza;
* no abrir serial, no mover MaxArm, no usar mode=hardware.

Fecha: 2026-07-04
Correlativo prompt run del dia: 004
```

## Resultado

- Sync Backend cambia de acumulacion a reemplazo de estado OpenCV actual.
- Snapshot repetido devuelve `alreadyProcessed=true`.
- Snapshot nuevo elimina cubos OpenCV previos de la sesion y crea solo los
  cubos actuales.
- `/vision/status` expone `lastSyncedSnapshotSignature`.
- Dashboard usa `lastVisionCounts` como conteo operativo cuando existe vision
  sincronizada.
- Validacion:
  - Edge: `91 passed`.
  - Backend: `3 files / 13 tests passed`.
  - Backend build: PASS.
  - Frontend build: PASS.
- Conclusion: **APROBADO CON OBSERVACIONES**.
