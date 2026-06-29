# Prompt Run - Validación E2E dry-run y dashboard

## Fecha

2026-06-29

## Objetivo

Validar de extremo a extremo RoboDock AI en `simulation` y dry-run integrado con
Backend y Dashboard, sin cámara, serial ni movimiento de MaxArm.

## Agentes usados

- `prompts/agents/qa.md`
- `prompts/agents/delivery-manager.md`
- `prompts/agents/backend.md`
- `prompts/agents/frontend.md`
- `prompts/agents/edge.md`
- `prompts/agents/documenter.md`

## Subagentes usados

- `prompts/subagents/qa-api.md`
- `prompts/subagents/backend-api.md`
- `prompts/subagents/edge-vision.md`
- `prompts/subagents/edge-maxarm.md`

Se distribuyeron auditorías de Backend/API, Frontend y Edge. La integración E2E y
la documentación se consolidaron en el agente principal.

## Skills usadas

- `prompts/skills/api-design.md`
- `prompts/skills/prisma-postgres.md`
- `prompts/skills/react-dashboard.md`
- `prompts/skills/maxarm.md`
- `prompts/skills/documentation.md`
- `prompts/skills/gitflow.md`

## Commands y playbooks

- No se invocó un archivo de `prompts/commands/`.
- No se invocó un playbook adicional.
- Se aplicaron directamente los comandos de prueba definidos por el prompt,
  README y documentación de Edge.

## Contexto leído

- `AGENTS.md`
- `README.md`
- `docs/delivery/06-plan-entrega-final.md`
- `docs/prompt-runs-finalproject/README.md`
- `docs/prompt-runs-finalproject/_template.md`
- `docs/api-design.md`
- agentes, subagentes y skills enumerados arriba
- `backend/`
- `frontend/`
- `edge/`
- `edge/README.md`

## Archivos destino

- `docs/evidence/finalproject/2026-06-29-e2e-dry-run-dashboard.md`
- `docs/prompt-runs-finalproject/2026-06-29-002-e2e-dry-run-dashboard-validation.md`

## Prompt enviado a Codex

```text
Usa AGENTS.md como guía principal del proyecto.

Actúa como:
- prompts/agents/qa.md
- prompts/agents/delivery-manager.md
- prompts/agents/backend.md
- prompts/agents/frontend.md
- prompts/agents/edge.md
- prompts/agents/documenter.md

Usa subagentes:
- prompts/subagents/qa-api.md
- prompts/subagents/backend-api.md
- prompts/subagents/edge-vision.md
- prompts/subagents/edge-maxarm.md

Usa skills:
- prompts/skills/api-design.md
- prompts/skills/prisma-postgres.md
- prompts/skills/react-dashboard.md
- prompts/skills/maxarm.md
- prompts/skills/documentation.md
- prompts/skills/gitflow.md

Lee README, plan de entrega final, documentación de prompt runs y API, backend,
frontend, edge y edge/README.md.

Objetivo:
Validar el flujo end-to-end dry-run integrado de RoboDock AI para la Entrega
Final, verificando que Edge, Backend y Dashboard funcionan juntos sin cámara real
obligatoria, sin abrir serial y sin mover MaxArm.

Contexto:
Ya existen avances en Edge simulation, visión aislada, CubeSelector,
DropZonePlanner, DropZoneAdapter, RobotActionPlanner, edge_dry_run.py, metadata
dry-run hacia Backend y dashboard con campos extendidos.

Este paso es de QA/evidencia, no de desarrollo mayor.

Fecha de validación:
- 2026-06-29

Alcance de validación:
1. Verificar que la rama actual sea finalproject-ASP.
2. Verificar working tree limpio o documentar cambios existentes.
3. Verificar Docker/PostgreSQL o documentar cómo levantarlo.
4. Validar Backend: dependencias, build, tests, GET /health y endpoints existentes.
5. Validar Frontend: dependencias y build sin errores TypeScript/Vite.
6. Validar Edge con python -m pytest -q, incluidos drop zones, visión y dry-run.
7. Ejecutar edge_runner.py simulation contra Backend y validar sesión, cubos,
   acción robot simulation y dashboard operacional.
8. Ejecutar edge_dry_run.py contra Backend con configuración segura, sin cámara
   ni serial; generar JSON, sincronizar metadata y validarla en Dashboard.
9. Validar GET /dashboard/operational: activeSession, counts, lastActions,
   profile, dryRun, visionSource, selectedCube, dropZoneCode y lastError.
10. Confirmar que no se abrió cámara/serial, no se ejecutó MaxArm, no se modificó
    _local_context/, simulation funciona y no se rompieron contratos.
11. Si algo falla, registrar comando, esperado, obtenido, causa, severidad,
    recomendación y si bloquea.
12. Si falta metadata Edge -> Backend, documentar el gap y cambio mínimo; no
    implementar una solución grande.

Crea:
- docs/evidence/finalproject/2026-06-29-e2e-dry-run-dashboard.md
- docs/prompt-runs-finalproject/2026-06-29-002-e2e-dry-run-dashboard-validation.md

La evidencia debe incluir objetivo, fecha, rama, commit, entorno, comandos,
resultados por componente, ambos E2E, dashboard sanitizado, rutas de evidencia,
checklist de seguridad, issues, conclusión APROBADO/APROBADO CON
OBSERVACIONES/NO APROBADO y próximo paso.

El prompt run debe usar docs/prompt-runs-finalproject/_template.md e incluir fecha,
objetivo, agentes, skills, contexto, archivos destino, prompt, resultado esperado,
resultado obtenido, archivos modificados y observaciones.

Restricciones:
- No implementar features grandes.
- No abrir cámara ni puerto serial.
- No ejecutar MaxArm ni usar hardware.
- No cambiar dry_run=false.
- No modificar _local_context/.
- No guardar secretos ni rutas absolutas innecesarias.
- No hacer commit ni push.
- No ocultar fallos.

Antes de ejecutar, resume plan, comandos y seguridad. Después, entrega resultado,
veredicto, archivos modificados y próximo paso.
```

## Resultado esperado

- Builds y tests sin errores.
- Los siete endpoints históricos compatibles.
- `simulation` y dry-run integrados contra Backend.
- Dashboard con metadata extendida.
- Evidencia Edge reproducible.
- Ningún acceso a cámara, serial o MaxArm.
- `_local_context/` sin modificaciones.
- Informe honesto con veredicto y próximos pasos.

## Resultado obtenido

- Rama y commit correctos; working tree inicial limpio.
- PostgreSQL activo y migraciones al día.
- Backend build aprobado y 6 tests aprobados.
- Frontend build aprobado y servidor Vite con HTTP 200.
- Suite acotada Edge: 59 tests aprobados.
- `edge_runner.py`: simulation E2E aprobado con 3 cubos y acción exitosa.
- `edge_dry_run.py --sync-backend`: aprobado; acción y metadata visibles en
  Dashboard.
- JSON dry-run generado bajo `workspace/generated/edge-evidence/`.
- Cámara no abierta, serial no abierto y MaxArm no ejecutado.
- Veredicto: **APROBADO CON OBSERVACIONES**.
- Falló el comando pytest desde la raíz porque descubrió un test serial en
  `_local_context/`; el intento a `COM4` no logró abrir el puerto ni enviar
  comandos. La colección generó un `.pyc` ignorado dentro de esa carpeta.

## Archivos creados o modificados

- Creado:
  `docs/evidence/finalproject/2026-06-29-e2e-dry-run-dashboard.md`
- Creado:
  `docs/prompt-runs-finalproject/2026-06-29-002-e2e-dry-run-dashboard-validation.md`
- Generado por Edge:
  `workspace/generated/edge-evidence/dry-run-046cafd6-7d9f-4e7e-b533-3c1628a57820.json`
- Generado durante el descubrimiento pytest:
  `_local_context/spikes/experiments/dynamic_pickup_maxarm_pick/__pycache__/test_serial_pose.cpython-311-pytest-8.3.4.pyc`

No se modificó código de producto, no se hizo commit ni push.

## Observaciones

- El `_template.md` disponible termina dentro del bloque “Prompt enviado a
  Codex”; se conservaron sus secciones y se completaron las secciones exigidas
  por el encargo.
- En Windows se usó `npm.cmd` porque `npm.ps1` está bloqueado por ExecutionPolicy.
- La base local contenía sesiones anteriores; la evidencia sanitizada identifica
  solamente la sesión relevante.
- El próximo paso es excluir `_local_context/` del descubrimiento pytest y
  proteger el spike serial contra I/O durante importación; después debe repetirse
  la validación.
