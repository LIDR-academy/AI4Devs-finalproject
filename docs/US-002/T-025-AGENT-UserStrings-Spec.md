# T-025-AGENT: Metadata Extractor (User Strings) - Especificación Técnica Detallada

**Ticket ID:** T-025-AGENT  
**Prioridad:** 🟡 ALTA  
**Story Points:** 2  
**Dependencias:** T-024-AGENT (Rhino Ingestion Service)

---

## 1. CONTEXTO Y OBJETIVO

### Problema de Negocio
Los archivos Rhino (.3dm) de la Sagrada Familia contienen **metadata crítica en user strings** a nivel de `InstanceObject`. Esta información es esencial para:
- Trazabilidad completa (código de producción, matrícula ISO-19650)
- Gestión de materiales (tipo, resistencia, proveedor)
- Control de calidad (grado estructural, volumen, peso)
- Planificación (fase proyecto, localización, agrupación)

**Si no extraemos user strings → El sistema pierde el 80% del valor BIM del modelo.**

### Objetivo del Ticket
Implementar función Python que:
1. ✅ Extrae **46 user strings** definidos de cada `InstanceObject` en archivo Rhino
2. ✅ Valida tipos de datos (numéricos, fechas, enums)
3. ✅ Estructura metadata en JSON normalizado
4. ✅ Guarda resultado en `blocks.rhino_metadata` (JSONB)

---

## 2. SCHEMA DE USER STRINGS (Sagrada Familia)

### 2.1. Categorización de Campos

Los 46 campos se organizan en 6 categorías:

#### **A. Metadatos de Proyecto (10 campos)**
Información contextual del archivo y equipo.

| Campo | Tipo | Ejemplo | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `Arquitecte` | string | "Esteve Umbert" | ✅ | Arquitecto responsable |
| `Colaborador` | string | "E-dintech Group" | ❌ | Empresa colaboradora |
| `Data` | date | "31/07/2025" | ✅ | Fecha última modificación |
| `Dibuixat` | string | "P. Cortés" | ✅ | Técnico que dibujó |
| `TitolPlanol` | string | "Mock-up Campanars" | ✅ | Título del plano |
| `Planol` | string | "Costelles Tram 1 - Pedra" | ✅ | Descripción del plano |
| `FaseProj` | enum | "Producció" | ✅ | Fase del proyecto |
| `ProjectFolder` | path | "H:\\Mi unidad\\..." | ❌ | Ruta carpeta proyecto |
| `GeosFolder` | path | "H:\\Mi unidad\\...\\DWG" | ❌ | Ruta archivos geométricos |
| `IGSFolder` | path | "H:\\Mi unidad\\...\\IGS" | ❌ | Ruta archivos IGES |

**Enum `FaseProj`:** `["Disseny", "Producció", "Fabricació", "Muntatge", "Instal·lació"]`

---

#### **B. Códigos de Identificación (9 campos)**
Sistema de nomenclatura ISO-19650 extended.

| Campo | Tipo | Ejemplo | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `Codi` | string | "GLPER.B-PAE0720.0702" | ✅ | Código pieza (formato ISO) |
| `CodiArxiu` | string | "Fx(PC)GICam_MU_...3dm" | ✅ | Nombre archivo completo |
| `CodiFitxe` | string | "Fx 068" | ✅ | Código ficha técnica |
| `CodiPdf` | string | "Fx(PC)GICam_MU_...pdf" | ✅ | Nombre PDF asociado |
| `CodiProduccio` | string | "P3 378 P70" | ✅ | Código producción interno |
| `Guid` | uuid | "ee2a3a90-ae5e-..." | ✅ | GUID único del objeto |
| `Prefix` | string | "GICam_MU_CostellesTram1" | ✅ | Prefijo agrupación |
| `NomVitrall` | string | "Fx(PC)GICam_MU_..." | ✅ | Nombre vidriera (legado) |
| `SF_PRO_Matricula` | string | "GLPER.B-PAE0720.0702" | ✅ | Matrícula oficial SF |

**Validación crítica:** `Codi` debe coincidir con `SF_PRO_Matricula` (integrity check).

---

#### **C. Arquitectura y Clasificación SF (8 campos)**
Jerarquía específica de la Sagrada Familia.

| Campo | Tipo | Ejemplo | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `SF_ARC_Agrupacio1` | string | "PER_B_PAE_0720" | ✅ | Agrupación nivel 1 |
| `SF_ARC_Agrupacio1Numeral` | string | "0720" | ✅ | Número agrupación |
| `SF_ARC_Agrupacio1Tipus` | enum | "PAE" | ✅ | Tipo agrupación |
| `SF_ARC_Filada` | string | "07" | ✅ | Número de hilada |
| `SF_ARC_Numeral` | string | "02" | ✅ | Número correlativo |
| `SF_ARC_PeçaTipus` | enum | "Peça Unica" | ✅ | Tipología de pieza |

**Enum `SF_ARC_Agrupacio1Tipus`:** `["PAE", "CAP", "COL", "DOV", "CLA", "IMP"]`  
**Enum `SF_ARC_PeçaTipus`:** `["Peça Unica", "Peça Serie A", "Peça Serie B", "Plantilla"]`

---

#### **D. Propiedades Generales (12 campos)**
Características físicas y técnicas de la pieza.

| Campo | Tipo | Ejemplo | Obligatorio | Validación |
|-------|------|---------|-------------|------------|
| `SF_GEN_Material` | enum | "M_Pedra_CA" | ✅ | Material base |
| `SF_GEN_GrauEstructural` | enum | "C" | ✅ | Grado resistencia |
| `SF_GEN_NomElement` | string | "COS" | ✅ | Código elemento |
| `SF_GEN_NomSubElement` | string | "EST" | ✅ | Código subelemento |
| `SF_GEN_TipusObjecte` | enum | "Peça" | ✅ | Tipo objeto |
| `SF_GEN_Volum_m3` | float | "0.0244210305415" | ✅ | Volumen real (m³) |
| `SF_GEN_VolumBrut_m3` | float | "0.024" | ✅ | Volumen bruto (m³) |
| `SF_GEN_Pes_t` | float | "0.063" | ✅ | Peso estimado (toneladas) |
| `SF_GEN_AlçadaBruta_m` | float | "0.305" | ✅ | Altura bruta (metros) |
| `SF_GEN_AmpladaBruta_m` | float | "0.667" | ✅ | Ancho bruto (metros) |
| `SF_GEN_ProfunditatBruta_m` | float | "0.12" | ✅ | Profundidad bruta (m) |
| `Quantitat` | integer | "1" | ✅ | Cantidad de piezas |

**Enum `SF_GEN_Material`:**  
`["M_Pedra_CA", "M_Pedra_XX", "M_Formigo_C30", "M_Acer_S275"]`

**Enum `SF_GEN_GrauEstructural`:**  
`["A", "B", "C", "D"]` (A=máxima resistencia, D=decorativo)

**Enum `SF_GEN_TipusObjecte`:**  
`["Peça", "Plantilla", "Referència", "Auxiliar"]`

**Validaciones:**
- `SF_GEN_Volum_m3 <= SF_GEN_VolumBrut_m3` (volumen real ≤ bruto)
- `SF_GEN_Pes_t > 0` (peso positivo)
- Dimensiones coherentes: `Volum ≈ Alçada × Amplada × Profunditat`

---

#### **E. Localización (2 campos)**
Ubicación en el edificio.

| Campo | Tipo | Ejemplo | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `SF_LOC_Zona` | enum | "PER" | ✅ | Zona Sagrada Familia |
| `SF_LOC_Eix` | enum | "B" | ✅ | Eje estructural |

**Enum `SF_LOC_Zona`:**  
`["PER", "NAT", "GRA", "PAS", "ABS", "CRU"]`  
(Perímetro, Natividad, Gloria, Pasión, Ábside, Crucero)

**Enum `SF_LOC_Eix`:**  
`["A", "B", "C", "D", "E", "F", "G", "H"]`

---

#### **F. Producción Extendida (5 campos)**
Metadatos adicionales de fabricación.

| Campo | Tipo | Ejemplo | Obligatorio | Descripción |
|-------|------|---------|-------------|-------------|
| `Material` | string | "Cantàbria" | ✅ | Cantera/proveedor |
| `Resistencia` | string | "C (45/4)" | ✅ | Resistencia compresión |
| `SF_PRO_Tram` | string | "01" | ✅ | Tramo de obra |

**Validación `Resistencia`:**  
Formato: `"{GrauEstructural} ({Compressio}/{Tracció})"` (MPa)

---

## 3. IMPLEMENTACIÓN TÉCNICA

### 3.1. Pydantic Models (Validación)

```python
# src/agent/schemas/user_strings.py
from pydantic import BaseModel, Field, validator, UUID4
from typing import Optional, Literal
from datetime import date
from decimal import Decimal

# Enums
FaseProj = Literal["Disseny", "Producció", "Fabricació", "Muntatge", "Instal·lació"]
MaterialType = Literal["M_Pedra_CA", "M_Pedra_XX", "M_Formigo_C30", "M_Acer_S275"]
GrauEstructural = Literal["A", "B", "C", "D"]
TipusObjecte = Literal["Peça", "Plantilla", "Referència", "Auxiliar"]
PeçaTipus = Literal["Peça Unica", "Peça Serie A", "Peça Serie B", "Plantilla"]
ZonaSF = Literal["PER", "NAT", "GRA", "PAS", "ABS", "CRU"]
EixSF = Literal["A", "B", "C", "D", "E", "F", "G", "H"]

class SagradaFamiliaUserStrings(BaseModel):
    """Schema completo de user strings para piezas Sagrada Familia"""
    
    # A. Metadatos Proyecto
    Arquitecte: str = Field(..., min_length=3, max_length=100)
    Colaborador: Optional[str] = None
    Data: date  # Parsear de "31/07/2025"
    Dibuixat: str
    TitolPlanol: str
    Planol: str
    FaseProj: FaseProj
    ProjectFolder: Optional[str] = None
    GeosFolder: Optional[str] = None
    IGSFolder: Optional[str] = None
    
    # B. Códigos Identificación
    Codi: str = Field(..., regex=r'^[A-Z]{2,5}\.[A-Z]-[A-Z]{3}\d{4}\.\d{4}$')
    CodiArxiu: str
    CodiFitxe: str
    CodiPdf: str
    CodiProduccio: str
    Guid: UUID4
    Prefix: str
    NomVitrall: str
    SF_PRO_Matricula: str
    
    # C. Arquitectura SF
    SF_ARC_Agrupacio1: str
    SF_ARC_Agrupacio1Numeral: str = Field(..., regex=r'^\d{4}$')
    SF_ARC_Agrupacio1Tipus: str
    SF_ARC_Filada: str = Field(..., regex=r'^\d{2}$')
    SF_ARC_Numeral: str = Field(..., regex=r'^\d{2}$')
    SF_ARC_PeçaTipus: PeçaTipus
    
    # D. Propiedades Generales
    SF_GEN_Material: MaterialType
    SF_GEN_GrauEstructural: GrauEstructural
    SF_GEN_NomElement: str
    SF_GEN_NomSubElement: str
    SF_GEN_TipusObjecte: TipusObjecte
    SF_GEN_Volum_m3: Decimal = Field(..., gt=0, max_digits=10, decimal_places=6)
    SF_GEN_VolumBrut_m3: Decimal = Field(..., gt=0)
    SF_GEN_Pes_t: Decimal = Field(..., gt=0, max_digits=6, decimal_places=3)
    SF_GEN_AlçadaBruta_m: Decimal = Field(..., gt=0)
    SF_GEN_AmpladaBruta_m: Decimal = Field(..., gt=0)
    SF_GEN_ProfunditatBruta_m: Decimal = Field(..., gt=0)
    Quantitat: int = Field(..., ge=1)
    
    # E. Localització
    SF_LOC_Zona: ZonaSF
    SF_LOC_Eix: EixSF
    
    # F. Producció
    Material: str  # Proveedor (e.g., "Cantàbria")
    Resistencia: str = Field(..., regex=r'^[A-D] \(\d{2}/\d+\)$')
    SF_PRO_Tram: str = Field(..., regex=r'^\d{2}$')
    
    @validator('SF_PRO_Matricula')
    def matricula_matches_codi(cls, v, values):
        """Validar que matrícula coincida con Codi"""
        if 'Codi' in values and v != values['Codi']:
            raise ValueError(f"SF_PRO_Matricula ({v}) no coincide con Codi ({values['Codi']})")
        return v
    
    @validator('SF_GEN_Volum_m3')
    def volum_lte_volum_brut(cls, v, values):
        """Volumen real debe ser <= volumen bruto"""
        if 'SF_GEN_VolumBrut_m3' in values and v > values['SF_GEN_VolumBrut_m3']:
            raise ValueError(f"Volum ({v}) > VolumBrut ({values['SF_GEN_VolumBrut_m3']})")
        return v
    
    @validator('Data', pre=True)
    def parse_catalan_date(cls, v):
        """Parsear fecha catalana DD/MM/YYYY"""
        if isinstance(v, str):
            from datetime import datetime
            return datetime.strptime(v, "%d/%m/%Y").date()
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "Codi": "GLPER.B-PAE0720.0702",
                "SF_GEN_Material": "M_Pedra_CA",
                "SF_GEN_Volum_m3": "0.0244210305415"
            }
        }
```

---

### 3.2. Función de Extracción

```python
# src/agent/services/metadata_extractor.py
import rhino3dm
from typing import Dict, List
from .schemas.user_strings import SagradaFamiliaUserStrings
from pydantic import ValidationError
import structlog

logger = structlog.get_logger()

def extract_user_strings_from_instance_objects(
    file3dm: rhino3dm.File3dm
) -> Dict[str, Dict]:
    """
    Extrae user strings de InstanceObjects en archivo Rhino.
    
    Args:
        file3dm: Archivo Rhino cargado con rhino3dm.File3dm.Read()
    
    Returns:
        Dict con estructura:
        {
            "objects": {
                "uuid-1": { ...46 campos validados... },
                "uuid-2": { ...46 campos validados... }
            },
            "validation_errors": [
                {"object_id": "uuid-3", "errors": ["Campo X faltante"]}
            ],
            "summary": {
                "total_objects": 10,
                "valid_objects": 8,
                "invalid_objects": 2
            }
        }
    """
    result = {
        "objects": {},
        "validation_errors": [],
        "summary": {"total_objects": 0, "valid_objects": 0, "invalid_objects": 0}
    }
    
    # Iterar sobre InstanceObjects
    for obj in file3dm.Objects:
        # Filtrar solo InstanceObjects (type = 4112)
        if obj.Geometry.ObjectType != rhino3dm.ObjectType.InstanceReference:
            continue
        
        result["summary"]["total_objects"] += 1
        obj_id = str(obj.Attributes.Id)
        
        # Extraer user strings raw
        user_strings_raw = {}
        for i in range(obj.Attributes.UserStringCount):
            key = obj.Attributes.GetUserString(i)[0]
            value = obj.Attributes.GetUserString(i)[1]
            user_strings_raw[key] = value
        
        # Validar con Pydantic
        try:
            validated_data = SagradaFamiliaUserStrings(**user_strings_raw)
            result["objects"][obj_id] = validated_data.dict()
            result["summary"]["valid_objects"] += 1
            
            logger.info(
                "user_strings_extracted",
                object_id=obj_id,
                codi=validated_data.Codi,
                material=validated_data.SF_GEN_Material
            )
            
        except ValidationError as e:
            result["validation_errors"].append({
                "object_id": obj_id,
                "raw_data": user_strings_raw,
                "errors": [
                    {
                        "field": err["loc"][0],
                        "message": err["msg"],
                        "value": err.get("input")
                    }
                    for err in e.errors()
                ]
            })
            result["summary"]["invalid_objects"] += 1
            
            logger.warning(
                "user_strings_validation_failed",
                object_id=obj_id,
                error_count=len(e.errors()),
                errors=e.errors()
            )
    
    return result
```

---

### 3.3. Integración con T-024-AGENT

```python
# src/agent/tasks/validation_task.py
from celery import Task
from .services.metadata_extractor import extract_user_strings_from_instance_objects
import rhino3dm

@celery_app.task(bind=True, max_retries=3, time_limit=600)
def validate_file(self, part_id: str, s3_key: str):
    """Task principal de validación"""
    
    # 1. Download del archivo (T-024)
    local_path = download_from_s3(s3_key)
    
    # 2. Leer archivo Rhino
    file3dm = rhino3dm.File3dm.Read(local_path)
    
    # 3. **NUEVO: Extraer user strings** (T-025)
    metadata_result = extract_user_strings_from_instance_objects(file3dm)
    
    # 4. Validar nomenclatura (T-026)
    nomenclature_errors = validate_nomenclature(file3dm)
    
    # 5. Validar geometría (T-027)
    geometry_errors = validate_geometry(file3dm)
    
    # 6. Compilar reporte final
    validation_report = {
        "is_valid": (
            len(nomenclature_errors) == 0 and
            len(geometry_errors) == 0 and
            metadata_result["summary"]["invalid_objects"] == 0
        ),
        "errors": nomenclature_errors + geometry_errors,
        "metadata": metadata_result,  # <-- User strings aquí
        "validated_at": datetime.utcnow().isoformat(),
        "validated_by": "librarian-v1.0-rhino3dm"
    }
    
    # 7. Guardar en DB (T-028)
    save_validation_report(part_id, validation_report)
    
    # 8. Actualizar estado
    if validation_report["is_valid"]:
        update_part_status(part_id, "validated")
    else:
        update_part_status(part_id, "rejected")
    
    return validation_report
```

---

## 4. TESTS

### 4.1. Fixtures Requeridos

Crear archivo de test: `tests/fixtures/valid_user_strings.3dm`

**Requisitos del fixture:**
- ✅ 1 InstanceObject con los 46 user strings completos
- ✅ Valores realistas (copiar del ejemplo proporcionado)
- ✅ GUID válido generado
- ✅ Fecha válida en formato DD/MM/YYYY

**Comando Rhino para crear fixture:**
```python
# Script Rhino Python para generar fixture
import rhinoscriptsyntax as rs
import scriptcontext as sc

# Crear bloque simple
rs.AddBlock(["0,0,0"], "TestBlock", delete_input=False)
instance = rs.InsertBlock("TestBlock", (0,0,0))

# Añadir user strings
user_strings = {
    "Arquitecte": "Esteve Umbert",
    "Codi": "GLPER.B-PAE0720.0702",
    # ... todos los 46 campos
}

for key, value in user_strings.items():
    rs.SetUserText(instance, key, str(value))

# Guardar como valid_user_strings.3dm
```

---

### 4.2. Unit Tests

```python
# tests/agent/test_metadata_extractor.py
import pytest
import rhino3dm
from agent.services.metadata_extractor import extract_user_strings_from_instance_objects

def test_extract_valid_user_strings():
    """Test extracción completa con todos los campos válidos"""
    # Arrange
    file3dm = rhino3dm.File3dm.Read("tests/fixtures/valid_user_strings.3dm")
    
    # Act
    result = extract_user_strings_from_instance_objects(file3dm)
    
    # Assert
    assert result["summary"]["total_objects"] == 1
    assert result["summary"]["valid_objects"] == 1
    assert result["summary"]["invalid_objects"] == 0
    assert len(result["validation_errors"]) == 0
    
    # Verificar campos específicos
    first_obj = list(result["objects"].values())[0]
    assert first_obj["Codi"] == "GLPER.B-PAE0720.0702"
    assert first_obj["SF_GEN_Material"] == "M_Pedra_CA"
    assert float(first_obj["SF_GEN_Volum_m3"]) == pytest.approx(0.0244, rel=1e-3)


def test_extract_missing_required_field():
    """Test fallo si falta campo obligatorio"""
    # Arrange: Fixture sin campo 'Arquitecte'
    file3dm = rhino3dm.File3dm.Read("tests/fixtures/missing_arquitecte.3dm")
    
    # Act
    result = extract_user_strings_from_instance_objects(file3dm)
    
    # Assert
    assert result["summary"]["invalid_objects"] == 1
    assert len(result["validation_errors"]) > 0
    
    error = result["validation_errors"][0]
    assert any(e["field"] == "Arquitecte" for e in error["errors"])


def test_validate_matricula_codi_mismatch():
    """Test fallo si SF_PRO_Matricula != Codi"""
    # Arrange: Fixture con matricula diferente de codi
    file3dm = rhino3dm.File3dm.Read("tests/fixtures/mismatched_matricula.3dm")
    
    # Act
    result = extract_user_strings_from_instance_objects(file3dm)
    
    # Assert
    assert result["summary"]["invalid_objects"] == 1
    error_msg = result["validation_errors"][0]["errors"][0]["message"]
    assert "no coincide" in error_msg.lower()


def test_validate_volume_constraints():
    """Test validación Volum <= VolumBrut"""
    # Arrange: Fixture con volumen > volumen bruto (imposible físicamente)
    file3dm = rhino3dm.File3dm.Read("tests/fixtures/invalid_volume.3dm")
    
    # Act
    result = extract_user_strings_from_instance_objects(file3dm)
    
    # Assert
    assert result["summary"]["invalid_objects"] == 1


def test_parse_catalan_date_format():
    """Test parsing fecha catalana DD/MM/YYYY"""
    # Arrange
    file3dm = rhino3dm.File3dm.Read("tests/fixtures/valid_user_strings.3dm")
    
    # Act
    result = extract_user_strings_from_instance_objects(file3dm)
    
    # Assert
    first_obj = list(result["objects"].values())[0]
    assert first_obj["Data"] == "2025-07-31"  # Formato ISO después de parseo
```

---

## 5. CRITERIOS DE ACEPTACIÓN (DoD)

### ✅ Funcional
- [ ] Extrae correctamente los 46 user strings de InstanceObjects
- [ ] Valida tipos de datos (float, int, date, UUID, enums)
- [ ] Detecta campos faltantes obligatorios
- [ ] Valida constraints cross-field (Matricula=Codi, Volum<=VolumBrut)
- [ ] Parsea fechas catalanas (DD/MM/YYYY → ISO)

### ✅ Testing
- [ ] 5 unit tests pasando (valid, missing, mismatch, volume, date)
- [ ] 3 fixtures creados (.3dm válido, sin campo, matricula incorrecta)
- [ ] Coverage >90% en metadata_extractor.py

### ✅ Integración
- [ ] Función integrada en T-024 validation task
- [ ] Resultado guardado en `blocks.rhino_metadata` JSONB
- [ ] Logs estructurados con object_id + Codi

### ✅ Performance
- [ ] Extracción de 100 objetos <2 segundos
- [ ] Sin memory leaks (usar context manager para File3dm)

---

## 6. ESTIMACIÓN

**Story Points:** 2  
**Tiempo Estimado:** 4-6 horas

**Breakdown:**
- Schema Pydantic: 1.5h
- Función extracción: 1h
- Unit tests: 2h
- Fixtures Rhino: 1h
- Integración + debug: 0.5h

---

## 7. NOTAS TÉCNICAS

### 7.1. Optimizaciones
```python
# Caché de validación para archivos grandes
@lru_cache(maxsize=128)
def get_enum_validator(field_name: str):
    """Cache enum validators para evitar recrearlos"""
    pass
```

### 7.2. Error Handling
```python
# Si TODOS los objetos fallan validación → warning pero NO failure
if result["summary"]["valid_objects"] == 0:
    logger.warning("no_valid_objects_found", part_id=part_id)
    # Continuar validación (nomenclature/geometry pueden pasar)
```

### 7.3. Extensibilidad
```python
# Preparar para versioning de schema
class UserStringsV1(SagradaFamiliaUserStrings):
    schema_version: Literal["1.0"] = "1.0"

# Futuro: UserStringsV2 con nuevos campos
```

---

## 8. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| User strings no existen en archivo legacy | ALTA | ALTO | Hacer campos opcionales + warning log |
| Typo en nombre de campo (e.g., "Arquitecto" vs "Arquitecte") | MEDIA | MEDIO | Fuzzy matching con threshold 90% |
| Valores fuera de enum debido a variaciones | MEDIA | BAJO | Log warning pero aceptar como string |
| Fecha en formato diferente | BAJA | BAJO | Intentar parseo con 3 formatos: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY |

---

## 9. APROBACIÓN Y SIGNATARIOS

**Creado por:** AI Assistant  
**Revisado por:** [Product Owner]  
**Aprobado por:** [Tech Lead]  
**Fecha:** 2026-02-11

---

**Status:** ✅ LISTO PARA IMPLEMENTACIÓN
