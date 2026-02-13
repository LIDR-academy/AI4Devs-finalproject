# Technical Specification: T-028-BACK - Validation Report Service

**Fecha:** 2026-02-14
**Ticket ID:** T-028-BACK
**Status:** Enrichment Complete - Ready for TDD-Red

---

## 1. Ticket Summary

- **Tipo:** BACK (Backend Service Layer)
- **Alcance:** Crear servicio para construir reportes de validación completos y persistirlos en la base de datos. Orquesta resultados de validadores individuales (T-026-AGENT, T-027-AGENT) y los combina en un `ValidationReport` estructurado que se almacena en la columna JSONB `blocks.validation_report`.
- **Dependencias:** 
  - T-020-DB ✅ (Columna `validation_report` JSONB ya existe)
  - T-023-TEST ✅ (Schemas `ValidationErrorItem`, `ValidationReport` ya definidos)
  - T-026-AGENT ✅ (NomenclatureValidator implementado)
  - T-027-AGENT ✅ (GeometryValidator implementado)

---

## 2. Data Structures & Contracts

### Backend Schema (Pydantic)

**NOTA**: Los schemas `ValidationErrorItem` y `ValidationReport` **YA EXISTEN** en `src/backend/schemas.py` (creados en T-023-TEST). **NO** se crearán nuevos schemas.

**Reutilización de schemas existentes:**

```python
# src/backend/schemas.py (YA EXISTENTE - NO MODIFICAR)
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ValidationErrorItem(BaseModel):
    """Single validation error (YA EXISTENTE)"""
    category: str  # "nomenclature", "geometry", "io"
    target: Optional[str]  # Layer name, object ID, etc.
    message: str  # Human-readable error description

class ValidationReport(BaseModel):
    """Complete validation report (YA EXISTENTE)"""
    is_valid: bool
    errors: List[ValidationErrorItem]
    metadata: Dict[str, Any]
    validated_at: Optional[datetime]
    validated_by: Optional[str]
```

**Nuevo Service (a crear en este ticket):**

```python
# src/backend/services/validation_report_service.py (CREAR NUEVO)
from typing import List, Dict, Any, Tuple
from datetime import datetime
from supabase import Client

from schemas import ValidationErrorItem, ValidationReport

class ValidationReportService:
    """
    Service for creating and persisting validation reports.
    
    Responsibilities:
    - Combine validation errors from multiple validators
    - Build complete ValidationReport with metadata
    - Persist report to blocks.validation_report (JSONB column)
    - Retrieve existing reports for a given block
    """
    
    def __init__(self, supabase_client: Client):
        """Initialize with Supabase client for DB access."""
        self.supabase = supabase_client
    
    def create_report(
        self,
        errors: List[ValidationErrorItem],
        metadata: Dict[str, Any],
        validated_by: str = "agent-worker"
    ) -> ValidationReport:
        """
        Create a ValidationReport from validation results.
        
        Args:
            errors: List of validation errors from validators
            metadata: Extracted metadata (user strings, layer info, etc.)
            validated_by: Identifier of the validator (default: "agent-worker")
            
        Returns:
            Complete ValidationReport with timestamp
            
        Logic:
            - is_valid = True if errors list is empty, False otherwise
            - validated_at = current UTC datetime
            - All fields populated according to ValidationReport schema
        """
        ...
    
    def save_to_db(
        self,
        block_id: str,
        report: ValidationReport
    ) -> Tuple[bool, Optional[str]]:
        """
        Persist validation report to database.
        
        Args:
            block_id: UUID of the block record to update
            report: ValidationReport to persist
            
        Returns:
            Tuple of (success: bool, error_message: Optional[str])
            - (True, None) if save successful
            - (False, error_msg) if save failed
            
        Implementation:
            1. Serialize ValidationReport to dict using .model_dump()
            2. Execute UPDATE blocks SET validation_report = ... WHERE id = block_id
            3. Verify update affected exactly 1 row (block exists)
            4. Return success status
            
        Error Handling:
            - Block ID not found → (False, "Block not found")
            - Database error → (False, str(exception))
            - Success → (True, None)
        """
        ...
    
    def get_report(
        self,
        block_id: str
    ) -> Tuple[Optional[ValidationReport], Optional[str]]:
        """
        Retrieve validation report from database.
        
        Args:
            block_id: UUID of the block record
            
        Returns:
            Tuple of (report: Optional[ValidationReport], error: Optional[str])
            - (ValidationReport, None) if found
            - (None, "Block not found") if block doesn't exist
            - (None, "No validation report") if block exists but no report
            - (None, error_msg) if database error
            
        Implementation:
            1. SELECT validation_report FROM blocks WHERE id = block_id
            2. If no rows → block not found
            3. If validation_report is NULL → no report yet
            4. If validation_report exists → parse JSON to ValidationReport
            5. Return parsed report or error
        """
        ...
```

### Frontend Types (TypeScript)

**NOTA**: El frontend type `ValidationReport` **YA EXISTE** en `src/frontend/src/types/validation.ts` (creado en T-023-TEST). **NO** se modificará en este ticket.

Este ticket es **backend-only**, el frontend consumirá los tipos existentes cuando implemente T-030-BACK (Get Validation Status Endpoint).

### Database Changes (SQL)

**NO SE REQUIEREN MIGRACIONES** - La columna `validation_report` ya fue creada en T-020-DB.

**Migración existente (referencia):**
```sql
-- supabase/migrations/20260211160000_add_validation_report.sql (YA APLICADA)
ALTER TABLE blocks ADD COLUMN validation_report JSONB DEFAULT NULL;
CREATE INDEX idx_blocks_validation_errors ON blocks USING GIN ((validation_report->'errors'));
CREATE INDEX idx_blocks_validation_failed ON blocks ((validation_report->>'is_valid'))
WHERE validation_report->>'is_valid' = 'false';
```

**Estructura de la tabla `blocks` (actual):**
- `id` (uuid, PK)
- `status` (block_status enum)
- `validation_report` (jsonb, nullable) ← **Columna donde se persistirá el reporte**
- ... (otros campos)

---

## 3. API Interface

**NO SE CREAN ENDPOINTS EN ESTE TICKET** - Este ticket implementa únicamente el **service layer**.

Los endpoints serán creados en tickets posteriores:
- **T-030-BACK**: `GET /api/parts/{id}/validation` (consumirá `validation_report_service.get_report()`)

Este service será consumido directamente por:
- **Agent Worker** (en tarea Celery `validate_file`) para persistir reportes después de validación
- **Backend API** (en endpoint T-030-BACK) para recuperar reportes

**Ejemplo de uso desde Agent Worker:**
```python
# src/agent/tasks.py (futuro uso en validate_file task)
from src.backend.services.validation_report_service import ValidationReportService
from src.backend.schemas import ValidationErrorItem

# ... después de ejecutar validadores ...
errors = []
errors.extend(nomenclature_validator.validate(...))
errors.extend(geometry_validator.validate(...))

metadata = {
    "layer_count": len(model.Layers),
    "object_count": len(model.Objects),
    "user_strings": user_string_extractor.extract(model)
}

# Crear y guardar reporte
service = ValidationReportService(supabase_client)
report = service.create_report(errors, metadata, validated_by="celery-worker-1")
success, error = service.save_to_db(block_id=part_id, report=report)

if not success:
    logger.error("Failed to save validation report", error=error)
```

---

## 4. Component Contract

**N/A** - Este ticket no crea componentes frontend.

---

## 5. Test Cases Checklist

### Happy Path

- [ ] **HP-1**: `test_create_report_with_no_errors`
  - Given: Empty errors list, valid metadata, validated_by="test-worker"
  - When: `create_report()` is called
  - Then: Returns `ValidationReport` with `is_valid=True`, errors=[], metadata populated, validated_at timestamp set

- [ ] **HP-2**: `test_create_report_with_errors`
  - Given: List with 3 ValidationErrorItems (2 nomenclature, 1 geometry), metadata, validated_by="test-worker"
  - When: `create_report()` is called
  - Then: Returns `ValidationReport` with `is_valid=False`, errors list contains 3 items, metadata populated

- [ ] **HP-3**: `test_save_report_to_db_success`
  - Given: Valid block_id exists in DB, ValidationReport created
  - When: `save_to_db(block_id, report)` is called
  - Then: Returns `(True, None)`, database record updated with JSON, verified with SELECT query

- [ ] **HP-4**: `test_get_report_success`
  - Given: Block exists with validation_report populated
  - When: `get_report(block_id)` is called
  - Then: Returns `(ValidationReport, None)` with all fields matching saved data

### Edge Cases

- [ ] **EC-1**: `test_create_report_with_empty_metadata`
  - Given: Empty metadata dict `{}`
  - When: `create_report()` is called
  - Then: Returns valid report with `metadata={}`

- [ ] **EC-2**: `test_save_report_block_not_found`
  - Given: block_id does not exist in database
  - When: `save_to_db(non_existent_id, report)` is called
  - Then: Returns `(False, "Block not found")`

- [ ] **EC-3**: `test_get_report_no_report_yet`
  - Given: Block exists but `validation_report` column is NULL
  - When: `get_report(block_id)` is called
  - Then: Returns `(None, "No validation report")`

- [ ] **EC-4**: `test_update_existing_report`
  - Given: Block already has a validation_report
  - When: `save_to_db()` is called with new report
  - Then: Old report is replaced with new one, `(True, None)` returned

### Security/Errors

- [ ] **SE-1**: `test_save_report_with_invalid_block_id_format`
  - Given: block_id is not a valid UUID (e.g., "invalid-id")
  - When: `save_to_db()` is called
  - Then: Returns `(False, error_message)` without crashing

- [ ] **SE-2**: `test_create_report_with_none_metadata`
  - Given: metadata=None passed (should default to {})
  - When: `create_report()` is called
  - Then: Creates report with metadata={} or raises clear validation error

- [ ] **SE-3**: `test_serialization_to_json`
  - Given: ValidationReport with datetime objects
  - When: Serialized using `.model_dump(mode='json')`
  - Then: Datetime converted to ISO string, no serialization errors

### Integration

- [ ] **INT-1**: `test_save_and_retrieve_report_roundtrip`
  - Given: Create ValidationReport, save to DB
  - When: Retrieve using `get_report()`
  - Then: Retrieved report matches original (except datetime precision may differ)

- [ ] **INT-2**: `test_jsonb_query_on_validation_status`
  - Given: Multiple blocks with different validation statuses
  - When: Query `SELECT * FROM blocks WHERE validation_report->>'is_valid' = 'false'`
  - Then: Returns only blocks with `is_valid=False` (index is used)

---

## 6. Files to Create/Modify

### Create

- `src/backend/services/validation_report_service.py` - New service class with create_report(), save_to_db(), get_report()
- `tests/unit/test_validation_report_service.py` - Unit tests for service (10 test cases from checklist)
- `tests/integration/test_validation_report_persistence.py` - Integration tests for DB persistence (2 tests: roundtrip, JSONB querying)

### Modify

- `src/backend/services/__init__.py` - Add export: `from .validation_report_service import ValidationReportService`
- `src/backend/constants.py` - Add constant: `TABLE_BLOCKS = "blocks"` (if not already exists)

**NO SE MODIFICAN:**
- `src/backend/schemas.py` (schemas ya existen)
- `src/frontend/src/types/validation.ts` (types ya existen)
- Migraciones SQL (columna ya existe)

---

## 7. Reusable Components/Patterns

### Patterns from Existing Codebase

1. **Clean Architecture Pattern** (`UploadService` - T-004-BACK)
   - ✅ Service class with Supabase client injection
   - ✅ Return tuples `(success: bool, error: Optional[str])` for error handling
   - ✅ Separate business logic from API layer
   - **Aplicar a**: `ValidationReportService` seguirá este mismo patrón

2. **Constants Centralization** (`src/backend/constants.py`)
   - ✅ `TABLE_EVENTS`, `STORAGE_BUCKET_RAW_UPLOADS` ya centralizados
   - **Aplicar a**: Añadir `TABLE_BLOCKS = "blocks"` si no existe

3. **Pydantic Model Serialization** (T-023-TEST)
   - ✅ `ValidationReport.model_dump(mode='json')` para serializar a JSON
   - ✅ `ValidationReport.model_validate(json_data)` para deserializar desde JSON
   - **Aplicar a**: Usar en `save_to_db()` y `get_report()`

4. **Datetime Handling** (Existing schemas)
   - ✅ `datetime.utcnow()` para timestamps
   - ✅ Pydantic auto-convierte datetime a ISO string en JSON mode
   - **Aplicar a**: `validated_at` field

### Supabase Client Patterns

```python
# UPDATE pattern (to apply in save_to_db)
result = self.supabase.table(TABLE_BLOCKS).update({
    "validation_report": report.model_dump(mode='json')
}).eq("id", block_id).execute()

# Check if update affected rows
if len(result.data) == 0:
    return (False, "Block not found")
return (True, None)

# SELECT pattern (to apply in get_report)
result = self.supabase.table(TABLE_BLOCKS).select("validation_report").eq("id", block_id).execute()

if len(result.data) == 0:
    return (None, "Block not found")

report_json = result.data[0].get("validation_report")
if report_json is None:
    return (None, "No validation report")

report = ValidationReport.model_validate(report_json)
return (report, None)
```

---

## 8. Implementation Notes

### Key Design Decisions

1. **Service-Only Pattern**: Este ticket implementa **solo** la capa de servicio, sin endpoints API.
   - Justificación: Sigue Clean Architecture - lógica de negocio desacoplada de HTTP
   - Los endpoints se crearán en T-030-BACK y consumirán este servicio

2. **Error Handling Strategy**: Métodos retornan tuplas `(result, error)` en lugar de excepciones
   - Justificación: Mismo patrón que `UploadService` (consistencia)
   - Permite al caller decidir cómo manejar errores (log, HTTP 404, retry, etc.)

3. **Schema Reuse**: NO se crean nuevos schemas, se reutilizan `ValidationErrorItem` y `ValidationReport`
   - Justificación: Contratos ya definidos en T-023-TEST, evita duplicación
   - Frontend ya tiene tipos TypeScript sincronizados

4. **Metadata Flexibility**: Campo `metadata` es `Dict[str, Any]` sin estructura fija
   - Justificación: Permite almacenar user strings, layer info, model stats sin cambiar schema
   - Agente puede enriquecer metadata sin modificar contratos

5. **Validator Identifier**: Campo `validated_by` identifica qué worker ejecutó validación
   - Justificación: Útil para debugging distribuido (múltiples workers Celery)
   - Formato sugerido: "celery-worker-{hostname}" o "agent-worker"

### Database Performance

- **Índices existentes** (T-020-DB):
  - GIN index en `validation_report->'errors'` → queries rápidas por tipo de error
  - Partial index en `is_valid=false` → queries rápidas de bloques rechazados

- **Query examples** (para documentación):
  ```sql
  -- Bloques con errores de nomenclatura
  SELECT id FROM blocks 
  WHERE validation_report @> '{"errors": [{"category": "nomenclature"}]}'::jsonb;
  
  -- Bloques rechazados (al menos 1 error)
  SELECT id FROM blocks 
  WHERE validation_report->>'is_valid' = 'false';
  
  -- Bloques validados en las últimas 24 horas
  SELECT id FROM blocks 
  WHERE (validation_report->>'validated_at')::timestamp > NOW() - INTERVAL '24 hours';
  ```

---

## 9. Next Steps

Esta spec está lista para iniciar **TDD-Red**. Usar el siguiente prompt con estos datos:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-028-BACK
Feature name:    Validation Report Service
Key test cases:  
  - HP-1: Create report with no errors (is_valid=True)
  - HP-2: Create report with errors (is_valid=False)
  - HP-3: Save report to DB successfully
  - EC-2: Save fails when block not found
  - INT-1: Roundtrip save and retrieve  matches
Files to create:
  - src/backend/services/validation_report_service.py
  - tests/unit/test_validation_report_service.py
  - tests/integration/test_validation_report_persistence.py
Files to modify:
  - src/backend/services/__init__.py (add export)
  - src/backend/constants.py (add TABLE_BLOCKS if missing)
=============================================
```

---

## 10. References

- **T-020-DB**: Migración que creó `blocks.validation_report` JSONB column
- **T-023-TEST**: Definición de schemas `ValidationErrorItem`, `ValidationReport`
- **T-026-AGENT**: NomenclatureValidator (genera ValidationErrorItem)
- **T-027-AGENT**: GeometryValidator (genera ValidationErrorItem)
- **T-004-BACK**: `UploadService` (patrón de referencia para service layer)
- **systemPatterns.md**: Validation Report Contract (sección completa)

---

**Spec Status:** ✅ **COMPLETE - READY FOR TDD-RED**  
**Estimated Complexity:** 3 Story Points (3 files, 12 tests, service layer only)  
**Next Phase:** TDD-Red (escribir 12 tests failing)
