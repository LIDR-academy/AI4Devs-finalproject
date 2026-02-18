# PREPROCESAMIENTO OBLIGATORIO: Rhino → Mesh

## ⚠️ Requisito Crítico

**Todos los archivos .3dm deben contener geometría MESH** (no Breps sin meshar).

### Razón Técnica

rhino3dm (librería Python) **NO expone** la función `CreateMesh()` para convertir Breps → Meshes. Esta funcionalidad solo está disponible en:
- RhinoCommon (C# API, requiere Rhino Desktop o Rhino.Compute server)
- OpenNURBS C++ (requiere compilación nativa)

### Solución: Workflow de Preparación

#### Opción A (Recomendada): Rhino Desktop Manual

```
1. Abrir archivo .3dm en Rhino Desktop
2. SelAll (Ctrl+A) → Seleccionar todas las geometrías
3. _Mesh → Se abre diálogo de configuración
   
   Configuración recomendada para Low-Poly (<1000 triángulos):
   ┌─────────────────────────────────────┐
   │ Mesh Settings                       │
   ├─────────────────────────────────────┤
   │ ☑ Simple Controls                   │
   │   → Fewer Polygons ━━━━●━━━━ More   │
   │                     (25% de escala) │
   │                                     │
   │ O Custom                            │
   │   Max Angle: 20°                    │
   │   Max Edge Length: 50mm             │
   │   Min Edge Length: 0.1mm            │
   └─────────────────────────────────────┘

4. Aplicar → Rhino genera Meshes desde Breps
5. Export (File → Save As)
   → Nombre: archivo-meshed.3dm
6. Subir a Supabase Storage (bucket: raw-uploads/)
```

#### Opción B (Batch): Script Rhino Python

Si tienes múltiples archivos, puedes automatizar con un script Rhino:

```python
# RhinoScript (ejecutar en Rhino Desktop)
import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino

# Configurar parámetros de mesh
mp = Rhino.Geometry.MeshingParameters.FastRenderMesh
mp.MaximumEdgeLength = 50.0  # 50mm
mp.MinimumEdgeLength = 0.1
mp.GridAngle = 20.0  # 20 grados

# Seleccionar todos los Breps
all_objs = rs.AllObjects()
breps = [obj for obj in all_objs if rs.IsBrep(obj)]

print(f"Found {len(breps)} Breps")

# Convertir a Mesh
for brep_id in breps:
    brep = rs.coercebrep(brep_id)
    if brep:
        meshes = Rhino.Geometry.Mesh.CreateFromBrep(brep, mp)
        if meshes:
            for mesh in meshes:
                sc.doc.Objects.AddMesh(mesh)
            # Opcional: Ocultar Brep original
            rs.HideObject(brep_id)

print("✅ Meshes created. Save file as .3dm-meshed")
```

#### Opción C (Cloud): RhinoCompute API

Para workflows automatizados sin Rhino Desktop:

```python
# Requiere Rhino.Compute server
from compute_rhino3d import Brep, Mesh, MeshingParameters

# 1. Extraer Breps del .3dm
file3dm = rhino3dm.File3dm.Read("input.3dm")
breps = [obj.Geometry for obj in file3dm.Objects 
         if isinstance(obj.Geometry, rhino3dm.Brep)]

# 2. Convertir a Mesh via Rhino.Compute
meshes = []
for brep in breps:
    brep_json = brep.Encode()  # Serialize
    mesh_params = MeshingParameters.FastRenderMesh
    mesh = Brep.CreateMesh(brep_json, mesh_params)  # Cloud API call
    meshes.append(mesh)

# 3. Guardar nuevo .3dm con Meshes
output_file = rhino3dm.File3dm()
for mesh in meshes:
    output_file.Objects.AddMesh(mesh)
output_file.Write("output-meshed.3dm", 7)  # Version 7
```

**Pros:** Automático, sin instalación Rhino  
**Contras:** Requiere setup server, API keys, latency red

---

## 🔍 Verificación del Archivo

Antes de usar el exporter, verifica que tu .3dm contenga Meshes:

```bash
cd poc/formats-comparison/exporters
python3 test_instance_objects.py

# Debe mostrar:
#   • Meshes processed: X  ✅
#   • Breps skipped: 0     ✅
```

Si muestra "Breps skipped: > 0", ejecuta el preprocesamiento.

---

## 📊 Impacto en Métricas

| Tipo         | Antes (Brep)      | Después (Mesh) |
|--------------|-------------------|----------------|
| Geometría    | NURBS surfaces    | Triángulos     |
| Precisión    | Matemática exacta | Aproximada     |
| Tamaño .3dm  | ~8 MB             | ~12 MB (+50%)  |
| Processing   | ❌ No compatible  | ✅ Compatible  |
| Decimation   | No aplicable      | ✅ Aplicable   |
| glTF Export  | ❌ Imposible      | ✅ <500 KB     |

El aumento de tamaño .3dm es temporal - el archivo final glTF+Draco será **mucho más pequeño** (<500 KB por pieza).

---

## ⚙️ Integración en Production

En el sistema final (US-005), este preprocesamiento debe ocurrir:

### Flujo Actual (US-002):
```
Usuario → Upload .3dm → Supabase Storage → Celery Task → Validation
```

### Flujo con Preprocesamiento (US-005):
```
Usuario → Upload .3dm original
  ↓
Celery Task 1: Validation (US-002)
  ↓
Celery Task 2: Mesh Conversion (NUEVO)
  |- RhinoCompute API: Brep → Mesh
  |- Upload .3dm-meshed a Supabase
  |- Update DB: blocks.source_file_meshed_url
  ↓
Celery Task 3: Low-Poly Generation (T-0502-AGENT)
  |- Download .3dm-meshed
  |- rhino3dm parse → trimesh
  |- Decimation → ~1000 faces
  |- glTF+Draco export
  |- Upload → blocks.low_poly_url
```

**Ticket adicional requerido:**
- **T-0502B-AGENT:** Mesh Conversion Service (Brep → Mesh via RhinoCompute)
  - Story Points: 3 SP
  - Dependencias: RhinoCompute server setup
  - Priority: Media (no bloqueante para POC)

---

## 🎯 Para la POC Actual

**Solución pragmática:**

Use **Opción A (Manual)** para generar 5-10 archivos .3dm-meshed de prueba.

Colócalos en:
```
poc/formats-comparison/dataset/raw/
  ├── capitel-001-meshed.3dm
  ├── dovela-002-meshed.3dm
  ├── columna-003-meshed.3dm
  ├── ...
```

Luego ejecute:
```bash
cd poc/formats-comparison/exporters
bash run-gltf-export.sh  # Usará el nuevo exporter con soporte InstanceObjects
```

---

## 📚 Referencias

- [rhino3dm Limitations](https://github.com/mcneel/rhino3dm/issues/302) - CreateMesh() no disponible en Python
- [Rhino.Compute Docs](https://www.rhino3d.com/compute) - Cloud API para operaciones Rhino
- [OpenNURBS C++](https://github.com/mcneel/opennurbs) - Librería nativa completa
