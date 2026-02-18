# POC: glTF+Draco vs ThatOpen Fragments Performance Comparison

**Objetivo:** Comparar rendimiento real de glTF+Draco vs ThatOpen Fragments con geometría de Sagrada Familia

**Duración estimada:** 4 horas implementación + 1 hora análisis resultados

---

## 📊 DATASET DE PRUEBA

### Piezas Seleccionadas (10 total):
```yaml
Test Cases:
  1. Instancing Test (5 piezas):
    - capitel-001.3dm (repetido 5 veces)
    - Objetivo: Medir eficiencia auto-instancing de ThatOpen
    - Peso original: ~2MB cada uno
  
  2. Unique Geometry Test (5 piezas):
    - columna-A.3dm
    - columna-B.3dm
    - columna-C.3dm
    - dovela-001.3dm
    - dovela-002.3dm
    - Objetivo: Comparar baseline sin instancing
    - Peso original: ~1.5MB promedio

Total Original: ~17.5MB en .3dm
```

---

## 🏗️ ESTRUCTURA DEL POC

```
poc/formats-comparison/
├── README.md                      ← Este archivo
├── package.json                   ← Frontend dependencies
├── dataset/
│   ├── raw/                       ← .3dm originales (no committed)
│   │   ├── capitel-001.3dm
│   │   ├── columna-A.3dm
│   │   └── ...
│   ├── gltf-draco/               ← Exports glTF
│   │   ├── capitel-001.glb
│   │   ├── capitel-001-instance-2.glb
│   │   └── ...
│   └── fragments/                ← Exports ThatOpen
│       ├── sagrada-sample.frag
│       └── sagrada-sample.frag.json
├── exporters/
│   ├── export_gltf_draco.py      ← Agent: .3dm → glTF+Draco
│   ├── export_thatopen_frag.py   ← Agent: .3dm → .frag
│   └── requirements.txt
├── src/
│   ├── viewers/
│   │   ├── GltfDracoViewer.tsx   ← Viewer glTF con benchmarks
│   │   ├── ThatOpenViewer.tsx    ← Viewer ThatOpen con benchmarks
│   │   └── ComparisonView.tsx    ← Side-by-side comparison
│   ├── hooks/
│   │   └── useBenchmark.ts       ← Hook para métricas performance
│   ├── utils/
│   │   └── performanceMetrics.ts ← Utilidades medición
│   └── App.tsx                   ← Entry point
├── results/
│   ├── benchmark-results.json    ← Output automatizado
│   └── analysis.md               ← Análisis con recomendación
└── scripts/
    ├── run-comparison.sh         ← Script automatizado completo
    └── analyze-results.py        ← Parser de resultados + gráficas
```

---

## 🚀 QUICK START

### 1. Preparar Dataset
```bash
# Copiar archivos .3dm de prueba
mkdir -p dataset/raw
cp /path/to/test-files/*.3dm dataset/raw/

# Verificar
ls -lh dataset/raw/
# Deberías ver los 10 archivos .3dm (~17.5MB total)
```

### 2. Instalar Dependencias

#### Backend (Exporters)
```bash
cd exporters/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Dependencias:
# - rhino3dm==8.4.0
# - trimesh==4.0.5
# - pygltflib==1.16.1
# - numpy==1.24.3
# - ifcopenshell==0.7.0  (para ThatOpen)
```

#### Frontend (Viewers)
```bash
cd ..  # Volver a raíz POC
npm install

# Dependencias clave:
# - react@18.2.0
# - @react-three/fiber@8.15.0
# - @react-three/drei@9.92.0
# - three@0.160.0
# - @thatopen/components@1.0.24
# - @thatopen/fragments@1.0.15
```

### 3. Exportar Formatos
```bash
# Exportar a glTF+Draco
python exporters/export_gltf_draco.py

# Salida esperada:
# ✓ capitel-001.glb (300KB)  ← Original 2MB
# ✓ capitel-002.glb (300KB)  ← Instancia (debería referenciar o duplicar)
# ...
# Total glTF: ~2.5MB

# Exportar a ThatOpen Fragments
python exporters/export_thatopen_frag.py

# Salida esperada:
# ✓ sagrada-sample.frag (1.2MB)  ← Geometría con auto-instancing
# ✓ sagrada-sample.frag.json (80KB)  ← Properties sidecar
# Total ThatOpen: ~1.3MB
```

### 4. Ejecutar Comparación
```bash
# Levantar dev server
npm run dev

# Abrir navegador
open http://localhost:5173

# Verás:
# Split screen: glTF (izquierda) | ThatOpen (derecha)
# Panel de métricas en tiempo real:
#   - Payload size
#   - Parse time
#   - Memory usage
#   - FPS
#   - Draw calls
```

### 5. Análisis Automatizado
```bash
# Ejecutar benchmarks automatizados (headless)
npm run benchmark

# Genera:
# results/benchmark-results.json (datos raw)
# results/analysis.md (recomendación automática)

# Ver resultados
cat results/analysis.md
```

---

## 📏 MÉTRICAS CLAVE

### A. Network Performance
```typescript
interface NetworkMetrics {
  payloadSize: number;        // Bytes totales descargados
  compressionRatio: number;   // vs archivos .3dm originales
  downloadTime: number;       // ms (simulated 3G)
  cacheEfficiency: number;    // % hits en segundo load
}
```

### B. Parse Performance
```typescript
interface ParseMetrics {
  parseTime: number;          // ms desde fetch() hasta geometría lista
  mainThreadBlocked: number;  // ms bloqueando UI
  workerTime: number;         // ms en Web Workers
  timeToFirstRender: number;  // ms hasta primer frame visible
}
```

### C. Runtime Performance
```typescript
interface RuntimeMetrics {
  memoryUsage: number;        // MB en heap (JS + GPU)
  fps: number;                // Frames per second (avg 10s)
  drawCalls: number;          // Draw calls por frame
  instancedMeshes: number;    // Cuántas instancias detectadas
  geometryCount: number;      // Geometrías únicas en memoria
}
```

### D. Developer Experience
```typescript
interface DXMetrics {
  setupComplexity: number;    // 1-10 (subjetivo)
  debuggingEase: number;      // 1-10 (¿puedo abrir en Blender?)
  documentationQuality: number; // 1-10
  communitySupport: number;   // GitHub stars, Stack Overflow
}
```

---

## 🎯 CRITERIOS DE DECISIÓN

### Decision Matrix

```yaml
Weight Distribution:
  Performance: 50%
    - Network: 15%
    - Parse: 15%
    - Runtime: 20%
  
  Developer Experience: 30%
    - Setup complexity: 10%
    - Debugging: 10%
    - Documentation: 10%
  
  Future-Proofing: 20%
    - Scalability: 10%
    - Ecosystem: 10%

Threshold:
  If (ThatOpen.totalScore - glTF.totalScore) > 15%:
    Decision: "ADOPT ThatOpen"
  Else:
    Decision: "KEEP glTF (lower risk)"
```

### Expected Outcomes

**Hipótesis 1: ThatOpen gana en runtime (instancing mejor)**
```
glTF:     5 capiteles × 300KB = 1.5MB, 5 draw calls
ThatOpen: 1 geometría × 300KB = 300KB, 1 draw call
→ ThatOpen wins: 80% memory reduction
```

**Hipótesis 2: glTF gana en network (Draco comprime más)**
```
glTF+Draco:  2.5MB total
ThatOpen:    1.3MB total (pero sin Draco equivalent)
→ ThatOpen wins: 48% payload reduction (inesperado)
```

**Hipótesis 3: Parse time similar**
```
glTF:     8s (3s Draco decode + 5s Three.js)
ThatOpen: 4s (ArrayBuffer direct)
→ ThatOpen wins: 50% faster parse
```

---

## 🔬 ANÁLISIS POST-BENCHMARK

### Template de Reporte

```markdown
# POC Results: glTF+Draco vs ThatOpen Fragments

**Fecha:** YYYY-MM-DD
**Dataset:** 10 piezas Sagrada Familia (5 instanciadas + 5 únicas)
**Hardware:** [Especificar: M1/M2/Intel, Chrome version]

## Executive Summary
[Ganador claro con % de diferencia]

## Detailed Metrics

### Network Performance
| Metric | glTF+Draco | ThatOpen | Winner |
|--------|------------|----------|--------|
| Payload | XX MB | XX MB | [format] (-XX%) |
| Download (3G) | XX s | XX s | [format] (-XX%) |
| Compression | XX% | XX% | [format] |

### Parse Performance
| Metric | glTF+Draco | ThatOpen | Winner |
|--------|------------|----------|--------|
| Parse Time | XX ms | XX ms | [format] (-XX%) |
| Main Thread | XX ms | XX ms | [format] (-XX%) |
| TTI | XX ms | XX ms | [format] (-XX%) |

### Runtime Performance
| Metric | glTF+Draco | ThatOpen | Winner |
|--------|------------|----------|--------|
| Memory | XX MB | XX MB | [format] (-XX%) |
| FPS | XX fps | XX fps | [format] (+XX%) |
| Draw Calls | XX | XX | [format] (-XX%) |
| Instances | XX | XX | [format] |

## Recommendation

**Decision:** [ADOPT ThatOpen | KEEP glTF]

**Justification:**
[Explicar con datos concretos]

**Implementation Plan:**
[Si ThatOpen: Migration plan, si glTF: Optimizations]

**Risk Mitigation:**
[Identificar riesgos de la decisión]
```

---

## 📦 DELIVERABLES

Al finalizar la POC, tendremos:

1. ✅ **Código funcionando** 
   - Exporters para ambos formatos
   - Viewers React con benchmarks en vivo
   - Scripts automatizados

2. ✅ **Datos cuantitativos**
   - `benchmark-results.json` con métricas exactas
   - Screenshots de DevTools (Memory, Network, Performance)

3. ✅ **Análisis cualitativo**
   - `analysis.md` con recomendación justificada
   - Decision matrix completada
   - Migration plan (si ThatOpen elegido)

4. ✅ **Aprendizaje validado**
   - Hipótesis confirmadas/refutadas
   - Edge cases identificados
   - Riesgos documentados

---

## 🚨 TROUBLESHOOTING

### Error: "Cannot find module 'ifcopenshell'"
```bash
# IFC OpenShell requiere instalación especial en macOS
brew install ifcopenshell
# O usar Docker:
docker run -v $(pwd):/work ifcopenshell/ifcopenshell python export_thatopen_frag.py
```

### Error: "WebGL context lost"
```javascript
// Añadir listener en viewer
renderer.forceContextLoss();
renderer.forceContextRestore();
```

### Error: "Out of memory" durante export
```python
# Reducir calidad decimation
target_faces = 500  # en lugar de 1000
```

---

## 📚 REFERENCIAS

- [glTF 2.0 Spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [Draco Compression](https://google.github.io/draco/)
- [ThatOpen Components Docs](https://docs.thatopen.com/)
- [ThatOpen Fragments API](https://github.com/ThatOpen/engine_fragments)
- [Performance API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

**Next Steps:**
1. Ejecutar `scripts/run-comparison.sh`
2. Analizar resultados en `results/analysis.md`
3. Decidir formato basado en data
4. Actualizar T-0502-AGENT con formato seleccionado
5. Documentar decisión en `memory-bank/decisions.md`
