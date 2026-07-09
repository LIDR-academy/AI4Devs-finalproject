# Prompt run - Fix CodeRabbit Entrega 2

## Objetivo

Aplicar correcciones minimas y de bajo riesgo sobre observaciones CodeRabbit del PR de Entrega 2, manteniendo el MVP funcional en la rama `feature-entrega2-ASP-fix`.

## Archivos revisados/corregidos

- `backend/package.json`
- `backend/src/server.ts`
- `backend/src/middleware/request-logger.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/modules/robot/robot.service.ts`
- `backend/src/modules/robot/robot.validators.ts`
- `edge/src/api_client.py`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/styles.css`
- `templates/api-template.md`
- `templates/delivery-plan-template.md`
- `prompts/commands/test-flow.md`
- `prompts/agents/qa.md`
- `docs/delivery/00-diagnostico-inicial.md`
- `docs/delivery/03-governance-checklist-entrega2.md`
- `docs/delivery/04-backend-implementation-plan.md`
- `docs/delivery/05-final-review-entrega2.md`
- `docs/decisions/ADR-003-edge-backend-contract.md`
- `docs/delivery/roadmap-entregas.md`

## Observaciones corregidas

- Alineado `backend/package.json` con el build real: `main` y `start` apuntan a `dist/src/server.js`.
- `dryRun` queda controlado por backend en `robot.service.ts`, calculado desde `input.mode` despues de mezclar metadata del input.
- El validador de acciones robot ya no inyecta `dryRun: true` cuando `metadata` viene indefinida.
- La documentacion activa usa rutas reales sin prefijo `/api` o marca planes previos como snapshot historico.
- Se valido que `docs/api-design.md` existe y se mantiene como fuente del contrato API actual.
- `edge/src/api_client.py` valida forma minima de respuestas para sesion, accion robot y dashboard.
- Se cerraron fences abiertos en templates Markdown.
- Se agrego handler de error para `app.listen`, con mensaje claro si el puerto esta ocupado.
- El request logger sanitiza CR/LF en `originalUrl` y `correlationId`.
- El error handler delega si `headersSent` y usa fallback de `correlationId`.
- El panel de error del dashboard tiene `role="alert"`.
- `.icon-button` tiene altura minima accesible y foco visible.
- Las guias activas de QA/test-flow incluyen identificacion de camion por QR/truckCode antes de crear sesion.

## Observaciones dejadas como mejora futura

- No se agrego Helmet porque implica dependencia nueva y queda fuera de las restricciones del fix.
- No se crearon migraciones ni indices Prisma nuevos.
- No se abordaron carreras TOCTOU con transacciones complejas para evitar refactor de servicios.
- No se refactorizo la paleta CSS ni la arquitectura frontend.
- No se modificaron prompts historicos ni evidencias QA pasadas para preservar trazabilidad.

## Comandos de validacion sugeridos

Desde `backend/`:

```bash
npm run build
npm start
```

Desde `frontend/`:

```bash
npm run build
```

Desde `edge/`:

```bash
python src/edge_runner.py
```

## Validacion ejecutada

- `backend`: `npm install` para dependencias ya declaradas, `npm run build` OK.
- `backend`: `Test-Path dist/src/server.js` retorno `True`; `package.json` apunta `main` y `start` a `dist/src/server.js`.
- `backend`: `npx prisma migrate deploy` contra PostgreSQL existente en `localhost:5434` indico que no habia migraciones pendientes.
- `backend`: `npm run prisma:seed` OK.
- `frontend`: `npm install` para dependencias ya declaradas, `npm run build` OK.
- `edge`: `python src/edge_runner.py` OK contra backend temporal y PostgreSQL existente; creo sesion, registro 3 cubos, registro `ACTION-001` y consulto dashboard con total 3.

## Notas de entorno

- `docker compose up -d` no pudo crear el servicio porque ya existia un contenedor global `robodock-postgres`. No se elimino ni renombro. Se uso el contenedor existente, que estaba activo en `localhost:5434`.
- No se creo archivo `.env`; `DATABASE_URL` se paso solo como variable de proceso durante validacion.
