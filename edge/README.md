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

No implementa todavía cámara real, OpenCV productivo, comunicación serial ni movimiento físico del MaxArm.

## Perfiles de ejecución

| Perfil | Estado actual | Comportamiento |
|---|---|---|
| `simulation` | Implementado y default | Ejecuta el flujo simulado existente contra Backend. |
| `vision-dry-run` | Reconocido, no ejecutable aún | El runner aborta antes de crear sesión o abrir dispositivos. |
| `hardware` | Reconocido, no ejecutable aún | El runner aborta antes de crear sesión o abrir dispositivos. |

Un perfil no implementado nunca degrada silenciosamente a simulación. Esta base no importa OpenCV ni pyserial.

## Requisitos

- Python 3.10+
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
- `vision.cubes`: cubos simulados enviados al backend.
- `robot`: accion simulada de pick/drop con `dryRun=true`.

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

Los tests cubren perfiles, defaults seguros, validación JSON, selección por color/orden, slots inactivos u ocupados, reservas consecutivas, zona llena, confirmación, reset, aislamiento de estado y regresión del flujo simulation con Backend simulado.

## Errores comunes

- Si falla la conexion, verificar que el backend este levantado con `npm run dev`.
- Si falla Prisma o la DB, revisar `docker compose up -d`, migracion y seed del backend.
- Si el perfil no es `simulation`, el runner se detiene por seguridad antes de instanciar el cliente Backend.

## Evolucion futura

Pendiente para los siguientes pasos:

- incorporar lectura QR real con OpenCV;
- incorporar deteccion real de cubos por color;
- integrar la selección del cubo detectado con `DropZonePlanner`;
- agregar un comando operacional de reset con confirmación humana y auditoría;
- añadir límites físicos de workspace y Z para coordenadas activas;
- implementar reservas/persistencia hardware con bloqueo de proceso;
- implementar adapter serial solo detrás de gates explícitos;
- validar coordenadas antes de cualquier comando MaxArm;
- no mover MaxArm sin configuracion segura, zona despejada y dry run previo.
