# Frontend Dashboard Test Results - Entrega 2

## Contexto

Fecha de ejecucion: 2026-06-09  
Agente: QA  
Alcance: validacion del dashboard operacional React/Vite consumiendo Backend real.

Fuentes revisadas:

- `docs/delivery/roadmap-entregas.md`
- `docs/delivery/01-alcance-entrega2.md`
- `docs/delivery/02-plan-delivery-entrega2.md`
- `docs/api-design.md`
- `backend/README.md`
- `edge/README.md`
- `frontend/README.md`
- `docs/evidence/backend-api-test-results.md`
- `docs/evidence/edge-simulation-test-results.md`
- `frontend/`

## Comandos usados

### Build frontend

```powershell
cd frontend
npm run build
```

### Verificar servidor frontend

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing
```

### Verificar datos backend consumidos por frontend

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/dashboard/operational" | ConvertTo-Json -Depth 10
```

## Resultado esperado

- El build TypeScript/Vite termina sin errores.
- El frontend responde en `http://127.0.0.1:5173`.
- El frontend consulta `GET /dashboard/operational` desde el backend configurado.
- El dashboard muestra:
  - sesion activa;
  - `truckCode`;
  - estado de sesion;
  - conteo por color;
  - total de cubos;
  - ultimas acciones del robot;
  - modo `simulation`;
  - estados loading, error y empty.

## Resultado obtenido

### Build

Resultado:

```text
npm run build
tsc && vite build
32 modules transformed
built in 709ms
```

Estado: OK.

### Servidor frontend

Resultado:

```text
HTTP 200 en http://127.0.0.1:5173
```

Estado: OK.

### Backend real consumible

Resultado obtenido desde `GET /dashboard/operational`:

```json
{
  "activeSession": {
    "id": "7366f96f-ef77-4052-a63f-73c14710d973",
    "code": "UNLOAD-20260609-003",
    "status": "IN_PROGRESS",
    "truckCode": "TRUCK-001",
    "startedAt": "2026-06-09T21:53:52.729Z",
    "finishedAt": null
  },
  "counts": {
    "red": 1,
    "blue": 1,
    "green": 0,
    "yellow": 1,
    "total": 3
  },
  "lastActions": [
    {
      "id": "8190aeb5-c008-4ec4-9790-ef52af17fe2b",
      "code": "ACTION-001",
      "actionType": "PICK_AND_DROP",
      "status": "SUCCESS",
      "mode": "simulation",
      "color": "red",
      "createdAt": "2026-06-09T21:53:52.802Z"
    }
  ]
}
```

Estado: OK.

## Validacion por criterio

| Criterio | Evidencia | Estado |
|---|---|---|
| 1. Frontend levanta correctamente | `Invoke-WebRequest` retorno HTTP 200 | OK |
| 2. Consume backend real | `frontend/src/api/dashboard.ts` usa `VITE_BACKEND_URL` y llama `/dashboard/operational` | OK |
| 3. Muestra sesion activa | `StatusPanel` renderiza `session.code`; backend entrega `UNLOAD-20260609-003` | OK |
| 4. Muestra `truckCode` | `StatusPanel` renderiza `session.truckCode`; backend entrega `TRUCK-001` | OK |
| 5. Muestra estado de sesion | `StatusPanel` renderiza `session.status`; backend entrega `IN_PROGRESS` | OK |
| 6. Muestra conteo por color | `CountsPanel` renderiza red, blue, green, yellow | OK |
| 7. Muestra total de cubos | `CountsPanel` renderiza `counts.total`; backend entrega `3` | OK |
| 8. Muestra ultimas acciones robot | `ActionsTable` renderiza `lastActions`; backend entrega `ACTION-001` | OK |
| 9. Muestra `mode=simulation` | `StatusPanel` y `ActionsTable` renderizan `mode`; backend entrega `simulation` | OK |
| 10. Maneja loading/error/empty | `Dashboard.tsx` implementa estados `loading`, `error`, `empty` | OK |

## Evidencia visual sugerida

Captura recomendada para documentacion final:

```text
docs/evidence/images/frontend-dashboard-operational.png
```

La captura deberia mostrar:

- titulo `Dashboard Operacional`;
- sesion `UNLOAD-20260609-003` o una sesion activa equivalente;
- camion `TRUCK-001`;
- estado `IN_PROGRESS`;
- modo `simulation`;
- total de cubos `3`;
- conteos por color;
- accion `ACTION-001` en modo `simulation`.

## Defectos encontrados

| ID | Severidad | Descripcion | Evidencia | Recomendacion |
|---|---|---|---|---|
| QA-FE-001 | Baja | El icono del boton de refrescar aparece como caracteres mojibake en el archivo fuente (`â†»`) en vez de un simbolo limpio o texto ASCII. | `frontend/src/components/Dashboard.tsx` | Reemplazar por texto ASCII como `Refresh` o por un icono controlado en una iteracion menor. |
| QA-FE-002 | Baja | No hay pruebas automatizadas de UI. | `frontend/README.md` lista este punto como pendiente. | Agregar test de render o smoke test cuando se estabilice la entrega. |
| QA-FE-003 | Baja | No se capturo screenshot automatizado desde esta validacion. | Evidencia actual es build, HTTP 200, API JSON e inspeccion de componentes. | Capturar screenshot manual o con herramienta de navegador antes de entrega final. |

## Recomendaciones minimas

- Corregir el caracter del boton de refrescar para evitar ruido visual.
- Capturar una imagen del dashboard operacional para evidencias finales.
- Mantener `VITE_BACKEND_URL` documentado en `.env.example`.
- Agregar pruebas de componente o smoke test en una iteracion posterior.
- No declarar hardware real como implementado; el dashboard debe seguir mostrando `simulation` cuando los datos provienen del Edge simulado.

## Estado general

**APROBADO CON OBSERVACIONES**

El frontend cumple el objetivo de Entrega 2: muestra el dashboard operacional consumiendo el backend real y refleja la sesion activa generada por Edge en modo `simulation`.
