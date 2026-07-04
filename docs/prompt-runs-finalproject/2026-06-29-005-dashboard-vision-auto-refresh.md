# Prompt Run - Dashboard vision auto-refresh

## Fecha

2026-06-29

## Objetivo

Mejorar el panel visual de Vision/Camara del Dashboard Operacional para que se
actualice automaticamente cada 1 a 3 segundos usando snapshot polling, sin
implementar streaming MJPEG y sin tocar MaxArm.

## Agente

- `prompts/agents/frontend.md`
- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/react-dashboard.md`
- `prompts/skills/opencv.md`
- `prompts/skills/api-design.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- Implementacion directa con Codex.
- Tests Edge: `python -m pytest -q`.
- Build Frontend: `npm run build`.

## Playbook

- AGENTS.md del proyecto.
- Plan de entrega final en `docs/delivery/06-plan-entrega-final.md`.

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-snapshot.md`
- `docs/evidence/finalproject/2026-06-29-camera-qr-color-validation.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `frontend/`
- `backend/`
- `_local_context/spikes/experiments/...` solo como contexto, sin modificar.

## Archivo destino

- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `frontend/.env.example`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `frontend/src/styles.css`
- `edge/README.md`
- `frontend/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-auto-refresh.md`
- `docs/prompt-runs-finalproject/2026-06-29-005-dashboard-vision-auto-refresh.md`

## Prompt enviado a Codex

```text
Objetivo:
Mejorar el panel visual de Vision/Camara del Dashboard Operacional para que se
actualice automaticamente cada 1 a 3 segundos usando snapshot polling, mostrando
estado Edge Vision, source, timestamp, truckCode, detecciones por color, imagen
anotada actualizada y errores si Edge Vision no esta disponible.

Fecha: 2026-06-29.
Correlativo prompt run del dia: 005.

Crear:
- docs/evidence/finalproject/2026-06-29-dashboard-vision-auto-refresh.md
- docs/prompt-runs-finalproject/2026-06-29-005-dashboard-vision-auto-refresh.md

Restricciones:
No abrir serial, no ejecutar MaxArm, no hardware mode, no MJPEG, no camara fisica
sin --allow-camera, no tocar _local_context, no cambiar Backend ni Prisma.
```

## Resultado

- Auto-refresh configurable implementado con default `2000` ms y rango
  `1000-3000`.
- Cache busting de imagen con `?ts=<timestamp>`.
- Headers no-store agregados a Edge Vision.
- `python -m pytest -q`: 69 passed.
- `npm run build`: PASS.
- Veredicto de evidencia: APROBADO CON OBSERVACIONES.
