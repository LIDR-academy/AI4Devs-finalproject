# Prompt-run: dashboard physical confirmation note

- Fecha: 2026-07-13
- Secuencia: 004
- Rama esperada: finalproject-ASP

## Objetivo

Corregir la nota inferior del Dashboard Operacional para que sea contextual y no contradiga una descarga fisica confirmada por Edge Vision.

## Problema UX detectado

Luego de una descarga fisica exitosa, el dashboard podia mostrar `Fisicos OK > 0`, `Resultado: SUCCESS` y filas con `Fisico = CONFIRMED`, pero mantenia una nota que indicaba que el dashboard no confirmaba movimiento fisico. El texto era confuso porque el dashboard si estaba reflejando una confirmacion fisica reportada por Edge Vision.

## Regla aplicada

- Si la ejecucion es `hardware` y existe confirmacion fisica reportada por Edge, se muestra: "Confirmación física reportada por Edge Vision. El dashboard refleja el estado informado por Edge."
- Si la ejecucion es `hardware` y no existe confirmacion fisica disponible, se muestra: "Modo hardware reportado por Edge. No hay confirmación física disponible para esta ejecución."
- Si la ejecucion es `simulation` o `dry-run`, se muestra: "Ejecución simulada / dry-run. No hubo movimiento físico."
- Si no hay ejecucion registrada, no se muestra nota.

La confirmacion fisica se determina solo con datos existentes: `totalPhysicalConfirmedCubes > 0`, `progress.physicalConfirmed > 0`, `physicalConfirmed > 0` si viene en el estado Edge, o acciones con `physicalConfirmation.status = CONFIRMED`.

## Cambios realizados

- Se agrego un helper de presentacion en el dashboard para calcular la nota contextual.
- Se reemplazo la frase fija anterior por el mensaje contextual.
- Se elimino la frase contradictoria del panel legacy de trazabilidad.
- Se mantuvo el estilo visual existente `trace-note`.

## Archivos modificados

- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/ExecutionPanel.tsx`
- `docs/prompt-runs-finalproject/2026-07-13-004-dashboard-physical-confirmation-note.md`

## Validaciones ejecutadas

- `npm run build` desde `frontend`: OK.
- `npm test --if-present` desde `frontend`: el primer intento con `npm` fue bloqueado por la politica local de PowerShell para `npm.ps1`; se reintento con `npm.cmd test --if-present` y termino OK.

## Alcance

- No se modifico Backend.
- No se modifico Edge.
- No se modificaron payloads, contratos, calculos ni logica fisica MaxArm.
- No se tocaron configuraciones locales.
- El dashboard solo refleja el estado informado por Edge Vision; no inventa ni ejecuta confirmaciones fisicas.
