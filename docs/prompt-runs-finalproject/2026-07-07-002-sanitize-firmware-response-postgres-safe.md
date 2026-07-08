# Prompt-run: 2026-07-07-002-sanitize-firmware-response-postgres-safe

## 1. Fecha

2026-07-07.

## 2. Contexto tecnico previo

- Dashboard ya podia planificar y ejecutar descarga full multi-cubo.
- Edge usaba `--unload-config` con `config/single-cube-pick-drop.local.json`
  para `robotPlanning`, `dropZones`, hardware, `physicalConfirmation` y
  `pickupRetry`.
- El flujo ya continuaba cuando una accion quedaba fisicamente confirmada pero
  `backendSyncStatus=FAILED`.
- La configuracion fisica local validada usaba `pickupOffset.x=5`,
  `pickupOffset.y=-5`, `pickZ=138`, `physicalConfirmation.enabled=true`,
  `pickupRetry.enabled=true`, `hardware.port=COM4` y `baudrate=115200`.
- No se modificaron configs locales ni backups restringidos.

## 3. Evidencia del problema

- En una descarga full desde Dashboard, MaxArm descargo fisicamente todos los
  cubos.
- Dashboard mostro `SUCCESS_WITH_BACKEND_SYNC_WARNINGS`.
- Una accion fallo al sincronizar con Backend con HTTP 500.
- CorrelationId observado: `74c45663-0461-40c8-9cbb-b11ee9ce70b9`.
- Backend registro un `PrismaClientUnknownRequestError` en
  `backend/src/modules/robot/robot.service.ts` al ejecutar
  `prisma.robotAction.create()`.

## 4. Diagnostico

- PostgreSQL rechazo metadata con error `22P05`.
- Mensaje observado: `unsupported Unicode escape sequence`.
- Detalle observado: `\u0000 cannot be converted to text`.
- Edge estaba enviando `firmwareResponses` crudas del MaxArm dentro de
  metadata.
- Algunas respuestas del firmware contienen caracteres de control o bytes
  binarios, incluido el caracter nulo real.
- El problema no estaba en robot, vision ni planificacion; era metadata no
  segura para PostgreSQL.

## 5. Objetivos

- Sanitizar `firmwareResponse` y cualquier string anidado en metadata antes de
  enviar desde Edge.
- Mantener metadata JSON estructurada y conservar texto util como `DONE`.
- Agregar flags diagnosticos cuando se sanitiza firmware.
- Sanitizar defensivamente en Backend antes de Prisma/PostgreSQL.
- Evitar HTTP 500 por `\u0000` en `POST /robot/actions`.
- Mantener compatibilidad con metadata multi-cubo, retries,
  `physicalConfirmation` y `backendSyncStatus`.

## 6. Cambios implementados

- Edge:
  - Se agrego `edge/src/metadata_sanitizer.py`.
  - `BackendClient.register_robot_action()` y `update_robot_action()` sanitizan
    metadata antes del request HTTP.
  - Los caracteres de control C0 no imprimibles, salvo `\n`, `\r` y `\t`, se
    reemplazan por marcadores legibles como `<0x00>`.
  - La sanitizacion cubre valores y nombres de claves dentro de metadata.
  - Cuando un `firmwareResponse` cambia, se agregan
    `firmwareResponseSanitized`, `firmwareResponseRawLength`,
    `firmwareResponseHadControlChars` y
    `firmwareResponseControlCharCount`.
  - Cuando cualquier string anidado cambia, se agregan `metadataSanitized` y
    `sanitizedFields`.
- Backend:
  - `normalizeRobotMetadata()` sanitiza metadata antes de validaciones y antes
    de que `robot.service.ts` llame a Prisma.
  - La sanitizacion defensiva cubre valores y nombres de claves dentro de
    metadata.
  - Se preservan acentos, unicode normal, saltos de linea, retorno de carro y
    tabs.
  - Se mantiene la validacion existente de JSON-safe, claves sensibles, tamano
    maximo y contratos de metadata.
- Docs:
  - `edge/README.md` documenta respuestas firmware con control chars y flags de
    sanitizacion.
  - `backend/README.md` documenta la defensa antes de Prisma/PostgreSQL.

## 7. Archivos modificados

- `edge/src/api_client.py`
- `edge/src/metadata_sanitizer.py`
- `edge/tests/test_metadata_sanitizer.py`
- `backend/src/modules/robot/robot.metadata.ts`
- `backend/src/modules/robot/robot.validators.test.ts`
- `edge/README.md`
- `backend/README.md`
- `docs/prompt-runs-finalproject/2026-07-07-002-sanitize-firmware-response-postgres-safe.md`

## 8. Tests ejecutados

- `python -m pytest tests\test_metadata_sanitizer.py -q` en `edge/`.
- `npm.cmd test -- --run src/modules/robot/robot.validators.test.ts` en
  `backend/`.
- `python -m pytest -q` en `edge/`.
- `npm.cmd run build` en `backend/`.
- `npm.cmd test --if-present` en `backend/`.
- `npm.cmd run build` en `frontend/`.
- `npm.cmd test --if-present` en `frontend/`.

## 9. Resultado de validaciones

- Edge sanitizador focalizado: 4 tests pasaron.
- Backend robot validators focalizado: 12 tests pasaron.
- Edge completo: 174 tests pasaron.
- Backend build TypeScript: exitoso.
- Backend tests: 19 tests pasaron.
- Frontend build TypeScript/Vite: exitoso.
- Frontend tests: `npm.cmd test --if-present` termino sin salida visible; no
  hay suite frontend ejecutable configurada.

## 10. Pruebas manuales pendientes

- Levantar Backend con `npm run dev`.
- Levantar Edge Vision con `--unload-config config/single-cube-pick-drop.local.json`,
  `--allow-camera`, `--sync-backend` y `--backend-url http://localhost:3000`.
- Levantar Dashboard.
- Resetear drop zones.
- Planificar descarga full.
- Ejecutar descarga full desde Dashboard.
- Confirmar que no aparezcan HTTP 500 por `\u0000`, PostgreSQL `22P05` ni
  `unsupported Unicode escape sequence`.
- Confirmar que, si no aparece otro error real, Dashboard llegue a fisico `6/6`,
  backend sync `6/6` y resultado `SUCCESS`.

## 11. Riesgos o limitaciones

- Las pruebas automatizadas no mueven MaxArm ni validan camara fisica.
- La sanitizacion conserva diagnostico, pero los bytes binarios ya no quedan
  como caracteres crudos sino como marcadores textuales.
- Si aparece otro error de backend, serial, seguridad o confirmacion fisica, el
  flujo debe reportarlo de forma separada.
