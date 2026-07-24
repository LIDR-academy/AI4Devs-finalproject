# Prompt Run - Single Cube Spike Alignment

## Fecha

2026-07-04

## Objetivo

Auditar y alinear `single_cube_pick_drop.py` con el spike fisico validado
`dynamic_pickup_maxarm_pick` antes de ejecutar un pick/drop real con MaxArm.

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

- No se invoco command del repo.

## Playbook

- `docs/delivery/06-plan-entrega-final.md`

## Contexto leido

- `AGENTS.md`
- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-07-04-real-vision-dry-run-planner.md`
- `docs/evidence/finalproject/2026-07-04-maxarm-serial-safe-probe.md`
- `docs/evidence/finalproject/2026-07-04-single-cube-pick-drop.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/`
- `_local_context/spikes/experiments/dynamic_pickup_detection/`

## Archivo destino

- `edge/src/config.py`
- `edge/src/single_cube_pick_drop.py`
- `edge/tests/test_config.py`
- `edge/tests/test_drop_zone_planner.py`
- `edge/tests/test_robot_action_planner.py`
- `edge/tests/test_single_cube_pick_drop.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/README.md`
- `docs/evidence/finalproject/2026-07-04-single-cube-spike-alignment.md`
- `docs/prompt-runs-finalproject/2026-07-04-008-single-cube-spike-alignment.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como prompts/agents/edge.md, architect.md, qa.md y documenter.md.
Usa subagentes edge-vision, edge-maxarm y qa-api.
Usa skills opencv, maxarm, documentation y gitflow.

Objetivo: auditar y alinear el flujo single_cube_pick_drop.py con el spike
fisico validado dynamic_pickup_maxarm_pick antes de ejecutar un pick/drop real
con MaxArm. La secuencia, poses, calibracion y drop zones deben ser coherentes
con el spike. El modo hardware debe quedar bloqueado si hay calibracion
placeholder o faltante.

Crear:
- docs/evidence/finalproject/2026-07-04-single-cube-spike-alignment.md
- docs/prompt-runs-finalproject/2026-07-04-008-single-cube-spike-alignment.md

Restricciones principales:
- No abrir serial.
- No mover MaxArm.
- No ejecutar succion ni pick/drop fisico.
- No modificar _local_context/.
- No modificar ni versionar configs locales.
- No inventar calibracion.
- No hacer commit ni push.

Tests requeridos:
- python -m pytest -q en edge.
- npm run build en backend.
- npm run build en frontend.
```

## Resultado

- Se mantuvo la secuencia del spike y se documentaron los pasos extra seguros
  `drop_safe_pose` y `retract_after_release`.
- Se agrego carga opcional de poses desde `robotPlanning.namedPosesPath`.
- Se agrego bloqueo hardware fail-closed para calibracion/poses/drop zones
  placeholder.
- Se agregaron pruebas de secuencia, named poses, drop zones y gates hardware.
- Se actualizo `edge/README.md`.
- Se genero evidencia del alineamiento.

## Validacion

- Edge: `python -m pytest -q` -> **122 passed**.
- Backend: `npm run build` -> **OK**.
- Frontend: `npm run build` -> **OK**.

## Restricciones verificadas

- No se abrio puerto serial.
- No se movio MaxArm.
- No se uso `mode=hardware` real.
- No se modifico `_local_context/`.
- No se modificaron configs locales no versionables.
