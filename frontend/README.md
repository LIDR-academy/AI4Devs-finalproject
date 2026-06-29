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
```

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

5. Verificar visualmente:

- existe una sesion activa;
- el camion es `TRUCK-001`;
- el estado es `IN_PROGRESS`;
- el total de cubos es mayor que cero;
- aparecen conteos por color;
- la ultima accion del robot muestra `mode=simulation`.
- el panel de trazabilidad muestra `profile`, fuente, cubo y `dropZoneCode`;
- `vision-dry-run` se etiqueta como dry-run sin movimiento;
- no existen controles de movimiento ni reset de ocupación.

## Build

```powershell
npm run build
```

## Pendientes

- Agregar pruebas automatizadas de componentes.
- Agregar refresco periodico si se requiere monitoreo continuo.
- Integrar evidencia visual de QA.
- Mantener el contrato `GET /dashboard/operational` estable para Entrega 3.
