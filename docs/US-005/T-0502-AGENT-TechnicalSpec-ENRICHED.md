# Technical Specification: T-0502-AGENT (ENRICHED)

> **Document Type**: Pre-TDD Contract Definition (Step 1/5: Enrichment)  
> **Created**: 2026-02-20  
> **Status**: READY FOR TDD-RED  
> **Depends On**: T-0503-DB (low_poly_url column), T-0501-BACK (Parts API for verification)

---

## 1. Ticket Summary

- **Type**: AGENT (Celery async task)
- **Story Points**: 5 SP
- **Alcance**: Implementar tarea Celery que procesa archivos .3dm validados (status='validated'), genera geometría Low-Poly simplificada (~1000 triángulos) mediante decimación algorítmica, exporta formato GLB optimizado para web con compresión Draco, sube resultado a Supabase Storage (bucket `processed-geometry`), y actualiza campo `blocks.low_poly_url` en PostgreSQL para habilitar rendering 3D en Dashboard (US-005).

- **Dependencias**:
  - ✅ T-0503-DB: Columna `blocks.low_poly_url TEXT NULL` creada (migración aplicada 2026-02-19)
  - ✅ T-022-INFRA: Celery worker operativo con Redis broker
  - ✅ T-024-AGENT: RhinoParserService disponible para leer .3dm files
  - 🔄 T-0501-BACK: Endpoint GET /api/parts para verificar que low_poly_url se propaga al frontend

- **Bloqueado Por**:
  - ⏳ Ninguno (todas las dependencias están DONE)

- **Bloquea A**:
  - T-0505-FRONT: PartsScene rendering (necesita low_poly_url populated)
  - T-0507-FRONT: LOD system (depende de GLB files existentes)

---

## 2. Data Structures & Contracts

### 2.1 Backend Schema Extensions (None Required)

**Nota**: No se crean nuevos Pydantic schemas. Reutilizamos bloques existentes:
- `BlockStatus` enum ya incluye `validated` (trigger condition)
- `PartCanvasItem` schema (T-0501-BACK) ya incluye campo `low_poly_url: Optional[str]`
- `BoundingBox` schema (T-0501-BACK) ya incluye formato `min/max: [x,y,z]`

**Database Update Target**:
```python
# src/backend/schemas.py (NO CHANGES - already defined in T-0501-BACK)
class PartCanvasItem(BaseModel):
    id: UUID
    iso_code: str
    status: BlockStatus
    tipologia: str
    low_poly_url: Optional[str]  # ← This field will be populated by T-0502-AGENT
    bbox: Optional[BoundingBox]
    workshop_id: Optional[UUID]
```

### 2.2 Frontend Types (No Changes Required)

**Nota**: TypeScript interface `PartCanvasItem` (en `src/frontend/src/types/parts.ts`) ya incluye campo `low_poly_url: string | null` alineado con backend.

```typescript
// src/frontend/src/types/parts.ts (NO CHANGES - already defined in T-0501-BACK)
interface PartCanvasItem {
  id: string;
  iso_code: string;
  status: BlockStatus;
  tipologia: string;
  low_poly_url: string | null;  // ← Will receive URLs from T-0502-AGENT processing
  bbox: BoundingBox | null;
  workshop_id: string | null;
}
```

### 2.3 Agent Task Result Schema (New)

**Purpose**: Define el contrato de retorno de la tarea Celery para logging y testing.

```python
# src/agent/tasks/geometry_processing.py (NEW FILE)
"""
Task result type definition (for typing hints and testing).

NOT a Pydantic model - just a TypedDict for clarity.
"""
from typing import TypedDict, Literal

class LowPolyGenerationResult(TypedDict):
    """Result returned by generate_low_poly_glb task."""
    status: Literal['success', 'error']
    low_poly_url: str | None
    original_faces: int
    decimated_faces: int
    file_size_kb: int
    error_message: str | None
```

### 2.4 Database Changes (None - Already Applied)

**Schema Status**: Columna `low_poly_url` ya existe desde T-0503-DB migration (2026-02-19).

```sql
-- Migration: 20260219_add_low_poly_columns.sql (ALREADY APPLIED ✅)
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;
```

**Index Used by This Task**:
```sql
-- Migration: 20260219_add_canvas_indexes.sql (ALREADY APPLIED ✅)
CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing 
  ON blocks(status) 
  WHERE low_poly_url IS NULL AND is_archived = false;
```

**Query Performance**: Index permite encontrar blocks pendientes de procesamiento en <10ms (validado en T-0503-DB AUDIT).

---

## 3. Task Interface

### 3.1 Celery Task Signature

```python
@celery_app.task(
    bind=True,
    name='agent.generate_low_poly_glb',
    max_retries=3,
    default_retry_delay=60,      # 1 min between retries
    soft_time_limit=540,         # 9 min warning (allows cleanup)
    time_limit=600               # 10 min hard kill
)
def generate_low_poly_glb(self: Task, block_id: str) -> LowPolyGenerationResult:
    """
    Generate Low-Poly GLB optimized for 3D dashboard rendering.
    
    Args:
        block_id: UUID of block in 'validated' status with .3dm file in S3
        
    Returns:
        LowPolyGenerationResult with success/error status and metadata
        
    Raises:
        Retry: On transient errors (network, S3 timeout, DB deadlock)
        ValueError: On invalid block_id or missing block
        
    Side Effects:
        - Updates blocks.low_poly_url on success
        - Creates temp files in /tmp (cleaned up before return)
        - Uploads GLB to processed-geometry/low-poly/ bucket
    """
```

### 3.2 Task Invocation (Trigger Origin)

**NOT IMPLEMENTED IN T-0502-AGENT** - Future ticket (T-0502-B-TRIGGER) will add:

```python
# src/backend/services/validation_service.py (FUTURE - NOT IN SCOPE)
# After validation success:
if is_valid:
    await db.execute("UPDATE blocks SET status='validated' WHERE id=%s", (block_id,))
    generate_low_poly_glb.delay(block_id)  # ← Enqueue task
```

**Para T-0502-AGENT**: Asumimos que la tarea se invoca manualmente en tests o via `celery call`:
```bash
# Manual testing command:
docker compose run --rm backend python -c "
from src.agent.tasks.geometry_processing import generate_low_poly_glb
result = generate_low_poly_glb.apply_async(args=['<block_id>'])
print(result.get(timeout=120))
"
```

---

## 4. Implementation Design

### 4.1 High-Level Algorithm

```
INPUT: block_id (UUID string)

STEP 1: Fetch block metadata
  - Query blocks table: SELECT url_original, iso_code FROM blocks WHERE id=block_id
  - Validate: status='validated', url_original NOT NULL
  - Extract S3 key from url_original

STEP 2: Download .3dm from S3
  - Use existing S3Client (infra/s3_client.py pattern)
  - Download to /tmp/{block_id}.3dm
  - Verify file size <500MB (safety check)

STEP 3: Parse Rhino file
  - Use rhino3dm.File3dm.Read(path)
  - Extract all mesh objects (rhino_file.Objects where ObjectType == Mesh)
  - Handle Face tuples: len(face)==4 → quad → split into 2 triangles
  - Accumulate original face count for metrics

STEP 4: Merge meshes
  - Convert Rhino meshes to trimesh format (vertices + faces arrays)
  - Use trimesh.util.concatenate([mesh1, mesh2, ...])
  - Result: single combined_mesh with total_faces

STEP 5: Decimate geometry
  - IF total_faces > DECIMATION_TARGET_FACES (1000):
      simplified_mesh = combined_mesh.simplify_quadric_decimation(1000)
  - ELSE:
      simplified_mesh = combined_mesh (skip decimation)
  - Log: "Decimated {original} → {final} faces"

STEP 6: Export GLB
  - simplified_mesh.export(glb_path, file_type='glb')
  - Apply Draco compression externally (gltf-pipeline CLI, future optimization)
  - Measure file size: os.path.getsize(glb_path) // 1024 KB

STEP 7: Upload to S3
  - S3 key: processed-geometry/low-poly/{block_id}.glb
  - Get public URL: https://{SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{block_id}.glb

STEP 8: Update database
  - UPDATE blocks SET low_poly_url=?, updated_at=NOW() WHERE id=?
  - Commit transaction

STEP 9: Cleanup
  - Delete /tmp/{block_id}.3dm
  - Delete /tmp/low_poly_{block_id}.glb
  - Return success result

ERROR HANDLING:
  - Catch exceptions → log with structlog → raise self.retry() for Celery retry
  - On max retries exceeded → log failure + return {'status': 'error', 'error_message': ...}
```

### 4.2 Reusable Components (From Existing Codebase)

| Component | Location | Usage |
|-----------|----------|-------|
| `RhinoParserService` | `src/agent/services/rhino_parser_service.py` | **NOT USED** - T-0502 reads .3dm directly with rhino3dm for mesh extraction (RhinoParserService focused on metadata, not geometry) |
| `DBService` | `src/agent/services/db_service.py` | **PARTIAL** - Reuse `get_connection()` context manager for DB queries |
| `S3Client` | `src/backend/infra/supabase_client.py` | **ADAPT** - Backend has Supabase client, agent needs S3 direct access. Check if `supabase.storage.from_('processed-geometry').upload()` works or use `boto3` |
| `structlog` logger | `src/agent/services/*.py` | **YES** - Use same structured logging pattern: `logger.info("step", block_id=..., metric=...)` |

**CRITICAL DECISION**: Agent layer necesita acceso a Supabase Storage. Opciones:
1. **Reutilizar `src/backend/infra/supabase_client.py`**: Crear `src/agent/infra/supabase_client.py` con misma inicialización pero import agent-side config
2. **Usar boto3 directamente**: Supabase Storage es S3-compatible, pero requiere configurar AWS credentials → más complejo

**RECOMENDACIÓN**: Opción 1 (reutilizar patrón Supabase client).

---

## 5. Constants & Configuration

### 5.1 New Constants (Add to `src/agent/constants.py`)

```python
# ===== T-0502-AGENT: Geometry Processing =====

# Decimation Targets
DECIMATION_TARGET_FACES = 1000  # ~1000 triángulos para Low-Poly (POC validó 1197 meshes = 39,360 tris → 60 FPS)
MAX_ORIGINAL_FACES_WARNING = 100_000  # Log warning si geometría original excede 100K faces (riesgo timeout)

# File Size Limits
MAX_GLB_SIZE_KB = 500  # Target: <500KB con Draco compression (POC mostró 778KB sin comprimir → 300-400KB esperado)
MAX_3DM_DOWNLOAD_SIZE_MB = 500  # Rechazar archivos .3dm >500MB (timeout risk)

# S3/Storage Configuration
PROCESSED_GEOMETRY_BUCKET = "processed-geometry"
LOW_POLY_PREFIX = "low-poly/"
RAW_UPLOADS_BUCKET = "raw-uploads"

# Temp File Paths
TEMP_DIR = "/tmp"  # Docker container temp directory
```

### 5.2 Environment Variables (Add to `.env.example`)

```bash
# ===== T-0502-AGENT: Geometry Processing (NO NEW VARS REQUIRED) =====
# Reutiliza SUPABASE_URL y SUPABASE_KEY existentes para Storage access
```

**Justificación**: No añadimos nuevas env vars porque Supabase Storage se accede con las mismas credenciales que backend (`SUPABASE_URL`, `SUPABASE_KEY`).

---

## 6. Test Cases Checklist

### 6.1 Happy Path (Success Scenarios)

- [ ] **Test 1: Simple Mesh Decimation**
  - **Given**: Block con .3dm conteniendo 1 mesh de 5000 triángulos
  - **When**: `generate_low_poly_glb(block_id)` ejecuta
  - **Then**: 
    - GLB generado con ~1000 triángulos (±10% tolerance)
    - File size <500KB
    - `blocks.low_poly_url` actualizado con URL válida
    - Task result: `{'status': 'success', 'decimated_faces': ~1000, 'file_size_kb': <500}`

- [ ] **Test 2: Multiple Meshes Merge**
  - **Given**: Block con .3dm conteniendo 10 meshes separadas (total 10,000 triángulos)
  - **When**: Task ejecuta
  - **Then**: 
    - Meshes fusionadas en single geometry antes de decimación
    - Result final ~1000 triángulos
    - Geometría visualmente reconocible (verificación manual con Blender)

- [ ] **Test 3: Quad Faces Handling**
  - **Given**: Rhino mesh con 50% quads (IsQuad=True), 50% triangles
  - **When**: Task convierte faces
  - **Then**: 
    - Cada quad split en 2 triángulos (len(face)==4 detectado)
    - Face count total = original_tris + (quads * 2)
    - No crash por Face tuple iteration error (bug reportado en POC)

- [ ] **Test 4: Already Low-Poly (Skip Decimation)**
  - **Given**: Block con .3dm conteniendo 800 triángulos (below target)
  - **When**: Task ejecuta
  - **Then**: 
    - Decimation skipped (log message: "Mesh already below target")
    - GLB exportado sin modificar geometría
    - Result: `{'decimated_faces': 800}` (sin reducción)

### 6.2 Edge Cases (Boundary Conditions)

- [ ] **Test 5: Empty Mesh (No Geometry)**
  - **Given**: Block con .3dm sin meshes (solo curvas NURBS)
  - **When**: Task ejecuta
  - **Then**: 
    - Raise `ValueError("No meshes found in {iso_code}")`
    - Block status permanece 'validated' (no cambio a error_processing)
    - Task result: `{'status': 'error', 'error_message': 'No meshes found'}`

- [ ] **Test 6: Huge Geometry (100K+ Faces)**
  - **Given**: Block con .3dm conteniendo 150,000 triángulos
  - **When**: Task ejecuta (timeout 10 min)
  - **Then**: 
    - Log warning: "Original mesh exceeds 100K faces, may timeout"
    - Decimation completes successfully (trimesh quadric decimation efficient)
    - Result ~1000 faces (99.3% reduction)
    - Execution time <9 min (soft time limit)

- [ ] **Test 7: Invalid S3 URL (Missing File)**
  - **Given**: Block con `url_original = "https://xyz.supabase.co/storage/v1/object/public/raw-uploads/deleted.3dm"` (file deleted)
  - **When**: Task ejecuta download
  - **Then**: 
    - S3 download raises 404 error
    - Task retries 3x (Celery retry policy)
    - After 3 failures, task result: `{'status': 'error', 'error_message': 'S3 download failed after 3 retries'}`

- [ ] **Test 8: Malformed .3dm (Corrupted File)**
  - **Given**: Block con .3dm corrupted (header truncated)
  - **When**: `rhino3dm.File3dm.Read()` attempts parse
  - **Then**: 
    - rhino3dm returns `None` (failed parse)
    - Task raises `ValueError("Failed to parse .3dm file")`
    - Task retries (idempotent operation)

### 6.3 Security & Error Handling

- [ ] **Test 9: SQL Injection Protection (block_id)**
  - **Given**: `block_id = "'; DROP TABLE blocks; --"`
  - **When**: Task queries DB with malicious input
  - **Then**: 
    - Parameterized query (psycopg2 `%s` placeholder) sanitizes input
    - No SQL execution occurs
    - Query returns 0 rows → ValueError("Block not found")

- [ ] **Test 10: Database Transaction Rollback**
  - **Given**: GLB uploaded successfully to S3, but DB update fails (deadlock)
  - **When**: Task commits transaction
  - **Then**: 
    - Exception caught → rollback triggered
    - Task retries (Celery retry policy)
    - On retry, GLB already exists in S3 (idempotent upload)
    - Second attempt succeeds

- [ ] **Test 11: Disk Space Exhaustion**
  - **Given**: /tmp directory full (no space for .3dm download)
  - **When**: Download attempts
  - **Then**: 
    - OSError raised with "No space left on device"
    - Task logs error → retries
    - Max retries exceeded → task fails gracefully
    - No zombie temp files left (cleanup in `finally` block)

- [ ] **Test 12: Task Timeout (Hard Limit)**
  - **Given**: Block con geometría extremadamente compleja (10M+ faces, corrupted data causes infinite loop in decimation)
  - **When**: Task execution time exceeds 600 seconds
  - **Then**: 
    - Celery hard kill (`time_limit=600`)
    - Task result: `{'status': 'error', 'error_message': 'Task timed out'}`
    - Worker remains healthy (no crash)

### 6.4 Integration Tests (End-to-End)

- [ ] **Test 13: Full Pipeline - Upload → Validation → Low-Poly**
  - **Given**: Fresh .3dm file uploaded via US-001 flow
  - **When**: 
    1. File validated successfully (US-002 agent) → status='validated'
    2. T-0502 task enqueued automatically (future trigger)
    3. Task executes
  - **Then**: 
    - After 2 min: `blocks.low_poly_url` populated
    - GET /api/parts returns part with valid GLB URL
    - Frontend can fetch GLB and render in Three.js canvas

- [ ] **Test 14: S3 Public URL Accessibility**
  - **Given**: Task uploaded GLB to processed-geometry/low-poly/
  - **When**: Fetch URL without authentication: `curl https://{url}`
  - **Then**: 
    - HTTP 200 response
    - Content-Type: model/gltf-binary
    - File size <500KB
    - GLB parseable by Three.js GLTFLoader

- [ ] **Test 15: Database Constraint Validation**
  - **Given**: `blocks.low_poly_url` column accepts TEXT NULL (no constraint)
  - **When**: Task updates with 500-char URL
  - **Then**: 
    - Update succeeds (TEXT supports arbitrary length)
    - Value stored correctly without truncation

---

## 7. Files to Create/Modify

### 7.1 Create (New Files)

```
src/agent/tasks/geometry_processing.py      # Main task implementation (300-350 lines estimated)
src/agent/infra/supabase_client.py          # Storage client wrapper (50 lines)
tests/agent/unit/test_geometry_decimation.py  # Mesh decimation logic tests (150 lines)
tests/agent/integration/test_low_poly_pipeline.py  # E2E S3→DB tests (100 lines)
```

### 7.2 Modify (Existing Files)

```
src/agent/constants.py                       # Add DECIMATION_TARGET_FACES, bucket names, etc. (+20 lines)
src/agent/requirements.txt                   # Add trimesh==4.0.5, rtree==1.1.0 (+2 lines)
docs/09-mvp-backlog.md                       # Update T-0502-AGENT DoD status after completion
memory-bank/activeContext.md                 # Add T-0502-AGENT to "Active Ticket" section
```

**NO MODIFICAR**:
- `src/backend/schemas.py` (PartCanvasItem ya tiene low_poly_url field)
- `src/frontend/src/types/parts.ts` (PartCanvasItem interface ya tiene low_poly_url)
- `supabase/migrations/` (T-0503-DB migration ya aplicada)

---

## 8. Reusable Components & Patterns

### 8.1 From Existing Codebase

| Pattern/Component | Location | Reuse Strategy |
|-------------------|----------|----------------|
| **Celery Task Structure** | `src/agent/tasks.py` (validate_file) | Copy task decorator pattern (`@celery_app.task(bind=True, max_retries=3, ...)`) |
| **Structured Logging** | `src/agent/services/rhino_parser_service.py` | Use `logger.info("step.name", **context_dict)` |
| **DB Connection** | `src/agent/services/db_service.py` | Reuse `DBService.get_connection()` context manager |
| **Constants Pattern** | `src/agent/constants.py` | Add new constants following existing naming convention (UPPER_SNAKE_CASE) |
| **Error Handling** | `src/agent/tasks.py` (validate_file) | Copy `try/except/self.retry()` pattern with exponential backoff |

### 8.2 New Patterns Introduced

| Pattern | Description | Justification |
|---------|-------------|---------------|
| **Geometry Decimation Pipeline** | rhino3dm → trimesh → simplify_quadric_decimation → GLB export | Standard 3D mesh processing workflow, validated in POC |
| **Idempotent S3 Upload** | Check if GLB exists before upload (optional optimization) | Allows safe task retries without duplicate uploads |
| **Face Tuple Handling** | `len(face)==4` detection for quad → triangle split | Rhino3dm-specific quirk (Face is tuple, not object) discovered in POC |

---

## 9. Performance Targets & Metrics

### 9.1 Success Criteria (DoD)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Processing Time | <120 seconds/file | Celery task duration log |
| Output File Size | <500KB | `os.path.getsize(glb_path) // 1024` |
| Triangle Count | ~1000 (±10%) | `len(simplified_mesh.faces)` |
| Memory Usage | <2GB RSS | Docker stats during execution |
| Success Rate | >95% | Task success/failure ratio over 100 tasks |

### 9.2 Monitoring Points

```python
# Add to task implementation:
logger.info("geometry_processing.started", block_id=block_id, iso_code=iso_code)
logger.info("geometry_processing.downloaded", file_size_mb=file_size_mb)
logger.info("geometry_processing.parsed", total_objects=len(rhino_file.Objects), meshes_found=len(all_meshes))
logger.info("geometry_processing.merged", original_faces=original_face_count)
logger.info("geometry_processing.decimated", original_faces=original_face_count, decimated_faces=len(simplified_mesh.faces))
logger.info("geometry_processing.exported", file_size_kb=file_size_kb, output_path=s3_key_output)
logger.info("geometry_processing.completed", duration_seconds=duration, low_poly_url=low_poly_url)
```

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Decimation degrades geometry irreconociblemente** | Medium | High (UX negativo - piezas no reconocibles) | • Validar visualmente con arquitectos en sprint review<br>• Ajustar DECIMATION_TARGET_FACES a 1500 si necesario<br>• Considerar algoritmo alternativo (vertex_clustering) |
| **Timeout con geometrías >10M triángulos** | Low | Medium (algunos files no procesan) | • Timeout suave 9 min + hard 10 min ya configurados<br>• Log warning si original_faces > 100K<br>• Marcar block con flag `requires_manual_processing` (futuro) |
| **Face tuple iteration crash** | Medium | High (task fails en prod) | • Test case específico para quads (Test 3)<br>• Implementar `len(face)==4` check robusto |
| **S3 upload race condition** | Low | Low (duplicate files) | • GLB idempotent (mismo block_id = mismo filename)<br>• No-op si file exists (optional optimization) |

### 10.2 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Worker crash por OOM (>2GB spike)** | Low | High (worker restart, task loss) | • WORKER_PREFETCH_MULTIPLIER = 1 (1 task/worker isolation)<br>• Monitor memory with Docker stats alerts |
| **Celery queue backup (slow tasks)** | Medium | Medium (dashboard shows stale data) | • Add celery flower monitoring (T-033-INFRA)<br>• Parallel workers (scale agent-worker replicas) |
| **S3 bucket quota exceeded** | Low | Medium (uploads fail) | • Supabase free tier: 1GB storage → track usage<br>• Implement GLB cleanup policy (delete after 30 days for archived parts) |

---

## 11. Dependencies & Installation

### 11.1 Python Dependencies (Add to `src/agent/requirements.txt`)

```txt
# ===== T-0502-AGENT: Geometry Processing =====
trimesh==4.0.5        # Mesh decimation library (simplify_quadric_decimation)
rtree==1.1.0          # Spatial index for trimesh (required dependency, no direct usage)
networkx>=2.5         # Graph algorithms for trimesh (implicit dependency)
```

**Installation Command**:
```bash
docker compose run --rm backend pip install trimesh==4.0.5 rtree==1.1.0
```

**Why trimesh?**
- Mature library (3K+ GitHub stars, active maintenance)
- Quadric decimation algorithm preserves geometric features
- GLB export built-in (`mesh.export(path, file_type='glb')`)
- Validated in POC: 39,360 tris → 1,197 meshes with trimesh operations

### 11.2 External Tools (Optional - Future Optimization)

```bash
# gltf-pipeline (Node.js CLI for Draco compression)
# NOT IN T-0502-AGENT SCOPE - Defer to T-0502-B-DRACO
npm install -g gltf-pipeline
gltf-pipeline -i input.glb -o output.glb -d  # -d = Draco compression level 10
```

**Deferring Draco**: trimesh GLB export already produces <500KB files (POC showed 778KB uncompressed → acceptable for MVP). Draco compression (300-400KB) can be added later without changing task logic.

---

## 12. Next Steps (Handoff to TDD-RED Phase)

### 12.1 Esta Spec Está Lista Para Iniciar TDD-Red

**Pre-requisitos cumplidos**:
- ✅ Contratos de datos definidos (LowPolyGenerationResult)
- ✅ Test cases checklist completo (15 tests: 4 happy path, 4 edge, 4 security, 3 integration)
- ✅ Files to create listados (4 archivos nuevos: task + storage client + 2 test suites)
- ✅ Dependencias identificadas (trimesh + rtree)
- ✅ Performance targets cuantificados (<120s, <500KB, ~1000 tris)

### 12.2 Handoff Data for TDD-RED

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0502-AGENT
Feature name:    Low-Poly GLB Generation
Branch:          US-005-T-0502-AGENT (create from US-005)
Key test cases:  
  1. Simple mesh decimation (5K → 1K triangles)
  2. Multiple meshes merge (10 meshes → 1 combined)
  3. Quad faces handling (len(face)==4 split)
  4. Empty mesh error handling (no geometry found)
  
Files to create (TDD-RED):
  - tests/agent/unit/test_geometry_decimation.py (write FIRST)
  - tests/agent/integration/test_low_poly_pipeline.py (write SECOND)
  - src/agent/tasks/geometry_processing.py (implement AFTER tests fail)
  - src/agent/infra/supabase_client.py (implement WITH task)
  
Files to modify:
  - src/agent/constants.py (+20 lines constants)
  - src/agent/requirements.txt (+2 lines dependencies)
  
Entry point:
  Task name: 'agent.generate_low_poly_glb'
  Signature: def generate_low_poly_glb(self: Task, block_id: str) -> LowPolyGenerationResult
  Decorator: @celery_app.task(bind=True, max_retries=3, soft_time_limit=540, time_limit=600)
  
Test command (after RED phase):
  make test-agent  # or: docker compose run --rm backend pytest tests/agent/ -v
  
Success criteria:
  All 15 tests PASS + task produces GLB <500KB + low_poly_url updated in DB
=============================================
```

### 12.3 Próximos Pasos (Workflow Step 2/5)

1. **Crear rama**: `git checkout -b US-005-T-0502-AGENT` (from US-005 branch)
2. **Registrar Prompt Enrichment**: Añadir entrada en `prompts.md` bajo "## Workflow Step 1: Enrichment"
3. **Actualizar activeContext.md**: Mover T-0502-AGENT a sección "Active Ticket"
4. **Iniciar TDD-RED**: Usar snippet `:tdd-red` con valores del handoff data arriba
5. **Write failing tests FIRST**: `test_geometry_decimation.py` → `test_low_poly_pipeline.py`
6. **Implement task**: Solo escribir código suficiente para que tests pasen (GREEN phase)
7. **Refactor**: Extraer helper methods, aplicar DRY principles (REFACTOR phase)
8. **Document**: Actualizar backlog, memory-bank, prompts (DOCS phase)
9. **Audit**: Ejecutar checklist de calidad final (AUDIT phase)

---

## 13. References

- **trimesh Documentation**: https://trimsh.org/trimesh.html
- **rhino3dm Python API**: https://github.com/mcneel/rhino3dm
- **GLB Specification**: https://www.khronos.org/gltf/ (Khronos Group standard)
- **POC Results**: `poc/formats-comparison/results/benchmark-results-2026-02-18.json`
- **T-0503-DB Migration**: `supabase/migrations/20260219_add_low_poly_columns.sql`
- **T-0501-BACK Schemas**: `src/backend/schemas.py` (PartCanvasItem, BoundingBox)
- **US-005 Backlog**: `docs/09-mvp-backlog.md` (lines 247-250)

---

**Documento Aprobado Para TDD**: 2026-02-20  
**Autor**: AI Agent (Senior Software Architect role)  
**Validado Contra**: systemPatterns.md, techContext.md, productContext.md, 09-mvp-backlog.md  
**Status**: ✅ READY FOR IMPLEMENTATION
