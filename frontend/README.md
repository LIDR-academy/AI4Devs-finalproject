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
apagado, el dashboard sigue funcionando con el backend y muestra el panel de
vision en estado no disponible.

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
  dashboard;
- `vision-dry-run` se etiqueta como dry-run sin movimiento;
- los controles fisicos aparecen solo como llamadas al servicio Edge; el
  frontend no habla con serial ni calcula movimientos de robot.
- la seccion `Descarga fisica del camion` muestra estado
  `idle/planning/planned/executing/success/partial_success/failed`;
- `Ejecutar descarga fisica` queda deshabilitado sin plan, sin QR valido, sin
  cubos planificados, sin Edge Vision, sin sesion backend, con ejecucion en curso
  o sin todos los checks de seguridad;
- `Reset drop zones` pide confirmacion visual, llama a Edge y muestra slots
  revisados/reseteados, archivo, backup y colores afectados;
- `Planificar descarga` llama a `/robot/multi-cube/plan` con el selector
  `Descargar todos`, `1`, `2`, `4` o `6`;
- la tabla del plan muestra color, drop zone, orden, pickup target y offset;
- el resumen de ejecucion distingue cubos fisicamente confirmados, acciones
  sincronizadas en Backend y fallas de sync;
- la tabla de acciones ejecutadas muestra color, drop zone,
  `physicalConfirmation.status`, `backendSyncStatus`, intentos, `finalPickZUsed`,
  action code de Backend y error si existe;
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
