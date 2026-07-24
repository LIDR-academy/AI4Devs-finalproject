# Prompt Run - Vision ROI Overlay

## Fecha

2026-07-04

## Objetivo

Mostrar visualmente en el snapshot de vision del dashboard los ROI configurados
para carga y QR (`cargoRoi` y `qrRoi`) para diagnosticar `QR_NOT_DETECTED`.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/frontend.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/qa-api.md`

## Skills

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
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `edge/`
- `edge/README.md`
- `frontend/`
- `frontend/README.md`
- `_local_context/spikes/experiments/truck_code_detection/`
- `_local_context/spikes/experiments/integrated_vision_detection/`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/`

## Archivo destino

- `edge/src/vision/evidence.py`
- `edge/src/service/vision_api.py`
- `edge/tests/test_evidence.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `edge/README.md`
- `frontend/README.md`
- `docs/evidence/finalproject/2026-07-04-vision-roi-overlay.md`
- `docs/prompt-runs-finalproject/2026-07-04-003-vision-roi-overlay.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como edge, frontend, qa y documenter.
Usa subagentes edge-vision y qa-api.
Usa skills opencv, react-dashboard, documentation y gitflow.

Objetivo:
Mostrar visualmente en el snapshot de vision del dashboard los ROI configurados
para carga y QR (`cargoRoi` y `qrRoi`), para diagnosticar por que aparece
`QR_NOT_DETECTED` y verificar si ambos ROI estan bien posicionados sobre la
imagen real de la camara cenital.

Fecha: 2026-07-04
Correlativo prompt run del dia: 003

Crear:
* docs/evidence/finalproject/2026-07-04-vision-roi-overlay.md
* docs/prompt-runs-finalproject/2026-07-04-003-vision-roi-overlay.md

Requisitos:
* Dibujar `cargoRoi` y `qrRoi` en la imagen anotada.
* Distinguir ROI de detecciones de cubos.
* Mostrar QR status, truckCode y coordenadas de ROI en dashboard.
* No abrir serial, no mover MaxArm, no usar hardware.
```

## Resultado

- Overlay de `CARGO ROI` verde y `QR ROI` magenta en imagen anotada.
- `/vision/snapshot` expone `cargoRoi`.
- Dashboard muestra `cargoRoi` y `qrRoi` en formato compacto.
- Validacion:
  - Edge: `89 passed`.
  - Frontend build: PASS.
- Conclusion: **APROBADO CON OBSERVACIONES**.
