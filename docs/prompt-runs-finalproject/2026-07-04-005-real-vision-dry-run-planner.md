# Prompt Run - Real Vision Dry-Run Planner

## Fecha

2026-07-04

## Objetivo

Implementar y validar un flujo `vision-dry-run` realista que use QR real y
cubos detectados por Edge Vision para seleccionar un cubo, asignar drop zone,
generar plan dry-run y registrar la traza en Backend/Dashboard sin abrir serial
ni mover MaxArm.

## Agente

- prompts/agents/edge.md
- prompts/agents/backend.md
- prompts/agents/frontend.md
- prompts/agents/architect.md
- prompts/agents/qa.md
- prompts/agents/documenter.md

## Subagentes

- prompts/subagents/edge-vision.md
- prompts/subagents/edge-maxarm.md
- prompts/subagents/backend-api.md
- prompts/subagents/qa-api.md

## Skills

- prompts/skills/opencv.md
- prompts/skills/maxarm.md
- prompts/skills/api-design.md
- prompts/skills/prisma-postgres.md
- prompts/skills/react-dashboard.md
- prompts/skills/documentation.md
- prompts/skills/gitflow.md

## Command

- Implementacion directa con Codex.
- Validacion con `python -m pytest -q`, `npm.cmd test`, `npm run build`.

## Playbook

- Entrega final RoboDock AI, G4 dry run integrado.

## Contexto leido

- AGENTS.md
- README.md
- docs/delivery/06-plan-entrega-final.md
- docs/evidence/finalproject/2026-07-04-qr-vision-backend-sync.md
- docs/evidence/finalproject/2026-07-04-vision-roi-overlay.md
- docs/evidence/finalproject/2026-07-04-vision-sync-idempotency.md
- docs/prompt-runs-finalproject/README.md
- docs/prompt-runs-finalproject/_template.md
- docs/api-design.md
- edge/README.md
- backend/README.md
- frontend/README.md
- edge/src/service/vision_api.py
- edge/src/edge_dry_run.py
- edge/src/models.py
- edge/src/config.py
- edge/src/robot/drop_zone_adapter.py
- edge/src/robot/drop_zone_planner.py
- edge/src/robot/planner.py
- edge/src/vision/cube_selector.py
- backend/src/modules/robot/
- backend/src/modules/dashboard/dashboard.service.ts
- frontend/src/components/
- frontend/src/types/

## Archivo destino

- edge/src/edge_dry_run.py
- edge/src/service/vision_api.py
- edge/tests/test_edge_dry_run.py
- edge/tests/test_vision_api.py
- backend/src/modules/robot/robot.metadata.ts
- backend/src/modules/robot/robot.validators.test.ts
- frontend/src/components/ExecutionPanel.tsx
- frontend/src/components/VisionSnapshotPanel.tsx
- frontend/src/components/StatusPanel.tsx
- frontend/src/types/dashboard.ts
- frontend/src/types/edgeVision.ts
- edge/README.md
- backend/README.md
- frontend/README.md
- docs/api-design.md
- docs/evidence/finalproject/2026-07-04-real-vision-dry-run-planner.md
- docs/prompt-runs-finalproject/2026-07-04-005-real-vision-dry-run-planner.md

## Prompt enviado a Codex

```text
Usa AGENTS.md como guia principal del proyecto.

Actua como edge, backend, frontend, architect, qa y documenter.
Usa subagentes edge-vision, edge-maxarm, backend-api y qa-api.
Usa skills opencv, maxarm, api-design, prisma-postgres, react-dashboard,
documentation y gitflow.

Objetivo:
Implementar y validar un flujo vision-dry-run realista que use QR real y cubos
reales detectados por la camara cenital para seleccionar un cubo, asignar una
drop zone disponible, generar un RobotActionPlan dry-run y registrar la accion
en Backend/Dashboard sin abrir serial ni mover MaxArm.

Restricciones principales:
No modificar _local_context, no abrir serial, no mover MaxArm, no usar
mode=hardware, no cambiar dryRun=false, no confirmar occupied en dry-run, no
romper simulation, no romper Edge Vision si Backend esta apagado, no romper
Dashboard si Edge Vision esta apagado, no hacer commit ni push.

Crear evidencia:
docs/evidence/finalproject/2026-07-04-real-vision-dry-run-planner.md

Registrar prompt run:
docs/prompt-runs-finalproject/2026-07-04-005-real-vision-dry-run-planner.md
```

## Resultado

- Implementado `POST /vision/plan-dry-run`.
- Validaciones Edge: QR requerido, cubos requeridos, zona disponible y
  configuracion de planning valida.
- Metadata extendida para Backend/Dashboard sin migracion Prisma.
- Dashboard muestra plan, bbox/centro, firma, drop zone y errores.
- Documentacion y evidencia creadas.

## Validacion

- Edge: `python -m pytest -q` -> 97 passed.
- Backend: `npm.cmd test` -> 3 files / 13 tests passed.
- Backend: `npm run build` -> OK.
- Frontend: `npm run build` -> OK.

## Veredicto

APROBADO CON OBSERVACIONES.
