# RoboDock AI Edge

Módulo Edge de RoboDock AI. Conserva el flujo funcional de Entrega 2 en `simulation` y añade la primera base segura de perfiles, modelos internos y planificación de drop zones para la Entrega Final.

## Alcance

Este modulo simula el flujo Edge de RoboDock AI:

1. Simula lectura QR con `TRUCK-001`.
2. Crea una sesion en backend con `POST /sessions`.
3. Simula deteccion de cubos por color.
4. Registra cubos con `POST /sessions/:id/cubes`.
5. Simula accion robot pick/drop.
6. Registra accion con `POST /robot/actions`.
7. Consulta dashboard con `GET /dashboard/operational`.
8. Muestra resumen en consola.

Implementa procesamiento OpenCV aislado para imagen o un frame de cámara. No integra todavía esa visión con Backend, planificación robot, comunicación serial ni movimiento físico del MaxArm.

## Perfiles de ejecución

| Perfil | Estado actual | Comportamiento |
|---|---|---|
| `simulation` | Implementado y default | Ejecuta el flujo simulado existente contra Backend y admite planificación dry-run con snapshot simulado. |
| `vision-dry-run` | Implementado sin robot | Procesa archivo/cámara y puede generar un plan integrado sin serial. |
| `hardware` | Probe serial seguro aislado | El runner principal sigue abortando; solo `maxarm_safe_probe.py` puede abrir serial con confirmación explícita y una pose allowlisted. |

El runner principal de Entrega 2 continúa ejecutando únicamente `simulation`. Un perfil no implementado nunca degrada silenciosamente a simulación.

## Requisitos

- Python 3.10+
- OpenCV y NumPy instalados mediante `requirements.txt`
- Backend RoboDock ejecutandose en `http://localhost:3000`
- PostgreSQL y backend configurados segun `backend/README.md`

## Instalacion

Desde la raiz del proyecto:

```powershell
cd edge
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

En bash:

```bash
cd edge
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configuracion

Crear `edge/.env` a partir de `edge/.env.example` si necesitas cambiar la URL del backend.

```env
BACKEND_URL=http://localhost:3000
EDGE_CONFIG_PATH=config/edge.config.example.json
```

La configuracion de simulacion esta en:

```text
edge/config/edge.config.example.json
```

Valores principales:

- `profile`: `simulation`, `vision-dry-run` o `hardware`. Si se omite, usa `simulation`.
- `truckCode`: camion simulado, por defecto `TRUCK-001`.
- `dropZones.path`: ruta relativa al archivo de slots.
- `safety.dryRun`: `true` en el ejemplo y por defecto.
- `safety.enableHardwareMotion`: `false` en el ejemplo y por defecto.
- `safety.humanConfirmationRequired`: `true` en el ejemplo y por defecto.
- `robotPlanning`: poses, Z seguras, calibración y workspace; deshabilitado en el config principal.
- `vision.cubes`: cubos simulados enviados al backend.
- `robot`: accion simulada de pick/drop con `dryRun=true`.

Configuración de visión:

- `vision.source`: `simulation`, `file` o `camera`.
- `vision.imagePath`: ruta relativa de la imagen de prueba.
- `vision.cameraIndex`: indice configurable; obligatorio cuando `vision.source=camera`.
- `vision.qrRoi` y `vision.cargoRoi`: ROI independientes o `null`.
- `vision.qr.pattern`: expresión permitida para `truckCode`.
- `vision.qr.allowedTruckCodes`: allowlist opcional.
- `vision.detection`: area, ancho/alto, relacion de aspecto, fill ratio,
  deduplicacion por solape y flag `sizeValid`.
- `vision.hsvRanges`: rangos HSV por color.
- `vision.evidence.directory`: directorio relativo para evidencia opcional.

El campo histórico `mode=simulation` sigue siendo aceptado para configuraciones de Entrega 2.

## Modelos internos

`edge/src/models.py` define:

- `CubeDetection`
- `DetectionSnapshot`
- `RobotPose`
- `DropZoneSlot`
- `DropZoneSelection`
- `RobotActionPlan`
- `EdgeRunProfile`

Son modelos internos. No cambian todavía los contratos del Backend.

## Visión real aislada

La visión está separada en:

```text
edge/src/vision/capture.py
edge/src/vision/qr_reader.py
edge/src/vision/color_detector.py
edge/src/vision/cube_selector.py
edge/src/vision/pipeline.py
edge/src/vision/evidence.py
```

`DetectionSnapshot` contiene `runId`, timestamp UTC, source, `truckCode`, detecciones, origen del frame y metadata segura. No contiene la imagen binaria.

## Servicio local Edge Vision

El servicio HTTP local expone un snapshot de vision opcional para el dashboard.
No reemplaza `edge_runner.py` ni `edge_dry_run.py`, no abre serial y no mueve
MaxArm. El perfil seguro sigue siendo `vision-dry-run`; `simulation` permanece
como default del flujo principal.

Instalar dependencias:

```powershell
cd edge
pip install -r requirements.txt
```

Levantar con imagen/fixture:

```powershell
python src\service\vision_api.py --config config\edge.vision.example.json
```

El servicio queda por defecto en:

```text
http://127.0.0.1:8001
```

Levantar con camara real solo con autorizacion explicita:

```powershell
python src\service\vision_api.py --config config\edge.vision.local.json --allow-camera
```

Si `vision.source=camera` y no se entrega `--allow-camera`, el servicio falla de
forma cerrada antes de llamar a `VideoCapture` y lo reporta en `lastError`.

Endpoints disponibles:

| Metodo | Ruta | Proposito |
|---|---|---|
| GET | `/health` | Estado del servicio Edge Vision |
| GET | `/vision/status` | Perfil, fuente, ultimo snapshot, error y flags seguros |
| GET | `/vision/snapshot` | Captura bajo demanda y devuelve metadata segura |
| GET | `/vision/snapshot/image` | Devuelve la ultima imagen anotada si existe |
| POST | `/vision/sync-backend` | Sincroniza el ultimo snapshot con Backend si el QR es valido |
| POST | `/vision/plan-dry-run` | Planifica desde el ultimo snapshot valido y registra traza dry-run si Backend esta configurado |

`/vision/status` siempre informa `serialOpened=false` y
`hardwareMovement=false`. `/vision/snapshot` devuelve `counts`, `detections`,
`truckCode`, `snapshotSignature`, `qrDetected`, `qrValid`, `qrStatus`, `qrRoi`,
`imageUrl` relativa y `lastError`. Si no hay imagen disponible,
`/vision/snapshot/image` responde `404` con un mensaje controlado.

Los endpoints responden con `Cache-Control: no-store`, `Pragma: no-cache` y
`Expires: 0` para soportar polling frecuente sin cachear status, snapshots ni
imagenes.

La imagen anotada se mantiene en memoria como ultimo snapshot del proceso. Para
persistir evidencia JSON/PNG se sigue usando el runner de vision con
`--save-evidence`; el servicio del dashboard no necesita escribir archivos para
funcionar.

La imagen anotada dibuja siempre los ROI configurados cuando existen:

- `CARGO ROI`: borde verde grueso sobre la zona de carga/cubos.
- `QR ROI`: borde magenta grueso sobre la zona esperada del QR.
- Si el QR no se detecta, la etiqueta muestra `QR ROI QR_NOT_DETECTED`.

Estos overlays se dibujan aunque no haya cubos detectados o aunque no se detecte
QR, para facilitar ajuste visual de `edge.vision.local.json`.

### Snapshot polling vs streaming

El dashboard usa snapshot polling: consulta `/vision/status` y `/vision/snapshot`
cada 1 a 3 segundos, y luego carga `/vision/snapshot/image?ts=<timestamp>` para
evitar imagenes viejas del navegador. Esto da una experiencia similar a camara en
vivo para el MVP, pero no es streaming MJPEG. El streaming continuo queda fuera
de este paso.

Para probar auto-refresh:

1. Levantar el servicio:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.example.json
```

2. Levantar el frontend con `VITE_EDGE_VISION_URL=http://localhost:8001`.
3. Verificar que el panel `Vision / Camara` actualiza timestamp/imagen segun el
   intervalo configurado.

### Sincronizar snapshot con Backend

La sincronizacion es opt-in y no depende del Frontend como fuente de verdad. Edge
solo sincroniza si el snapshot tiene QR valido (`qrStatus=OK`) y `truckCode`.
Si el QR no existe o no cumple el patron/allowlist configurado, responde
`QR_NOT_DETECTED` o `QR_INVALID` y no llama al Backend.

Levantar Edge Vision con sync automatico por cada snapshot fresco:

```powershell
cd edge
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --allow-camera `
  --sync-backend `
  --backend-url http://localhost:3000
```

Tambien puede usarse sync explicito:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/vision/sync-backend"
```

Para evitar duplicados por polling:

- Edge calcula `snapshotSignature` estable desde QR, fuente, ROI y detecciones.
- Edge no reenvia dos veces la misma firma dentro del mismo proceso.
- Backend ignora una firma ya procesada.
- Backend reemplaza los cubos OpenCV previos de la sesion cuando llega un
  snapshot nuevo valido, de modo que los conteos reflejan el estado actual de
  camara y no una suma acumulada por polling.

La sincronizacion registra cubos y sesion, no registra acciones robot y no abre
serial.

### Planificar dry-run desde el ultimo snapshot real

`POST /vision/plan-dry-run` conecta el ultimo `DetectionSnapshot` valido del
servicio Edge Vision con `CubeSelector`, `DropZoneAdapter` y
`RobotActionPlanner`.

Requisitos:

- `profile=vision-dry-run`.
- `safety.dryRun=true`.
- `safety.enableHardwareMotion=false`.
- QR detectado y valido (`qrStatus=OK`) con `truckCode`.
- Al menos un cubo real detectado.
- `robotPlanning.enabled=true` con calibracion, poses y workspace validos.
- Drop zone activa y libre del mismo color del cubo seleccionado.

Levantar Edge Vision con camara cenital y Backend:

```powershell
cd edge
python src\service\vision_api.py `
  --config config\edge.vision.local.json `
  --allow-camera `
  --backend-url http://localhost:3000
```

Ejecutar el plan dry-run desde el snapshot en memoria:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/vision/plan-dry-run"
```

Respuesta esperada en caso feliz:

```json
{
  "planned": true,
  "status": "DRY_RUN_PLANNED",
  "profile": "vision-dry-run",
  "dryRun": true,
  "selectedCubeColor": "red",
  "dropZoneCode": "DROP_RED_01",
  "serialOpened": false,
  "hardwareMovement": false
}
```

Errores controlados:

- `QR_NOT_DETECTED`: no hay QR en `qrRoi`.
- `QR_INVALID`: el QR no cumple patron/allowlist o no trae `truckCode`.
- `NO_CUBES_DETECTED`: no hay cubos elegibles.
- `ZONE_UNAVAILABLE`: no existe slot activo y libre del color seleccionado.
- `MISSING_CALIBRATION`, `MISSING_PLANNING_CONFIG` o `MISSING_POSE`: falta
  configuracion de robotPlanning.

Seguridad:

- No abre serial.
- No mueve MaxArm.
- Registra acciones con `mode=simulation`, `dryRun=true`,
  `profile=vision-dry-run`, `serialOpened=false` y `hardwareMovement=false`.
- No llama `DropZoneAdapter.confirm()` en dry-run.
- Toda reserva se cancela al finalizar o ante error.
- El estado canonico de drop zones no se modifica en `vision-dry-run`.

Limitaciones:

- procesa una captura por request, no un stream continuo;
- si el fixture configurado no existe, devuelve error controlado;
- la camara fisica no debe usarse sin `--allow-camera`;
- no implementa control robotico ni modo hardware.

### Procesar una imagen

La configuracion reproducible de referencia esta en
`edge/config/edge.vision.example.json`. Usa `profile=vision-dry-run`,
`source=file`, `dryRun=true`, movimiento hardware deshabilitado, ROI separadas y
rutas relativas. El fixture referenciado es una escena local de QA; para otra
instalacion, crear una copia local del config y ajustar `imagePath`:

```json
{
  "profile": "vision-dry-run",
  "vision": {
    "source": "file",
    "imagePath": "fixtures/escena.png"
  }
}
```

La ruta es relativa al archivo de configuración. Ejecutar:

```powershell
python src\vision_runner.py --config config\edge.vision.local.json
```

Para guardar JSON y una imagen anotada:

```powershell
python src\vision_runner.py --config config\edge.vision.local.json --save-evidence
```

El snapshot usa `source=opencv-file`. El runner se detiene antes de capturar si
`dryRun=false` o si el movimiento hardware esta habilitado.

### Procesar un frame de cámara

Configurar:

```json
{
  "profile": "vision-dry-run",
  "vision": {
    "source": "camera",
    "cameraIndex": 1
  }
}
```

`vision.cameraIndex` define la camara operacional. Edge Vision abre unicamente
ese indice y no hace autodiscovery, fallback ni alternancia entre camaras durante
el polling del dashboard. Si `vision.source=camera`, `cameraIndex` es obligatorio.
Para el montaje local de RoboDock AI, la camara cenital se configura como
`cameraIndex=1`; la camara frontal del laptop queda fuera del flujo operacional.

Crear un archivo local no versionado, por ejemplo
`edge/config/edge.vision.local.json`, para ajustar `source=camera` y
`cameraIndex=1`. Ese archivo no debe subirse a Git.

La cámara solo se abre con autorización explícita:

```powershell
python src\vision_runner.py --config config\edge.vision.local.json --allow-camera
```

Sin `--allow-camera`, el proceso falla antes de llamar a `VideoCapture`. Con
camara, el snapshot usa `source=opencv-camera`. El comando captura un solo frame,
libera la camara en `finally` y nunca importa ni abre serial.

Si la camara configurada no esta disponible, el error esperado es controlado, por
ejemplo `Configured cameraIndex=1 unavailable`. Edge Vision no intenta abrir otro
indice como fallback.

### ROI

`qrRoi` y `cargoRoi` usan coordenadas globales:

```json
{
  "x": 50,
  "y": 40,
  "w": 200,
  "h": 160
}
```

Una ROI negativa, vacía o parcial/totalmente fuera del frame produce error. No existe fallback silencioso al frame completo cuando se configuró una ROI.

La deteccion de color se ejecuta estrictamente dentro de `vision.cargoRoi`
cuando ese ROI existe. Las cajas devueltas en el snapshot siguen usando
coordenadas globales del frame completo, no coordenadas locales del recorte.
Esto permite que el dashboard, evidencia y planificacion trabajen en el mismo
espacio de pixeles.

`qrRoi` se procesa de forma independiente de `cargoRoi`. Para validar QR, usar
un ROI que contenga el codigo del camion y configurar:

```json
{
  "vision": {
    "qr": {
      "pattern": "^TRUCK-\\d{3}$",
      "allowedTruckCodes": ["TRUCK-001", "TRUCK-002", "TRUCK-003"]
    }
  }
}
```

Si `allowedTruckCodes` queda vacio, se acepta cualquier valor que cumpla el
patron. El default seguro esperado es `TRUCK-*`.

Para diagnosticar `QR_NOT_DETECTED`:

1. Verificar en el dashboard que el rectangulo `QR ROI` cubre completamente el
   QR fisico.
2. Si el QR queda fuera, ajustar `vision.qrRoi.x/y/w/h` en el config local.
3. Si el QR esta dentro pero sigue sin detectarse, revisar foco, luz, tamano del
   QR y patron `vision.qr.pattern`.
4. Confirmar que `CARGO ROI` cubre solo la zona de cubos y no tapa ni reemplaza
   el `QR ROI`; ambos se procesan por separado.

### Rangos HSV

Cada color acepta uno o más rangos:

```json
{
  "red": [
    { "lower": [0, 100, 80], "upper": [10, 255, 255] },
    { "lower": [170, 100, 80], "upper": [179, 255, 255] }
  ]
}
```

OpenCV usa H entre 0-179 y S/V entre 0-255. Los valores del ejemplo son un punto inicial; deben recalibrarse para la cámara, iluminación y cubos reales.

Para calibrar HSV, mantener primero ROI estrechas sobre QR y carga; despues
ajustar S/V para rechazar sombras o reflejos y, por ultimo, ajustar H por color.
Validar cada cambio contra una escena con conteo conocido antes de usar camara.

La referencia del spike fisico `dynamic_pickup_maxarm_pick` usa:

- rojo con dos rangos HSV: `0-10` y `170-179`;
- azul `95-130`;
- verde `40-85`;
- amarillo `22-34` con `V` minimo mas alto para reducir ruido;
- morfologia `OPEN` + `CLOSE` con kernel `5x5`.

Estos valores son punto de partida, no calibracion universal. Si aparece ruido,
ajustar primero `cargoRoi`; despues subir `minArea`, `minWidth/minHeight` o
`minFillRatio`; por ultimo ajustar HSV.

### Filtros de cubo

`vision.detection` acepta:

```json
{
  "minArea": 1200,
  "maxArea": 14000,
  "minWidth": 25,
  "maxWidth": 105,
  "minHeight": 25,
  "maxHeight": 105,
  "minFillRatio": 0.45,
  "minAspectRatio": 0.55,
  "maxAspectRatio": 1.8,
  "overlapThreshold": 0.35,
  "sizeValid": true,
  "morphologyKernelSize": 5
}
```

- `minArea` / `maxArea`: rechazan ruido chico y blobs demasiado grandes.
- `minWidth` / `maxWidth` y `minHeight` / `maxHeight`: acotan el tamano esperado
  de un cubo en pixeles.
- `minAspectRatio` / `maxAspectRatio`: rechazan bordes largos del pickup,
  tiras de color o reflejos alargados.
- `minFillRatio`: exige que el contorno llene razonablemente su bounding box.
- `overlapThreshold`: aplica deduplicacion NMS cuando dos detecciones se solapan.
- `sizeValid`: se propaga en metadata; `CubeSelector` solo elige detecciones con
  `sizeValid=true`.
- `morphologyKernelSize`: controla limpieza de mascara HSV.

Para evitar falsos positivos del borde rojo del pickup, mantener `cargoRoi`
ajustado a la zona de carga real y usar limites de ancho/alto/aspect ratio que
describan cubos, no bordes. Un borde largo debe fallar por ancho excesivo o
relacion de aspecto fuera de rango.

### CubeSelector

`CubeSelector` es lógica pura. Excluye colores no soportados, bounding boxes inválidas y detecciones con `sizeValid=false`. La política por defecto selecciona mayor confianza, luego mayor área y finalmente aplica desempate estable. No conoce drop zones, Backend, cámara o serial.

### Evidencia

La evidencia es opt-in con `--save-evidence`:

- un JSON atómico con una única lista `detections`;
- una imagen anotada cuando hay frame;
- nombres relativos basados en `runId`;
- metadata con claves sensibles eliminadas.

La imagen anotada muestra bounding box, color y `sizeValid`; si la deteccion trae
`confidence`, tambien se muestra como score. Los rechazos internos no se dibujan
por defecto para no contaminar el dashboard.

Por defecto, la configuracion de vision guarda evidencia bajo
`workspace/generated/vision-evidence/`. El JSON incluye `qrDetected`, `qrValid`,
`qrRawValue`, bounding boxes y `fillRatio`; la confianza queda `null` mientras el
detector HSV no tenga un score calibrado.

## Drop zones

La configuración de ejemplo está en:

```text
edge/config/drop_zones.example.json
```

Contiene los cuatro colores soportados: `red`, `blue`, `yellow` y `green`. Cada slot usa:

```json
{
  "code": "DROP_RED_01",
  "color": "red",
  "position_order": 1,
  "x": 0,
  "y": 0,
  "z": 0,
  "active": false,
  "occupied": false
}
```

Las coordenadas del ejemplo son placeholders y todos los slots están inactivos. No deben habilitarse para hardware sin calibración y gates de seguridad.

### DropZonePlanner

`DropZonePlanner` es lógica pura:

1. recibe color y slots;
2. conserva solo el mismo color;
3. filtra `active=true` y `occupied=false`;
4. ordena por `position_order` y luego `code`;
5. devuelve el primer slot;
6. lanza `ZONE_UNAVAILABLE` si no existe uno disponible.

No lee ni escribe archivos y no conoce cámara o serial.

### DropZoneAdapter

`DropZoneAdapter`:

- carga y valida el JSON en modo fail-closed;
- exige los cuatro colores soportados;
- valida códigos únicos y `position_order` positivo y único por color;
- rechaza coordenadas no numéricas, booleanas, `NaN` o infinitas;
- valida `active` y `occupied` como booleanos estrictos;
- reserva slots en memoria por `run_id`;
- marca `occupied=true` solo mediante `confirm(run_id)`;
- cancela una reserva mediante `cancel(run_id)`;
- resetea mediante `reset_occupancy(confirmed=True)`.

En `simulation` y `vision-dry-run`, confirm y reset solo alteran el estado en memoria: el JSON fuente no cambia. La persistencia atómica existe únicamente como opt-in del adapter para un estado hardware dedicado; el runner todavía no la utiliza.

### Reset seguro

El reset implementado es una operación explícita del adapter:

```python
adapter.reset_occupancy(confirmed=True)
```

Reglas:

- rechaza el reset sin confirmación;
- rechaza el reset si existen reservas activas;
- conserva código, color, orden, coordenadas y `active`;
- no importa ni abre cámara;
- no importa ni abre serial;
- no se ejecuta automáticamente al iniciar.

Un comando operacional dedicado con checklist humano queda pendiente antes de usar estado hardware real.

## Dry-run integrado

El comando `edge_dry_run.py` conecta:

```text
DetectionSnapshot
-> CubeSelector
-> reserva DropZoneAdapter
-> RobotActionPlanner
-> evidencia JSON
-> cancelación de reserva
```

No importa ni abre serial. No ejecuta comandos y nunca llama `DropZoneAdapter.confirm()`.

### Sincronizar la traza con Backend

La sincronización es opt-in y no cambia los gates de seguridad:

```powershell
python src\edge_dry_run.py `
  --config config\edge.dry-run.example.json `
  --sync-backend `
  --backend-url http://localhost:3000
```

El flujo registra una sesión, las detecciones saneadas y una única acción
`PLANNED`, que luego actualiza a `SUCCESS` con `outcome=DRY_RUN_PLANNED`. La sesión
queda `IN_PROGRESS` para que el dashboard la muestre. No se envían poses,
command previews, rutas, snapshots completos ni metadata cruda. La acción siempre
usa `mode=simulation`, `dryRun=true`, `serialOpened=false`,
`hardwareMovement=false`, `releaseConfirmed=false` y `statePersisted=false`.

La sincronización no llama `confirm()`, no cambia `occupied` y no abre serial. Para
fuentes reales, exige un `truckCode` validado en el snapshot y que coincida con la
configuración; no presenta un valor configurado como si proviniera del QR.

### Ejemplo reproducible

Los archivos siguientes contienen valores exclusivamente sintéticos:

```text
edge/config/edge.dry-run.example.json
edge/config/drop_zones.dry-run.example.json
```

No son una calibración válida para hardware. Ejecutar desde `edge/`:

```powershell
python src\edge_dry_run.py --config config\edge.dry-run.example.json
```

La evidencia se escribe bajo `workspace/generated/edge-evidence/` y contiene:

- snapshot;
- cubo seleccionado;
- código y pose de drop zone;
- perfil y `dryRun=true`;
- poses candidatas y `safeZ`;
- secuencia conceptual y previews `POSE` enteros;
- `serialOpened=false` y `hardwareMovement=false`;
- resultado `CANCELLED_AFTER_DRY_RUN` para la reserva.

También puede recibirse un snapshot previamente guardado:

```powershell
python src\edge_dry_run.py `
  --config config\edge.dry-run.local.json `
  --snapshot ..\workspace\generated\snapshot.json
```

Para usar una imagen, el config local debe usar `profile=vision-dry-run`, `vision.source=file`, calibración válida y drop zones de dry-run. La cámara conserva el gate explícito `--allow-camera`.

### Configuración de planificación

Cuando `robotPlanning.enabled=true`, son obligatorios:

- `safeZ`, `pickZ`, `dropSafeZ` y `liftZDelta`;
- `readyPose` y `resetPose`;
- calibración versionada con cuatro esquinas robot;
- para hardware, `visualCalibration` con dimensiones fisicas y `cornersPx`;
- límites completos de `workspace`.

`imageRoi` es un fallback legacy rectangular para plan-only o pruebas antiguas.
No representa la perspectiva real del pickup cuando la camara ve el contenedor
inclinado o desplazado. Para hardware, `single_cube_pick_drop.py` exige
`visualCalibration.cornersPx`: cuatro puntos reales del pickup en pixeles del
frame, en orden `topLeft`, `topRight`, `bottomRight`, `bottomLeft`.

Con `cornersPx`, el planner calcula una homografia desde pixeles de frame hacia
centimetros fisicos del pickup:

```text
centro del cubo en frame-pixels
-> homografia con cornersPx
-> pickupPositionCm { x, y }
-> interpolacion bilineal contra robotCorners
-> pickupTarget / pickupSafe
```

El planner rechaza cubos fuera de esa region, calibraciones incompatibles,
poses no finitas/fuera del workspace, perfiles hardware y cualquier ejecucion
con `dryRun=false`.

### Estados de drop zone

- **Selection:** `DropZonePlanner` identifica el primer slot elegible.
- **Reservation:** `DropZoneAdapter` lo bloquea solo en memoria para un `runId`; `occupied` sigue en `false`.
- **Release:** en hardware futuro será el paso físico que libera el cubo. El dry-run solo lo previsualiza.
- **Occupied:** solo una confirmación física futura podrá llamar `confirm()` y persistir `occupied=true`.

En dry-run, tanto éxito como error posterior a la reserva ejecutan `cancel()`. El JSON canónico no cambia.

## MaxArm serial safe probe

`maxarm_safe_probe.py` valida el Gate G5 de la entrega final: abrir el puerto
serial configurado, enviar una unica pose segura preaprobada con `suction=0`,
esperar respuesta del firmware y cerrar el puerto de forma controlada.

Este comando no es un pick/drop hardware. Diferencias:

| Flujo | Camara | Serial | Succion | Cubos | Drop zones | Backend/Dashboard |
|---|---|---|---|---|---|---|
| `simulation` | No | No | No | Simulados | Simuladas | Si, `mode=simulation` |
| `vision-dry-run` | Opcional | No | No | Detectados | Reserva en memoria | Si, `dryRun=true` |
| `maxarm_safe_probe.py` | No | Si, con confirmacion | No | No | No | No |
| Hardware pick/drop futuro | Si | Si | Si, solo con gates futuros | Si | Si | Pendiente |

Config de ejemplo:

```text
edge/config/maxarm.safe-probe.example.json
```

Incluye `serial.port`, `serial.baudrate`, `serial.timeoutSeconds`,
`safePoses`, `allowedPoseNames`, `defaultPoseName`,
`suctionAllowed=false`, `pickupAllowed=false`, `dropAllowed=false` y
`hardwareMotionRequiresConfirmation=true`. Las poses del ejemplo deben revisarse
fisicamente antes de ejecutar porque dependen del montaje real.

El comando tiene estos gates:

- sin `--confirm-safe-motion`, aborta antes de abrir serial;
- `--pose-name` debe existir en `safePoses` y estar en `allowedPoseNames`;
- la allowlist interna solo acepta `reset`, `ready` o `ready_to_take`;
- rechaza cualquier config con `suctionAllowed=true`, `pickupAllowed=true` o
  `dropAllowed=true`;
- envia una sola linea `POSE <x> <y> <z> 0`;
- redondea coordenadas a enteros antes de escribir al firmware;
- cierra el puerto en exito, error o timeout.

Prueba sin confirmacion, segura para verificar gates y evidencia:

```powershell
cd edge
python src\maxarm_safe_probe.py --config config\maxarm.safe-probe.example.json
```

Resultado esperado: `CONFIRMATION_REQUIRED`, `serialOpened=false` y
`hardwareMovement=false`.

Prueba real con confirmacion, solo despues de checklist fisico:

```powershell
cd edge
python src\maxarm_safe_probe.py `
  --config config\maxarm.safe-probe.example.json `
  --port COM4 `
  --baudrate 115200 `
  --pose-name reset `
  --confirm-safe-motion
```

Checklist fisico obligatorio antes de usar `--confirm-safe-motion`:

- brazo sobre superficie estable;
- zona despejada;
- no hay cubos bajo el brazo;
- no hay personas u objetos en el recorrido;
- cable conectado correctamente;
- puerto COM confirmado;
- fuente de energia estable;
- boton o forma de cortar energia accesible;
- pose segura revisada visualmente;
- operador presente durante toda la prueba.

La evidencia JSON se guarda por defecto bajo:

```text
edge/workspace/generated/edge-evidence/maxarm-safe-probe/
```

Campos principales: `runId`, `timestamp`, `portSanitized`, `baudrate`,
`poseName`, `commandPreview`, `commandSent`, `firmwareResponse`, `timeout`,
`serialOpened`, `hardwareMovement`, `suctionActivated`, `pickupExecuted`,
`dropExecuted`, `result` y `errorCode`.

Interpretacion:

- `SUCCESS` con `firmwareResponse` que contiene `DONE` valida comunicacion serial
  y movimiento seguro de una pose.
- `TIMEOUT` indica que se escribio el comando, pero no se recibio `DONE` dentro
  del plazo.
- `CONFIRMATION_REQUIRED`, `POSE_NOT_ALLOWLISTED`,
  `SUCTION_NOT_ALLOWED`, `PICKUP_NOT_ALLOWED` o `DROP_NOT_ALLOWED` abortan antes
  de abrir serial.

Advertencia: este probe no usa camara, no usa cubos, no activa succion y no
ejecuta secuencias pick/drop.

## Single-cube pick/drop controlado

`single_cube_pick_drop.py` implementa el primer flujo operacional para un unico
cubo detectado por Edge Vision y una unica drop zone del mismo color. Es un
comando Edge local: no agrega controles al dashboard, no expone endpoint remoto
de movimiento y no procesa multiples cubos.

Configuracion de referencia:

```text
edge/config/single-cube-pick-drop.example.json
```

El ejemplo es seguro por defecto. Para hardware real se debe crear una copia
local no versionada con calibracion, ROI, snapshot/camara y drop zones reales.
No usar `edge/config/drop_zones.example.json` para hardware: sus slots son
placeholders.

### Pausas entre movimientos

El spike `dynamic_pickup_maxarm_pick` usaba `movement.delay_seconds=0.8` para
dar tiempo fisico entre pasos aunque el firmware ya hubiera respondido `DONE`.
`DONE` confirma la ejecucion del comando, pero no reemplaza una pausa mecanica
para que el brazo estabilice, la ventosa selle o el cubo se libere.

`single_cube_pick_drop.py` soporta:

```json
{
  "movement": {
    "delay_seconds": 0.8,
    "pickup_hold_seconds": 0.8,
    "release_hold_seconds": 0.8
  }
}
```

- `delay_seconds`: pausa general despues de cada `send_pose` exitoso.
- `pickup_hold_seconds`: pausa especial despues de `cube_target_pick`, antes de
  `lift_after_pick`; si se omite, usa `delay_seconds`.
- `release_hold_seconds`: pausa especial despues de `drop_zone_release`, antes
  de `retract_after_release`; si se omite, usa `delay_seconds`.

Si `movement` no existe, todos los valores quedan en `0.0` para compatibilidad.
`--plan-only` no duerme ni abre serial. En hardware, la evidencia incluye
`movementDelaySeconds`, `pickupHoldSeconds`, `releaseHoldSeconds` y, por cada
respuesta firmware, `postStepDelaySeconds`, `stepStartedAt`,
`responseReceivedAt` y `elapsedMs`.

### Configuracion de pickupOffset

`robotPlanning.pickupOffset` permite aplicar un ajuste fino al punto de pickup
sin alterar la calibracion base ni los `robotCorners`:

```json
{
  "robotPlanning": {
    "pickupOffset": {
      "x": 0,
      "y": 0,
      "z": 0
    }
  }
}
```

Si el bloque no existe, el offset queda en `0,0,0`. El offset se aplica solo a
`pickupTarget`, `pickupSafe` y poses derivadas del pickup como
`lift_after_pick`; no cambia `dropTarget`, `dropSafe`, drop zones, `readyPose`
ni `resetPose`.

La evidencia incluye `pickupOffset`, `pickupTargetBase`, `pickupTarget` y
`pickupSafe`. `pickupOffset` tambien queda dentro de `planFingerprint`, por lo
que cambiarlo entre `--plan-only` y la ejecucion hardware produce
`DRY_RUN_MISMATCH`.

### Alineacion con el spike fisico validado

El spike local `dynamic_pickup_maxarm_pick` usa esta secuencia conceptual:

```text
ready_to_take -> reset -> cube_safe_pose -> cube_target_pick -> lift_after_pick
-> reset_with_cube -> drop_zone_with_cube -> drop_zone_release
-> reset_without_cube -> ready_to_take_end
```

`single_cube_pick_drop.py` conserva ese orden relativo y agrega dos pasos de
seguridad:

```text
ready_to_take -> reset -> cube_safe_pose -> cube_target_pick -> lift_after_pick
-> reset_with_cube -> drop_safe_pose -> drop_zone_with_cube
-> drop_zone_release -> retract_after_release -> reset_without_cube
-> ready_to_take_end
```

`drop_safe_pose` aproxima la descarga a una Z segura antes de bajar al slot.
`retract_after_release` sube nuevamente a esa Z segura antes de volver a reset.
Estos pasos no cambian el hito fisico esperado del spike: el slot solo puede
marcarse ocupado despues de `drop_zone_release` confirmado.

### Configuracion local desde archivos del spike

Para una prueba fisica no se debe versionar la configuracion local. Crear
`edge/config/single-cube-pick-drop.local.json` a partir del ejemplo y revisar:

- `robotPlanning.readyPose` y `robotPlanning.resetPose` pueden copiarse desde
  `arm_named_poses.json`, o cargarse con `robotPlanning.namedPosesPath`,
  `readyPoseName=ready_to_take` y `resetPoseName=reset`.
- `dropZones.path` debe apuntar a una copia local real de
  `drop_zones_config.json`, no a `drop_zones.example.json`.
- La seleccion de slot conserva la politica del spike: mismo color,
  `active=true`, `occupied=false` y menor `position_order`.
- Si `DROP_BLUE_01` esta ocupado y `DROP_BLUE_02` libre, el planner elige
  `DROP_BLUE_02`.
- `pickup_robot_calibration.json` se mapea a
  `robotPlanning.calibration.robotCorners`, `safeZ` y `pickZ`.
- `pickup_calibration.json` se mapea a
  `robotPlanning.calibration.visualCalibration`: `pickup_width_cm` ->
  `pickupWidthCm`, `pickup_height_cm` -> `pickupHeightCm`, `cube_size_cm` ->
  `cubeSizeCm` y `corners_px.top_left/top_right/bottom_right/bottom_left` ->
  `cornersPx.topLeft/topRight/bottomRight/bottomLeft`.
- `arm_named_poses.json` aporta las poses nominales del brazo y
  `drop_zones_config.json` aporta los slots; ambos deben copiarse o referenciarse
  desde archivos locales no versionados.

El campo `calibration.version` debe ser una version local trazable. Nunca usar
`REPLACE_WITH_LOCAL_CALIBRATION` para hardware.

### Reset de drop zones

Para limpiar ocupacion despues de pruebas fisicas, usar la utilidad dedicada.
Requiere confirmacion explicita, crea backup y modifica solo `occupied=false`;
no cambia `active`, coordenadas, `code`, `color` ni `position_order`.

Reset completo:

```powershell
python src\reset_drop_zones.py `
  --config config\single-cube-pick-drop.local.json `
  --all `
  --confirm-reset
```

Reset por color:

```powershell
python src\reset_drop_zones.py `
  --config config\single-cube-pick-drop.local.json `
  --color blue `
  --confirm-reset
```

Sin `--confirm-reset`, el comando aborta sin modificar archivos. El resumen
impreso indica archivo modificado, backup creado, slots revisados, slots
reseteados y colores afectados.

### Bloqueo fail-closed para hardware

`--plan-only` puede ejecutarse con configuracion placeholder para generar y
revisar comandos, pero la evidencia incluye `safetyWarnings` y no abre serial.
La ejecucion con hardware queda bloqueada antes de `serial.open()` si detecta:

- `calibration.version=REPLACE_WITH_LOCAL_CALIBRATION`;
- falta `visualCalibration`, `pickupWidthCm`, `pickupHeightCm`, `cubeSizeCm` o
  algun punto de `cornersPx`;
- `cornersPx` coincide con placeholders del ejemplo;
- `robotCorners` iguales al ejemplo placeholder;
- se intenta usar solo `imageRoi` legacy;
- `readyPose` o `resetPose` placeholder;
- Z o workspace invalidos;
- `dropZones.path` apuntando a archivos de ejemplo.

Validacion segura de bloqueo con placeholder:

```powershell
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.example.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4 `
  --confirm-pick-drop `
  --enable-hardware-motion `
  --confirm-zone-clear `
  --confirm-operator-present `
  --confirm-emergency-stop-ready `
  --confirm-suction
```

Resultado esperado: error controlado como
`MISSING_REAL_PICKUP_ROBOT_CALIBRATION` o `PLACEHOLDER_ROBOT_CORNERS`,
`serialOpened=false` y cero comandos al firmware.

### Diferencias entre dry-run, safe probe y pick/drop

| Flujo | Camara/snapshot | Serial | Succion | Drop zones | Backend |
|---|---|---|---|---|---|
| `edge_dry_run.py` | Si | No | No | Reserva y cancela | Opcional, `mode=simulation` |
| `maxarm_safe_probe.py` | No | Si | No | No | No |
| `single_cube_pick_drop.py --plan-only` | Si | No | No | Reserva y cancela | No |
| `single_cube_pick_drop.py` hardware | Si | Si | Si, con gate | Confirma tras release | Opcional, `mode=hardware` |

`--plan-only` genera la evidencia obligatoria del plan y cancela la reserva. La
ejecucion fisica exige que el plan actual coincida con esa evidencia mediante
`--dry-run-evidence`.

### Plan-only obligatorio

Desde `edge/`:

```powershell
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --plan-only
```

Tambien puede leer el ultimo snapshot del servicio Edge Vision:

```powershell
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --edge-vision-url http://127.0.0.1:8001 `
  --plan-only
```

Resultado esperado: evidencia JSON con `status=DRY_RUN_PLANNED`,
`serialOpened=false`, `hardwareMovement=false`, `maxCubes=1` y
`planFingerprint.commandsPreview`.

### Prueba de gate sin confirmacion

Este comando debe abortar antes de abrir serial:

```powershell
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4
```

Resultado esperado: `CONFIRMATION_REQUIRED`, `serialOpened=false` y cero comandos
al firmware.

### Ejecucion fisica controlada

Ejecutar solo despues de revisar el plan-only y completar el checklist fisico:

```powershell
python src\single_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot ..\workspace\generated\vision-evidence\snapshot.json `
  --dry-run-evidence ..\workspace\generated\edge-evidence\single-cube-pick-drop\single-cube-plan-only-RUN_ID.json `
  --port COM4 `
  --baudrate 115200 `
  --confirm-pick-drop `
  --enable-hardware-motion `
  --confirm-zone-clear `
  --confirm-operator-present `
  --confirm-emergency-stop-ready `
  --confirm-suction `
  --sync-backend `
  --backend-url http://localhost:3000
```

Gates obligatorios:

- `--confirm-pick-drop`
- `--enable-hardware-motion`
- `--port COMx`
- `--baudrate` documentado con default `115200`
- `--max-cubes 1`, implicito por defecto
- dry-run match obligatorio mediante `--dry-run-evidence`
- `--confirm-zone-clear`
- `--confirm-operator-present`
- `--confirm-emergency-stop-ready`
- `--confirm-suction`

Sin todos los gates, el comando aborta antes de abrir serial. Si el plan actual
no coincide con el dry-run previo, aborta con `DRY_RUN_MISMATCH`.

### Ejecucion hardware con --sync-backend

`--sync-backend` crea o reutiliza la sesion del camion y registra la accion en
`POST /robot/actions` con `mode=hardware`. El metadata enviado es JSON-safe y
solo incluye campos disponibles: plan, cubo seleccionado, drop zone, respuestas
firmware, flags de hardware, homografia/calibracion visual y tiempos de
movimiento.

Antes de usarlo, levantar backend y base de datos:

```powershell
cd ..\backend
npm run build
npm run dev
```

Luego ejecutar el flujo hardware desde `edge/` con `--sync-backend` y
`--backend-url http://localhost:3000`. Si el backend rechaza el payload por
validacion, debe responder 4xx con `correlationId`; un 500 queda registrado en
consola con metodo, ruta y `correlationId`.

### Checklist fisico

- Brazo estable.
- Camara y cables fuera del recorrido.
- Solo 1 cubo en zona de pickup o cubos bien separados.
- Drop zone del color seleccionado despejada.
- Puerto COM confirmado.
- Energia estable.
- Operador presente.
- Forma de cortar energia disponible.
- Nadie cerca del recorrido.
- Dry-run del mismo plan revisado.
- Succion revisada.
- Coordenadas revisadas.
- Plan y drop zone revisados visualmente.

### Evidencia e interpretacion

La evidencia JSON incluye `runId`, `snapshotSignature`, `truckCode`,
`selectedCube`, `selectedCubeColor`, `selectedCubeCenter`,
`selectedCubeBoundingBox`, `pickupPositionCm`, `visualCalibrationVersion`,
`visualCalibrationUsed`, `homographyUsed`, `pickupTarget`, `pickupSafe`,
`dropZoneCode`, `positionOrder`, `commandsPreview`, `firmwareResponses`,
`serialOpened`, `hardwareMovement`, `suctionActivated`, `pickupExecuted`,
`dropExecuted`, `releaseConfirmed`, `occupiedPersisted` y `errorCode` si aplica.

Para validar el calculo antes de mover hardware:

1. Revisar que `selectedCube.center` corresponda al centro visual del cubo en el
   frame original.
2. Confirmar que `visualCalibrationUsed=true` y `homographyUsed=true`.
3. Revisar `pickupPositionCm` contra el pickup fisico: `x=0` queda hacia
   `topLeft/bottomLeft`; `y=0` queda hacia `topLeft/topRight`.
4. Revisar que `pickupTarget` y `pickupSafe` coincidan con poses esperadas dentro
   del workspace y con la Z segura.
5. Si el brazo baja pero no centra el cubo, no repetir pick/drop; recalibrar
   `cornersPx`, validar `pickupPositionCm` en plan-only y recien despues generar
   nueva evidencia.

`occupied=true` se persiste solo despues del paso `drop_zone_release` con
respuesta valida del firmware. Si falla antes del release, se cancela la reserva
y queda `occupied=false`. Si falla despues del release, la zona se considera
fisicamente ocupada y el error queda en la evidencia para conciliacion humana.

Ante error:

1. No repetir el movimiento sin revisar evidencia y estado fisico.
2. Cortar energia si el brazo queda en una pose insegura.
3. Verificar si `releaseConfirmed=true`; en ese caso tratar la drop zone como ocupada.
4. Revisar `firmwareResponses` y `errorCode`.
5. Rehacer `--plan-only` antes de cualquier nuevo intento.

## Flujo multi-cubo real

`multi_cube_pick_drop.py` extiende el flujo operacional validado para descargar
varios cubos desde Edge Vision. Mantiene la misma logica de homografia,
`pickupPositionCm`, `pickupOffset`, pausas de `movement`, seleccion de drop zone
por color y sync opcional con Backend. No modifica `single_cube_pick_drop.py`.

La seleccion de cubos es deterministica: primero por color `red`, `blue`,
`yellow`, `green`; luego por posicion `y/x`; y finalmente por confianza/area.
El comando reserva drop zones en memoria durante la planificacion para no usar
dos veces el mismo slot. En hardware con `physicalConfirmation.enabled=true`,
persiste `occupied=true` solo cuando el snapshot post-drop confirma que el total
de cubos y el conteo del color descargado bajaron en 1.

### Confirmacion fisica post-drop

La confirmacion por vision se configura en el JSON de Edge:

```json
{
  "physicalConfirmation": {
    "enabled": true,
    "method": "post_drop_vision_count_delta",
    "visionSettleSeconds": 1.0,
    "expectedTotalDelta": -1,
    "expectedColorDelta": -1
  }
}
```

La verificacion ocurre despues de ejecutar el ciclo completo:
`pickupSafe`, `pickupTarget` con succion, `lift_after_pick`, `reset_with_cube`,
`drop_safe`, `drop_target`, `release`, `retract_after_release` y reset/ready.
No se verifica inmediatamente despues de levantar el cubo para evitar falsos
negativos cuando el brazo tapa parcialmente el pickup.

Si el snapshot post-drop cumple `totalAfter=totalBefore-1` y
`colorAfter=colorBefore-1`, la accion queda con
`physicalConfirmation.status=CONFIRMED`, `successMeaning=physical_confirmed` y
se confirma la drop zone. Si no cumple, queda `FAILED` o `INCONCLUSIVE`, no se
persiste `occupied=true` y el flujo no avanza al siguiente cubo.

La evidencia y el metadata enviado a Backend incluyen `physicalConfirmation`,
`selectedCubeColor`, conteos before/after, firmas de snapshot,
`commandExecutionStatus`, `successMeaning`, `occupiedPersisted` y los intentos.

### Retry bajando Z

Si la confirmacion fisica falla, el mismo cubo/color se reintenta antes de pasar
al siguiente:

```json
{
  "pickupRetry": {
    "enabled": true,
    "maxAttempts": 3,
    "zStep": -2,
    "minPickZ": 132
  }
}
```

Con `pickZ=138`, los intentos usan `138`, `136`, `134` y nunca bajan de
`minPickZ`. Cada intento ejecuta nuevamente el pick/drop completo y captura un
snapshot post-drop. Si algun intento confirma, se registra `SUCCESS`, se
persiste la drop zone y se continua. Si todos fallan, el cubo queda `FAILED`, el
resultado general queda `PARTIAL_SUCCESS` si ya habia cubos confirmados o
`FAILED` si ninguno fue confirmado, y no se ejecutan cubos posteriores.

En `--plan-only` no hay hardware ni retries reales. La evidencia muestra
`pickupRetry`, `maxAttempts`, `zStep`, `minPickZ` y los posibles `pickZ`
planificados para revisar el comportamiento antes de mover MaxArm.

### Replanificacion con snapshot actualizado

Para demo real, usar `--edge-vision-url` y mantener Edge Vision levantado. Tras
cada descarga confirmada, el snapshot post-drop pasa a ser la base del siguiente
cubo, de modo que el siguiente pick se planifica contra la escena actual.
`--recapture-between-cubes` queda como bandera documental/recomendada del flujo
real; con `--edge-vision-url`, la recaptura post-drop ya se usa para confirmar y
replanificar.

Para un dry-run simple con `--snapshot`, un snapshot unico puede bastar. Si
`physicalConfirmation.enabled=true` y no existe fuente post-drop, la accion queda
`INCONCLUSIVE` y no se marca la drop zone como ocupada.

### Reset previo de drop zones

Antes de una demo fisica, limpiar el estado local de drop zones:

```powershell
python src\reset_drop_zones.py `
  --config config\single-cube-pick-drop.local.json `
  --all `
  --confirm-reset
```

### Ejecucion plan-only

Desde `edge/`, usando un snapshot ya capturado:

```powershell
python src\multi_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --snapshot workspace\scratch\single-cube-compatible-snapshot.json `
  --max-cubes 3 `
  --plan-only
```

Tambien puede leer el snapshot actual desde Edge Vision:

```powershell
python src\multi_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --edge-vision-url http://localhost:8001 `
  --max-cubes 3 `
  --plan-only
```

El resultado esperado es evidencia con `status=DRY_RUN_PLANNED`, `plannedActions`
y `skippedCubes`. No abre serial, no mueve hardware y no persiste
`occupied=true`.

### Ejecucion hardware

Ejecutar solo despues de revisar el plan y completar el checklist fisico:

```powershell
python src\multi_cube_pick_drop.py `
  --config config\single-cube-pick-drop.local.json `
  --edge-vision-url http://localhost:8001 `
  --port COM4 `
  --baudrate 115200 `
  --max-cubes 3 `
  --confirm-multi-pick-drop `
  --enable-hardware-motion `
  --confirm-zone-clear `
  --confirm-operator-present `
  --confirm-emergency-stop-ready `
  --confirm-suction `
  --sync-backend `
  --backend-url http://localhost:3000
```

Si se quiere exigir coincidencia con una evidencia plan-only previa, agregar:

```powershell
--dry-run-evidence workspace\generated\edge-evidence\multi-cube-pick-drop\multi-cube-plan-only-RUN_ID.json
```

Con `--sync-backend`, cada cubo ejecutado registra una accion en
`POST /robot/actions` con metadata JSON-safe: `multiCubeRunId`,
`sequenceNumber`, `totalPlannedCubes`, drop zone, color, `pickupOffset`,
targets, tiempos de movimiento, `firmwareResponses`, `commandExecutionStatus`,
`physicalConfirmation`, `finalPickZUsed` y datos de retry. Las fallas fisicas se
envian al Backend como `status=ERROR` para respetar el enum existente, dejando la
causa precisa en metadata.

### Consideraciones de seguridad

Hardware multi-cubo exige todos estos gates:

- `--confirm-multi-pick-drop`
- `--enable-hardware-motion`
- `--confirm-zone-clear`
- `--confirm-operator-present`
- `--confirm-emergency-stop-ready`
- `--confirm-suction`
- `--port COMx`

Si falta QR valido, si no hay cubos o si un cubo no tiene drop zone disponible,
el comando termina con estado controlado y no mueve hardware. Si un cubo falla a
mitad de la secuencia, no ejecuta cubos posteriores; el resultado queda como
`PARTIAL_SUCCESS` si ya habia al menos un cubo descargado, o `FAILED` si no.

Recomendacion para demo real: resetear drop zones, levantar Edge Vision con
camara cenital y QR valido, ejecutar plan-only, revisar evidencia, y luego
ejecutar hardware con `--edge-vision-url`, `--sync-backend`,
`physicalConfirmation.enabled=true` y `pickupRetry.enabled=true`.

## Ejecucion

Con `.env`:

```powershell
python src\edge_runner.py
```

Indicando backend y config explicitamente:

```powershell
python src\edge_runner.py --backend-url http://localhost:3000 --config config\edge.config.example.json
```

En bash:

```bash
python src/edge_runner.py --backend-url http://localhost:3000 --config config/edge.config.example.json
```

## Verificacion

Al finalizar, el runner imprime:

- health del backend;
- QR simulado;
- sesion creada;
- cubos simulados;
- accion robot simulada;
- dashboard operacional;
- resumen final.

Tambien puedes verificar en backend:

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational"
```

Resultado esperado:

- `activeSession.truckCode` igual a `TRUCK-001`;
- `counts.total` mayor que cero;
- `lastActions[0].mode` igual a `simulation`.

## Tests unitarios

Desde `edge/`:

```powershell
python -m unittest discover -s tests -v
```

También puede ejecutarse con la dependencia fijada en `requirements.txt`:

```powershell
python -m pytest tests -v
```

Los tests cubren perfiles, drop zones y regresión simulation, captura/QR/HSV/ROI, snapshots, selección, evidencia, planificación robot pura, filtros de geometria/NMS para cubos y el flujo dry-run rojo/azul con cancelación de reservas.

## Errores comunes

- Si falla la conexion, verificar que el backend este levantado con `npm run dev`.
- Si falla Prisma o la DB, revisar `docker compose up -d`, migracion y seed del backend.
- Si el perfil no es `simulation`, el runner se detiene por seguridad antes de instanciar el cliente Backend.
- Si no se puede leer una imagen, revisar `vision.imagePath` respecto del archivo de configuración.
- Si una ROI queda fuera de la resolución real, corregirla; el procesamiento se detiene de forma fail-closed.
- Si `robotPlanning.enabled=false` o falta calibración/poses, el dry-run integrado se detiene antes de generar un plan.
- Si no hay slot activo y libre, retorna `ZONE_UNAVAILABLE` y no modifica `occupied`.

## Evolucion futura

Pendiente para los siguientes pasos:

- estabilizar QR y detecciones entre múltiples frames;
- calibrar ROI y HSV con el montaje final;
- incorporar homografía y calibración versionada de pickup;
- integrar la selección del cubo detectado con `DropZonePlanner`;
- conectar `DetectionSnapshot` con Backend sin duplicar detecciones;
- sustituir la calibración sintética por calibración final versionada y evidenciada;
- agregar estabilidad multiframe y validación QR antes de autorizar planes finales;
- agregar un comando operacional de reset con confirmación humana y auditoría;
- añadir límites físicos de workspace y Z para coordenadas activas;
- implementar reservas/persistencia hardware con bloqueo de proceso;
- implementar adapter serial solo detrás de gates explícitos;
- crear un executor hardware separado que confirme release antes de marcar `occupied`;
- validar coordenadas antes de cualquier comando MaxArm;
- no mover MaxArm sin configuracion segura, zona despejada y dry run previo.
