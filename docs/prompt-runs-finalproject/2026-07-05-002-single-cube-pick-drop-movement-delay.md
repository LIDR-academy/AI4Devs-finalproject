# Prompt Run - Single Cube Pick Drop Movement Delay

## Fecha

2026-07-05

## Objetivo

Agregar pausas configurables entre movimientos hardware de
`single_cube_pick_drop.py`, alineadas con `movement.delay_seconds=0.8` del spike
`dynamic_pickup_maxarm_pick`.

## Agente

- `prompts/agents/edge.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes

- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/qa-api.md`

## Skills

- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Command

- No aplica.

## Playbook

- `docs/delivery/06-plan-entrega-final.md`

## Contexto leido

- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/config.json`
- `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/pick_dynamic_cube_with_maxarm.py`
- `edge/src/single_cube_pick_drop.py`
- `edge/src/robot/maxarm_serial.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/tests/test_single_cube_pick_drop.py`

## Archivo destino

- `edge/src/config.py`
- `edge/src/single_cube_pick_drop.py`
- `edge/config/single-cube-pick-drop.example.json`
- `edge/tests/test_config.py`
- `edge/tests/test_single_cube_pick_drop.py`
- `edge/README.md`
- `docs/prompt-runs-finalproject/2026-07-05-002-single-cube-pick-drop-movement-delay.md`

## Prompt enviado a Codex

```text
Necesito corregir el flujo fisico de edge/src/single_cube_pick_drop.py para
igualarlo al comportamiento del spike dinamico que si funcionaba.

Agregar movement.delay_seconds=0.8, pickup_hold_seconds y release_hold_seconds,
aplicar time.sleep despues de cada send_pose exitoso en hardware, con pausas
especiales despues de cube_target_pick y drop_zone_release. No cambiar
homografia, drop zones ni safety gates.
```

## Problema detectado

Edge esperaba `DONE` del firmware y enviaba inmediatamente el siguiente comando.
El timeout serial de `5.0` segundos solo limita la espera por respuesta; no es
una pausa fisica entre movimientos.

## Solucion aplicada

- Se agrego `movement.delay_seconds` con default `0.0`.
- Se agregaron `movement.pickup_hold_seconds` y
  `movement.release_hold_seconds`; si se omiten, heredan `delay_seconds`.
- En hardware se duerme despues de cada `send_pose` exitoso.
- `cube_target_pick` usa `pickup_hold_seconds`.
- `drop_zone_release` usa `release_hold_seconds`.
- `--plan-only` no ejecuta sleeps.
- La evidencia registra delays y timestamps por step.

## Relacion con el spike original

El spike usaba:

```json
{
  "movement": {
    "delay_seconds": 0.8
  }
}
```

El Edge ahora replica ese comportamiento y permite ajustar esperas especificas
para agarre y liberacion.

## Validacion

```powershell
cd edge
python -m pytest -q
```

Resultado:

```text
133 passed in 7.46s
```
