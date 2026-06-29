# Evidencia dashboard vision snapshot

## Objetivo

Implementar y validar una integracion opcional entre Edge Vision y el Dashboard
Operacional para mostrar estado, fuente, metadata segura, conteos e imagen
anotada del ultimo snapshot, sin abrir serial, sin mover MaxArm y sin habilitar
modo hardware.

## Identificacion

- Fecha: 2026-06-29.
- Rama: `finalproject-ASP`.
- Commit actual al iniciar evidencia: `2899322c11d217d0e329240af641ed612cce25e2`.
- Veredicto: **APROBADO CON OBSERVACIONES**.

## Archivos principales

- `edge/src/service/vision_api.py`
- `edge/tests/test_vision_api.py`
- `frontend/src/api/edgeVision.ts`
- `frontend/src/components/VisionSnapshotPanel.tsx`
- `frontend/src/types/edgeVision.ts`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/styles.css`
- `edge/README.md`
- `frontend/README.md`
- `docs/api-design.md`

## Comandos ejecutados

Desde `edge/`:

```powershell
pip install -r requirements.txt
python -m pytest tests -q
python -m py_compile src\service\vision_api.py
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

- `python -m pytest tests -q`: **PASS, 67 passed**.
- `python -m py_compile src\service\vision_api.py`: **PASS**.
- Dependencias agregadas a `edge/requirements.txt`: `fastapi`, `uvicorn`,
  `httpx`.
- Servicio implementado con CORS local para Vite.
- El servicio reutiliza el pipeline existente de vision y no importa
  `edge_runner.py`, serial ni MaxArm.
- La camara se bloquea si `vision.source=camera` y no existe `--allow-camera`.

## Endpoints probados

La suite `edge/tests/test_vision_api.py` probo con `TestClient`:

- `GET /health`: responde `status=ok`, `serialOpened=false`,
  `hardwareMovement=false`.
- `GET /vision/status`: responde sin snapshot y no abre camara.
- `GET /vision/snapshot`: procesa fixture sintetico y devuelve `opencv-file`,
  conteo rojo, deteccion e `imageUrl`.
- `GET /vision/snapshot/image`: devuelve PNG despues de snapshot.
- `GET /vision/snapshot/image`: devuelve `404` controlado sin snapshot.
- Camara sin `--allow-camera`: no llama `read_camera` y reporta error.
- Config insegura con `dryRun=false` y movimiento habilitado: falla antes de
  capturar.

## Resultado Frontend

- `npm run build`: **PASS**.
- Build Vite genero 35 modulos transformados.
- Se agrego `VITE_EDGE_VISION_URL=http://localhost:8001` como configuracion
  opcional.
- El dashboard conserva la carga del Backend mediante `/dashboard/operational`.
- Si Edge Vision no esta configurado o no responde, el panel muestra error sin
  romper sesion activa, conteos, trazabilidad Edge ni ultimas acciones.
- No se agregaron controles fisicos, botones de movimiento ni reset de zonas.

## Snapshot o imagen

La evidencia automatizada uso un fixture sintetico en memoria/temporal dentro del
test. El endpoint `/vision/snapshot` produjo metadata con una deteccion roja y
`/vision/snapshot/image` devolvio `image/png`.

No se abrio camara fisica en esta corrida.

## Checklist de seguridad

- [x] `simulation` se mantiene como default del flujo principal.
- [x] `vision-dry-run` se mantiene como perfil seguro.
- [x] No se modifico `edge_runner.py`.
- [x] No se modifico `edge_dry_run.py`.
- [x] No se abrio serial.
- [x] No se movio MaxArm.
- [x] No se uso `mode=hardware`.
- [x] No se cambio `dryRun=false`.
- [x] Camara bloqueada sin `--allow-camera`.
- [x] Tests no dependen de camara fisica.
- [x] `_local_context/` no fue modificado.
- [x] No se hizo commit ni push.

## Issues encontrados

### VISAPI-01 - Camara fisica no validada

El servicio quedo preparado para `opencv-camera`, pero no se ejecuto camara real
en esta validacion. Se requiere una evidencia separada con autorizacion explicita
para validar indice, foco, iluminacion y ROI.

### VISAPI-02 - Servicio validado por TestClient, no por servidor persistente

Los endpoints fueron probados mediante `TestClient`, suficiente para contratos y
seguridad de aplicacion. No se dejo un proceso Uvicorn corriendo ni se capturaron
requests HTTP manuales contra `localhost:8001`.

## Como levantar Edge Vision

Fixture/archivo:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.example.json
```

Camara real, solo si corresponde y con autorizacion:

```powershell
cd edge
python src\service\vision_api.py --config config\edge.vision.local.json --allow-camera
```

Frontend:

```env
VITE_EDGE_VISION_URL=http://localhost:8001
```

## Conclusion

**APROBADO CON OBSERVACIONES.**

La integracion opcional Edge Vision + Dashboard fue implementada y validada sin
camara fisica, sin serial, sin MaxArm y sin hardware. Las observaciones se deben
a que la camara real y la prueba manual con servidor Uvicorn quedan para una
evidencia posterior.

## Proximo paso recomendado

Levantar `vision_api.py` con el fixture real de QA y capturar una evidencia manual
del dashboard. Luego, con autorizacion explicita, ejecutar una captura
`opencv-camera` en el montaje final.
