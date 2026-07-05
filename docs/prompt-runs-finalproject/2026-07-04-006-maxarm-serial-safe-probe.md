# Prompt Run - MaxArm serial safe probe

## Fecha

2026-07-04

## Objetivo

Implementar y validar una primera integracion segura con MaxArm real usando
comunicacion serial, una unica pose segura, sin succion, sin cubos y sin
secuencias pick/drop.

## Agente

- prompts/agents/edge.md
- prompts/agents/architect.md
- prompts/agents/qa.md
- prompts/agents/documenter.md

## Subagentes

- prompts/subagents/edge-maxarm.md
- prompts/subagents/qa-api.md

## Skills

- prompts/skills/maxarm.md
- prompts/skills/documentation.md
- prompts/skills/gitflow.md

## Command

- Implementacion directa Codex.
- Validacion con `python -m pytest -q`, `npm run build`.

## Playbook

- Gate G5 - Serial sin carga, segun `docs/delivery/06-plan-entrega-final.md`.

## Contexto leido

- README.md
- docs/delivery/06-plan-entrega-final.md
- docs/evidence/finalproject/2026-07-04-real-vision-dry-run-planner.md
- docs/evidence/finalproject/2026-07-04-qr-vision-backend-sync.md
- docs/evidence/finalproject/2026-07-04-vision-sync-idempotency.md
- docs/prompt-runs-finalproject/README.md
- docs/prompt-runs-finalproject/_template.md
- docs/api-design.md
- edge/
- edge/README.md
- backend/
- frontend/
- _local_context/spikes/experiments/dynamic_pickup_maxarm_pick/

## Archivo destino

- edge/src/robot/maxarm_serial.py
- edge/src/maxarm_safe_probe.py
- edge/config/maxarm.safe-probe.example.json
- edge/tests/test_maxarm_serial.py
- edge/tests/test_maxarm_safe_probe.py
- edge/README.md
- edge/requirements.txt
- docs/evidence/finalproject/2026-07-04-maxarm-serial-safe-probe.md
- docs/prompt-runs-finalproject/2026-07-04-006-maxarm-serial-safe-probe.md

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como:

* prompts/agents/edge.md
* prompts/agents/architect.md
* prompts/agents/qa.md
* prompts/agents/documenter.md

Usa subagentes:

* prompts/subagents/edge-maxarm.md
* prompts/subagents/qa-api.md

Usa skills:

* prompts/skills/maxarm.md
* prompts/skills/documentation.md
* prompts/skills/gitflow.md

Objetivo:
Implementar y validar una primera integracion segura con el MaxArm real usando
comunicacion serial, sin carga, sin succion y sin manipular cubos. Este paso
solo debe validar que el Edge puede abrir el puerto COM configurado, enviar una
pose segura preaprobada, recibir respuesta del firmware y cerrar el puerto de
forma controlada.

Fecha: 2026-07-04
Correlativo prompt run del dia: 006

Debes crear:

* docs/evidence/finalproject/2026-07-04-maxarm-serial-safe-probe.md
* docs/prompt-runs-finalproject/2026-07-04-006-maxarm-serial-safe-probe.md

Implementar o completar MaxArmSerialAdapter seguro y un CLI
edge/src/maxarm_safe_probe.py con gates --config, --port, --baudrate,
--pose-name y --confirm-safe-motion. Sin confirmacion no debe abrir serial.
Debe rechazar poses fuera de allowlist, no activar succion, no hacer pickup/drop,
no usar camara, guardar evidencia JSON y cerrar serial siempre. Agregar tests
mockeados y documentacion en edge/README.md. No modificar Backend/Frontend salvo
validar builds. No hacer commit ni push.
```
