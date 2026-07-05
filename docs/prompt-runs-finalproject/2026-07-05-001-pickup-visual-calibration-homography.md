# Prompt Run - Pickup Visual Calibration Homography

## Fecha

2026-07-05

## Objetivo

Corregir `single_cube_pick_drop.py` para calcular la pose de pickup con
calibracion visual real basada en `cornersPx` y homografia, bloquear hardware si
solo existe `imageRoi`, actualizar tests y documentacion.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-vision.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/opencv.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- No aplica.

## Playbook

- `docs/delivery/06-plan-entrega-final.md`

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-07-04-single-cube-pick-drop.md`
- `docs/evidence/finalproject/2026-07-04-single-cube-spike-alignment.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/pick_dynamic_cube_with_maxarm.py`
- `_local_context/spikes/experiments/dynamic_pickup_detection/pickup_calibration.json`
- `_local_context/spikes/experiments/dynamic_pickup_detection/pickup_robot_calibration.json`

## Archivo destino

- `edge/src/models.py`
- `edge/src/config.py`
- `edge/src/robot/safety.py`
- `edge/src/robot/planner.py`
- `edge/src/edge_dry_run.py`
- `edge/src/single_cube_pick_drop.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/tests/test_robot_action_planner.py`
- `edge/tests/test_single_cube_pick_drop.py`
- `edge/tests/test_config.py`
- `edge/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-07-05-pickup-visual-calibration-homography.md`
- `docs/prompt-runs-finalproject/2026-07-05-001-pickup-visual-calibration-homography.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como:
* prompts/agents/edge.md
* prompts/agents/architect.md
* prompts/agents/qa.md
* prompts/agents/documenter.md

Objetivo:
Corregir el calculo de la pose de pickup para que single_cube_pick_drop.py use
la calibracion visual real del pickup basada en corners_px y homografia, igual
que el spike dynamic_pickup_maxarm_pick, en lugar de usar unicamente imageRoi
rectangular como aproximacion.

Restricciones principales:
No abrir serial, no mover MaxArm, no ejecutar pick/drop fisico, no modificar
_local_context, no versionar configs locales, no hacer commit ni push.
```

## Resultado

- Implementado soporte de `visualCalibration.cornersPx` y homografia.
- Hardware queda bloqueado si falta calibracion visual real o si se usa solo
  `imageRoi`.
- Edge tests ejecutados: `128 passed`.
- Backend build ejecutado: `npm run build` OK.
- Frontend build ejecutado: `npm run build` OK.
- Documentacion y evidencia creadas.
