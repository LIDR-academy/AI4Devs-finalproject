# T-0500-INFRA: Setup React Three Fiber Stack

## Objetivo
Configurar el entorno de desarrollo frontend para renderizado 3D con Three.js via React Three Fiber, incluyendo dependencias, configuración Vite para assets GLB, y TypeScript types.

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
