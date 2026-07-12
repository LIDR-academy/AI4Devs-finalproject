# Prompt run: Dashboard UX compact layout

- Fecha: 2026-07-12
- Secuencia: 001
- Rama esperada: finalproject-ASP

## Objetivo UX

Redisenar el Dashboard Operacional como una consola compacta para operacion y demo, priorizando respuesta rapida sobre sesion activa, backend, Edge/Vision, cubos, planificacion, ejecucion fisica y resultado.

## Problema detectado

El dashboard mostraba todos los paneles y diagnosticos al mismo nivel. Cuando Edge Vision no estaba disponible, la vista principal crecia con muchos campos tecnicos en "-", mensajes de diagnostico y tablas que obligaban a hacer scroll para operar.

## Cambios realizados

- Se agrego header compacto con ultima actualizacion, auto-refresh y boton Actualizar.
- Se agrego una franja de estado global para Backend, Edge, Vision, Robot y Sync.
- Se reorganizo la vista principal en un workspace de dos columnas: Vision / Camara y Control MaxArm.
- Vision muestra un estado ejecutivo cuando Edge Vision no esta disponible, sin desplegar toda la grilla tecnica.
- Control MaxArm quedo compacto con estado, selector de max cubos, checklist, reset, planificacion, ejecucion y progreso resumido.
- Se agregaron tarjetas de resumen para sesion, cubos y progreso de descarga.
- Se movieron detalles a tabs: Plan de descarga, Acciones robot, Trazabilidad Edge, Diagnostico vision y Reset / configuracion.
- En el plan se cambio el label "Orden" por "Posicion en zona".
- Se aumento el limite backend de ultimas acciones de 5 a 10 con un cambio minimo en `dashboard.service.ts`.
- Se actualizo `frontend/README.md` con el nuevo layout compacto y comportamiento sin Edge Vision.

## Archivos modificados

- `frontend/src/components/Dashboard.tsx`
- `frontend/src/components/PhysicalUnloadPanel.tsx`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `frontend/src/components/ActionsTable.tsx`
- `frontend/src/styles.css`
- `frontend/README.md`
- `backend/src/modules/dashboard/dashboard.service.ts`
- `docs/prompt-runs-finalproject/2026-07-12-001-dashboard-ux-compact-layout.md`

## Validaciones ejecutadas

- `cd frontend && npm run build`: OK.
- `cd frontend && npm.cmd test --if-present`: OK, sin script de test configurado.
- `cd backend && npm run build`: OK.
- `cd backend && npm.cmd test --if-present`: OK, 3 archivos de test y 19 tests pasados.

## Observaciones y mejoras futuras

- Agregar pruebas de componentes para tabs y estados de Edge no disponible.
- Capturar evidencia visual desktop/mobile para documentar reduccion de scroll.
- Considerar persistir la tab seleccionada si se vuelve util durante demo.
