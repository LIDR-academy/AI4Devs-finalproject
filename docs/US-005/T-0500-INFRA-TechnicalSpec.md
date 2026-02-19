# Technical Specification: T-0500-INFRA — Setup React Three Fiber Stack

**Ticket:** T-0500-INFRA | **Sprint:** US-005 | **Story Points:** 2
**Fecha enrichment:** 2026-02-19 | **Estado:** Enrichment ✍️ → listo para TDD-Red

---

## 1. Ticket Summary

- **Tipo:** INFRA (Frontend exclusivamente)
- **Alcance:** Instalar y configurar el stack de renderizado 3D (React Three Fiber + drei + Three.js + Zustand) en el proyecto frontend. Incluye: dependencias npm, configuración Vite para assets GLB, declaraciones TypeScript para módulos 3D, mocks de test para jsdom, y estructura de directorios para los componentes del Dashboard.
- **Dependencias:** Ninguna (ticket fundacional de US-005 — todos los tickets FRONT lo requieren)
- **POC validado:** ✅ React Three Fiber 8.15 + drei 9.92 + three.js 0.160 — 60 FPS constantes con 1197 meshes, 41 MB heap, 778 KB payload

---

## 2. Estado Actual vs. Cambios Necesarios

| Archivo | Estado actual | Cambio necesario |
|---|---|---|
| `package.json` | Sin deps 3D ni Zustand | +4 deps producción, +1 devDep |
| `vite.config.ts` | Solo proxy `/api` | +GLB support, +code splitting, +alias `@` |
| `tsconfig.json` | `types: [vitest/globals, jest-dom]` | +`@types/three` |
| `src/vite-env.d.ts` | Solo `ImportMetaEnv` | +declaraciones `*.glb`, `*.gltf` |
| `vitest.config.ts` | Solo jsdom + setupFiles | +`coverage.include Dashboard/**` |
| `src/test/setup.ts` | Solo `@testing-library/jest-dom` | +mocks fiber + drei |
| `src/components/Dashboard/` | No existe | Crear directorio |
| `src/stores/`, `src/types/parts.ts`, `src/constants/`, `src/hooks/` | Parcialmente existentes | Crear stubs vacíos |

---

## 3. Data Structures & Contracts

Este ticket no define schemas Pydantic ni interfaces TypeScript de negocio. Establece los tipos y mocks que todos los tickets FRONT posteriores usarán.

### Tipos disponibles tras instalación (referencia para T-0505/T-0507/T-0508)

```typescript
// Via @types/three
import type { Mesh, Group, Material, BufferGeometry } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

// Estructura devuelta por useGLTF — base para mocks de tests
interface GLTFResult {
  scene: Group;
  nodes: Record<string, Mesh>;
  materials: Record<string, Material>;
}
```

### Declaraciones de módulos (vite-env.d.ts)

```typescript
declare module '*.glb' {
  const src: string;
  export default src;
}
declare module '*.gltf' {
  const src: string;
  export default src;
}
```

---

## 4. Cambios de Configuración Detallados

### 4.1 package.json

```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "three": "^0.160.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

**Notas:** `three@0.160.0` pinned — versión validada en POC. `zustand` se instala aquí aunque lo usa T-0506 (mejor consolidar todas las deps en INFRA).

### 4.2 vite.config.ts — diff

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';                                // ← AÑADIR

export default defineConfig({
  plugins: [react()],
  server: {                                             // ← CONSERVAR
    port: 5173,
    proxy: { '/api': { target: 'http://backend:8000', changeOrigin: true } },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],            // ← AÑADIR
  resolve: {                                            // ← AÑADIR
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {                                              // ← AÑADIR
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  optimizeDeps: {                                       // ← AÑADIR
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
});
```

**Motivo chunk `three-vendor`:** Three.js ~600KB no debe bloquear páginas sin 3D.

### 4.3 tsconfig.json — diff

```json
"types": ["vitest/globals", "@testing-library/jest-dom", "@types/three"]
```

### 4.4 src/vite-env.d.ts — añadir al final

```typescript
declare module '*.glb' { const src: string; export default src; }
declare module '*.gltf' { const src: string; export default src; }
```

### 4.5 vitest.config.ts — añadir coverage

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  coverage: {                                          // ← AÑADIR
    provider: 'v8',
    include: ['src/components/Dashboard/**/*.tsx']
  }
}
```

### 4.6 src/test/setup.ts — mocks Three.js

```typescript
import '@testing-library/jest-dom';    // ← CONSERVAR

// ← AÑADIR:
import { vi } from 'vitest';
import React from 'react';

vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'three-canvas' }, children),
    useFrame: vi.fn(),
    useThree: vi.fn(() => ({ camera: {}, gl: {}, scene: {} }))
  };
});

vi.mock('@react-three/drei', async () => {
  const actual = await vi.importActual('@react-three/drei');
  return {
    ...actual,
    useGLTF: vi.fn((_url: string) => ({
      scene: { clone: () => ({ children: [], traverse: vi.fn() }) },
      nodes: {},
      materials: {}
    })),
    OrbitControls: () => null,
    Html: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'drei-html' }, children),
  };
});
```

---

## 5. Estructura de Directorios a Crear

```
src/frontend/src/
├── components/
│   └── Dashboard/                         ← NUEVO (vacío — T-0504 lo rellena)
├── stores/
│   └── parts.store.ts                     ← NUEVO stub export {}
├── types/
│   └── parts.ts                           ← NUEVO stub export {}
├── constants/
│   └── dashboard3d.constants.ts           ← NUEVO stub export {}
└── hooks/
    └── usePartsSpatialLayout.ts           ← NUEVO stub export {}
```

---

## 6. Test Cases Checklist

### Happy Path
- [ ] **T1 — npm install:** `make front-install` completa sin errores en contenedor Docker
- [ ] **T2 — TypeScript imports:** `import { Canvas } from '@react-three/fiber'` y `import { useGLTF } from '@react-three/drei'` pasan `tsc --noEmit` sin errores
- [ ] **T3 — GLB type resolution:** `import model from './test.glb'` resuelve como `string` (sin TS2307)
- [ ] **T4 — Sin regresiones:** `npm test` ejecuta FileUploader + ValidationReportModal con 0 fallos
- [ ] **T5 — Smoke visual:** TestCanvas muestra cubo rotable en `make front-dev` sin errores consola
- [ ] **T6 — Code splitting:** `npm run build` genera `three-vendor-[hash].js` en `/dist/assets/`

### Edge Cases
- [ ] **T7 — Version pin:** `npm ls three` muestra exactamente `0.160.x` sin duplicados
- [ ] **T8 — Zustand peer deps:** `npm install` sin warnings de peer dependencies con React 18.2
- [ ] **T9 — Alias @ resuelve:** `import Foo from '@/components/Foo'` no produce errores TS/Vite

### Security / Errores
- [ ] **T10 — npm audit:** `npm audit --audit-level=high` — 0 CRITICAL/HIGH en nuevas deps
- [ ] **T11 — Bundle size:** Chunk `three-vendor` ≤ 700 KB sin gzip

### Integration
- [ ] **T12 — Docker install:** `docker compose run --rm frontend npm install` instala en contenedor sin errores de red
- [ ] **T13 — Mock Canvas testable:** Componente que usa `<Canvas>` renderiza `<div data-testid="three-canvas">` en tests
- [ ] **T14 — CI sin regresión:** Job `frontend-tests` en GitHub Actions pasa sin cambios adicionales

---

## 7. Files to Create / Modify

**Modificar:**
- `src/frontend/package.json` → +4 deps producción, +1 devDep
- `src/frontend/vite.config.ts` → +GLB, +code splitting, +alias @
- `src/frontend/tsconfig.json` → +@types/three en `types`
- `src/frontend/src/vite-env.d.ts` → +declaraciones *.glb / *.gltf
- `src/frontend/vitest.config.ts` → +coverage.include Dashboard
- `src/frontend/src/test/setup.ts` → +mocks @react-three/fiber y @react-three/drei

**Crear:**
- `src/frontend/src/components/Dashboard/.gitkeep`
- `src/frontend/src/stores/parts.store.ts` (stub)
- `src/frontend/src/types/parts.ts` (stub)
- `src/frontend/src/constants/dashboard3d.constants.ts` (stub)
- `src/frontend/src/hooks/usePartsSpatialLayout.ts` (stub)

---

## 8. Reusable Patterns

| Patrón existente | Reutilización |
|---|---|
| `src/test/setup.ts` | Extender con mocks Three.js (no reemplazar) |
| `vitest.config.ts` | Extender con coverage Dashboard |
| `vite.config.ts` | Extender conservando proxy existente |
| `node:20-bookworm` Docker | Compatible — no requiere cambios en Dockerfile |
| Constants extraction pattern | `dashboard3d.constants.ts` sigue el mismo patrón que `FileUploader.constants.ts` |

---

## 9. Decisiones Técnicas

| Decisión | Alternativa | Razón |
|---|---|---|
| `three@0.160.0` pinned | `three@latest` | POC validado en 0.160 — actualizar requiere re-validar FPS/memoria |
| Zustand instalado en INFRA | Instalarlo en T-0506 | Consolidar todas las deps en ticket INFRA — evita modificar package.json en tickets FRONT |
| Mock Canvas como `<div>` | WebGL real en jsdom | jsdom no implementa WebGL — `getContext('webgl')` falla |
| Chunk `three-vendor` separado | Bundle único | Three.js 600KB no debe bloquear carga de páginas sin 3D |
| Stubs vacíos en directorios | Crear archivos al usarlos | Evita errores de import en tests de tickets posteriores desde el día 1 |

---

## 10. Handoff para TDD-Red

```
=============================================
READY FOR TDD-RED PHASE
=============================================
Ticket ID:       T-0500-INFRA
Feature name:    React Three Fiber Stack Setup
Key test cases:
  - T2: TypeScript imports sin errores (tsc --noEmit)
  - T4: npm test sin regresiones en suite existente
  - T12: Docker npm install funciona en contenedor
  - T13: Mock Canvas testable via data-testid="three-canvas"
Files to modify:
  - src/frontend/package.json
  - src/frontend/vite.config.ts
  - src/frontend/tsconfig.json
  - src/frontend/src/vite-env.d.ts
  - src/frontend/vitest.config.ts
  - src/frontend/src/test/setup.ts
Files to create:
  - src/frontend/src/components/Dashboard/.gitkeep
  - src/frontend/src/stores/parts.store.ts
  - src/frontend/src/types/parts.ts
  - src/frontend/src/constants/dashboard3d.constants.ts
  - src/frontend/src/hooks/usePartsSpatialLayout.ts
=============================================
```

---

## Spec Original (referencia histórica)

## Dependencias a Instalar

### Producción
```bash
cd src/frontend
npm install @react-three/fiber@^8.15.0
npm install @react-three/drei@^9.92.0
npm install three@^0.160.0
npm install zustand@^4.4.7
```

### Desarrollo
```bash
npm install --save-dev @types/three@^0.160.0
```

## Configuración Vite

### vite.config.ts - Añadir soporte GLB/GLTF
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'], // Soporte GLB assets
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
});
```

## TypeScript Configuration

### tsconfig.json - Añadir module resolution para GLB
```json
{
  "compilerOptions": {
    "types": ["vite/client", "@types/three"],
    "moduleResolution": "bundler"
  }
}
```

### src/vite-env.d.ts - Declaración de módulos GLB
```typescript
/// <reference types="vite/client" />

declare module '*.glb' {
  const src: string;
  export default src;
}

declare module '*.gltf' {
  const src: string;
  export default src;
}
```

## POC Validation Results

**Date:** 2026-02-18  
**Test File:** test-model-big.glb (1197 meshes, 39,360 triangles, 778 KB without Draco)

### Performance Metrics (POC Validated)
| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| **Payload Size** | 778 KB | <800 KB | ✅ EXCELENTE |
| **Download Time** | 89 ms | <100 ms | ✅ EXCELENTE |
| **Parse Time (TTFR)** | 1002 ms | <1000 ms | ⚠️ ACEPTABLE (+2ms) |
| **Memory Usage** | 41 MB | <200 MB | ✅ EXCELENTE (5x better) |
| **FPS (Idle)** | 60 | >30 | ✅ EXCELENTE |
| **FPS (Interaction)** | 60 | >30 | ✅ EXCELENTE |

### Key Findings
✅ **Stack validated:** React Three Fiber 8.15 + drei 9.92 + three.js 0.160 handles 1197 meshes without performance issues  
✅ **Memory efficient:** 41 MB heap (5x better than 200 MB target)  
✅ **FPS excellent:** Constant 60 FPS during rotation, zoom, pan  
⚠️ **Parse time acceptable:** 1002 ms (2ms over target, negligible)  
🎯 **Optimization potential:** With gltf-pipeline Draco compression, estimated 778 KB → 300-400 KB (50% reduction)

### References
- POC Results: `poc/formats-comparison/results/benchmark-results-2026-02-18.json`
- Executive Summary: `poc/formats-comparison/results/executive-summary.md`
- ADR: `memory-bank/decisions.md` (ADR-001: glTF+Draco adopted, ThatOpen rejected)

## gltf-pipeline Installation (Draco Compression)

### Install gltf-pipeline CLI
```bash
npm install -g gltf-pipeline@^4.0.0
```

### Verify Installation
```bash
gltf-pipeline --version
# Expected: 4.0.0 or higher
```

### Usage (Manual Compression Test)
```bash
# Compress GLB with Draco level 10
gltf-pipeline -i input.glb -o output.glb -d

# With specific compression level
gltf-pipeline -i input.glb -o output.glb \
  --draco.compressionLevel 10 \
  --draco.quantizePositionBits 14 \
  --draco.quantizeNormalBits 10 \
  --draco.quantizeTexcoordBits 12
```

### Expected Results
- **Input:** 778 KB (uncompressed glTF)
- **Output:** ~300-400 KB (Draco compressed)
- **Reduction:** 50% file size
- **Quality:** Imperceptible visual difference

**Note:** T-0502-AGENT will automate this compression in production pipeline.

## Estructura de Directorios

```
src/frontend/src/
├── components/
│   └── Dashboard/
│       ├── Dashboard3D.tsx          # Componente principal
│       ├── PartsScene.tsx           # Escena 3D con geometrías
│       ├── PartMesh.tsx             # Componente individual de pieza
│       ├── FiltersSidebar.tsx       # Filtros izquierda
│       ├── StatsPanel.tsx           # Panel stats flotante
│       ├── EmptyStateOverlay.tsx    # Empty state cuando no hay piezas
│       └── LoadingSpinner.tsx       # Spinner 3D
├── stores/
│   └── parts.store.ts               # Zustand store para estado global
├── services/
│   └── parts.service.ts             # API service (GET /api/parts)
├── types/
│   └── parts.ts                     # Interfaces TypeScript
├── constants/
│   └── dashboard3d.constants.ts     # Constantes (colores, distancias LOD)
└── hooks/
    └── usePartsSpatialLayout.ts     # Custom hook para calcular posiciones
```

## Testing Setup

### Vitest Configuration para Three.js
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/components/Dashboard/**/*.tsx']
    }
  }
});
```

### src/test/setup.ts - Mocks para Three.js
```typescript
import { vi } from 'vitest';

// Mock useGLTF de @react-three/drei
vi.mock('@react-three/drei', async () => {
  const actual = await vi.importActual('@react-three/drei');
  return {
    ...actual,
    useGLTF: vi.fn((url) => ({
      scene: {
        clone: () => ({
          children: [],
          traverse: vi.fn()
        })
      },
      nodes: {},
      materials: {}
    }))
  };
});

// Mock Canvas de @react-three/fiber
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children }: any) => <div data-testid="three-canvas">{children}</div>
  };
});
```

## Verification Steps

### DoD Checklist
- [ ] `npm install` ejecuta sin errores
- [ ] Importación `import { Canvas } from '@react-three/fiber'` no genera errores TypeScript
- [ ] Importación `import { useGLTF } from '@react-three/drei'` funciona
- [ ] Archivo GLB de prueba puede importarse: `import testModel from './test.glb'`
- [ ] `npm run build` genera bundle con chunk `three-vendor.js` separado
- [ ] Tests Vitest ejecutan con mocks de Three.js sin errores

### Test Manual
```typescript
// src/components/Dashboard/TestCanvas.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

export function TestCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <Box args={[1, 1, 1]}>
          <meshStandardMaterial color="orange" />
        </Box>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
```

Si este componente renderiza un cubo naranja rotable → Setup exitoso ✅

## Notas de Implementación

### Performance Considerations
- **Code Splitting:** Three.js es pesado (~600KB). El chunk `three-vendor` se carga lazy solo al entrar a Dashboard.
- **Tree Shaking:** Solo importar funciones específicas de `drei` (ej: `import { useGLTF, OrbitControls }` NO `import * as drei`).

### Common Pitfalls
1. **Canvas sin altura:** Asegurar `height: 100vh` o el canvas será 0px.
2. **Lighting ausente:** Sin luces, los meshes se ven negros (añadir `<ambientLight>`).
3. **GLB path incorrecto:** URLs deben ser absolutas o relativas correctas (ej: `/models/part.glb` NO `models/part.glb`).

## Estimación
**Tiempo:** 2 horas  
**Complejidad:** Baja (configuración estándar)  
**Bloqueadores:** Ninguno

## Referencias
- React Three Fiber Docs: https://docs.pmnd.rs/react-three-fiber
- Drei Helpers: https://github.com/pmndrs/drei
- Vite GLB Import: https://vitejs.dev/guide/assets.html
