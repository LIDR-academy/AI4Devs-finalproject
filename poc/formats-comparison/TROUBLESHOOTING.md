# TROUBLESHOOTING - POC Formats Comparison

Guía rápida para resolver errores comunes durante el setup de la POC.

---

## 🔥 CRITICAL: Preprocesamiento Obligatorio (InstanceObjects + Breps)

### Síntoma
```
📂 Parsing test-model-big.3dm...
📊 Parsing summary:
  • Meshes processed: 0
  • Breps skipped: 1197 (rhino3dm API limitation)
❌ No meshes found, skipping
Files processed: 0
```

### Causa
**Arquitectura real de archivos Sagrada Família:**
- ✅ Archivos contienen **InstanceObjects** (bloques reutilizables)
- ✅ Cada InstanceDefinition contiene **Breps** (superficies NURBS sin meshar)
- ❌ rhino3dm (Python) **NO puede convertir Breps → Meshes**

La función `CreateMesh()` solo está disponible en:
- RhinoCommon (C# API, requiere Rhino Desktop)
- OpenNURBS C++ (compilación nativa)
- Rhino.Compute (Cloud API, requiere server setup)

### Solución: PREPROCESAMIENTO OBLIGATORIO

Ver guía completa en: [exporters/PREPROCESSING_REQUIRED.md](exporters/PREPROCESSING_REQUIRED.md)

**Quick Fix Manual (5 minutos):**
```bash
# 1. Abrir .3dm en Rhino Desktop
# 2. Ejecutar comandos:
SelAll                  # Seleccionar todas las geometrías
_Mesh                   # Convertir a Mesh
  → Simple Controls
  → Fewer Polygons (mover slider al 25%)
  → OK
  
# 3. Save As: test-model-meshed.3dm
# 4. Copiar a: poc/formats-comparison/dataset/raw/
```

**Verificación:**
```bash
cd poc/formats-comparison/exporters
python3 test_instance_objects.py

# Debe mostrar:
#   • Meshes processed: X   ✅ (donde X > 0)
#   • Breps skipped: 0      ✅
```

**Solución Automática (Para Producción):**
- **Ticket adicional:** T-0502B-AGENT (Mesh Conversion Service)
- **Tecnología:** RhinoCompute Cloud API
- **Story Points:** 3 SP
- **Documentación:** https://www.rhino3d.com/compute

**Archivos Creados:**
- ✅ `export_instances_gltf.py`: Nuevo exporter con soporte InstanceObjects
- ✅ `PREPROCESSING_REQUIRED.md`: Guía completa de workflows
- ✅ `test_instance_objects.py`: Script de inspección de estructura .3dm

---

## 🔥 ERROR: Failed to build pydantic-core

### Síntoma
```
ERROR: Failed to build installable wheels for some pyproject.toml based projects (pydantic-core)
```

### Causa
`pydantic-core` requiere compilador Rust, que puede no estar disponible o compatible en tu sistema.

### Solución 1: Usar requirements.txt simplificado (RECOMENDADO)
```bash
# Ya aplicado en requirements.txt - simplemente reinstala:
cd poc/formats-comparison
bash scripts/fix-python-deps.sh
```

Esto instala solo las dependencias críticas sin Pydantic/Click/rtree.

### Solución 2: Instalar Rust (si realmente necesitas Pydantic)
```bash
# macOS
brew install rust

# O vía rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Luego reinstalar
pip install pydantic==2.5.3
```

---

## 🔥 ERROR: No .3dm files found

### Síntoma
```
❌ No .3dm files found in dataset/raw/
```

### Solución
```bash
# Crear directorio y copiar archivos de prueba
mkdir -p poc/formats-comparison/dataset/raw

# Copiar tus archivos .3dm
cp /path/to/your/*.3dm poc/formats-comparison/dataset/raw/

# Verificar
ls -lh poc/formats-comparison/dataset/raw/
```

**Si no tienes archivos .3dm de prueba**, puedes:
1. Usar el test fixture del proyecto principal:
   ```bash
   cp tests/fixtures/test-model.3dm poc/formats-comparison/dataset/raw/capitel-001.3dm
   ```

2. O crear uno simple en Rhino (cualquier geometría básica sirve para POC)

---

## 🔥 ERROR: gltf-pipeline not found

### Síntoma
```
⚠️  gltf-pipeline not found. Install with: npm install -g gltf-pipeline
⚠️  Copying without Draco compression...
```

### Causa
El CLI de `gltf-pipeline` no está instalado globalmente en Node.js.

### Solución
```bash
# Instalar gltf-pipeline globalmente
npm install -g gltf-pipeline

# Verificar instalación
gltf-pipeline --help
```

**Nota:** Si no instalas `gltf-pipeline`, los exports glTF funcionarán pero **sin compresión Draco** (archivos ~5x más grandes).

---

## 🔥 ERROR: Cannot find module '@react-three/fiber'

### Síntoma
```
Error: Cannot find module '@react-three/fiber'
```

### Solución
```bash
cd poc/formats-comparison
npm install

# Si persiste, limpiar caché
rm -rf node_modules package-lock.json
npm install
```

---

## 🔥 ERROR: Python module 'rhino3dm' not found

### Síntoma
```
ModuleNotFoundError: No module named 'rhino3dm'
```

### Causa
Virtual environment no activado o dependencias no instaladas.

### Solución
```bash
cd poc/formats-comparison/exporters

# Activar venv
source venv/bin/activate

# Verificar que estás en el venv (debe aparecer "(venv)" en prompt)
which python  # Debe apuntar a venv/bin/python

# Reinstalar si es necesario
pip install -r requirements.txt
```

---

## 🔥 ERROR: Port 5173 already in use

### Síntoma
```
Error: Port 5173 is already in use
```

### Solución
```bash
# Matar proceso en puerto 5173
lsof -ti:5173 | xargs kill -9

# O usar puerto alternativo
npm run dev -- --port 5174
```

---

## 🔥 ERROR: WebGL context lost

### Síntoma
Viewer negro o error "WebGL context lost" en consola.

### Causa
GPU overload o driver issue.

### Solución
1. **Reducir número de modelos:**
   ```typescript
   // En App.tsx, comentar algunos archivos
   const GLTF_FILES = [
     '/dataset/gltf-draco/capitel-001-instance-1.glb',
     // '/dataset/gltf-draco/capitel-001-instance-2.glb',  // Comentar
     // '/dataset/gltf-draco/capitel-001-instance-3.glb',  // Comentar
   ];
   ```

2. **Reducir DPR (Device Pixel Ratio):**
   ```typescript
   // En GltfDracoViewer.tsx
   <Canvas dpr={[1, 1]}> {/* Era dpr={[1, 2]} */}
   ```

3. **Reiniciar navegador** (libera memoria GPU)

---

## 🔥 ERROR: Decimation failed / Invalid mesh

### Síntoma
```
⚠️  Decimation failed: X, using original
⚠️  Skipping invalid mesh: Y
```

### Causa
Geometría Rhino inválida (non-manifold, holes, etc.)

### Solución
**En Rhino:**
1. Ejecutar `SelBadObjects` (seleccionar mal formados)
2. Ejecutar `_Check` (verificar geometría)
3. Ejecutar `_ExtractBadSrf` (extraer superficies malas)
4. Re-exportar geometría limpia

**En Python (workaround):**
```python
# En export_gltf_draco.py, línea ~120
try:
    mesh = trimesh.Trimesh(vertices, faces, process=False)  # Cambiar a False
    mesh.fill_holes()  # Intentar reparar
    mesh.fix_normals()  # Arreglar normales
except Exception as e:
    print(f"Skipping mesh: {e}")
```

---

## 🔥 WARN: Memory usage is high

### Síntoma
```
Memory: 980 MB
```

### Causa
Demasiados modelos cargados simultáneamente.

### Solución
1. **Reducir dataset:**
   - Usar solo 5 modelos en lugar de 10
   - Reducir target faces a 500 (en lugar de 1000)

2. **Enable geometry disposal:**
   ```typescript
   // En GltfDracoViewer.tsx
   useEffect(() => {
     return () => {
       models.forEach(model => {
         model.traverse((child) => {
           if (child.geometry) child.geometry.dispose();
           if (child.material) child.material.dispose();
         });
       });
     };
   }, [models]);
   ```

---

## 🚀 QUICK FIX: Start Fresh

Si nada funciona, reset completo:

```bash
cd poc/formats-comparison

# 1. Limpiar todo
rm -rf exporters/venv
rm -rf node_modules
rm -rf dataset/gltf-draco/*
rm -rf dataset/fragments/*

# 2. Fix Python deps
bash scripts/fix-python-deps.sh

# 3. Export files
cd exporters
source venv/bin/activate
python export_gltf_draco.py

# 4. Frontend
cd ..
npm install
npm run dev
```

---

## 📞 CONTACTO

Si encuentras un error no documentado aquí:

1. **Check console logs:**
   ```bash
   # Python errors
   cat exporters/venv/pip.log
   
   # Node errors
   npm run dev 2>&1 | tee debug.log
   ```

2. **Check browser console:**
   - Chrome DevTools → Console tab
   - Buscar errors en rojo

3. **Documentar issue:**
   - Error message completo
   - Sistema operativo + versión
   - Python version (`python3 --version`)
   - Node version (`node --version`)

---

**Última actualización:** 2026-02-18
