# 09. MVP Backlog & Sprint Planning

**Estado:** Aprobado para Implementación
**Fase:** Construction Phase - MVP Scope
**Objetivo:** MVP Académico (TFM)
**Focus:** "Happy Paths" críticos + Validación "The Librarian" (US-001, US-002)

---

## 1. MVP Scope Definition (The Golden Path)

Selección estratégica de historias para cumplir con los objetivos del TFM en el plazo restante.

### MUST-HAVE (Prioridad Crítica - Core Loop)
* **US-001:** Upload de archivo .3dm válido **[DONE]** ✅ (Ingesta)
* **US-002:** Validación de errores (Nomenclatura/Geometría). (El "Cerebro")
* **US-005:** Dashboard de listado de piezas. (Gestión)
* **US-010:** Visor 3D (Interacción geométrica). (Visualización)
* **US-007:** Cambio de Estado. (Ciclo de Vida)

### SHOULD-HAVE (Prioridad Alta - Soporte)
* **US-013:** Login/Auth. (Seguridad Básica)
* **US-009:** Evidencia de fabricación. (Cierre del Ciclo)

---

## 2. Technical Breakdown (Tickets de Trabajo)

### US-001: Upload de archivo .3dm válido **[DONE]** ✅

**User Story:** Como **Arquitecto**, quiero subir mis archivos de diseño (.3dm) directamente al sistema para que sean procesados sin bloquear mi navegador ni sobrecargar el servidor.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Direct Upload):** ✅
    *   Given el usuario arrastra un archivo `model_v1.3dm` (200MB) a la zona de upload.
    *   When el upload comienza.
    *   Then el cliente solicita una URL firmada al backend.
    *   And el archivo se sube directamente a S3 (POST/PUT) mostrando barra de progreso.
    *   And al finalizar, el frontend notifica al backend "Upload Complete".
    *   And el estado del archivo cambia a `processing`.
*   **Scenario 2 (Edge Case - Limit Size):** ✅
    *   Given el usuario intenta subir un archivo de 2GB.
    *   When lo suelta validación cliente.
    *   Then el sistema muestra error "Tamaño máximo excedido (500MB)".
    *   And NO se solicita URL firmada.
*   **Scenario 3 (Error Handling - Network Cut):** ✅
    *   Given el usuario pierde conexión al 50%.
    *   When la conexión falla.
    *   Then el sistema permite "Reintentar" o limpia el estado visual.

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-001-FRONT` **[DONE]** | **UploadZone Component (Drag & Drop)** | `react-dropzone` para manejo de drag&drop. Validación mime-type `application/x-rhino` o extensión `.3dm`. Refactorizado con constants extraction pattern. | **[DONE]** Dropzone rechaza .txt y >500MB. Tests 14/14 passing. |
| `T-002-BACK` **[DONE]** | **Generate Presigned URL** | Endpoint `POST /api/upload/url`. Body: `{ filename, size, checksum }`. Usa `boto3.generate_presigned_url('put_object', Bucket='raw-uploads')`. | **[DONE]** Retorna URL válida de S3 temporal (5min). |
| `T-003-FRONT` **[DONE]** | **Upload Manager (Client)** | Servicio Frontend que usa `axios` o `fetch` para hacer PUT a la signed URL. Evento `onProgress` para la UI. Refactorizado con separación de responsabilidades (service layer). | **[DONE]** FileUploader component con validación client-side, upload service dedicado, tests passing (4/4). |
| `T-004-BACK` **[DONE]** | **Confirm Upload Webhook** | Endpoint `POST /api/upload/confirm`. Body: `{ file_id, file_key }`. Verifica existencia en Storage y crea evento en tabla `events`. | **[DONE]** Tests 7/7 pasando. Implementado con Clean Architecture (service layer). |
| `T-005-INFRA` **[DONE]** | **S3 Bucket Setup** | Configurar Bucket Policy para aceptar PUT desde `localhost` y dominio prod. Lifecycle rule: borrar objetos en `raw-uploads` tras 24h. | **[DONE]** Upload desde browser no da error CORS. |

**Valoración:** 5 Story Points  
**Dependencias:** N/A

> **✅ Auditado por AI (2026-02-11):** Funcionalidad completamente implementada y verificada contra código y documentación. Todos los criterios de aceptación cumplidos. Tests: Backend 7/7 ✅ | Frontend 18/18 ✅ (4 FileUploader + 14 UploadZone). Implementación sigue patrones Clean Architecture documentados en `systemPatterns.md`.

---

### US-002: Validación de errores (The Librarian)
**User Story:** Como **"The Librarian" (Agente de Proceso)**, quiero inspeccionar automáticamante cada archivo subido para verificar que cumple los estándares ISO-19650 y de integridad geométrica, rechazando los inválidos con un reporte detallado.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Valid File):**
    *   Given un archivo en S3 con capas correctas (ej: `SF-C12-M-001`) y user strings válidos.
    *   When el agente lo procesa con `rhino3dm`.
    *   Then extrae metadatos (capas, objetos, user strings) y confirma validez.
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
*   **Scenario 4 (Metadata Extraction):**
    *   Given un archivo con user strings en objetos y capas.
    *   When el agente procesa el archivo.
    *   Then extrae y almacena user strings en `blocks.rhino_metadata`.
    *   And metadata incluye clasificación, materiales y propiedades personalizadas.

**Desglose de Tickets Técnicos (Ordenados por Dependencias):**

**A. Infraestructura Base (Prerequisitos)**
| ID Ticket | Título | Tech Spec | DoD | Prioridad |
|-----------|--------|-----------|-----|-----------|
| `T-020-DB` **[DONE]** ✅ | **Add Validation Report Column** | Migración SQL: `ALTER TABLE blocks ADD COLUMN validation_report JSONB`. Índice GIN: `CREATE INDEX idx_blocks_validation_errors ON blocks USING GIN ((validation_report->'errors'))`. Índice parcial para validaciones fallidas. Pydantic schemas: ValidationError, ValidationReport, ValidationMetadata. | **[DONE]** Columna existe en DB y acepta JSON estructurado. Tests 4/4 passing. Migración ejecutada exitosamente (2026-02-11). ✅ **Auditado 2026-02-12:** Código 100% spec compliant, tests 4/4 passing, documentación sincronizada. Aprobado para merge. (Auditoría: [docs/US-002/AUDIT-T-020-DB-FINAL.md](US-002/AUDIT-T-020-DB-FINAL.md)) | 🔴 CRÍTICA |
| `T-021-DB` **[DONE]** ✅ | **Extend Block Status Enum** | Migración SQL: `ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'processing'`, `ADD VALUE IF NOT EXISTS 'rejected'`, `ADD VALUE IF NOT EXISTS 'error_processing'`. | Migración aplicada (2026-02-12). Tests de integración: 6/6 PASS. Estados nuevos disponibles en tipo ENUM. | 🔴 CRÍTICA |
| `T-022-INFRA` | **Redis & Celery Worker Setup** | Configurar Redis como broker. Dockerfile para worker con `celery -A agent.tasks worker`. Variables: `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`. Docker Compose service `agent-worker`. | `docker-compose up agent-worker` ejecuta sin errores. Task dummy funciona. | 🔴 CRÍTICA |
| `T-023-TEST` | **Create .3dm Test Fixtures** | Crear 3 archivos Rhino: `valid_model.3dm` (capas SF-C12-M-001 + user strings), `invalid_naming.3dm` (capa bloque_test), `corrupted.3dm` (archivo truncado). | Fixtures disponibles en `tests/fixtures/`. | 🟡 ALTA |

**B. Agente de Validación (Core Logic)**
| ID Ticket | Título | Tech Spec | DoD | Prioridad |
|-----------|--------|-----------|-----|-----------|
| `T-024-AGENT` | **Rhino Ingestion Service** | Worker Python. Task Celery: `@celery_app.task def validate_file(part_id, s3_key)`. Descarga .3dm de S3 a `/tmp`. Usa `rhino3dm.File3dm.Read(path)`. Timeout 10min. Retry policy: 3 intentos. | Lee .3dm correctamente y lista capas en logs estructurados. | 🔴 CRÍTICA |
| `T-025-AGENT` | **Metadata Extractor (User Strings)** | Función: `extract_user_strings(file3dm) -> dict`. Itera `model.Objects`, `model.Layers`, `model.Strings`. Extrae `obj.Attributes.GetUserStrings()`. Retorna JSON con estructura: `{ "document": {...}, "layers": {...}, "objects": {...} }`. | Unit test extrae user strings de fixture. JSON válido con campos dinámicos. | 🟡 ALTA |
| `T-026-AGENT` | **Nomenclature Validator** | Función: `validate_nomenclature(file3dm) -> List[ValidationError]`. Itera capas y objetos. Regex: `^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\d{3}$`. Retorna lista de errores con `layer_name` y `error_msg`. | Unit tests: nombres válidos pasan, inválidos fallan. | 🔴 CRÍTICA |
| `T-027-AGENT` | **Geometry Auditor** | Función: `validate_geometry(file3dm) -> List[ValidationError]`. Chequea: `obj.Geometry.IsValid`, `BoundingBox.IsValid`, `Volume > 0` (si Brep/Mesh). Detecta geometría degenerada/nula. | Unit test detecta objetos inválidos. Fixture con geometría rota devuelve errores. | 🔴 CRÍTICA |

**C. Backend Integration**
| ID Ticket | Título | Tech Spec | DoD | Prioridad |
|-----------|--------|-----------|-----|-----------|
| `T-028-BACK` | **Validation Report Model** | Esquema Pydantic: `ValidationResult(is_valid: bool, errors: List[ValidationError], metadata: dict, validated_at: datetime, validated_by: str)`. Método `save_to_db(part_id)` que actualiza `blocks.validation_report`. | Model serializa a JSON. Guarda en DB sin errores. | 🔴 CRÍTICA |
| `T-029-BACK` | **Trigger Validation from Confirm Endpoint** | Modificar `POST /api/upload/confirm`. Después de crear evento, ejecutar: `celery_app.send_task('agent.tasks.validate_file', args=[part_id, s3_key])`. Actualizar estado a `processing`. | Endpoint encola job exitosamente. Redis muestra task pendiente. | 🔴 CRÍTICA |
| `T-030-BACK` | **Get Validation Status Endpoint** | Endpoint `GET /api/parts/{id}/validation`. Retorna `validation_report` JSONB + estado actual. Si estado=`processing`, incluir `job_id` para tracking. | Endpoint retorna JSON con reporte completo. | 🟡 ALTA |

**D. Frontend Visualization**
| ID Ticket | Título | Tech Spec | DoD | Prioridad |
|-----------|--------|-----------|-----|-----------|
| `T-031-FRONT` | **Real-Time Status Listener** | Hook `useSupabaseRealtime('blocks', part_id)`. Escucha cambios en columna `status`. Cuando cambia de `processing` → `validated`/`rejected`, dispara toast notification y refetch de datos. | UI actualiza automáticamente sin polling. Toast aparece al terminar validación. | 🟡 ALTA |
| `T-032-FRONT` | **Validation Report Visualizer** | Componente Modal `<ValidationReportModal report={validationReport} />`. Renderiza: ✅ Checks passed (green), ❌ Errors (red list), 📊 Metadata extraída (tabla expandible). Tabs: Nomenclature / Geometry / Metadata. | Usuario ve errores detallados. Clicks en error highlightean objeto problemático (nice-to-have). | 🔴 CRÍTICA |

**E. Observability (Opcional pero Recomendado)**
| ID Ticket | Título | Tech Spec | DoD | Prioridad |
|-----------|--------|-----------|-----|-----------|
| `T-033-INFRA` | **Worker Logging & Monitoring** | Configurar `structlog` en worker. Logs JSON a stdout. Métricas: `validation_duration`, `success_rate`, `error_types`. Dashboard Grafana/Railway Metrics (opcional MVP). | Logs estructurados visibles en Railway. Errores trazables. | 🟢 BAJA |

**Valoración Actualizada:** 13 Story Points (original 8 + infraestructura 5)  
**Dependencias:** US-001  
**Riesgos Críticos:**  
- ⚠️ rhino3dm puede fallar con archivos >500MB (OOM) → Mitigación: timeout + retry + límite estricto  
- ⚠️ Workers se caen y jobs se pierden → Mitigación: Celery result backend + monitoring (T-033)  
- ⚠️ Regex ISO-19650 con falsos positivos → Mitigación: LLM fallback (post-MVP)

---

### US-005: Dashboard de listado de piezas
**User Story:** Como **BIM Manager**, quiero ver una lista paginada de todas las piezas con su estado actual y filtros rápidos, para tener una visión global del progreso sin esperar tiempos de carga excesivos.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Pagination):**
    *   Given existen 150 piezas en el sistema.
    *   When entro al Dashboard.
    *   Then veo las primeras 50 piezas ordenadas por fecha reciente.
    *   And veo controles "Página 1 de 3".
    *   And al dar click en "Siguiente", carga la página 2 en <500ms.
*   **Scenario 2 (Wait State - Empty Dashboard):**
    *   Given no existen piezas iniciadas.
    *   When entro al Dashboard.
    *   Then veo un "Empty State" amigable invitando a subir el primer archivo.
*   **Scenario 3 (Filtering):**
    *   Given selecciono filtro "Workshop: Granollers".
    *   When aplico el filtro.
    *   Then la tabla solo muestra piezas de ese taller.
    *   And el contador "Total Piezas" se actualiza al número filtrado.

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-030-FRONT` | **Dashboard Layout & Stats** | Layout principal con Sidebar de filtros y Grid de Stats (Zustand store para filtros globales). | Estructura visual responsive montada. |
| `T-031-FRONT` | **Parts Table Component** | Implementación `TanStack Table`. Columnas sortables. Hook `useQuery` con key `['parts', page, filters]`. | Tabla renderiza datos mockeados con paginación UI. |
| `T-032-BACK` | **List Parts Endpoint** | `GET /api/parts`. Query params: `page`, `limit`, `status`, `workshop`. Implementa offset pagination SQL. | Retorna JSON `{ data: [...], meta: { total, page } }`. |
| `T-033-DB` | **Index Optimization** | Crear índices B-tree compuestos en columnas `status` y `workshop_id` de tabla `parts`. | `EXPLAIN ANALYZE` muestra uso de índice en queries filtradas. |

**Valoración:** 5 Story Points
**Dependencias:** US-001

---

### US-010: Visor 3D Web
**User Story:** Como **Responsable de Taller**, quiero visualizar la pieza 3D asignada directamente en el navegador, para poder rotarla, hacer zoom y entender su geometría sin instalar software CAD.

**Criterios de Aceptación:**
*   **Scenario 1 (Happy Path - Load Success):**
    *   Given una pieza con geometría procesada (.glb disponible) y click en "Ver 3D".
    *   When se abre el modal del visor.
    *   Then el modelo aparece centrado en pantalla con iluminación neutra.
    *   And puedo rotar (orbit) suavemente alrededor de la pieza.
*   **Scenario 2 (Edge Case - Model Not Found):**
    *   Given el archivo .glb aún no se ha generado (estado `processing`).
    *   When intento abrir el visor.
    *   Then veo un "Placeholder" o "Spinner" indicando que se está procesando (o Bounding Box básico).
*   **Scenario 3 (Error Handling - Load Fail):**
    *   Given el archivo .glb está corrupto o URL es 404.
    *   When el loader falla.
    *   Then veo un mensaje de error "No se pudo cargar la geometría 3D" (no pantalla blanca).

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-040-FRONT` | **Viewer Canvas Component** | Setup `@react-three/fiber` con `<Canvas>`. Configurar cámara `makeDefault` y `OrbitControls`. | Canvas 3D renderiza un cubo de prueba rotable. |
| `T-041-FRONT` | **Model Loader & Stage** | Componente que recibe URL `.glb`. Usa `useGLTF` de `@react-three/drei` y `<Stage>` para entorno automático (luces/sombras). | Carga modelo desde URL estática correctamente. |
| `T-042-FRONT` | **Error Boundary & Fallback** | Wrapper React Error Boundary para capturar fallos de WebGL. Loader Suspense con spinner. | Si URL rompe, muestra UI de error controlada. |
| `T-043-BACK` | **Get Model URL** | El endpoint `GET /api/parts/{id}` debe incluir campo `glb_url` (URL pública S3 o presigned GET temporal). | Endpoint retorna URL válida al frontend. |

**Valoración:** 8 Story Points
**Dependencias:** US-001 (Necesita geometría procesada)

---

### US-007: Cambio de Estado (Ciclo de Vida)
**User Story:** Como **BIM Manager**, quiero cambiar el estado de una pieza (ej: de "Validada" a "En Producción") para reflejar su avance real en el flujo de trabajo.

**Criterios de Aceptación:**
*   **Scenario 1 (Valid Transition):**
    *   Given la pieza está en `validated`.
    *   When selecciono `in_production` en el dropdown.
    *   Then el estado cambia instantáneamente en la UI (Optimistic).
    *   And se confirma en el backend.
    *   And aparece notificación "Estado actualizado".
*   **Scenario 2 (Invalid Transition - Guardrail):**
    *   Given la pieza está en `uploaded` (aún no validada por Librarian).
    *   When intento pasarla directamenet a `completed`.
    *   Then el backend rechaza la petición (Error 400 "Invalid Transition").
    *   And la UI revierte al estado original y muestra error toast.
*   **Scenario 3 (Audit Log):**
    *   Given cambio el estado exitosamente.
    *   When consulto el historial.
    *   Then existe un registro "User X cambió estado A -> B".

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-050-FRONT` | **Status Selector UI** | Dropdown component que deshabilita opciones inválidas según estado actual. Usa `useMutation` con `onMutate` para Optimistic Update. | UI actualiza visualmente antes de respuesta server. |
| `T-051-BACK` | **State Machine Logic** | Lógica en endpoint `PATCH` que valida matriz de transiciones permitidas (ej: `uploaded -> validated` OK, `uploaded -> completed` ERROR). | Unit test de transiciones prohibidas lanza excepción. |
| `T-052-DB` | **Status Audit Trigger** | Función Trigger PL/pgSQL `log_status_change` que inserta en `events` (old_status, new_status, user_id). | Cambio en `parts` genera fila en `events`. |

**Valoración:** 3 Story Points
**Dependencias:** US-005

---

### US-013: Login/Auth
**User Story:** Como **Usuario del Sistema**, quiero iniciar sesión con mi cuenta corporativa para acceder de forma segura a la información confidencial del proyecto.

**Criterios de Aceptación:**
*   **Scenario 1 (Successful Login):**
    *   Given estoy en `/login`.
    *   When introduzco credenciales válidas y pulso "Entrar".
    *   Then recibo un token de sesión.
    *   And soy redirigido automáticamente al Dashboard.
*   **Scenario 2 (Login Failed):**
    *   Given introduzco contraseña errónea.
    *   When intento entrar.
    *   Then veo mensaje "Credenciales inválidas" (sin revelar si existe el usuario).
    *   And sigo en la pantalla de login.
*   **Scenario 3 (Unauthorized Access):**
    *   Given no estoy logueado.
    *   When intento entrar a `/dashboard` directamente.
    *   Then soy interceptado y redirigido a `/login`.

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-060-FRONT` | **AuthProvider Context** | Contexto React global que inicializa `supabase.auth.onAuthStateChange`. Expone `session`, `user`, `loading`. | Login persiste al recargar página. |
| `T-061-FRONT` | **Protected Route Wrapper** | Componente `<RequireAuth>` que envuelve rutas privadas. Si `!session`, redirige a Login. | Dashboard inaccesible sin login. |
| `T-062-BACK` | **Auth Middleware (Guard)** | Dependencia FastAPI `get_current_user` que valida `Authorization: Bearer <token>` verificando firma JWT de Supabase. | Endpoints protegidos devuelven 401 si no hay token. |
| `T-063-INFRA` | **Supabase Auth Config** | Habilitar Email/Password en panel Supabase. Deshabilitar "Sign Up" público (solo invitación/admin). | Login funciona con usuario seed. |

**Valoración:** 3 Story Points
**Dependencias:** N/A (Transversal)

---

### US-009: Evidencia de Fabricación
**User Story:** Como **Responsable de Taller**, quiero adjuntar una foto de la pieza terminada antes de marcarla como "Completada", para dejar registro visual de calidad y trazabilidad física.

**Criterios de Aceptación:**
*   **Scenario 1 (Complete with Photo):**
    *   Given estoy en una pieza en estado `in_fabrication`.
    *   When selecciono estado `completed`.
    *   Then se abre un modal solicitando "Evidencia de Calidad".
    *   When subo una foto válida y confirmo.
    *   Then el estado cambia a `completed` y la foto queda guardada.
*   **Scenario 2 (Attempt without Photo):**
    *   Given estoy en el modal de completitud.
    *   When intento confirmar sin adjuntar archivo.
    *   Then el botón "Confirmar" está deshabilitado.
*   **Scenario 3 (File Upload Fail):**
    *   Given el upload de la foto falla por conexión.
    *   Then el cambio de estado NO se ejecuta (transacción atómica o rollback).
    *   And veo error "No se pudo subir la evidencia".

**Desglose de Tickets Técnicos:**
| ID Ticket | Título | Tech Spec | DoD |
|-----------|--------|-----------|-----|
| `T-070-FRONT` | **Evidence Completion Modal** | Modal que intercepta el cambio a `completed`. Contiene input file simple (mobile friendly). | Modal aparece solo al seleccionar "Completed". |
| `T-071-INFRA` | **Quality Control Bucket** | Bucket S3 `quality-control` con ACL confidencial. (Solo lectura para admins/auditores). | Configuración Terraform/Manual lista. |
| `T-072-BACK` | **Upload Evidence & Transition** | Endpoint `POST /api/parts/{id}/complete`. Recibe imagen (`multipart/form-data`). Sube a S3 -> Inserta en `attachments` -> Actualiza estado a `completed`. | Transacción OK: Foto en S3 y Estado cambiado. Fallo: Estado no cambia. |

**Valoración:** 5 Story Points
**Dependencias:** US-007

---

## 3. Icebox (Fuera de Alcance MVP)
Las siguientes historias quedan pospuestas para futuras iteraciones:
* **US-003, US-004:** Casos de borde de upload.
* **US-006:** Filtros avanzados.
* **US-008:** Bloqueo de permisos detallado (Testear solo básico).
* **US-011, US-012:** Fallbacks y Capturas de visor.
* **US-014:** Login error handling avanzado.

---

## ✅ Definition of Ready (DoR) - Global
Para que una historia de este backlog entre en el Sprint 0, debe cumplir:
1.  **Tech Spec Completa:** Tabla de tickets definida con librerías y endpoints.
2.  **UX Clara:** Criterios de aceptación visuales (Happy Path + Error).
3.  **Dependencias Resueltas:** La arquitectura base (S3/DB/Auth) está provisionada.
4.  **Estimación:** Story Points asignados.

**Status Final:** BACKLOG REFINADO Y APROBADO (2026-02-04). LISTO PARA CODING.
