# Evidencia dashboard vision auto-refresh

## Objetivo

Mejorar el panel visual de Vision/Camara del Dashboard Operacional para que use
snapshot polling automatico cada 1 a 3 segundos, con experiencia similar a camara
en vivo sin implementar streaming MJPEG, sin abrir serial y sin tocar MaxArm.

## Identificacion

- Fecha: 2026-06-29.
- Rama: `finalproject-ASP`.
- Commit actual al registrar evidencia: `150a83422485e1311760958b7e6cbfe1a83ef70d`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Configuracion usada

Frontend:

```env
VITE_EDGE_VISION_URL=http://localhost:8001
VITE_EDGE_VISION_REFRESH_MS=2000
```

El intervalo por defecto es `2000` ms. El frontend acepta valores entre `1000` y
`3000` ms; valores fuera de rango se ajustan al rango permitido.

## Comandos ejecutados

Desde `edge/`:

```powershell
python -m pytest -q
```

Desde `frontend/`:

```powershell
npm run build
```

Desde la raiz:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
rg -n "import serial|from serial|MaxArm|mode=hardware|dryRun.: false|enableHardwareMotion.: true" edge\src edge\tests frontend\src
```

## Resultado Edge Vision

- `python -m pytest -q`: **PASS, 69 passed**.
- `/vision/snapshot` refresca bajo demanda y reutiliza snapshots frescos por una
  TTL corta de 1 segundo para evitar recapturas duplicadas inmediatas.
- `/health`, `/vision/status`, `/vision/snapshot` y `/vision/snapshot/image`
  responden con:
  - `Cache-Control: no-store, max-age=0`
  - `Pragma: no-cache`
  - `Expires: 0`
- `/vision/snapshot/image` sigue respondiendo `404` controlado si no existe imagen.
- La camara sigue bloqueada sin `--allow-camera`.
- No se importo ni abrio serial o MaxArm.

## Resultado Dashboard

- `npm run build`: **PASS**.
- El panel `Vision / Camara` usa polling automatico con intervalo configurable.
- El dashboard conserva los datos del Backend: sesion activa, counts, trazabilidad
  Edge, ultimas acciones, `profile`, `dryRun`, `selectedCube` y `dropZoneCode`.
- El panel muestra:
  - `Auto-refresh cada X segundos`;
  - `Ultima actualizacion`;
  - estado conectado/desconectado/error;
  - source de vision;
  - timestamp del snapshot;
  - truckCode;
  - conteos por color;
  - imagen anotada si existe.
- La URL de imagen incluye cache busting:
  `/vision/snapshot/image?ts=<timestamp>`.
- Si Edge Vision no esta configurado o no responde, muestra `Servicio de vision
  no disponible` y no rompe el resto del dashboard.

## Endpoints probados

Mediante tests Edge:

- `GET /health`
- `GET /vision/status`
- `GET /vision/snapshot`
- `GET /vision/snapshot/image`

## Evidencia de snapshot actualizado

La evidencia automatizada valida que dos requests inmediatos a `/vision/snapshot`
reutilizan un snapshot fresco y que, al expirar la TTL, se genera un nuevo
`runId`. Esto confirma el mecanismo de refresh bajo demanda compatible con polling.

No se ejecuto una prueba manual visual con navegador y servicio Uvicorn en esta
corrida.

## Comportamiento con Edge Vision apagado

Validado por build y logica frontend: si no existe `VITE_EDGE_VISION_URL` o falla
el fetch, `fetchEdgeVisionPanel` retorna un estado seguro con mensaje `Servicio de
vision no disponible`; el dashboard Backend sigue renderizando.

## Checklist de seguridad

- [x] No se abrio puerto serial.
- [x] No se ejecuto MaxArm.
- [x] No se implemento movimiento fisico.
- [x] No se uso `mode=hardware`.
- [x] No se cambio `dryRun=false`.
- [x] `simulation` no se elimino ni se rompio.
- [x] No se implemento MJPEG.
- [x] Tests no dependen de camara fisica.
- [x] `_local_context/` no fue modificado.
- [x] Backend sin cambios contractuales ni migraciones.
- [x] No se hizo commit ni push.

## Issues encontrados

### AUTO-03 - Correccion aplicada: camara fija por `vision.cameraIndex`

En pruebas locales se observo alternancia entre la camara frontal del laptop
(`cameraIndex=0`) y la camara cenital (`cameraIndex=1`). Se corrigio Edge Vision
para que, cuando `vision.source=camera`, `vision.cameraIndex` sea obligatorio y se
abra unicamente ese indice configurado. No hay autodiscovery ni fallback a otra
camara durante el polling.

Validacion agregada:

- `cameraIndex=1` no intenta abrir `0`;
- polling repetido conserva el mismo indice;
- sin `--allow-camera` no llama `VideoCapture`;
- camara configurada no disponible reporta `Configured cameraIndex=1 unavailable`;
- status expone `configuredCameraIndex` y `activeCameraIndex`.
- status y snapshot exponen `snapshotCameraIndex`;
- `/vision/snapshot/image` no sirve imagen antigua si el indice del snapshot no
  coincide con el configurado o si una captura posterior falla.
- Edge Vision conserva una captura persistente para el `cameraIndex` configurado
  durante la vida del servicio, evitando reabrir la camara en cada polling.

### AUTO-01 - Prueba manual visual pendiente

No se levanto un navegador con Edge Vision corriendo para observar visualmente el
timestamp/imagen cada 2 segundos. La validacion automatica cubre build, contrato,
headers y polling, pero falta evidencia visual manual.

### AUTO-02 - Sin tests de componentes frontend

El repo no tiene runner de tests de componentes configurado. Se valido con
TypeScript/Vite build y revision de logica, pero no con pruebas automatizadas de
render React.

## Como levantar Edge Vision

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.example.json
```

Con camara real, solo si corresponde:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.local.json --allow-camera
```

## Conclusion

**APROBADO CON OBSERVACIONES.**

El auto-refresh por snapshot polling quedo implementado con intervalo configurable,
cache busting, headers no-store y degradacion segura. Las observaciones quedan por
la falta de prueba manual visual y de tests de componentes frontend.

## Proximo paso recomendado

Levantar Edge Vision y Frontend juntos, capturar evidencia visual del panel
actualizandose cada 2 segundos y luego repetir con camara real solo con
`--allow-camera`.
