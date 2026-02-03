# 09. MVP Backlog & Sprint Planning

**Estado:** Aprobado para Implementación
**Fase:** Construction Phase - MVP Scope
**Objetivo:** MVP Académico (TFM)
**Focus:** "Happy Paths" críticos + Validación "The Librarian" (US-001, US-002)

---

## 1. MVP Scope Definition (The Golden Path)

Selección estratégica de historias para cumplir con los objetivos del TFM en el plazo restante.

### MUST-HAVE (Prioridad Crítica - Core Loop)
* **US-001:** Upload de archivo .3dm válido. (Ingesta)
* **US-002:** Validación de errores (Nomenclatura/Geometría). (El "Cerebro")
* **US-005:** Dashboard de listado de piezas. (Gestión)
* **US-010:** Visor 3D (Interacción geométrica). (Visualización)
* **US-007:** Cambio de Estado. (Ciclo de Vida)

### SHOULD-HAVE (Prioridad Alta - Soporte)
* **US-013:** Login/Auth. (Seguridad Básica)
* **US-009:** Evidencia de fabricación. (Cierre del Ciclo)

---

## 2. Technical Breakdown (Tickets de Trabajo)

### US-001: Upload de archivo .3dm válido
**Estimación:** 5 Story Points
**Dependencias:** N/A (Primer paso)

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[FRONT]` | **Implementar UploadZone** | Componente React con Drag & Drop, validación de extensión .3dm y tamaño máx (500MB). |
| `[FRONT]` | **Progress Bar UI** | Visualización de progreso real conectado a evento de subida (Axios onUploadProgress). |
| `[BACK]` | **Endpoint Presigned URL** | `POST /api/upload/url`: Genera URL firmada de S3 para upload directo desde cliente (bypassing server). |
| `[BACK]` | **Trigger Procesamiento** | `POST /api/upload/confirm`: Notifica que el archivo está en S3 para iniciar worker de extracción. |
| `[INFRA]` | **S3 Bucket Setup** | Configurar bucket `raw-uploads` con reglas CORS y Lifecycle rules (borrado tras 24h). |
| `[AGENT]` | **Rhino Extractor Script** | Script Python con `rhino3dm` que abra el archivo y extraiga metadatos de capas y UserText. |

---

### US-002: Validación de errores (The Librarian)
**Estimación:** 8 Story Points
**Dependencias:** US-001

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[AGENT]` | **Nomenclature Validator** | Función Regex que valide ISO-19650 en nombres de objetos y capas. |
| `[AGENT]` | **Geometry Sanity Check** | Función que detecte volúmenes negativos, nulos o meshes abiertas inválidas. |
| `[AGENT]` | **LangGraph Workflow** | Orquestación del grafo: `Extract -> Validate -> Report`. State management. |
| `[BACK]` | **Validation Report Schema** | Definición Pydantic/JSONB para almacenar errores estructurados por pieza. |
| `[FRONT]` | **Validation Modal** | Interfaz que muestra lista de errores y advertencias tras el procesamiento. |

---

### US-005: Dashboard de listado de piezas
**Estimación:** 5 Story Points
**Dependencias:** US-001, Modelo de Datos

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[FRONT]` | **Parts Table Component** | Tabla con TanStack Table: Sort, Paginación server-side. |
| `[FRONT]` | **Stats Cards** | Componentes visuales para contadores (Total, En Proceso, Alertas). |
| `[BACK]` | **List Parts Endpoint** | `GET /api/parts`: Endpoint con soporte de filtros (`?status=xxx`) y paginación. |
| `[DB]` | **Optimized Queries** | Índices SQL en columnas `status` y `workshop` para filtrado rápido. |
| `[FRONT]` | **Filter Sidebar** | UI para selección de filtros combinados. |

---

### US-010: Visor 3D Web
**Estimación:** 8 Story Points
**Dependencias:** US-001 (Necesita geometría procesada)

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[BACK]` | **Converter Worker** | Celery task para convertir objetos Rhino a .glb (usando `rhino3dm` + trimesh/export). |
| `[INFRA]` | **Public Assets Bucket** | Bucket S3 `processed-models` optimizado para entrega de assets web. |
| `[FRONT]` | **Three.js Viewer** | Canvas React-Three-Fiber con OrbitControls y Environment básico. |
| `[FRONT]` | **GLB Loader** | Hook de carga asíncrona de modelos con manejo de caché y errores. |
| `[FRONT]` | **Viewer Overlay** | Controles UI sobre el canvas (Reset cámara, Mostrar/Ocultar grid). |

---

### US-007: Cambio de Estado (Ciclo de Vida)
**Estimación:** 3 Story Points
**Dependencias:** US-005

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[FRONT]` | **Status Dropdown** | Componente selector de estado con lógica de transiciones permitidas. |
| `[BACK]` | **Update Status Endpoint** | `PATCH /api/parts/{id}`: Actualiza estado y valida transición. |
| `[DB]` | **Audit Log Trigger** | Trigger PostgreSQL que inserta automáticamente en tabla `events` al cambiar estado. |
| `[FRONT]` | **Optimistic Update** | Reflejar cambio inmediato en UI antes de confirmación de servidor. |

---

### US-013: Login/Auth
**Estimación:** 3 Story Points
**Dependencias:** N/A (Transversal)

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[INFRA]` | **Supabase Auth Config** | Configuración de proyecto Supabase y providers (Email/Pass). |
| `[FRONT]` | **Login Page** | Formulario de login y manejo de sesión (Context/Store). |
| `[FRONT]` | **Protected Routes** | Wrapper `RequireAuth` para proteger acceso al Dashboard. |
| `[BACK]` | **Auth Middleware** | Dependencia FastAPI para validar JWT de Supabase en cada request. |

---

### US-009: Evidencia de Fabricación
**Estimación:** 5 Story Points
**Dependencias:** US-007

| Componente | Ticket | Descripción Técnica |
|------------|--------|---------------------|
| `[FRONT]` | **Completion Modal** | Modal que exige foto al marcar estado "Completed". |
| `[BACK]` | **Upload Evidence** | `POST /api/evidence`: Manejo de subida de imagen de evidencia. |
| `[DB]` | **Evidence Relation** | Vincular registro de `attachments` con el evento de cambio de estado. |

---

## 3. Icebox (Fuera de Alcance MVP)
Las siguientes historias quedan pospuestas para futuras iteraciones:
* **US-003, US-004:** Casos de borde de upload.
* **US-006:** Filtros avanzados.
* **US-008:** Bloqueo de permisos detallado (Testear solo básico).
* **US-011, US-012:** Fallbacks y Capturas de visor.
* **US-014:** Login error handling avanzado.
