# Technical Specification: T-029-BACK

## 1. Ticket Summary
- **Tipo:** BACK
- **Alcance:** Modificar `POST /api/upload/confirm` para crear un registro `blocks`, encolar tarea Celery `validate_file`, y retornar `task_id` al frontend.
- **Dependencias:** T-004-BACK (confirm endpoint) ✅, T-022-INFRA (Redis + Celery) ✅, T-028-BACK (ValidationReportService) ✅
- **Spec del backlog:** "Después de crear evento, ejecutar `celery_app.send_task('agent.tasks.validate_file', args=[part_id, s3_key])`. Actualizar estado a `processing`."

## 2. Analisis del Problema

### Flujo actual (T-004-BACK)
```
Frontend → POST /api/upload/confirm { file_id, file_key }
  → UploadService.confirm_upload()
    → 1. verify_file_exists_in_storage(file_key)
    → 2. create_upload_event(file_id, file_key)
    → return (success, event_id, error)
  → Response { success, message, event_id, task_id: null }
```

### Flujo propuesto (T-029-BACK)
```
Frontend → POST /api/upload/confirm { file_id, file_key }
  → UploadService.confirm_upload()
    → 1. verify_file_exists_in_storage(file_key)    [EXISTING]
    → 2. create_upload_event(file_id, file_key)      [EXISTING]
    → 3. create_block_record(file_id, file_key)      [NEW]
    → 4. enqueue_validation(block_id, file_key)      [NEW]
    → return (success, event_id, task_id, error)
  → Response { success, message, event_id, task_id: "celery-uuid" }
```

### Decision clave: Crear block antes de encolar

El task `validate_file(part_id, s3_key)` ejecuta `db_service.update_block_status(part_id, "processing")` como primer paso. **El bloque DEBE existir en DB antes de enviar la tarea.** Por esto, T-029-BACK crea el registro `blocks` con datos minimos, y el agent lo enriquece despues.

Campos del bloque al crearlo:
- `id`: UUID auto-generado
- `iso_code`: `"PENDING-{file_id[:8]}"` (temporal, el agent lo actualiza post-validacion)
- `tipologia`: `"pending"` (temporal, el agent lo actualiza)
- `status`: `"uploaded"` (default del enum — el task lo cambia a `processing`)
- `url_original`: `file_key` (ruta S3 del .3dm)

## 3. Data Structures & Contracts

### Backend Schemas (Pydantic) — SIN CAMBIOS
Los schemas existentes ya soportan `task_id`:

```python
# src/backend/schemas.py (NO MODIFICAR)
class ConfirmUploadRequest(BaseModel):
    file_id: str
    file_key: str

class ConfirmUploadResponse(BaseModel):
    success: bool
    message: str
    event_id: Optional[str] = None
    task_id: Optional[str] = None    # ← Ya existe, actualmente retorna None
```

### Frontend Types (TypeScript) — SIN CAMBIOS
```typescript
// src/frontend/src/types/upload.ts (NO MODIFICAR)
interface ConfirmUploadResponse {
  success: boolean;
  message: string;
  event_id?: string;
  task_id?: string;    // ← Ya existe, actualmente undefined
}
```

### Constants (Backend) — AGREGAR
```python
# src/backend/constants.py (AGREGAR)

# ===== Celery Task Names =====
TASK_VALIDATE_FILE = "agent.tasks.validate_file"

# ===== Block Defaults =====
BLOCK_TIPOLOGIA_PENDING = "pending"
BLOCK_ISO_CODE_PREFIX = "PENDING"
```

### Database Changes — NINGUNO
La tabla `blocks` y el enum `block_status` ya existen con la estructura necesaria.

## 4. API Interface — SIN CAMBIOS EN CONTRATO

- **Endpoint:** `POST /api/upload/confirm` (existente)
- **Auth:** Public (MVP — auth se agrega en US-013)
- **Request:** Sin cambios
  ```json
  { "file_id": "550e8400-e29b-41d4-a716-446655440000", "file_key": "uploads/550e8400/model.3dm" }
  ```
- **Response 200 (ANTES):**
  ```json
  { "success": true, "message": "Upload confirmed successfully", "event_id": "uuid", "task_id": null }
  ```
- **Response 200 (DESPUES):**
  ```json
  { "success": true, "message": "Upload confirmed and validation enqueued", "event_id": "uuid", "task_id": "celery-task-uuid" }
  ```
- **Response 404:** Sin cambios (file not found in storage)
- **Response 500:** Sin cambios (database error)
- **Response 500 (NUEVO caso):** `{ "detail": "Failed to enqueue validation task" }`

## 5. Component Design

### A. Nuevo: `src/backend/infra/celery_client.py`
Singleton pattern (igual que `supabase_client.py`):

```python
# Pseudocode — NO implementar todavia
_celery_client = None

def get_celery_client() -> Celery:
    """Create/return singleton Celery client for sending tasks."""
    # Read CELERY_BROKER_URL from environment
    # Configure JSON serialization
    # Return cached client
```

### B. Modificar: `src/backend/services/upload_service.py`

**Constructor** — agregar celery_client opcional:
```python
def __init__(self, supabase_client, celery_client=None):
    self.supabase = supabase_client
    self.celery = celery_client
```

**Nuevo metodo** `create_block_record(file_id, file_key) -> str`:
```
1. Generar iso_code temporal: f"PENDING-{file_id[:8]}"
2. INSERT INTO blocks (iso_code, tipologia, url_original, status)
   VALUES (temp_iso_code, "pending", file_key, "uploaded")
3. Return block_id (UUID generado por DB)
```

**Nuevo metodo** `enqueue_validation(block_id, file_key) -> str`:
```
1. celery.send_task(TASK_VALIDATE_FILE, args=[block_id, file_key])
2. Return task.id (Celery task UUID)
```

**Modificar** `confirm_upload()`:
- Return type: `Tuple[bool, Optional[str], Optional[str], Optional[str]]` → `(success, event_id, task_id, error)`
- Step 3 (NEW): create_block_record
- Step 4 (NEW): enqueue_validation
- Si el enqueue falla, NO hacer rollback del evento/bloque — el bloque queda en status `uploaded` y puede re-encolarse manualmente

### C. Modificar: `src/backend/api/upload.py`

- Inyectar celery_client en UploadService
- Actualizar destructuring del return tuple (ahora incluye task_id)
- Cambiar `task_id=None` por `task_id=task_id`
- Actualizar mensaje de success

### D. Modificar: `docker-compose.yml`

- Backend service: agregar `depends_on.redis.condition: service_healthy`
- Backend service: agregar env var `CELERY_BROKER_URL` (ya disponible via `.env`)

## 6. Test Cases Checklist

### Happy Path
- [ ] Test 1: Confirm upload returns `task_id` (not null) cuando archivo existe en S3
- [ ] Test 2: Block record creado en tabla `blocks` con status `uploaded` y iso_code `PENDING-*`
- [ ] Test 3: Celery task encolada correctamente (verificar via mock o Redis inspect)

### Edge Cases
- [ ] Test 4: Confirm upload con `file_key` inexistente retorna 404 (sin crear block ni task)
- [ ] Test 5: Segundo confirm del mismo `file_id` crea otro block (iso_code unique via UUID slice)
- [ ] Test 6: Block record tiene `url_original` = file_key y `tipologia` = "pending"

### Security/Errors
- [ ] Test 7: Si Celery broker no disponible, retorna 500 con error descriptivo
- [ ] Test 8: Si INSERT blocks falla (DB error), retorna 500 sin encolar task
- [ ] Test 9: Payload invalido (missing fields) retorna 422 (existente, no-regression)

### Integration
- [ ] Test 10: Full flow — confirm → block creado → task encolada → task ejecuta → block status cambia a `processing` (requiere Celery eager mode)

## 7. Files to Create/Modify

**Create:**
- `src/backend/infra/celery_client.py` — Singleton Celery client

**Modify:**
- `src/backend/constants.py` → Agregar `TASK_VALIDATE_FILE`, `BLOCK_TIPOLOGIA_PENDING`, `BLOCK_ISO_CODE_PREFIX`
- `src/backend/services/upload_service.py` → Agregar `create_block_record()`, `enqueue_validation()`, modificar `confirm_upload()` return tuple
- `src/backend/api/upload.py` → Inyectar celery_client, usar task_id del return tuple
- `docker-compose.yml` → Backend depends_on redis

**Tests (TDD-Red):**
- `tests/unit/test_upload_service_enqueue.py` — Unit tests para nuevos metodos (mock Celery + Supabase)
- `tests/integration/test_confirm_upload_enqueue.py` — Integration test del flow completo

## 8. Reusable Components/Patterns

| Existente | Reutilizado para |
|---|---|
| `infra/supabase_client.py` (singleton) | Patron para `infra/celery_client.py` |
| `UploadService` (Clean Architecture) | Agregar metodos al service existente |
| `constants.py` (backend) | Agregar task name y block defaults |
| `ConfirmUploadResponse.task_id` | Ya definido en schema, solo cambiar de null a valor |
| `TABLE_BLOCKS` constant | Ya existe en constants.py |
| `conftest.py::celery_eager_mode` | Fixture para integration tests con Celery |

## 9. Diagrama de Secuencia

```
Frontend                Backend (API)           Backend (Service)        Redis/Celery           Agent Worker
   |                        |                        |                       |                      |
   |-- POST /confirm ------>|                        |                       |                      |
   |                        |-- confirm_upload() --->|                       |                      |
   |                        |                        |-- verify_file ------->|                      |
   |                        |                        |<-- file exists -------|                      |
   |                        |                        |-- create_event ------>|                      |
   |                        |                        |<-- event_id ---------|                      |
   |                        |                        |-- create_block ------>|                      |
   |                        |                        |<-- block_id ---------|                      |
   |                        |                        |-- send_task -------->|                      |
   |                        |                        |<-- task_id ----------|                      |
   |                        |<-- (ok, eid, tid, _) --|                       |                      |
   |<-- 200 {task_id} ------|                        |                       |                      |
   |                        |                        |                       |-- validate_file --->|
   |                        |                        |                       |                      |-- update status(processing)
   |                        |                        |                       |                      |-- download .3dm
   |                        |                        |                       |                      |-- parse + validate
   |                        |                        |                       |                      |-- save report
   |                        |                        |                       |                      |-- update status(validated)
```

## 10. Next Steps

Esta spec esta lista para iniciar TDD-Red.

```
=============================================
READY FOR TDD-RED PHASE
=============================================
Ticket ID:       T-029-BACK
Feature name:    Trigger Validation from Confirm Endpoint
Key test cases:
  1. confirm upload returns task_id (not null)
  2. block record created with PENDING iso_code
  3. celery task enqueued (mock/eager)
  4. file not found → 404 (no block, no task)
Files to create:
  - src/backend/infra/celery_client.py
  - tests/unit/test_upload_service_enqueue.py
  - tests/integration/test_confirm_upload_enqueue.py
Files to modify:
  - src/backend/constants.py
  - src/backend/services/upload_service.py
  - src/backend/api/upload.py
  - docker-compose.yml
=============================================
```
