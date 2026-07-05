# Prompt Run - Single Cube Pick/Drop

## Fecha

2026-07-04

## Objetivo

Implementar y validar el primer flujo Edge para planificar y ejecutar un unico
pick/drop fisico controlado con MaxArm, dry-run previo obligatorio, gates de
seguridad, serial mockeable y evidencia reproducible.

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
- `prompts/skills/api-design.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- Implementacion directa con Codex.

## Playbook

- `docs/delivery/06-plan-entrega-final.md`

## Contexto leido

- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/evidence/finalproject/2026-07-04-real-vision-dry-run-planner.md`
- `docs/evidence/finalproject/2026-07-04-maxarm-serial-safe-probe.md`
- `docs/evidence/finalproject/2026-07-04-vision-sync-idempotency.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- `edge/`
- `edge/README.md`
- `backend/`
- `frontend/`

## Archivo destino

- `edge/src/single_cube_pick_drop.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/tests/test_single_cube_pick_drop.py`
- `edge/src/robot/maxarm_serial.py`
- `edge/README.md`
- `docs/api-design.md`
- `docs/evidence/finalproject/2026-07-04-single-cube-pick-drop.md`
- `docs/prompt-runs-finalproject/2026-07-04-007-single-cube-pick-drop.md`

## Prompt enviado a Codex

```text
Implementar y validar el primer flujo fisico controlado de RoboDock AI para
seleccionar un cubo real detectado por camara y descargarlo fisicamente en una
drop zone del mismo color usando MaxArm, con gates de seguridad estrictos,
dry-run previo obligatorio, confirmacion humana explicita y evidencia
reproducible.

Crear:
- docs/evidence/finalproject/2026-07-04-single-cube-pick-drop.md
- docs/prompt-runs-finalproject/2026-07-04-007-single-cube-pick-drop.md

Alcance principal:
- Edge CLI explicito `edge/src/single_cube_pick_drop.py`
- maximo 1 cubo por corrida
- dry-run previo exitoso y match obligatorio
- confirmaciones humanas y COM explicito antes de abrir serial
- serial mockeable para tests
- Backend solo registra metadata si hay ejecucion real segura
- Dashboard sin controles fisicos
- Tests y builds de Edge, Backend y Frontend
```

## Resultado

- Edge tests: `115 passed`.
- Backend build: aprobado.
- Frontend build: aprobado.
- Hardware fisico: no ejecutado en esta sesion.
- Conclusion: APROBADO CON OBSERVACIONES.
