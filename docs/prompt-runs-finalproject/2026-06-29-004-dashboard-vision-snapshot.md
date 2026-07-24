# Prompt Run - Dashboard vision snapshot

## Fecha

2026-06-29

## Objetivo

Implementar un panel visual de vision/camara en el Dashboard Operacional de
RoboDock AI, mostrando un snapshot procesado por Edge con metadata segura, sin
abrir serial, sin mover MaxArm y sin habilitar modo hardware.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/frontend.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/opencv.md`
- `prompts/skills/react-dashboard.md`
- `prompts/skills/api-design.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- Implementacion directa con Codex.
- Tests Edge: `python -m pytest tests -q`.
- Build Frontend: `npm run build`.

## Playbook

- AGENTS.md del proyecto.
- Plan de entrega final en `docs/delivery/06-plan-entrega-final.md`.

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-06-29-e2e-dry-run-dashboard.md`
- `docs/evidence/finalproject/2026-06-29-camera-qr-color-validation.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `frontend/`
- `backend/`
- `_local_context/spikes/experiments/...` solo como contexto indicado, sin modificar.

## Archivo destino

- `edge/src/service/vision_api.py`
- `edge/src/service/__init__.py`
- `edge/tests/test_vision_api.py`
- `edge/requirements.txt`
- `frontend/.env.example`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/styles.css`
- `edge/README.md`
- `frontend/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-snapshot.md`
- `docs/prompt-runs-finalproject/2026-06-29-004-dashboard-vision-snapshot.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como edge, frontend, architect, qa y documenter.
Usa subagentes edge-vision y qa-api.
Usa skills opencv, react-dashboard, api-design, documentation y gitflow.

Objetivo:
Implementar un panel visual de vision/camara en el Dashboard Operacional de
RoboDock AI, mostrando un snapshot procesado por Edge con metadata segura, sin
abrir serial, sin mover MaxArm y sin habilitar modo hardware.

Fecha: 2026-06-29.
Correlativo prompt run del dia: 004.

Crear:
- docs/evidence/finalproject/2026-06-29-dashboard-vision-snapshot.md
- docs/prompt-runs-finalproject/2026-06-29-004-dashboard-vision-snapshot.md

Alcance:
- Edge Vision API local con /health, /vision/status, /vision/snapshot y
  /vision/snapshot/image.
- Mantener simulation default y vision-dry-run seguro.
- Camara real solo con --allow-camera.
- No modificar edge_runner.py ni edge_dry_run.py.
- Frontend con VITE_EDGE_VISION_URL opcional y panel Vision / Camara.
- Backend sin cambios contractuales ni migraciones.
- Documentacion y evidencia actualizadas.
- Ejecutar tests Edge y build Frontend.
```

## Resultado

- Edge Vision API implementada con FastAPI/Uvicorn.
- Panel frontend opcional agregado.
- Documentacion actualizada.
- `python -m pytest tests -q`: 67 passed.
- `npm run build`: PASS.
- Veredicto de evidencia: APROBADO CON OBSERVACIONES.
