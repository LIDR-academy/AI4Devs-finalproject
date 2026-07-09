# Diagnostico Inicial - RoboDock AI

> Snapshot historico: este diagnostico describe el estado inicial antes de la implementacion de Entrega 2. El estado actual del MVP esta documentado en `docs/delivery/05-final-review-entrega2.md`, `docs/api-design.md` y las evidencias QA.

## 1. Diagnostico de estructura

La estructura base del laboratorio esta bien encaminada: existen las carpetas esperadas por `AGENTS.md` para separar backend, frontend, edge, documentacion y prompts.

Estado actual:

- `backend/`: vacio. Falta API, Prisma, modelos y endpoints MVP.
- `frontend/`: vacio. Falta dashboard operativo.
- `edge/`: vacio. Falta mover o adaptar logica ejecutable desde los spikes.
- `docs/`: contiene material de Entrega 1 y prompts historicos. Falta documentacion especifica de Entrega 2.
- `prompts/`: contiene agentes, subagentes, skills, commands y playbooks.
- `spikes/`: concentra el mayor valor funcional actual: QR, vision por color, deteccion integrada, dashboard live camera y MaxArm/dry run.
- `templates/`: contiene plantillas utiles para documentar y ordenar la entrega.

Conclusion: el proyecto tiene buena base exploratoria, pero el MVP todavia no vive en las carpetas productivas. El siguiente paso es promover lo util desde `spikes/` hacia `edge/`, `backend/` y `frontend/`.

## 2. Archivos que deberian poblarse primero

Prioridad alta:

- `backend/package.json`
- `backend/src/server.ts`
- `backend/src/routes/*.ts`
- `backend/prisma/schema.prisma`
- `backend/.env.example`
- `edge/requirements.txt`
- `edge/vision/detect_truck_and_cargo.py`
- `edge/robot/maxarm_simulator.py`
- `edge/main.py`
- `frontend/package.json`
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/.env.example`
- `docs/entrega-2/README.md`
- `docs/entrega-2/api.md`
- `docs/entrega-2/modelo-datos.md`
- `docs/entrega-2/pruebas.md`
- `docs/entrega-2/evidencias.md`

Primero deben existir archivos minimos ejecutables. La documentacion debe acompanar el flujo, no adelantarse demasiado al desarrollo funcional.

## 3. Riesgos de sobreingenieria

- Disenar demasiados modelos antes de tener el flujo QR -> sesion -> cubos -> robot -> dashboard.
- Separar demasiadas capas en backend cuando una API Express simple basta para Entrega 2.
- Intentar control real completo de MaxArm antes de estabilizar `dry_run` y registro de acciones.
- Convertir los spikes en arquitectura compleja en vez de adaptarlos incrementalmente.
- Crear dashboard demasiado elaborado antes de mostrar estado de camion, sesion, cubos y acciones.
- Incorporar autenticacion, roles, colas, eventos o websockets antes de validar el MVP basico.
- Usar PostgreSQL/Prisma como bloqueo inicial en vez de avanzar con un modelo simple y endpoints probables.

## 4. Orden recomendado para comenzar

1. Crear backend minimo con Express, TypeScript y Prisma.
2. Definir modelo de datos simple: `Truck`, `UnloadSession`, `Cube`, `RobotAction`.
3. Crear endpoints MVP:
   - crear u obtener camion por `code`;
   - crear sesion de descarga;
   - registrar detecciones de cubos;
   - registrar acciones simuladas del robot;
   - consultar estado de sesion.
4. Adaptar el spike integrado de vision hacia `edge/`, manteniendo salida JSON.
5. Crear cliente edge que envie detecciones al backend.
6. Crear simulador MaxArm que registre acciones en backend.
7. Crear dashboard Vite/React con vista de estado operativo.
8. Documentar ejecucion, pruebas y evidencias en `docs/entrega-2/`.
9. Mejorar integracion en vivo, refresh automatico o control real solo despues del flujo basico.

## 5. Proximo prompt sugerido

```text
Usa AGENTS.md como guia principal.

Implementa el primer incremento funcional del MVP RoboDock AI sin sobreingenieria.

Alcance:
1. Crear backend minimo en backend/ con Node.js, Express, TypeScript y Prisma.
2. Definir modelos Prisma para Truck, UnloadSession, Cube y RobotAction.
3. Usar id como UUID tecnico y code como identificador de negocio.
4. Crear endpoints basicos para:
   - healthcheck
   - crear/obtener camion por QR code
   - crear sesion de descarga
   - registrar cubos detectados
   - registrar accion simulada del robot
   - consultar estado de una sesion
5. Agregar .env.example.
6. Documentar como probar.

Antes de implementar, propon un plan breve.
```

El mejor primer movimiento recomendado es implementar el backend minimo. Sin backend, los spikes siguen siendo piezas aisladas; con backend, vision, robot y dashboard empiezan a compartir un flujo comun.
