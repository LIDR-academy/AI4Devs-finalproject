# RoboDock AI Edge

Modulo Edge en modo simulation para Entrega 2.

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

No implementa camara real, OpenCV real ni movimiento fisico del MaxArm. El modo soportado para Entrega 2 es `simulation`.

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

- `mode`: debe ser `simulation`.
- `truckCode`: camion simulado, por defecto `TRUCK-001`.
- `vision.cubes`: cubos simulados enviados al backend.
- `robot`: accion simulada de pick/drop con `dryRun=true`.

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

## Errores comunes

- Si falla la conexion, verificar que el backend este levantado con `npm run dev`.
- Si falla Prisma o la DB, revisar `docker compose up -d`, migracion y seed del backend.
- Si `mode` no es `simulation`, el runner se detiene por seguridad.

## Evolucion futura

Para Entrega 3 o integracion hardware:

- incorporar lectura QR real con OpenCV;
- incorporar deteccion real de cubos por color;
- mantener `simulation` como fallback;
- agregar modo hardware solo con bandera explicita;
- validar coordenadas antes de cualquier comando MaxArm;
- no mover MaxArm sin configuracion segura, zona despejada y dry run previo.
