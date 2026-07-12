# RoboDock AI Frontend

Dashboard operacional para Entrega 2.

## Alcance

Este frontend implementa una pantalla minima:

- Dashboard Operacional.
- Sesion activa.
- `truckCode`.
- Estado de sesion.
- Conteo de cubos por color.
- Total de cubos.
- Ultimas acciones del robot.
- Modo `simulation` cuando corresponde.
- Estados loading, error y empty.
- Perfil, fuente de visión, dry-run, cubo y drop zone planificados.
- Estado de acción y último error reportado.
- Control de descarga fisica multi-cubo desde Edge Vision.
- Layout compacto de consola demo con vision y control fisico visibles arriba.
- Detalles de plan, acciones, trazabilidad, diagnostico vision y reset en tabs.
- Flujo operacional para `Iniciar jornada` y `Preparar nuevo camion` sin borrar
  historial.

No declara hardware real como implementado. El frontend consume datos reales del backend, que para Entrega 2 provienen del Edge en modo `simulation`.

## Requisitos

- Node.js 20+
- npm
- Backend ejecutandose en `http://localhost:3000`

## Instalacion

```powershell
cd frontend
npm install
```

## Configuracion

Crear `frontend/.env` desde `frontend/.env.example` si necesitas cambiar la URL del backend.

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_DASHBOARD_REFRESH_MS=3000
VITE_EDGE_VISION_URL=http://localhost:8001
VITE_EDGE_VISION_REFRESH_MS=2000
```

`VITE_EDGE_VISION_URL` es opcional. Si no existe o el servicio Edge Vision esta
apagado, el dashboard sigue funcionando con el backend y muestra un estado
ejecutivo de Edge Vision no disponible. Los campos tecnicos quedan disponibles
en la tab `Diagnostico vision`, sin ocupar la vista principal.

`VITE_DASHBOARD_REFRESH_MS` controla el polling automatico del dashboard
operacional: sesion activa, cubos registrados, conteos y ultimas acciones robot.
Si se omite, usa `3000`. El boton `Actualizar` sigue disponible para refresco
manual.

`VITE_EDGE_VISION_REFRESH_MS` controla el polling automatico del panel de vision.
Si se omite, usa `2000`. El frontend acepta valores entre `1000` y `3000` ms; los
valores fuera de rango se ajustan a ese intervalo seguro.

El mismo `VITE_EDGE_VISION_URL` se usa para reset de drop zones, planificacion
multi-cubo, ejecucion fisica y status de la ultima descarga.

La descarga fisica desde Dashboard se ejecuta siempre a traves de Edge Vision.
El puerto serial del MaxArm se configura en el unload-config local de Edge
(`edge/config/single-cube-pick-drop.local.json`) mediante `hardware.port`; el
Dashboard no pide `COM4` al usuario final ni habla directamente con serial.

## Reset operacional

El boton `Iniciar jornada` llama a `POST /dashboard/operational/reset` con
`mode=start-day`, intenta `POST /operation/reset` en Edge Vision y refresca el
dashboard. Si Edge no esta disponible, el backend queda limpio igual y la UI
muestra el warning correspondiente.

El boton `Preparar nuevo camion` cierra la operacion activa como `COMPLETED`
cuando Edge reporta exito; en otros casos la descarta como `cancelled` en el
contrato de UI. El backend lo persiste como `ERROR` porque el enum actual no
tiene `CANCELLED`.

En estado limpio:

- `activeSession` queda `null`.
- la tarjeta de sesion muestra `Sin sesion activa` y `Estado: IDLE`;
- los cubos quedan en 0;
- plan, progreso y acciones de la operacion actual quedan vacios;
- la trazabilidad conserva solo estado ejecutivo, no acciones historicas.

Estos flujos limpian solo la operacion actual. No borran sesiones, cubos ni
acciones historicas del backend.

## Ejecucion

```powershell
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Validacion manual

1. Levantar PostgreSQL:

```powershell
docker compose up -d
```

2. Levantar backend:

```powershell
cd backend
npm run dev
```

3. Ejecutar Edge simulation:

```powershell
cd edge
python src\edge_runner.py --backend-url http://localhost:3000 --config config\edge.config.example.json
```

4. Levantar frontend:

```powershell
cd frontend
npm run dev
```

5. Opcional: levantar Edge Vision para snapshot de camara/fixture:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.example.json
```

Para demo fisica desde dashboard, levantar Edge Vision con camara y puerto MaxArm:

```powershell
cd edge
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --unload-config config\single-cube-pick-drop.local.json `
  --allow-camera `
  --sync-backend `
  --backend-url http://localhost:3000
```

Antes de esa demo, agregar localmente en
`edge/config/single-cube-pick-drop.local.json`:

```json
{
  "hardware": {
    "port": "COM4",
    "baudrate": 115200
  }
}
```

En otros equipos el puerto puede ser `COM3`, `COM5`, etc. Si falta
`hardware.port`, el panel muestra el bloqueo:
`Falta configurar hardware.port en single-cube-pick-drop.local.json`.

6. Verificar visualmente:

- existe una sesion activa;
- el camion es `TRUCK-001`;
- el estado es `IN_PROGRESS`;
- el total de cubos es mayor que cero;
- aparecen conteos por color;
- la ultima accion del robot muestra `mode=simulation`.
- el panel de trazabilidad muestra `profile`, fuente, firma de snapshot, cubo,
  centro, bounding box, `dropZoneCode`, cantidad de pasos y ultimo error;
- el panel `Vision / Camara` muestra estado, fuente, timestamp, conteos e imagen
  si Edge Vision esta disponible;
- el panel `Vision / Camara` muestra `truckCode` leido por QR, `qrDetected`,
  `qrValid`, `qrStatus`, ROI QR y ultimo sync Backend si existe;
- la imagen anotada del panel muestra los rectangulos `CARGO ROI` y `QR ROI`
  cuando Edge Vision los expone en el snapshot;
- el panel muestra `cargoRoi` y `qrRoi` en formato compacto `x,y,w,h`;
- el panel `Vision / Camara` muestra el ultimo resultado de
  `/vision/plan-dry-run` cuando existe, incluido `dropZoneCode` o error seguro;
- el panel de conteos superiores se interpreta como `Cubos registrados en
  sesion`, mientras el panel de vision muestra `Cubos detectados por vision`;
- si Edge Vision detecta cubos pero no hay QR valido, esos cubos no deben
  presentarse como registrados en sesion;
- el panel indica `Auto-refresh cada X segundos` y `Ultima actualizacion`;
- la cabecera indica la actualizacion automatica operacional y cambia sin
  presionar `Actualizar` cuando el backend recibe nuevas acciones;
- si Edge Vision esta apagado, muestra un error visible sin romper el resto del
  dashboard y sin desplegar la grilla tecnica completa en la vista principal;
- `Iniciar jornada` deja el dashboard en `Sin sesion activa`, cubos 0,
  plan/progreso/acciones vacios y muestra que no borra historial;
- si Edge Vision no esta disponible durante el reset, el dashboard informa
  `Backend limpio; Edge no disponible para reset fisico/drop zones`;
- `Preparar nuevo camion` limpia la operacion actual y vuelve a esperar QR;
- la vista principal muestra arriba `Vision / Camara` y `Control MaxArm`;
- las tabs muestran plan de descarga, acciones robot, trazabilidad Edge,
  diagnostico vision y reset/configuracion;
- `vision-dry-run` se etiqueta como dry-run sin movimiento;
- los controles fisicos aparecen solo como llamadas al servicio Edge; el
  frontend no habla con serial ni calcula movimientos de robot.
- la seccion `Descarga fisica del camion` muestra estado
  `idle/planning/planned/executing/success/success_with_backend_sync_warnings/partial_success/failed`;
- `Ejecutar descarga fisica` queda deshabilitado sin plan, sin QR valido, sin
  cubos planificados, sin Edge Vision, sin sesion backend, con ejecucion en curso
  o sin todos los checks de seguridad;
- `Reset drop zones` pide confirmacion visual, llama a Edge y muestra slots
  revisados/reseteados, archivo, backup y colores afectados;
- `Planificar descarga` llama a `/robot/multi-cube/plan` con el selector
  `Descargar todos`, `1`, `2`, `4` o `6`;
- la tabla del plan muestra color, drop zone, orden, pickup target y offset;
- el resumen de ejecucion distingue cubos fisicamente confirmados, cubos
  intentados, cubos restantes, acciones sincronizadas en Backend, fallas de sync,
  ultimo error backend y ultimo error fisico;
- la tabla de acciones ejecutadas muestra color, drop zone,
  `physicalConfirmation.status`, `backendSyncStatus`, intentos, `finalPickZUsed`,
  action code de Backend y error si existe;
- una accion con `physicalConfirmation.status=CONFIRMED` y
  `backendSyncStatus=FAILED` se interpreta como advertencia de sincronizacion:
  no borra la confirmacion fisica ni convierte la descarga en fallo fisico;
- al ejecutar, el payload incluye `zoneClear`, `operatorPresent`,
  `emergencyStopReady`, `suctionReady` y `physicalExecutionConfirmed`.

## Build

```powershell
npm run build
```

## Pendientes

- Agregar pruebas automatizadas de componentes.
- Integrar evidencia visual de QA.
- Mantener el contrato `GET /dashboard/operational` estable para Entrega 3.
