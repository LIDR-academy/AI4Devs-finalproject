# Prompt Run - Fixed camera index for vision

## Fecha

2026-06-29

## Objetivo

Corregir Edge Vision para que use siempre el `cameraIndex` configurado y no
altere ni haga autodiscovery entre camaras durante el auto-refresh del dashboard.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/frontend.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`

## Skills

- `prompts/skills/opencv.md`
- `prompts/skills/react-dashboard.md`
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
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-auto-refresh.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `edge/`
- `edge/README.md`
- `frontend/`

## Archivo destino

- `edge/src/config.py`
- `edge/src/vision/capture.py`
- `edge/src/service/vision_api.py`
- `edge/tests/test_config.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `edge/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-06-29-dashboard-vision-auto-refresh.md`
- `docs/prompt-runs-finalproject/2026-06-29-006-fixed-camera-index-for-vision.md`

## Prompt enviado a Codex

```text
Objetivo:
Corregir Edge Vision para que use siempre el cameraIndex configurado y no alterne
ni haga autodiscovery entre camaras durante el auto-refresh del dashboard.

Comportamiento esperado:
- Si vision.source=camera, abrir unicamente vision.cameraIndex.
- Si cameraIndex=1, no intentar abrir 0.
- Sin fallback automatico.
- Sin --allow-camera, fallar antes de VideoCapture.
- Status expone configuredCameraIndex, activeCameraIndex, cameraAllowed y lastError.
- Status expone snapshotCameraIndex y /vision/snapshot tambien lo incluye.
- /vision/snapshot/image no debe servir imagenes antiguas de otro indice.
- Frontend muestra configuredCameraIndex y activeCameraIndex.
- No serial, no MaxArm, no hardware mode.
```

## Resultado

- `vision.cameraIndex` ahora es obligatorio cuando `vision.source=camera`.
- `FrameCapture.read_camera` reporta `Configured cameraIndex=N unavailable`.
- Edge Vision status expone `configuredCameraIndex` y `activeCameraIndex`.
- Edge Vision expone `snapshotCameraIndex` en status y snapshot.
- `/vision/snapshot/image` invalida imagenes que no correspondan al indice
  configurado y no sirve imagen vieja tras una falla de captura.
- Edge Vision mantiene una captura persistente para el `cameraIndex` configurado
  durante la vida del servicio, evitando reabrir/reenumerar camaras en cada
  polling del dashboard.
- Tests con mocks validan indice fijo, no apertura de `0`, error controlado,
  bloqueo sin `--allow-camera`, polling repetido, captura persistente e
  invalidacion de imagen vieja.
- Frontend muestra camara configurada, activa y de snapshot.
- `python -m pytest -q`: 75 passed.
- `npm run build`: PASS.
