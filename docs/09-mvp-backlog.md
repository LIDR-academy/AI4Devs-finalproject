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
**User Story:** Como **Arquitecto**, quiero subir mis archivos de diseño (.3dm) directamente al sistema para que sean procesados sin bloquear mi navegador ni sobrecargar el servidor.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Direct Upload):**
    *   Given el usuario arrastra un archivo `model_v1.3dm` (200MB) a la zona de upload.
    *   When el upload comienza.
    *   Then el cliente solicita una URL firmada al backend.
    *   And el archivo se sube directamente a S3 (POST/PUT) mostrando barra de progreso.
    *   And al finalizar, el frontend notifica al backend "Upload Complete".
    *   And el estado del archivo cambia a `processing`.
*   **Scenario 2 (Edge Case - Limit Size):**
    *   Given el usuario intenta subir un archivo de 2GB.
    *   When lo suelta validación cliente.
    *   Then el sistema muestra error "Tamaño máximo excedido (500MB)".
    *   And NO se solicita URL firmada.
*   **Scenario 3 (Error Handling - Network Cut):**
    *   Given el usuario pierde conexión al 50%.
    *   When la conexión falla.
    *   Then el sistema permite "Reintentar" o limpia el estado visual.

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-001-FRONT` | **UploadZone Component** | `react-dropzone` para manejo de drag&drop. Validación mime-type `application/x-rhino` o extensión `.3dm`. | Dropzone rechaza .txt y >500MB. |
| `T-002-BACK` | **Generate Presigned URL** | Endpoint `POST /api/upload/url`. Body: `{ filename, size, checksum }`. Usa `boto3.generate_presigned_url('put_object', Bucket='raw-uploads')`. | Retorna URL válida de S3 temporal (5min). |
| `T-003-FRONT` | **Upload Manager (Client)** | Servicio Frontend que usa `axios` o `fetch` para hacer PUT a la signed URL. Evento `onProgress` para la UI. | Archivo aparece en bucket S3 tras upload. |
| `T-004-BACK` | **Confirm Upload Webhook** | Endpoint `POST /api/upload/confirm`. Body: `{ file_key }`. Verifica existencia en S3 y lanza Celery Task. | Registro en DB `events` creado y Worker disparado. |
| `T-005-INFRA` | **S3 Bucket Setup** | Configurar Bucket Policy para aceptar PUT desde `localhost` y dominio prod. Lifecycle rule: borrar objetos en `raw-uploads` tras 24h. | Upload desde browser no da error CORS. |

**Valoración:** 5 Story Points
**Dependencias:** N/A

---

### US-002: Validación de errores (The Librarian)
**User Story:** Como **"The Librarian" (Agente de Proceso)**, quiero inspeccionar automáticamante cada archivo subido para verificar que cumple los estándares ISO-19650 y de integridad geométrica, rechazando los inválidos con un reporte detallado.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Valid File):**
    *   Given un archivo en S3 con capas correctas (ej: `SF-C12-M-001`).
    *   When el agente lo procesa con `rhino3dm`.
    *   Then extrae metadatos y confirma validez.
    *   And cambia estado a `validated`.
*   **Scenario 2 (Validation Fail - Bad Naming):**
    *   Given un archivo capa llamada `bloque_test`.
    *   When el agente detecta que no coincide con Regex `^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\d{3}$`.
    *   Then marca estado `rejected`.
    *   And genera reporte JSON: `{"errors": [{"layer": "bloque_test", "msg": "Invalid format"}]}`.
*   **Scenario 3 (Error Handling - Corrupt File):**
    *   Given un archivo .3dm corrupto (header incompleto).
    *   When `File3dm.Read()` falla.
    *   Then captura excepción y marca estado `error_processing`.

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-020-AGENT` | **Rhino Ingestion Service** | Worker Python. Usa `rhino3dm.File3dm.Read(path)`. Descarga archivo de S3 a `/tmp` del worker antes de leer. | Lee correctamente un .3dm y lista sus capas en log. |
| `T-021-AGENT` | **Nomenclature Validator** | Función que itera `model.Layers` y `model.Objects`. Aplica Regex estricta sobre `Name`. | Unit tests con nombres válidos e inválidos pasando. |
| `T-022-AGENT` | **Geometry Auditor** | Función que chequea `object.Geometry.IsValid` y `BoundingBox.IsValid`. Rechaza Volume ~= 0 si es posible calcularlo (Brep/Mesh). | Detecta y flaggea objetos nulos/vacíos. |
| `T-023-BACK` | **Validation Report Model** | Esquema Pydantic `ValidationResult`. Campos: `is_valid (bool)`, `errors (List[ValidationError])`, `metadata (Dict)`. Guardado en columna JSONB. | DB almacena el reporte estructurado sin error. |
| `T-024-FRONT` | **Report Visualizer** | Componente Modal que consume el JSON de reporte. Muestra lista roja de errores bloqueantes. | Usuario ve por qué se rechazó su archivo. |

**Valoración:** 8 Story Points
**Dependencias:** US-001

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
