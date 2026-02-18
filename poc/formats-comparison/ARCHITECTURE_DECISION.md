# ADR-001: Gestión de InstanceObjects con Geometría Brep

**Fecha:** 2026-02-18  
**Estado:** ✅ ACEPTADA  
**Contexto:** POC Formats Comparison + US-005 Dashboard 3D  

---

## Contexto

### Problema Descubierto

Durante la implementación de la POC para comparar formatos 3D (glTF+Draco vs ThatOpen), se descubrió que **todos los archivos .3dm de Sagrada Família tienen la siguiente arquitectura:**

```
.3dm File Structure:
│
├── InstanceDefinitions (91 masters)
│   ├── GLPER.B-PAE0720.0102 (11 Breps)
│   ├── GLPER.B-PAE0720.0103 (26 Breps)
│   └── ...
│
├── InstanceReferences (91 instancias colocadas en escena)
│   ├── Instance 1 → def_id + Transform Matrix
│   ├── Instance 2 → def_id + Transform Matrix
│   └── ...
│
└── Direct Geometry (1744 objetos: TextDots, anotaciones)
```

**Hallazgos Clave:**
- ✅ **InstanceObjects:** Arquitectura de bloques reutilizables (correcto para BIM)
- ✅ **InstanceDefinitions:** 91 piezas únicas con geometría compleja
- ❌ **Geometría Brep:** Superficies NURBS sin convertir a Mesh
- ❌ **rhino3dm Limitation:** Librería Python NO expone `CreateMesh()`

### Impacto en el Proyecto

1. **POC Bloqueada:** No podemos procesar archivos actuales sin preprocesamiento
2. **US-005 Afectado:** T-0502-AGENT requiere modificación (añadir paso conversión)
3. **Production Workflow:** Necesita servicio adicional de conversión Brep → Mesh

---

## Decisión

### Opción Seleccionada: **PREPROCESAMIENTO OBLIGATORIO + SERVICIO MESH CONVERSION**

Implementaremos un workflow en dos fases:

#### FASE 1: POC (Actual - Manual)
```
Usuario → Preprocesa .3dm en Rhino Desktop
  |- SelAll
  |- _Mesh (Simple Controls → Fewer Polygons)
  |- Save As: archivo-meshed.3dm
  ↓
POC Exporter → Procesa InstanceObjects con Meshes
  |- parse_instance_definitions()
  |- extract meshes → trimesh
  |- decimate → ~1000 faces
  |- export glTF+Draco
```

**Justificación:**
- ✅ Desbloquea POC inmediatamente
- ✅ Control de calidad manual del mesh
- ✅ No requiere infraestructura adicional
- ⏱️ Time-to-market: <1 día

#### FASE 2: Producción (T-0502B-AGENT - Automático)
```
Usuario → Upload .3dm original (con Breps)
  ↓
Celery Task 1: Validation (US-002)
  |- Nomenclature check
  |- Geometry validation
  |- User Strings extraction
  ↓
Celery Task 2: Mesh Conversion (NUEVO)
  |- Download .3dm from Supabase
  |- RhinoCompute API: Brep.CreateMesh()
  |- Upload .3dm-meshed to Supabase
  |- Update DB: blocks.source_file_meshed_url
  ↓
Celery Task 3: Low-Poly Generation (T-0502-AGENT)
  |- Download .3dm-meshed
  |- rhino3dm parse → trimesh
  |- Decimation → ~1000 faces
  |- glTF+Draco export
  |- Upload → blocks.low_poly_url
```

**Justificación:**
- ✅ Workflow completamente automático
- ✅ No requiere intervención manual del usuario
- ✅ Escalable para 100+ archivos
- ⚠️ Requiere setup RhinoCompute server (2-3 días)
- ⚠️ Añade 30-60s latencia por archivo

---

## Alternativas Consideradas

### Alternativa A: OpenNURBS C++ Custom Build ❌

**Descripción:** Compilar extensión Python con OpenNURBS nativo que exponga `CreateMesh()`.

**Pros:**
- Sin dependencias cloud
- Control total del proceso

**Contras:**
- ❌ Complejidad extrema (5-7 días desarrollo + testing)
- ❌ Mantenimiento costoso (compatibilidad Rhino versions)
- ❌ Builds multiplataforma (macOS, Linux, Windows)
- ❌ Fuera de scope MVP

**Decisión:** Rechazada (over-engineering)

---

### Alternativa B: Convertir Workflow a IFC ❌

**Descripción:** Cambiar flujo completo a .ifc en lugar de .3dm nativo.

**Pros:**
- IFC es estándar BIM open-source
- Compatibilidad con ThatOpen Fragments nativa

**Contras:**
- ❌ Requiere capacitación usuarios (cambio workflow Rhino)
- ❌ Pérdida de metadata Rhino-specific (User Strings)
- ❌ Conversión Rhino→IFC introduce errores geométricos
- ❌ No compatible con arquitectura existente (US-002 validation)

**Decisión:** Rechazada (breaking change, riesgo alto)

---

### Alternativa C: Solo usar glTF directamente desde Rhino ❌

**Descripción:** Usuarios exportan .glb desde Rhino Desktop directamente.

**Pros:**
- Bypasea problema Brep→Mesh completamente
- Usuarios controlan mesh settings

**Contras:**
- ❌ Pierde validación automática (US-002)
- ❌ No extrae User Strings (metadata crítica BIM)
- ❌ No genera versiones optimizadas (low-poly, Draco)
- ❌ Requiere capacitación: "exportar glTF desde Rhino"

**Decisión:** Rechazada (incompatible con sistema actual)

---

## Consecuencias

### Positivas

1. **POC Desbloquead a:** Manual process permite ejecutar benchmarks glTF+Draco vs ThatOpen
2. **Incremental Path:** Fase 1 (manual) → Fase 2 (automático) con misma arquitectura
3. **Documentación:** PREPROCESSING_REQUIRED.md documenta proceso reproducible
4. **Tickets Claros:** T-0502B-AGENT definido (Mesh Conversion Service, 3 SP)

### Negativas

1. **POC No Completamente Realista:** Requiere paso manual que producción no tendrá
2. **Dependencia RhinoCompute:** Para Fase 2, necesitamos setup server ($$ + tiempo)
3. **Latencia Añadida:** +30-60s por archivo en producción (vs Breps directos)
4. **Storage Duplicado:** Archivos .3dm originales + .3dm-meshed + .glb (2x-3x espacio)

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| RhinoCompute setup falla | Media | Alto | Fallback: Manual process documentado |
| Calidad mesh automático mala | Alta | Medio | Batch testing + ajuste parámetros |
| Storage costs overrun | Baja | Medio | Lifecycle policies (delete .3dm-meshed tras 30d) |
| Latency >2min bloquea UX | Media | Alto | Async processing + notificaciones email |

---

## Implementación

### Tickets Modificados/Nuevos

#### T-0502-AGENT (MODIFICADO)
**ANTES:**
```python
# Step 3: Parse Rhino file
rhino_file = rh.File3dm.Read(local_3dm_path)
for obj in rhino_file.Objects:
    if isinstance(obj.Geometry, rh.Brep):
        mesh = obj.Geometry.CreateMesh()  # ❌ NO DISPONIBLE
```

**DESPUÉS:**
```python
# Step 3: Parse Rhino file (MUST be meshed)
rhino_file = rh.File3dm.Read(local_3dm_path_MESHED)

# Step 3.1: Extract InstanceDefinitions
for idef_idx in range(len(rhino_file.InstanceDefinitions)):
    idef = rhino_file.InstanceDefinitions[idef_idx]
    
    # Step 3.2: Extract Meshes from definition
    # (Assumes prepocessing completed)
    for obj_id in idef.GetObjectIds():
        # Extract mesh geometry
        # (Implementation details in export_instances_gltf.py)
```

#### T-0502B-AGENT (NUEVO)
```
Ticket ID: T-0502B-AGENT
Title: Mesh Conversion Service (Brep → Mesh via RhinoCompute)
Priority: 🟡 MEDIA
Story Points: 3 SP
Dependencies: T-024-AGENT (Rhino Ingestion)

Description:
Servicio Celery para convertir InstanceDefinitions con Breps → Meshes
usando RhinoCompute Cloud API.

Acceptance Criteria:
- [ ] RhinoCompute server operativo (Docker/Cloud)
- [ ] Celery task: convert_breps_to_meshes(file_id)
- [ ] Configurable mesh parameters (angle, edge length)
- [ ] Upload .3dm-meshed to Supabase
- [ ] Update DB: blocks.source_file_meshed_url
- [ ] Timeout handling: 5min max per file
- [ ] Error reporting: geometrías unconvertibles

Technical Stack:
- compute_rhino3d (Python client)
- Rhino.Compute 8.x (server)
- Docker Compose (local dev)
- AWS ECS (production)

Testing:
- Integration test con 3 archivos reales (5-10 MB)
- Performance: <60s por archivo <10MB
- Quality: Visual comparison mesh vs Brep
```

### Archivos Creados

- ✅ `export_instances_gltf.py`: Exporter con soporte InstanceObjects
- ✅ `PREPROCESSING_REQUIRED.md`: Guía workflows manual/automático
- ✅ `test_instance_objects.py`: Inspección estructura .3dm
- ✅ `ARCHITECTURE_DECISION.md`: Este documento (ADR-001)

### Archivos Modificados

- ✅ `TROUBLESHOOTING.md`: Sección crítica preprocesamiento
- ⏳ `docs/US-005/T-0502-AGENT-TechnicalSpec.md`: Actualizar con InstanceObjects
- ⏳ `docs/09-mvp-backlog.md`: Añadir T-0502B-AGENT (3 SP)

---

## Métricas de Éxito

### POC (Fase 1)
- [ ] 5-10 archivos .3dm-meshed generados manualmente
- [ ] Exportados a glTF+Draco exitosamente
- [ ] Benchmarks comparativos completados
- [ ] Decisión formato basado en datos: glTF vs ThatOpen

### Producción (Fase 2)
- [ ] 100% archivos convertidos automáticamente (<5% error rate)
- [ ] Latency promedio <90s por archivo
- [ ] Calidad mesh: >95% aceptación visual por arquitectos
- [ ] Storage cost <$50/mes para 500 archivos

---

## Referencias

- [rhino3dm Issue #302](https://github.com/mcneel/rhino3dm/issues/302) - CreateMesh() not available in Python
- [Rhino.Compute Docs](https://www.rhino3d.com/compute) - Cloud API setup
- [OpenNURBS Spec](https://github.com/mcneel/opennurbs) - Native library reference
- T-025-AGENT-UserStrings-Spec.md - InstanceObjects existing implementation
- US-005/PERFORMANCE-ANALYSIS-3D-FORMATS.md - Instancing strategy

---

## Aprobación

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Tech Lead | AI Assistant | 2026-02-18 | ✅ Propuesta |
| BIM Manager | Usuario | - | ⏳ Pendiente |
| Product Owner | - | - | ⏳ Pendiente |

**Próximos Pasos:**
1. Usuario valida decisión preprocesamiento manual para POC
2. Usuario genera 5-10 archivos .3dm-meshed
3. POC ejecuta benchmarks con archivos reales
4. Decisión formato basado en datos (glTF vs ThatOpen)
5. Si aprobamos MVP, crear ticket T-0502B-AGENT (Fase 2)
