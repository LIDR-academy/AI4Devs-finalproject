# Technical Specification: T-1004-FRONT

**Ticket ID:** T-1004-FRONT  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 3 Story Points (~5 hours)  
**Responsable:** Frontend Developer  
**Prioridad:** 🔴 P1 (Blocker for T-1007-FRONT modal integration)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** FRONT
- **Alcance:** Create `PartViewerCanvas` component that renders a dedicated 3D canvas for viewing individual parts in the modal. Optimize camera/lighting for close-up part inspection (vs. dashboard's multi-object scene).
- **Dependencias:**
  - **Upstream:** T-0500-INFRA (✅ DONE 2026-02-15) - React Three Fiber configured
  - **Upstream:** T-0504-FRONT (✅ DONE 2026-02-18) - Canvas3D reusable component
  - **Downstream:** T-1005-FRONT (Model Loader & Stage will use this canvas)
  - **Downstream:** T-1007-FRONT (Modal will embed this canvas in 3D Viewer tab)

### Problem Statement
US-005 `Canvas3D` component is optimized for **dashboard multi-object scene** (camera far away, grid floor, Stats overlay):
- **Camera:** `position: [50, 50, 50]`, `fov: 50` → Good for viewing 150 parts
- **Lighting:** Ambient + 2 directional lights → Shows all parts equally
- **Controls:** OrbitControls with damping → Smooth navigation across scene

US-010 needs a **dedicated single-part viewer** with different optimizations:
- **Camera:** Closer position `[3, 3, 3]`, `fov: 45` → Focus on one part
- **Lighting:** 3-point lighting (key, fill, rim) → Highlight part details (normals, edges)
- **Controls:** OrbitControls with autoRotate option → Showcase part geometry
- **Stage:** White/neutral background → Part stands out (vs. grid floor)

**Decision:** Create separate `PartViewerCanvas` component instead of adding props to `Canvas3D` (SOLID: Single Responsibility Principle).

### Current State (Before Implementation)
```
PartDetailModal.tsx
  └─ ❌ No 3D viewer, just "Placeholder for 3D Viewer"
```

### Target State (After Implementation)
```
PartDetailModal.tsx (T-1007)
  └─ PartViewerCanvas (T-1004)
      ├─ Camera (fov=45, position=[3,3,3])
      ├─ 3-Point Lighting (key, fill, rim)
      ├─ OrbitControls (autoRotate optional)
      └─ Stage (white background, shadows)
```

---

## 2. Component Interface

### Props Contract

**File:** `src/frontend/src/components/PartViewerCanvas.tsx`

```typescript
/**
 * T-1004-FRONT: Part Viewer Canvas Component
 * Dedicated 3D canvas for viewing single parts in modal (US-010).
 * 
 * Features:
 * - Optimized camera/lighting for close-up part inspection
 * - 3-point lighting setup (key, fill, rim)
 * - OrbitControls with optional auto-rotation
 * - White stage background with soft shadows
 * - Touch gesture support for mobile
 * 
 * Differences from Canvas3D (dashboard):
 * - Camera closer (3,3,3 vs 50,50,50)
 * - FOV narrower (45 vs 50)
 * - No grid floor (white stage instead)
 * - No Stats overlay (production viewer)
 * - 3-point lighting (vs ambient + 2 directional)
 */

import { ReactNode } from 'react';

export interface PartViewerCanvasProps {
  /**
   * Child components to render inside Canvas (typically ModelLoader from T-1005)
   */
  children: ReactNode;
  
  /**
   * Enable auto-rotation of camera (showcase mode)
   * @default false
   */
  autoRotate?: boolean;
  
  /**
   * Auto-rotation speed in degrees per second
   * @default 1.5
   */
  autoRotateSpeed?: number;
  
  /**
   * Camera field of view in degrees
   * @default 45
   */
  fov?: number;
  
  /**
   * Initial camera position [x, y, z]
   * @default [3, 3, 3]
   */
  cameraPosition?: [number, number, number];
  
  /**
   * Enable soft shadows on stage
   * @default true
   */
  shadows?: boolean;
  
  /**
   * Show loading overlay while children load
   * @default false
   */
  showLoading?: boolean;
  
  /**
   * Loading message text
   * @default "Cargando modelo 3D..."
   */
  loadingMessage?: string;
  
  /**
   * Enable touch gestures (pinch zoom, two-finger pan)
   * @default true
   */
  enableTouchGestures?: boolean;
  
  /**
   * Custom className for styling container
   */
  className?: string;
  
  /**
   * ARIA label for accessibility
   * @default "Visor 3D de pieza"
   */
  ariaLabel?: string;
}
```

---

## 3. Implementation

### 3.1 Component Code

**File:** `src/frontend/src/components/PartViewerCanvas.tsx`

```tsx
import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import type { PartViewerCanvasProps } from './PartViewerCanvas.types';
import { VIEWER_DEFAULTS } from './PartViewerCanvas.constants';

/**
 * T-1004-FRONT: Dedicated 3D canvas for single-part viewing in modal.
 * Optimized for close-up part inspection with 3-point lighting.
 */
export const PartViewerCanvas: React.FC<PartViewerCanvasProps> = ({
  children,
  autoRotate = VIEWER_DEFAULTS.AUTO_ROTATE,
  autoRotateSpeed = VIEWER_DEFAULTS.AUTO_ROTATE_SPEED,
  fov = VIEWER_DEFAULTS.FOV,
  cameraPosition = VIEWER_DEFAULTS.CAMERA_POSITION,
  shadows = VIEWER_DEFAULTS.SHADOWS,
  showLoading = false,
  loadingMessage = VIEWER_DEFAULTS.LOADING_MESSAGE,
  enableTouchGestures = VIEWER_DEFAULTS.ENABLE_TOUCH_GESTURES,
  className = '',
  ariaLabel = VIEWER_DEFAULTS.ARIA_LABEL,
}) => {
  const controlsRef = useRef<any>(null);

  return (
    <div 
      className={`part-viewer-canvas ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        shadows={shadows}
        dpr={[1, 2]}  // Adaptive pixel ratio (1x for low-end, 2x for high-DPI)
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        {/* Camera Configuration */}
        <PerspectiveCamera
          makeDefault
          fov={fov}
          position={new Vector3(...cameraPosition)}
          near={0.1}
          far={1000}
        />

        {/* Lighting Setup: 3-Point Lighting */}
        {/* Key Light (main) - 45° angle, white, brightest */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow={shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Fill Light - opposite side, softer, reduces harsh shadows */}
        <directionalLight
          position={[-3, 2, -3]}
          intensity={0.5}
          color="#f0f0f0"
        />
        
        {/* Rim Light - from behind, highlights edges */}
        <directionalLight
          position={[0, 3, -5]}
          intensity={0.3}
          color="#ffffff"
        />
        
        {/* Ambient Light - base illumination */}
        <ambientLight intensity={0.4} />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom
          enablePan
          minDistance={1}
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.5}  // Prevent camera going below floor
          // Touch gestures
          touches={{
            ONE: enableTouchGestures ? 2 : 0,  // One-finger rotate
            TWO: enableTouchGestures ? 1 : 0,  // Two-finger pan
          }}
        />

        {/* Stage: White background with soft shadows */}
        <Stage
          environment="city"  // HDRI environment map (realistic reflections)
          intensity={0.5}
          shadows={shadows ? 'contact' : false}  // Soft contact shadows
          adjustCamera={false}  // Don't auto-adjust camera (we control it)
        >
          <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
            {children}
          </Suspense>
        </Stage>
      </Canvas>

      {/* Loading Overlay (shown during initial load) */}
      {showLoading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
};

/**
 * Loading fallback for Suspense (inside Canvas)
 */
const LoadingFallback: React.FC<{ message: string }> = ({ message }) => (
  <Html center>
    <div style={{
      background: 'rgba(255,255,255,0.9)',
      padding: '1rem 2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}>
      <div className="spinner" />
      <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>{message}</p>
    </div>
  </Html>
);

/**
 * Loading overlay (outside Canvas, covers entire viewport)
 */
const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem', color: '#333' }}>{message}</p>
    </div>
  </div>
);

export default PartViewerCanvas;
```

---

### 3.2 Constants File

**File:** `src/frontend/src/components/PartViewerCanvas.constants.ts`

```typescript
/**
 * T-1004-FRONT: Part Viewer Canvas Constants
 * Extracted constants following project pattern (avoid magic numbers).
 */

export const VIEWER_DEFAULTS = {
  /**
   * Camera field of view in degrees (narrower than dashboard's 50°)
   */
  FOV: 45,
  
  /**
   * Initial camera position [x, y, z] (closer than dashboard's [50,50,50])
   */
  CAMERA_POSITION: [3, 3, 3] as [number, number, number],
  
  /**
   * Enable auto-rotation by default
   */
  AUTO_ROTATE: false,
  
  /**
   * Auto-rotation speed in degrees per second
   */
  AUTO_ROTATE_SPEED: 1.5,
  
  /**
   * Enable soft shadows on stage
   */
  SHADOWS: true,
  
  /**
   * Enable touch gestures (pinch zoom, two-finger pan)
   */
  ENABLE_TOUCH_GESTURES: true,
  
  /**
   * Loading message text
   */
  LOADING_MESSAGE: 'Cargando modelo 3D...',
  
  /**
   * ARIA label for accessibility
   */
  ARIA_LABEL: 'Visor 3D de pieza arquitectónica',
} as const;

/**
 * Camera distance constraints
 */
export const CAMERA_CONSTRAINTS = {
  MIN_DISTANCE: 1,
  MAX_DISTANCE: 20,
  MAX_POLAR_ANGLE: Math.PI / 1.5,  // ~120° (prevent going below floor)
} as const;

/**
 * Lighting configuration (3-point setup)
 */
export const LIGHTING_CONFIG = {
  KEY_LIGHT: {
    position: [5, 5, 5] as [number, number, number],
    intensity: 1.2,
    color: '#ffffff',
  },
  FILL_LIGHT: {
    position: [-3, 2, -3] as [number, number, number],
    intensity: 0.5,
    color: '#f0f0f0',
  },
  RIM_LIGHT: {
    position: [0, 3, -5] as [number, number, number],
    intensity: 0.3,
    color: '#ffffff',
  },
  AMBIENT: {
    intensity: 0.4,
  },
} as const;
```

---

### 3.3 Types File

**File:** `src/frontend/src/components/PartViewerCanvas.types.ts`

```typescript
/**
 * T-1004-FRONT: Part Viewer Canvas Types
 */

import { ReactNode } from 'react';

export interface PartViewerCanvasProps {
  children: ReactNode;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  fov?: number;
  cameraPosition?: [number, number, number];
  shadows?: boolean;
  showLoading?: boolean;
  loadingMessage?: string;
  enableTouchGestures?: boolean;
  className?: string;
  ariaLabel?: string;
}
```

---

## 4. Testing Strategy

### 4.1 Component Tests

**File:** `src/frontend/src/components/PartViewerCanvas.test.tsx`

```tsx
/**
 * T-1004-FRONT: Part Viewer Canvas Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartViewerCanvas } from './PartViewerCanvas';
import '@testing-library/jest-dom';

// Mock @react-three/fiber and drei (they use WebGL, not available in jsdom)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <primitive object={{}} />,
  Stage: ({ children }: any) => <>{children}</>,
  PerspectiveCamera: () => <primitive object={{}} />,
  Html: ({ children }: any) => <div>{children}</div>,
}));

describe('PartViewerCanvas', () => {
  it('RENDER-01: should render canvas with children', () => {
    render(
      <PartViewerCanvas>
        <mesh data-testid="test-mesh" />
      </PartViewerCanvas>
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
  
  it('RENDER-02: should apply custom className', () => {
    const { container } = render(
      <PartViewerCanvas className="custom-viewer">
        <></>
      </PartViewerCanvas>
    );
    
    const viewer = container.querySelector('.part-viewer-canvas');
    expect(viewer).toHaveClass('custom-viewer');
  });
  
  it('RENDER-03: should show loading overlay when showLoading=true', () => {
    render(
      <PartViewerCanvas showLoading loadingMessage="Cargando...">
        <></>
      </PartViewerCanvas>
    );
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
  
  it('RENDER-04: should use custom loading message', () => {
    render(
      <PartViewerCanvas showLoading loadingMessage="Procesando geometría...">
        <></>
      </PartViewerCanvas>
    );
    
    expect(screen.getByText('Procesando geometría...')).toBeInTheDocument();
  });
  
  it('A11Y-01: should have role="img" and aria-label', () => {
    const { container } = render(
      <PartViewerCanvas ariaLabel="Vista 3D de columna">
        <></>
      </PartViewerCanvas>
    );
    
    const viewer = container.querySelector('.part-viewer-canvas');
    expect(viewer).toHaveAttribute('role', 'img');
    expect(viewer).toHaveAttribute('aria-label', 'Vista 3D de columna');
  });
  
  it('A11Y-02: should use default aria-label if not provided', () => {
    const { container } = render(
      <PartViewerCanvas>
        <></>
      </PartViewerCanvas>
    );
    
    const viewer = container.querySelector('.part-viewer-canvas');
    expect(viewer).toHaveAttribute('aria-label', 'Visor 3D de pieza arquitectónica');
  });
  
  it('PROPS-01: should accept default props', () => {
    // Should not throw with minimal props
    expect(() => {
      render(<PartViewerCanvas><></></PartViewerCanvas>);
    }).not.toThrow();
  });
  
  it('PROPS-02: should accept all optional props', () => {
    expect(() => {
      render(
        <PartViewerCanvas
          autoRotate
          autoRotateSpeed={2.0}
          fov={50}
          cameraPosition={[5, 5, 5]}
          shadows={false}
          showLoading
          loadingMessage="Custom message"
          enableTouchGestures={false}
          className="custom"
          ariaLabel="Custom label"
        >
          <></>
        </PartViewerCanvas>
      );
    }).not.toThrow();
  });
});
```

---

## 5. Definition of Done

### Functional Requirements
- [ ] `PartViewerCanvas` component created with all props from interface
- [ ] 3-point lighting setup (key, fill, rim) implemented
- [ ] OrbitControls with autoRotate option working
- [ ] Stage with white background and soft shadows
- [ ] Touch gestures enabled for mobile (pinch zoom, two-finger pan)
- [ ] Loading overlay and Suspense fallback implemented

### Testing Requirements
- [ ] Component tests: 8/8 passing (`PartViewerCanvas.test.tsx`)
- [ ] Coverage: >90% (component + constants file)
- [ ] Manual test: Render with dummy mesh, verify camera/lighting/controls

### Accessibility Requirements
- [ ] `role="img"` and `aria-label` attributes present
- [ ] Loading states have visible text (not just spinner)
- [ ] Keyboard accessible (OrbitControls support keyboard by default)

### Performance Requirements
- [ ] Adaptive pixel ratio (1x for low-end devices, 2x for high-DPI)
- [ ] Shadows use 2048x2048 shadow maps (balance quality/performance)
- [ ] `powerPreference: 'high-performance'` set on WebGL context

### Documentation Requirements
- [ ] JSDoc comments on all exported types and functions
- [ ] Constants file documents all magic numbers
- [ ] Usage example added to component header comment

---

## 6. Usage Example

```tsx
import { PartViewerCanvas } from '@/components/PartViewerCanvas';
import { ModelLoader } from '@/components/ModelLoader';  // T-1005

function PartDetailModal({ partId }: { partId: string }) {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <PartViewerCanvas autoRotate showLoading>
        <ModelLoader partId={partId} />
      </PartViewerCanvas>
    </div>
  );
}
```

---

## 7. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Performance: 3-point lighting too expensive on mobile** | Medium | Low | Use fewer lights on mobile (detect with `window.matchMedia`), reduce shadow map size to 1024x1024 |
| **Stage environment map (HDRI) loads slowly** | Low | Medium | Use smaller environment preset ("studio" instead of "city"), or remove if >2MB |
| **Touch gestures conflict with modal scroll** | Medium | Medium | Add `touch-action: none` CSS to canvas container, test on iOS/Android |

---

## 8. References

- T-0500-INFRA: React Three Fiber configuration
- T-0504-FRONT: Canvas3D component (dashboard, different use case)
- React Three Fiber Docs: https://docs.pmnd.rs/react-three-fiber
- @react-three/drei Stage: https://github.com/pmndrs/drei#stage
- 3-Point Lighting: https://en.wikipedia.org/wiki/Three-point_lighting
