# Technical Specification: T-027-AGENT - Geometry Auditor

**Status:** APPROVED FOR TDD-RED  
**Created:** 2026-02-14  
**Author:** GitHub Copilot (Claude Sonnet 4.5) - Senior Software Architect Role  
**Dependencies:** T-024-AGENT ✅, T-026-AGENT ✅, ValidationErrorItem schema ✅

---

## 1. Executive Summary

### Ticket Overview
- **ID:** T-027-AGENT
- **Título:** Geometry Auditor
- **Tipo:** AGENT (servicio interno Python, NO API endpoints)
- **Prioridad:** 🔴 CRÍTICA (bloquea backend integration T-028/T-029)

### Scope
Crear servicio `GeometryValidator` que valida integridad geométrica de objetos 3D en archivos .3dm procesados por rhino3dm. Detecta geometría degenerada, nula o inválida que podría causar fallos en fabricación digital.

### Acceptance Criteria (from backlog)
- Unit test detecta objetos inválidos ✅
- Fixture con geometría rota devuelve errores ✅

### Deliverables
1. `src/agent/services/geometry_validator.py` (~120 lines)
2. `tests/unit/test_geometry_validator.py` (~300 lines, 9-10 tests)
3. Constants añadidos a `src/agent/constants.py`
4. Export añadido a `src/agent/services/__init__.py`

---

## 2. Technical Context

### Dependencies (VERIFIED ✅)
| Componente | Status | Propósito |
|------------|--------|-----------|
| T-024-AGENT (RhinoParserService) | ✅ DONE | Proporciona `rhino3dm.File3dm` parsed |
| T-026-AGENT (NomenclatureValidator) | ✅ DONE | Patrón de servicio a replicar |
| ValidationErrorItem schema | ✅ DONE | Output contract (category="geometry") |
| rhino3dm 8.4.0 | ✅ INSTALLED | API para acceder a `obj.Geometry.IsValid` |
| structlog 24.1.0 | ✅ INSTALLED | Structured logging |

### Reusable Patterns (from T-026-AGENT)
- **Service structure:** Constructor + método retorna `List[ValidationErrorItem]`
- **Constants extraction:** Category name, error templates, magic numbers
- **Defensive programming:** None input handling
- **Structured logging:** Context fields (object_count, errors_found)
- **Test organization:** Happy Path / Edge Cases / Security

---

## 3. Data Structures & Contracts

### 3.1 Input Contract
```python
# INPUT: rhino3dm.File3dm (ya parseado por RhinoParserService)
# Acceso:
#   - model.Objects: List[File3dmObject]
#   - obj.Geometry: GeometryBase (tiene .IsValid, .GetBoundingBox())
#   - obj.Attributes.Id: UUID del objeto
#   - obj.Attributes.Name: str (nombre opcional del objeto)
```

### 3.2 Output Contract (EXISTING - reuse)
```python
# src/backend/schemas.py (YA EXISTE desde T-020-DB)
class ValidationErrorItem(BaseModel):
    category: str = Field(..., description="Error category")
    target: Optional[str] = Field(None, description="Target element identifier")
    message: str = Field(..., description="Error description")

# USAGE para T-027-AGENT:
# - category: "geometry"
# - target: str(object.Attributes.Id) o object.Attributes.Name si existe
# - message: Descripción específica (ej: "Geometry is marked as invalid by Rhino...")
```

### 3.3 Constants (NEW - añadir a src/agent/constants.py)
```python
# Geometry Validation
GEOMETRY_CATEGORY_NAME = "geometry"
MIN_VALID_VOLUME = 1e-6  # Minimum volume in cubic units (avoid near-zero volumes)

# Error Messages Templates
GEOMETRY_ERROR_INVALID = "Geometry is marked as invalid by Rhino (obj.Geometry.IsValid = False)"
GEOMETRY_ERROR_NULL = "Geometry is null or missing"
GEOMETRY_ERROR_DEGENERATE_BBOX = "Bounding box is degenerate or invalid"
GEOMETRY_ERROR_ZERO_VOLUME = "Solid geometry has zero or near-zero volume (< {min_volume} cubic units)"
```

### 3.4 Service Interface (NEW)
```python
# src/agent/services/geometry_validator.py (NUEVO ARCHIVO)

class GeometryValidator:
    """
    Service for validating geometric integrity of Rhino objects.
    
    Performs 3D geometry validation to detect:
    - Invalid geometry (Rhino's internal validity checks)
    - Null/missing geometry
    - Degenerate bounding boxes
    - Zero-volume solids (Brep/Mesh)
    """
    
    def __init__(self):
        """Initialize geometry validator with logging."""
        logger.info("geometry_validator.initialized")
    
    def validate_geometry(
        self, 
        model: rhino3dm.File3dm
    ) -> List[ValidationErrorItem]:
        """
        Validate all geometric objects in a .3dm file.
        
        Args:
            model: Parsed rhino3dm File3dm object
            
        Returns:
            List of ValidationErrorItem for objects with invalid geometry.
            Empty list if all geometry is valid.
        """
        # IMPLEMENTATION: TDD-GREEN phase
        raise NotImplementedError("To be implemented in TDD-GREEN phase")
```

---

## 4. Validation Logic (Implementation Blueprint)

### 4.1 Checks Performed (in order)
| # | Check | Condition | Error Category | Target |
|---|-------|-----------|----------------|--------|
| 1 | **Null Geometry** | `obj.Geometry is None` | `geometry` | object_id |
| 2 | **Invalid Geometry** | `obj.Geometry.IsValid == False` | `geometry` | object_id |
| 3 | **Degenerate BBox** | `bbox.IsValid == False` | `geometry` | object_id |
| 4 | **Zero Volume** | `bbox_volume < MIN_VALID_VOLUME` (solo Brep/Mesh) | `geometry` | object_id |

### 4.2 rhino3dm API Reference
```python
# Geometry Validity
is_valid = obj.Geometry.IsValid  # bool

# Bounding Box
bbox = obj.Geometry.GetBoundingBox(False)  # False = world coordinates
is_bbox_valid = bbox.IsValid  # bool
bbox_volume = (bbox.Max.X - bbox.Min.X) * (bbox.Max.Y - bbox.Min.Y) * (bbox.Max.Z - bbox.Min.Z)

# Object Type Detection
isinstance(obj.Geometry, rhino3dm.Brep)  # Sólidos/superficies
isinstance(obj.Geometry, rhino3dm.Mesh)  # Mallas trianguladas
isinstance(obj.Geometry, rhino3dm.Curve)  # Curvas 2D/3D
isinstance(obj.Geometry, rhino3dm.Point)  # Puntos

# Object Attributes
object_id = str(obj.Attributes.Id)  # UUID as string
object_name = obj.Attributes.Name if obj.Attributes.Name else object_id
```

### 4.3 Pseudocode (for TDD-GREEN)
```python
def validate_geometry(self, model: rhino3dm.File3dm) -> List[ValidationErrorItem]:
    errors = []
    
    # Defensive programming
    if model is None:
        logger.warning("geometry_validator.validate_geometry.none_input")
        return errors
    
    logger.info("geometry_validator.validate_geometry.started", object_count=len(model.Objects))
    
    for obj in model.Objects:
        # Check 1: Null geometry
        if obj.Geometry is None:
            errors.append(ValidationErrorItem(
                category=GEOMETRY_CATEGORY_NAME,
                target=str(obj.Attributes.Id),
                message=GEOMETRY_ERROR_NULL
            ))
            continue  # Skip further checks
        
        # Check 2: Invalid geometry
        if not obj.Geometry.IsValid:
            errors.append(ValidationErrorItem(
                category=GEOMETRY_CATEGORY_NAME,
                target=str(obj.Attributes.Id),
                message=GEOMETRY_ERROR_INVALID
            ))
            logger.debug("geometry_validator.validation_failed", 
                        object_id=str(obj.Attributes.Id), 
                        failure_reason="invalid_geometry")
        
        # Check 3: Degenerate bounding box
        bbox = obj.Geometry.GetBoundingBox(False)
        if not bbox.IsValid:
            errors.append(ValidationErrorItem(
                category=GEOMETRY_CATEGORY_NAME,
                target=str(obj.Attributes.Id),
                message=GEOMETRY_ERROR_DEGENERATE_BBOX
            ))
            logger.debug("geometry_validator.validation_failed",
                        object_id=str(obj.Attributes.Id),
                        failure_reason="degenerate_bbox")
        
        # Check 4: Zero volume (solo Brep/Mesh)
        if isinstance(obj.Geometry, (rhino3dm.Brep, rhino3dm.Mesh)):
            volume = (bbox.Max.X - bbox.Min.X) * (bbox.Max.Y - bbox.Min.Y) * (bbox.Max.Z - bbox.Min.Z)
            if volume < MIN_VALID_VOLUME:
                errors.append(ValidationErrorItem(
                    category=GEOMETRY_CATEGORY_NAME,
                    target=str(obj.Attributes.Id),
                    message=GEOMETRY_ERROR_ZERO_VOLUME.format(min_volume=MIN_VALID_VOLUME)
                ))
                logger.debug("geometry_validator.validation_failed",
                            object_id=str(obj.Attributes.Id),
                            failure_reason="zero_volume",
                            volume=volume)
    
    logger.info("geometry_validator.validate_geometry.completed",
                objects_checked=len(model.Objects),
                errors_found=len(errors))
    
    return errors
```

---

## 5. Test Cases Specification

### 5.1 Happy Path Tests
| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| **HP-1** | All valid geometry | 5 objects, all `IsValid=True` | `[]` (0 errors) |
| **HP-2** | Empty model | `model.Objects = []` | `[]` (0 errors, no crash) |

### 5.2 Edge Case Tests
| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| **EC-1** | All invalid geometry | 3 objects, all `IsValid=False` | 3 errors, category="geometry" |
| **EC-2** | Mixed valid/invalid | 5 objects: 2 valid, 3 invalid | 3 errors (ONLY invalid objects) |
| **EC-3** | Null geometry | 1 object, `obj.Geometry=None` | 1 error, message="Geometry is null..." |
| **EC-4** | Degenerate bbox | 1 object, `bbox.IsValid=False` | 1 error, message="Bounding box..." |
| **EC-5** | Zero-volume solid | 1 Brep, volume=0 | 1 error, message="zero volume" |

### 5.3 Security/Error Handling Tests
| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| **SE-1** | None model input | `model=None` | `[]` OR `TypeError` (acceptable) |
| **SE-2** | Object without Attributes | obj.Attributes=None | Graceful handling (placeholder ID) |

### 5.4 Integration Test (opcional - más T-029)
| Test ID | Description | Input | Expected Output |
|---------|-------------|-------|-----------------|
| **IT-1** | Real .3dm file | File with mixed geometry | Correct errors detected |

**Total Tests:** 9-10 comprehensive unit tests

---

## 6. Files to Create/Modify

### 6.1 Create
```
src/agent/services/geometry_validator.py
├── Imports (rhino3dm, structlog, constants, schemas)
├── logger = structlog.get_logger()
├── class GeometryValidator
│   ├── __init__(self)
│   └── validate_geometry(self, model) -> List[ValidationErrorItem]
└── Estimated: ~120 lines

tests/unit/test_geometry_validator.py
├── Imports (pytest, GeometryValidator, mock rhino3dm objects)
├── Fixtures (valid_model, invalid_model, mixed_model, etc.)
├── Happy Path tests (2 tests)
├── Edge Case tests (5 tests)
├── Security tests (2 tests)
└── Estimated: ~300 lines
```

### 6.2 Modify
```
src/agent/constants.py
└── ADD:
    - GEOMETRY_CATEGORY_NAME = "geometry"
    - MIN_VALID_VOLUME = 1e-6
    - GEOMETRY_ERROR_INVALID = "..."
    - GEOMETRY_ERROR_NULL = "..."
    - GEOMETRY_ERROR_DEGENERATE_BBOX = "..."
    - GEOMETRY_ERROR_ZERO_VOLUME = "..."

src/agent/services/__init__.py
└── ADD:
    from .geometry_validator import GeometryValidator
    __all__ = [..., "GeometryValidator"]
```

---

## 7. Integration Roadmap (Future Tickets)

### T-029-BACK: Integration with validate_file Task
```python
# src/agent/tasks.py (FUTURE MODIFICATION)
from services.nomenclature_validator import NomenclatureValidator
from services.geometry_validator import GeometryValidator  # ← NEW

@celery_app.task
def validate_file(part_id: str, s3_key: str):
    # ... parsing logic ...
    nomenclature_errors = NomenclatureValidator().validate_nomenclature(result.layers)
    geometry_errors = GeometryValidator().validate_geometry(model)  # ← INTEGRATION
    
    all_errors = nomenclature_errors + geometry_errors
    # ... save validation_report to blocks.validation_report ...
```

### T-032-FRONT: Visualization in ValidationReportModal
```typescript
// FUTURE COMPONENT
<ValidationReportModal report={validationReport}>
  <Tabs>
    <Tab label="Nomenclature">
      {/* Errors with category="nomenclature" */}
    </Tab>
    <Tab label="Geometry">
      {/* Errors with category="geometry" */} ← T-027 OUTPUT
      {/* List of invalid objects with target (object ID) */}
      {/* Nice-to-have: Highlight object in 3D viewer on click */}
    </Tab>
  </Tabs>
</ValidationReportModal>
```

---

## 8. Performance & Scalability

### Expected Load
- **Small files:** 10-50 objects → <1ms validation
- **Medium files:** 100-500 objects → <10ms validation
- **Large files:** 1,000-10,000 objects → <100ms validation

### Optimization Opportunities (Post-MVP)
1. **Parallel processing:** Validate objects con multiprocessing
2. **Early exit:** Skip geometría en capas inválidas (post nomenclature check)
3. **Caching:** Cache bbox calculations si re-validaciones frecuentes

**For MVP:** Validar TODOS los objetos secuencialmente (simplicidad > performance)

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| rhino3dm API changes | HIGH | LOW | Pin rhino3dm==8.4.0 en requirements |
| BBox calculation exceptions | MEDIUM | MEDIUM | Try/except con logging, skip objeto |
| Large file OOM (10k+ objects) | HIGH | LOW | Task timeout (600s) ya configurado en T-022 |
| False positives (valid geometry flagged invalid) | MEDIUM | MEDIUM | Unit tests exhaustivos + real .3dm fixtures |

---

## 10. Success Criteria (DoD)

- [ ] Service class `GeometryValidator` created with `validate_geometry()` method
- [ ] 9-10 unit tests written (Happy Path + Edge Cases + Security)
- [ ] All tests PASS (0 failures)
- [ ] Constants extracted to `constants.py`
- [ ] Service exported in `__init__.py`
- [ ] Code follows T-026 pattern (structured logging, defensive programming)
- [ ] No regression on T-024/T-025/T-026 tests
- [ ] Documentation updated (prompts.md registered)

---

## 11. Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **TDD-RED** | Write 9-10 failing tests | 1.5 hours |
| **TDD-GREEN** | Implement minimal logic to pass tests | 1 hour |
| **TDD-REFACTOR** | Improve code, add logging, extract constants | 0.5 hours |
| **Documentation** | Update docs, prompts.md, activeContext | 0.5 hours |
| **AUDIT** | Final QA check, regression tests | 0.5 hours |
| **TOTAL** | | **~4 hours** |

**Confidence Level:** HIGH (siguiendo patrón probado de T-026-AGENT)

---

## 12. Handoff for TDD-RED Phase

```
=============================================
READY FOR TDD-RED PHASE
=============================================
Ticket ID:       T-027-AGENT
Feature name:    Geometry Validator
Key test cases:  
  1. All valid geometry → 0 errors
  2. All invalid geometry → N errors (category="geometry")
  3. Mixed valid/invalid → errors only for invalid objects
  4. Null geometry → error with GEOMETRY_ERROR_NULL message
  5. Degenerate bounding box → error detected
  6. Zero-volume solid → error for Brep/Mesh only
  7. Empty model → 0 errors (no crash)
  8. None input → handle gracefully (return [] or TypeError)
  9. Objects without attributes → graceful handling

Files to create:
  - src/agent/services/geometry_validator.py (~120 lines)
  - tests/unit/test_geometry_validator.py (~300 lines, 9-10 tests)

Files to modify:
  - src/agent/constants.py (add 6 GEOMETRY_* constants)
  - src/agent/services/__init__.py (export GeometryValidator)

Dependencies verified:
  ✅ T-024-AGENT (RhinoParserService provides File3dm model)
  ✅ T-026-AGENT (NomenclatureValidator pattern to follow)
  ✅ ValidationErrorItem schema (exists in schemas.py)
  ✅ rhino3dm 8.4.0 (installed and working)

Contract verified:
  ✅ Input: rhino3dm.File3dm (from RhinoParserService)
  ✅ Output: List[ValidationErrorItem] (category="geometry")
  ✅ No new Pydantic models needed (reuse existing)
  ✅ No API endpoints (internal service only)

Next command:
  Use TDD-RED prompt with the test cases above
=============================================
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-14  
**Status:** ✅ APPROVED FOR TDD-RED - READY TO PROCEED
