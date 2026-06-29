# Prompt Run - Backend y Dashboard Dry-Run

## Fecha

2026-06-29

## Objetivo

Integrar el dry-run de Edge con Backend y Dashboard para exponer una traza
operacional segura del plan, cubo, drop zone, perfil y errores, sin movimiento
físico.

## Agentes usados

- `prompts/agents/backend.md`
- `prompts/agents/frontend.md`
- `prompts/agents/edge.md`
- `prompts/agents/architect.md`
- `prompts/agents/qa.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/backend-api.md`
- `prompts/subagents/backend-prisma.md`
- `prompts/subagents/qa-api.md`
- `prompts/subagents/edge-maxarm.md`
- `prompts/subagents/edge-vision.md`

Los subagentes realizaron auditorías de contratos, Prisma, QA y seguridad Edge. No
abrieron cámara, serial ni modificaron hardware.

## Skills usadas

- `prompts/skills/api-design.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/react-dashboard.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Contexto leído

- `AGENTS.md`
- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- agentes, subagentes y skills enumerados arriba
- `backend/`
- `frontend/`
- `edge/`
- `edge/README.md`

## Archivos destino

- `backend/src/modules/robot/`
- `backend/src/modules/sessions/`
- `backend/src/modules/dashboard/`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/README.md`
- `frontend/src/`
- `frontend/README.md`
- `edge/src/api_client.py`
- `edge/src/edge_dry_run.py`
- `edge/tests/test_edge_dry_run.py`
- `edge/README.md`
- `docs/api-design.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/2026-06-29-001-backend-dashboard-dry-run-integration.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/backend.md
- prompts/agents/frontend.md
- prompts/agents/edge.md
- prompts/agents/architect.md
- prompts/agents/qa.md
- prompts/agents/documenter.md

Usa subagentes:
- prompts/subagents/backend-api.md
- prompts/subagents/backend-prisma.md
- prompts/subagents/qa-api.md
- prompts/subagents/edge-maxarm.md
- prompts/subagents/edge-vision.md

Usa skills:
- prompts/skills/api-design.md
- prompts/skills/prisma-postgres.md
- prompts/skills/react-dashboard.md
- prompts/skills/maxarm.md
- prompts/skills/documentation.md
- prompts/skills/gitflow.md

Lee:
- README.md
- docs/delivery/06-plan-entrega-final.md
- docs/prompt-runs-finalproject/README.md
- docs/prompt-runs-finalproject/_template.md
- backend/
- frontend/
- edge/
- edge/README.md

Objetivo:
Integrar el flujo Edge dry-run con Backend y Dashboard para que la Entrega Final
muestre trazabilidad operacional del plan generado, cubo seleccionado, drop zone
seleccionada, perfil de ejecución, dryRun y errores, sin mover hardware físico.

Contexto:
El Edge ya cuenta con:

- perfiles `simulation`, `vision-dry-run` y `hardware`;
- modelos internos;
- OpenCV aislado;
- CubeSelector;
- DropZonePlanner;
- DropZoneAdapter;
- RobotActionPlanner;
- comando `edge_dry_run.py`;
- evidencia JSON;
- tests unitarios con unittest/pytest.

Ahora se necesita que el Backend y Dashboard puedan reflejar mejor el resultado del
dry-run integrado.

Alcance de este paso:

1. Mantener compatibles los endpoints existentes:
   - GET /health
   - POST /sessions
   - GET /sessions
   - GET /sessions/:id
   - POST /sessions/:id/cubes
   - POST /robot/actions
   - GET /dashboard/operational
2. No romper Entrega 2.
3. Extender de forma compatible `POST /robot/actions` para aceptar metadata segura
   del dry-run, incluyendo cuando exista:
   - runId;
   - profile;
   - dryRun;
   - source;
   - selectedCube;
   - dropZoneCode;
   - positionOrder;
   - releaseConfirmed;
   - statePersisted;
   - configVersion;
   - errorCode;
   - errorMessage sanitizado.
4. Si ya existe un campo JSON `metadata`, preferir usarlo antes que crear una
   migración nueva.
5. Si una migración es estrictamente necesaria, justificarla y mantenerla mínima.
6. Agregar o preparar una transición controlada de acciones, idealmente:
   - PATCH /robot/actions/:id
   - para pasar de `PLANNED` a `SUCCESS` o `ERROR`.
   - Si se decide no implementarla aún, documentar por qué.
7. Agregar o preparar cierre de sesión, idealmente:
   - PATCH /sessions/:id
   - para marcar sesión como `COMPLETED`, `FAILED` o similar y setear `finishedAt`.
   - Si se decide no implementarlo aún, documentar por qué.
8. Ampliar `GET /dashboard/operational` de forma compatible para exponer:
   - activeSession;
   - counts;
   - lastActions;
   - profile;
   - dryRun;
   - visionSource;
   - selectedCube;
   - dropZoneCode;
   - lastError;
   - timestamps relevantes.
9. Actualizar Frontend para mostrar:
   - perfil de ejecución;
   - fuente de visión;
   - dry-run vs simulation vs hardware;
   - cubo seleccionado;
   - color;
   - dropZoneCode;
   - estado de acción;
   - último error si existe.
10. El Frontend no debe incluir controles de movimiento físico ni reset de
    ocupación.
11. Actualizar Edge solo si es necesario para enviar metadata compatible al
    Backend desde `edge_dry_run.py`.
12. Agregar tests:
    - Backend para metadata en robot actions;
    - Backend para dashboard con campos nuevos;
    - Backend para compatibilidad con payload antiguo;
    - Frontend build;
    - si aplica, test de Edge para payload dry-run.
13. Actualizar documentación:
    - backend/README.md;
    - frontend/README.md si existe;
    - edge/README.md si cambia el uso;
    - docs/api-design.md si existe;
    - docs/delivery/06-plan-entrega-final.md solo si hay decisiones relevantes.

Archivos sugeridos a revisar o modificar:

- backend/src/
- backend/prisma/schema.prisma
- backend/prisma/migrations/ si fuera estrictamente necesario
- backend/README.md
- frontend/src/
- frontend/README.md
- edge/src/edge_dry_run.py
- edge/src/api_client.py
- edge/README.md
- docs/api-design.md
- docs/prompt-runs-finalproject/2026-06-28-006-backend-dashboard-dry-run-integration.md

Restricciones:
- No elimines ni rompas `simulation`.
- No abras cámara.
- No abras puerto serial.
- No ejecutes MaxArm.
- No implementes movimiento físico.
- No agregues controles físicos en el dashboard.
- No guardes secretos ni rutas absolutas.
- No cambies contratos existentes de forma incompatible.
- No hagas commit ni push.
- No modifiques `_local_context/`.

Antes de modificar:

1. Resume brevemente el plan.
2. Indica si necesitas o no migración Prisma.
3. Lista archivos a crear/modificar.
4. Confirma que no abrirás cámara ni serial.

Después de implementar:

1. Ejecuta o indica cómo ejecutar tests Backend.
2. Ejecuta o indica cómo ejecutar build Frontend.
3. Ejecuta o indica cómo ejecutar tests Edge si tocaste Edge.
4. Verifica que los endpoints existentes siguen funcionando.
5. Muestra ejemplo de payload dry-run hacia Backend.
6. Muestra ejemplo esperado de `GET /dashboard/operational`.
7. Resume archivos creados/modificados.
8. Indica qué queda pendiente para el siguiente paso.
9. Registra este prompt run.

El prompt run debe usar como base:
- docs/prompt-runs-finalproject/_template.md

Debe incluir:
- Fecha.
- Objetivo.
- Agentes usados.
- Skills usadas.
- Contexto leído.
- Archivos destino.
- Prompt enviado a Codex.
- Resultado esperado.
- Resultado obtenido.
- Archivos modificados.
- Observaciones.
```

## Resultado esperado

- Contratos anteriores compatibles.
- Metadata dry-run segura sin migración innecesaria.
- Transiciones controladas de acción y sesión.
- Dashboard y Frontend con traza operacional inequívoca.
- Edge sincronizable sin activar hardware.
- Pruebas y documentación reproducibles.

## Resultado obtenido

- Se reutilizó `RobotAction.metadata`; no se creó migración Prisma.
- `POST /robot/actions` conserva defaults históricos y devuelve metadata/timestamps.
- Se agregó `PATCH /robot/actions/:id` con transición
  `PLANNED -> SUCCESS|ERROR`.
- Se agregó `PATCH /sessions/:id` con
  `IN_PROGRESS -> COMPLETED|ERROR` y `finishedAt`.
- La metadata valida campos dry-run, tamaño y claves sensibles; el perfil
  `vision-dry-run` fuerza invariantes sin hardware.
- El dashboard agrega traza general y `execution` por acción.
- Frontend muestra perfil, fuente, dry-run, cubo, drop zone, estado y error, sin
  controles físicos.
- Edge sincroniza solo con `--sync-backend`, enviando un payload allowlisted y
  manteniendo `occupied` sin cambios.
- Backend: 6 tests aprobados y build TypeScript aprobado.
- Frontend: build de producción aprobado.
- Edge: 59 tests aprobados.
- Un smoke HTTP verificó los siete endpoints históricos, ambos PATCH, el payload
  legado y los campos aditivos del dashboard.
- El comando Edge sintético sincronizó una acción `PLANNED -> SUCCESS` con
  `hardwareMovement=false`, `serialOpened=false` y reserva cancelada.

## Archivos modificados

- Modificados: `backend/package.json`, `backend/package-lock.json`
- Creado: `backend/vitest.config.ts`
- Creados: `backend/src/modules/robot/robot.metadata.ts`,
  `backend/src/modules/robot/robot.validators.test.ts`
- Modificados: rutas, servicios y validadores de robot/sesiones; dashboard service
- Modificado: `backend/README.md`
- Creado: `frontend/src/components/ExecutionPanel.tsx`
- Modificados: tipos, Dashboard, StatusPanel, ActionsTable y estilos de Frontend
- Modificado: `frontend/README.md`
- Modificados: `edge/src/api_client.py`, `edge/src/edge_dry_run.py`,
  `edge/tests/test_edge_dry_run.py`, `edge/README.md`
- Modificados: `docs/api-design.md`, `docs/delivery/06-plan-entrega-final.md`
- Creado: este prompt run

## Observaciones

- El prompt original solicitaba un nombre `2026-06-28-006`; se corrigió el registro
  a `2026-06-29-001` porque fue el primer prompt run del 29-06-2026. La ruta antigua
  se conserva únicamente dentro del bloque histórico “Prompt enviado a Codex”.
- No se modificó el schema ni se generó migración.
- `SUCCESS + outcome=DRY_RUN_PLANNED` solo acredita planificación dry-run.
- La sesión queda activa para mantenerla visible en el dashboard; puede cerrarse
  explícitamente después de capturar evidencia.
- `runId` todavía no ofrece idempotencia entre procesos.
- No se abrió cámara ni serial, no se ejecutó MaxArm y no se modificó
  `_local_context/`.
- No se hizo commit ni push.
