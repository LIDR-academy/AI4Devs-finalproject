# Glosario y convenciones — Flotiko

Términos y convenciones usados en la documentación del proyecto.

## Historias y tickets

| Sigla | Significado |
|-------|-------------|
| **MH** | Must-Have. Historia de usuario obligatoria para el MVP. |
| **SH** | Should-Have. Historia de usuario opcional (mejora el producto). |
| **T** | Ticket. Unidad de trabajo (backend, API o frontend) con criterios de aceptación. |
| **AC** | Criterio de aceptación (Acceptance Criteria). |

Numeración: MH1–MH5 (Must-Have), SH1–SH2 (Should-Have), T1–T15 (tickets en orden Backend → API → Frontend → Opcionales).

## Autenticación y API

| Término | Descripción |
|---------|-------------|
| **API key** | Clave asociada a una empresa; se envía en el header `Authorization: Bearer {api_key}` o `X-API-Key`. El backend valida la key y filtra datos por la empresa asociada. |
| **company_id** | Identificador de la empresa (tenant). Casi todos los datos (vehículos, repostajes, mantenimientos, usuarios) se filtran por `company_id`. |
| **Multi-tenant** | Arquitectura donde cada empresa solo ve sus propios datos; el filtro se aplica por `company_id` en modelos y consultas. |
| **Bearer** | Esquema de autenticación HTTP: `Authorization: Bearer <token>` (aquí, la API key). |

## Rutas y endpoints

| Contexto | Ejemplo | Descripción |
|----------|---------|-------------|
| **API (backend)** | `POST /api/auth/login` | Login; devuelve info de usuario/empresa. |
| **API** | `GET /api/vehicles` | Listado de vehículos (paginado, filtros). |
| **API** | `GET /api/vehicles/{id}/report` | Informe del vehículo (consumo, costes). |
| **Frontend** | `/login` | Pantalla de login. |
| **Frontend** | `/` | Dashboard (listado de vehículos). |
| **Frontend** | `/vehicle/:id` | Detalle del vehículo. |
| **Frontend** | `/vehicle/:id/add-fuel` | Formulario añadir repostaje. |
| **Frontend** | `/vehicle/:id/add-maintenance` | Formulario añadir mantenimiento. |
| **Frontend** | `/vehicle/:id/history` | Historial del vehículo. |
| **Frontend** | `/vehicle/:id/report` | Informe del vehículo. |

Base URL de la API: configurable por entorno (ej. `VITE_API_BASE_URL` en el frontend). En desarrollo suele ser `/api` (proxy) o la URL del backend.

## Modelo de datos (resumen)

| Entidad | Descripción breve |
|---------|-------------------|
| **Company** | Empresa; agrupa usuarios, vehículos y datos. |
| **User** | Usuario (nombre, email, company_id, rol). |
| **Vehicle** | Vehículo (marca, modelo, matrícula, km, etc.). |
| **FuelRefill** | Repostaje (fecha, km, litros, precio, coste total). |
| **Maintenance** | Mantenimiento (tipo, taller, fecha, km, coste). |
| **Brand** | Marca de vehículo (por empresa). |
| **MaintenanceType** | Tipo de mantenimiento (revisión, cambio de aceite, etc.). |
| **Workshop** | Taller donde se realiza el mantenimiento. |

Documentación detallada del modelo: ver [readme.md](readme.md) (sección Modelo de datos).

## Orden de implementación

1. **Backend (T1–T2)**: Proyecto Laravel, BD, migraciones, modelos, middleware API key.
2. **API (T3–T8)**: Endpoints auth, usuarios, vehículos, fuel-refills, maintenances, reporte.
3. **Frontend (T9–T13)**: Login, dashboard, detalle vehículo, repostaje, mantenimiento, historial e informe.
4. **Opcionales (T14–T15)**: Notificaciones, gasolineras cercanas.
