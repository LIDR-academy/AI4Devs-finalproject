# Technical Specification: T-020-DB

**Ticket ID:** T-020-DB  
**Type:** DATABASE  
**Priority:** 🔴 CRÍTICA  
**Story Points:** 1  
**Sprint:** Sprint 4A (Infraestructura Base - US-002)

---

## 1. Ticket Summary

**Alcance:**  
Agregar columna `validation_report` tipo JSONB a la tabla `blocks` para almacenar resultados estructurados de validación de archivos .3dm procesados por "The Librarian" agent.

**Contexto de Negocio:**  
Cuando el agente valida un archivo (T-024-AGENT a T-027-AGENT), debe guardar un reporte detallado con:
- Lista de errores de nomenclatura ISO-19650
- Errores de geometría (objetos inválidos, volumen = 0)
- Metadata extraída (user strings, capas, propiedades físicas)
- Timestamp y versión del validador

Este reporte permite:
✅ Frontend mostrar errores específicos al usuario (T-032-FRONT)  
✅ Búsquedas/filtros por tipo de error (ej: "todas las piezas con error de nomenclatura")  
✅ Auditoría de calidad (tracking de mejoras en archivos re-subidos)  
✅ Analytics de tasa de rechazo por tipo de error

**Dependencias:**  
- Tabla `blocks` debe existir (creada en migración `004_create_blocks.sql` según modelo de datos)
- ENUM `block_status` debe existir (se extenderá en T-021-DB con estados `processing`, `rejected`, `error_processing`)

**Bloqueantes si NO se implementa:**  
❌ T-028-BACK no puede guardar reportes de validación → workers fallan  
❌ T-032-FRONT no puede mostrar errores → UX rota  
❌ Sistema pierde trazabilidad de por qué se rechazó un archivo

---

## 2. Data Structures & Contracts

### Database Changes (SQL)

#### A. Nueva Columna `validation_report`

**Nombre:** `validation_report`  
**Tipo:** `JSONB`  
**Nullable:** `NULL` (campo opcional, solo se llena tras validación)  
**Default:** `NULL`

**Razón de JSONB (no JSON):**  
- ✅ Soporte de índices GIN para búsquedas eficientes  
- ✅ Operadores nativos PostgreSQL (`@>`, `->`, `->>`)  
- ✅ Compresión automática (mejora performance con reportes grandes)

**Schema JSON esperado** (definido por T-028-BACK):
```json
{
  "is_valid": false,
  "validated_at": "2026-02-11T15:30:00Z",
  "validated_by": "librarian-v1.0-rhino3dm",
  "errors": [
    {
      "type": "nomenclature",
      "severity": "error",
      "location": "layer:bloque_test",
      "message": "Layer name 'bloque_test' does not match ISO-19650 pattern",
      "expected_pattern": "^[A-Z]{2,3}-[A-Z0-9]{3,4}-[A-Z]{1,2}-\\d{3}$"
    },
    {
      "type": "geometry",
      "severity": "warning",
      "location": "object:uuid-123-456",
      "message": "Object geometry is invalid (self-intersecting surfaces)",
      "details": {
        "object_type": "Brep",
        "is_valid": false
      }
    }
  ],
  "metadata": {
    "total_objects": 156,
    "valid_objects": 154,
    "invalid_objects": 2,
    "user_strings_extracted": 46,
    "processing_duration_ms": 3450
  },
  "warnings": [
    {
      "type": "metadata",
      "message": "User string 'Arquitecte' missing in 3 objects"
    }
  ]
}
```

**Campos obligatorios del schema:**
- `is_valid` (boolean): Indica si validación fue exitosa
- `validated_at` (ISO timestamp): Cuándo se validó
- `validated_by` (string): Versión del validador (para auditoría)
- `errors` (array): Lista de errores bloqueantes (vacío si `is_valid=true`)
  - Cada error DEBE tener: `type`, `severity`, `location`, `message`
- `metadata` (object): Estadísticas del procesamiento

**Campos opcionales:**
- `warnings` (array): Avisos no bloqueantes

---

#### B. Índice GIN para Búsquedas

**Nombre:** `idx_blocks_validation_errors`  
**Tipo:** GIN (Generalized Inverted Index)  
**Expresión:** `(validation_report->'errors')`

**Propósito:**  
Optimizar queries de búsqueda/filtrado por tipo de error sin full table scan.

**Queries optimizadas por este índice:**

```sql
-- Query 1: Encontrar todas las piezas con errores de nomenclatura
SELECT id, iso_code, validation_report->'errors' AS errors
FROM blocks
WHERE validation_report @> '{"errors": [{"type": "nomenclature"}]}'::jsonb;

-- Query 2: Contar piezas rechazadas por cada tipo de error
SELECT 
  error->>'type' AS error_type,
  COUNT(*) AS count
FROM blocks,
  jsonb_array_elements(validation_report->'errors') AS error
WHERE validation_report->>'is_valid' = 'false'
GROUP BY error->>'type'
ORDER BY count DESC;

-- Query 3: Dashboard - Piezas con errores críticos (severity=error)
SELECT id, iso_code, status, validation_report
FROM blocks
WHERE validation_report @? '$.errors[*] ? (@.severity == "error")';
```

**Performance esperado:**  
- **Sin índice:** Seq Scan ~200ms para 1000 piezas (❌ inaceptable)  
- **Con índice GIN:** Index Scan ~5ms para misma query (✅ óptimo)

---

#### C. Migración SQL Completa

**Archivo:** `supabase/migrations/20260211160000_add_validation_report.sql`

```sql
-- Migration: Add validation_report column to blocks table
-- Ticket: T-020-DB
-- Author: AI Assistant
-- Date: 2026-02-11

BEGIN;

-- 1. Add JSONB column for validation reports
ALTER TABLE blocks
ADD COLUMN validation_report JSONB DEFAULT NULL;

-- 2. Add comment for documentation
COMMENT ON COLUMN blocks.validation_report IS 
'Structured validation report from The Librarian agent. Contains errors, warnings, and metadata from .3dm file validation. NULL if file has not been validated yet.';

-- 3. Create GIN index on errors array for efficient filtering
CREATE INDEX idx_blocks_validation_errors
ON blocks USING GIN ((validation_report->'errors'));

COMMENT ON INDEX idx_blocks_validation_errors IS
'GIN index for efficient queries on validation errors. Optimizes filters like "all blocks with nomenclature errors".';

-- 4. Optional: Create partial index for failed validations only (performance optimization)
CREATE INDEX idx_blocks_validation_failed
ON blocks ((validation_report->>'is_valid'))
WHERE validation_report->>'is_valid' = 'false';

COMMENT ON INDEX idx_blocks_validation_failed IS
'Partial index for rejected blocks. Optimizes dashboard queries showing only failed validations.';

-- 5. Verify migration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blocks'
      AND column_name = 'validation_report'
  ) THEN
    RAISE EXCEPTION 'Migration failed: validation_report column not created';
  END IF;

  RAISE NOTICE 'Migration successful: validation_report column added to blocks table';
END$$;

COMMIT;
```

**Rollback (si necesario):**
```sql
BEGIN;

DROP INDEX IF EXISTS idx_blocks_validation_failed;
DROP INDEX IF EXISTS idx_blocks_validation_errors;
ALTER TABLE blocks DROP COLUMN IF EXISTS validation_report;

COMMIT;
```

---

### Backend Schema Alignment (Pydantic)

**CRÍTICO:** El schema Pydantic en `src/backend/schemas.py` debe reflejar exactamente la estructura JSON esperada.

**Archivo:** `src/backend/schemas.py` (a crear/modificar en T-028-BACK)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# Schema de error individual
class ValidationError(BaseModel):
    """Individual validation error in a .3dm file"""
    type: Literal["nomenclature", "geometry", "metadata"]
    severity: Literal["error", "warning"]
    location: str = Field(..., description="Layer, object, or document location")
    message: str = Field(..., description="Human-readable error description")
    expected_pattern: Optional[str] = None  # Solo para errores de nomenclatura
    details: Optional[dict] = None  # Detalles adicionales específicos del error

class ValidationWarning(BaseModel):
    """Non-blocking warning"""
    type: str
    message: str

class ValidationMetadata(BaseModel):
    """Processing statistics"""
    total_objects: int
    valid_objects: int
    invalid_objects: int
    user_strings_extracted: Optional[int] = 0
    processing_duration_ms: Optional[int] = None

class ValidationReport(BaseModel):
    """
    Complete validation report stored in blocks.validation_report JSONB.
    Generated by The Librarian agent (T-024 to T-027).
    """
    is_valid: bool = Field(..., description="True if no blocking errors found")
    validated_at: datetime = Field(..., description="ISO timestamp of validation")
    validated_by: str = Field(..., description="Validator version (e.g., 'librarian-v1.0-rhino3dm')")
    errors: List[ValidationError] = Field(default_factory=list, description="Blocking errors")
    metadata: ValidationMetadata
    warnings: List[ValidationWarning] = Field(default_factory=list, description="Non-blocking warnings")

    class Config:
        json_schema_extra = {
            "example": {
                "is_valid": False,
                "validated_at": "2026-02-11T15:30:00Z",
                "validated_by": "librarian-v1.0-rhino3dm",
                "errors": [
                    {
                        "type": "nomenclature",
                        "severity": "error",
                        "location": "layer:bloque_test",
                        "message": "Invalid ISO-19650 format"
                    }
                ],
                "metadata": {
                    "total_objects": 156,
                    "valid_objects": 154,
                    "invalid_objects": 2
                },
                "warnings": []
            }
        }
```

---

### Frontend Types Alignment (TypeScript)

**Archivo:** `src/frontend/src/types/validation.ts` (a crear en T-032-FRONT)

```typescript
/**
 * Validation report structure (matches backend Pydantic schema)
 * Stored in blocks.validation_report JSONB column
 */

export type ValidationErrorType = "nomenclature" | "geometry" | "metadata";
export type ValidationSeverity = "error" | "warning";

export interface ValidationError {
  type: ValidationErrorType;
  severity: ValidationSeverity;
  location: string; // e.g., "layer:bloque_test", "object:uuid-123"
  message: string;
  expected_pattern?: string; // Only for nomenclature errors
  details?: Record<string, unknown>; // Type-safe generic object
}

export interface ValidationWarning {
  type: string;
  message: string;
}

export interface ValidationMetadata {
  total_objects: number;
  valid_objects: number;
  invalid_objects: number;
  user_strings_extracted?: number;
  processing_duration_ms?: number;
}

export interface ValidationReport {
  is_valid: boolean;
  validated_at: string; // ISO 8601 datetime string
  validated_by: string; // e.g., "librarian-v1.0-rhino3dm"
  errors: ValidationError[];
  metadata: ValidationMetadata;
  warnings: ValidationWarning[];
}

// Type guard for runtime validation
export function isValidationReport(obj: unknown): obj is ValidationReport {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "is_valid" in obj &&
    "validated_at" in obj &&
    "errors" in obj &&
    Array.isArray((obj as ValidationReport).errors)
  );
}
```

**Verificación de contrato (CRÍTICO):**  
✅ `is_valid`: `boolean` en Python ↔ `boolean` en TS  
✅ `validated_at`: `datetime` en Python ↔ `string` en TS (ISO format)  
✅ `errors`: `List[ValidationError]` ↔ `ValidationError[]`  
✅ `metadata`: Nested object matching field-by-field

---

## 3. API Interface

**N/A para este ticket** - T-020-DB es solo migración de base de datos.  
No crea ni modifica endpoints HTTP.

**Endpoints que LEERÁN esta columna** (tickets futuros):
- `GET /api/parts/{id}` (T-030-BACK) - Retorna pieza con validation_report incluido
- `GET /api/parts/{id}/validation` (T-030-BACK) - Retorna solo el validation_report
- `PATCH /api/parts/{id}/validation` (T-028-BACK) - Actualiza validation_report tras validación

---

## 4. Component Contract

**N/A para este ticket** - T-020-DB no toca componentes React.

**Componentes que CONSUMIRÁN esta columna** (tickets futuros):
- `<ValidationReportModal>` (T-032-FRONT) - Renderiza errores/warnings
- `<PartDetailView>` (futuro) - Muestra badge de validación (✅/❌)
- `<PartsTable>` (T-031-FRONT) - Columna "Validation Status"

---

## 5. Test Cases Checklist

### Happy Path (DDL Execution)

- [ ] **Test 1: Migration executes successfully**
  - **Given:** Fresh database con tabla `blocks` existente
  - **When:** Ejecutar migración `20260211160000_add_validation_report.sql`
  - **Then:** Migración completa sin errores, commit exitoso
  - **Verify:** `SELECT column_name FROM information_schema.columns WHERE table_name='blocks' AND column_name='validation_report'` retorna 1 fila

- [ ] **Test 2: Column accepts NULL values**
  - **Given:** Pieza existente sin validation_report
  - **When:** `SELECT validation_report FROM blocks WHERE id = '<existing_id>'`
  - **Then:** Retorna `NULL` (no error, NULL es válido)

- [ ] **Test 3: Column accepts valid JSONB**
  - **Given:** Pieza existente
  - **When:** `UPDATE blocks SET validation_report = '{"is_valid": true, "validated_at": "2026-02-11T15:00:00Z", "validated_by": "test", "errors": [], "metadata": {"total_objects": 10, "valid_objects": 10, "invalid_objects": 0}}' WHERE id = '<id>'`
  - **Then:** Update exitoso, data persiste correctamente
  - **Verify:** `SELECT validation_report->>'is_valid' FROM blocks WHERE id='<id>'` retorna `'true'`

- [ ] **Test 4: GIN index exists**
  - **Given:** Migración ejecutada
  - **When:** `SELECT indexname FROM pg_indexes WHERE tablename='blocks' AND indexname='idx_blocks_validation_errors'`
  - **Then:** Retorna 1 fila con el índice

- [ ] **Test 5: Partial index exists**
  - **Given:** Migración ejecutada
  - **When:** `SELECT indexname FROM pg_indexes WHERE tablename='blocks' AND indexname='idx_blocks_validation_failed'`
  - **Then:** Retorna 1 fila con el índice

### Edge Cases (Data Validation)

- [ ] **Test 6: Empty JSONB object is accepted**
  - **Given:** Pieza existente
  - **When:** `UPDATE blocks SET validation_report = '{}' WHERE id = '<id>'`
  - **Then:** Update exitoso (JSONB no tiene schema enforcement en DB)
  - **Note:** Validación de schema debe hacerse en aplicación (Pydantic), no DB

- [ ] **Test 7: Large JSONB (10KB+) is accepted**
  - **Given:** Archivo con 500+ errores de validación
  - **When:** Insertar validation_report de ~15KB
  - **Then:** Insert exitoso, sin errores de tamaño
  - **Verify:** JSONB soporta hasta ~250MB por campo

- [ ] **Test 8: Special characters in error messages**
  - **Given:** Error con mensaje conteniendo `"`'`, newlines, unicode
  - **When:** Insertar JSON con mensaje: `"Error en capa: \"test\"\nDetalles: émoji 🔴"`
  - **Then:** Data se guarda correctamente escapada, lectura devuelve texto original

### Security/Errors (SQL Injection Prevention)

- [ ] **Test 9: SQL injection attempts fail**
  - **Given:** Intento malicioso de inyección
  - **When:** `UPDATE blocks SET validation_report = '{"is_valid": true}'; DROP TABLE blocks; --' WHERE id = '<id>'`
  - **Then:** Error de syntax JSON, tabla `blocks` NO se elimina
  - **Note:** Parameters bindeados previenen esto, pero verificar

- [ ] **Test 10: Invalid JSON is rejected**
  - **Given:** Intento de insertar JSON malformado
  - **When:** `UPDATE blocks SET validation_report = '{invalid json}' WHERE id = '<id>'`
  - **Then:** PostgreSQL lanza error: `invalid input syntax for type json`
  - **Verify:** Transacción hace rollback, data original intacta

### Integration (Existing Data Compatibility)

- [ ] **Test 11: Existing rows unaffected by migration**
  - **Given:** 100 piezas existentes en `blocks` antes de migración
  - **When:** Ejecutar migración
  - **Then:** `SELECT COUNT(*) FROM blocks WHERE validation_report IS NULL` retorna 100
  - **Verify:** Ningún row tiene validation_report != NULL tras migración

- [ ] **Test 12: Queries on existing data work**
  - **Given:** Migración completada con piezas existentes
  - **When:** `SELECT * FROM blocks WHERE iso_code LIKE 'SF-%'`
  - **Then:** Query retorna resultados normales, performance sin degradación
  - **Verify:** `EXPLAIN ANALYZE` muestra plan de ejecución normal (no Seq Scan inesperado)

- [ ] **Test 13: GIN index improves query performance**
  - **Given:** 1000 piezas, 200 con validation_report conteniendo errores
  - **When:** Ejecutar query con filtro por errores (ver "Queries optimizadas" arriba)
  - **Then:** `EXPLAIN ANALYZE` muestra `Index Scan using idx_blocks_validation_errors`
  - **Benchmark:** Query completa en <10ms (vs >100ms sin índice para tabla grande)

### Rollback Safety

- [ ] **Test 14: Rollback script works**
  - **Given:** Migración ejecutada exitosamente
  - **When:** Ejecutar script de rollback (ver sección "Rollback" arriba)
  - **Then:** Columna `validation_report` eliminada, índices eliminados
  - **Verify:** `SELECT column_name FROM information_schema.columns WHERE table_name='blocks' AND column_name='validation_report'` retorna 0 filas

---

## 6. Files to Create/Modify

### Create (New Files)

1. **`supabase/migrations/20260211160000_add_validation_report.sql`**
   - **Contenido:** Migración SQL completa (ver sección 2.C)
   - **Tamaño:** ~50 líneas SQL
   - **Owner:** T-020-DB

2. **`docs/T-020-DB-TechnicalSpec.md`** (este archivo)
   -  **Contenido:** Especificación técnica completa
   - **Owner:** T-020-DB (design phase)

### Modify (Existing Files)

**N/A** - Este ticket NO modifica archivos existentes.

**Archivos que LEERÁN data nueva** (tickets futuros):
- `src/backend/schemas.py` → Añadir `ValidationReport` model (T-028-BACK)
- `src/frontend/src/types/validation.ts` → Añadir interfaces TypeScript (T-032-FRONT)

---

## 7. Reusable Components/Patterns

### ✅ Patterns Already in Use (Reuse These)

1. **Migration Naming Convention:**
   - Formato: `YYYYMMDDHHMMSS_<descriptive_name>.sql`
   - Ejemplo existente: `20260207133355_create_raw_uploads_bucket.sql`
   - **Reutilizar:** Usar mismo patrón para nuevo archivo

2. **JSONB Column Pattern:**
   - Tabla `blocks` ya tiene columna JSONB: `rhino_metadata`
   - Ya tiene índice GIN: `idx_blocks_rhino_metadata`
   - **Reutilizar:** Seguir mismo patrón para `validation_report`

3. **Index Naming Convention:**
   - Formato: `idx_{table}_{column}_{index_type}`
   - Ejemplos: `idx_blocks_status`, `idx_blocks_rhino_metadata_gin`
   - **Reutilizar:** `idx_blocks_validation_errors` (consistente)

4. **SQL COMMENT Pattern:**
   - Documentar columnas e índices con `COMMENT ON`
   - Mejora auto-documentación en herramientas DB
   - **Reutilizar:** Ver migration code en sección 2.C

5. **Migration Verification Pattern:**
   - Bloque `DO $$ ... END$$` para verificar éxito
   - Lanza excepción si algo falla
   - **Reutilizar:** Ver migration code en sección 2.C

---

## 8. Next Steps

### Definition of Done (DoD) Checklist

**Antes de marcar ticket como DONE:**

- [ ] Migration SQL file creado en `supabase/migrations/`
- [ ] Migración ejecutada en Supabase local (Docker Compose)
- [ ] Verificado: `\d blocks` en psql muestra columna `validation_report JSONB`
- [ ] Verificado: `\di` en psql muestra índices `idx_blocks_validation_errors` y `idx_blocks_validation_failed`
- [ ] Test 1-5 (Happy Path) ejecutados manualmente y pasando
- [ ] Test 6-8 (Edge Cases) ejecutados manualmente y pasando
- [ ] Test 9-10 (Security) ejecutados manualmente y pasando
- [ ] Test 11-13 (Integration) ejecutados manualmente y pasando
- [ ] Test 14 (Rollback) ejecutado y pasando
- [ ] Screenshot de `SELECT * FROM blocks LIMIT 1` mostrando columna nueva (para PR review)
- [ ] Migration aplicada en Supabase remoto (staging environment)
- [ ] PR merged a branch `feature/T-020-DB`

---

### Handoff for TDD-RED Phase

```
=============================================
READY FOR TESTING PHASE - T-020-DB
=============================================
Ticket ID:       T-020-DB
Feature name:    Add Validation Report Column
Migration file:  supabase/migrations/20260211160000_add_validation_report.sql

TESTING APPROACH (SQL-based, no unit tests framework):
1. Execute migration in local Supabase instance
2. Run test queries manually (see Test Cases Checklist)
3. Verify with \d blocks and \di commands in psql
4. Document results in PR description

Key test cases to execute manually:
  ✅ Test 1: Migration executes successfully
  ✅ Test 3: Column accepts valid JSONB
  ✅ Test 4: GIN index exists
  ✅ Test 10: Invalid JSON is rejected
  ✅ Test 13: GIN index improves query performance

Files to create:
  - supabase/migrations/20260211160000_add_validation_report.sql

BLOCKER DEPENDENCIES (must exist before testing):
  - Table `blocks` must exist (from 004_create_blocks.sql)
  - Docker Compose with Supabase must be running

NEXT TICKET DEPENDENCIES (blocked until T-020-DB completes):
  - T-028-BACK (needs validation_report column to save data)
  - T-032-FRONT (needs validation_report to display errors)
=============================================
```

---

## 9. Additional Notes

### Why JSONB Instead of Separate Tables?

**Considered Alternative:** Create normalized tables:
```sql
CREATE TABLE validation_errors (
  id UUID PRIMARY KEY,
  block_id UUID REFERENCES blocks(id),
  error_type TEXT,
  severity TEXT,
  location TEXT,
  message TEXT
);
```

**Rejected Because:**
- ❌ Overhead: 1 pieza con 50 errores = 50 INSERT statements (slow)
- ❌ Complexity: JOIN required para leer reportes completos
- ❌ Rigidity: Schema changes require migration (JSONB es flexible)
- ❌ Performance: JSONB con GIN index es MÁS RÁPIDO para lecturas que JOINs

**JSONB Advantages:**
- ✅ Atomic updates: Todo el reporte se guarda/lee en 1 operación
- ✅ Flexibility: Schema puede evolucionar sin migraciones
- ✅ Performance: GIN index + JSONB operators extremadamente rápidos
- ✅ Simplicity: 1 columna vs 3+ tablas relacionadas

---

### PostgreSQL JSONB Performance Tips

**Best Practices (follow these):**

1. **Use GIN, not B-tree, for JSONB:**
   ```sql
   CREATE INDEX idx_blocks_validation_errors 
   ON blocks USING GIN ((validation_report->'errors'));  -- ✅ Correct
   
   CREATE INDEX idx_blocks_validation_report_btree 
   ON blocks (validation_report);  -- ❌ Wrong, B-tree not useful for JSONB
   ```

2. **Use containment operator `@>` for queries:**
   ```sql
   -- ✅ Good: Uses GIN index
   WHERE validation_report @> '{"errors": [{"type": "nomenclature"}]}'::jsonb
   
   -- ❌ Bad: Full table scan
   WHERE validation_report->>'is_valid' = 'false'
   ```

3. **Use partial indexes for common filters:**
   ```sql
   -- ✅ Excellent: Index covers only rows with failed validations
   CREATE INDEX idx_blocks_validation_failed
   ON blocks ((validation_report->>'is_valid'))
   WHERE validation_report->>'is_valid' = 'false';
   ```

4. **Monitor index usage:**
   ```sql
   -- Check if indexes are being used
   SELECT 
     schemaname, tablename, indexname, idx_scan,
     pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public' AND tablename = 'blocks'
   ORDER BY idx_scan DESC;
   ```

---

### Data Migration Strategy (Future)

**If we need to backfill validation_report for old blocks:**

```sql
-- Example: Mark old blocks as "not validated" (vs NULL = "never validated")
UPDATE blocks
SET validation_report = jsonb_build_object(
  'is_valid', NULL,
  'validated_at', NULL,
  'validated_by', 'legacy-migration-v1',
  'errors', '[]'::jsonb,
  'metadata', jsonb_build_object(
    'note', 'Block uploaded before validation system existed'
  )
)
WHERE created_at < '2026-02-11'  -- Before validation feature launched
  AND validation_report IS NULL;
```

---

## 10. Approval & Sign-Off

**Technical Spec Author:** AI Assistant  
**Reviewed by:** [Product Owner] - PENDING  
**Approved by:** [Tech Lead] - PENDING  
**Date Created:** 2026-02-11  
**Last Updated:** 2026-02-11

**Status:** ✅ READY FOR IMPLEMENTATION (TDD-RED Phase)

---

**END OF TECHNICAL SPECIFICATION**
