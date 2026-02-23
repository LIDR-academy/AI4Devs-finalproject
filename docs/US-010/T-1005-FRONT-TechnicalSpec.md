# Technical Specification: T-1005-FRONT

**Ticket ID:** T-1005-FRONT  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 3 Story Points (~5 hours)  
**Responsable:** Frontend Developer  
**Prioridad:** 🔴 P1 (Blocker for T-1007-FRONT modal integration)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** FRONT
- **Alcance:** Create `ModelLoader` component that fetches GLB file from CDN and renders it inside PartViewerCanvas. Handles loading states, error fallbacks (BBox wireframe), and model preloading for adjacent parts.
- **Dependencias:**
  - **Upstream:** T-1004-FRONT (✅ MUST BE DONE) - PartViewerCanvas to render into
  - **Upstream:** T-1002-BACK (✅ MUST BE DONE) - GET /api/parts/{id} provides low_poly_url
  - **Upstream:** T-0507-FRONT (✅ DONE 2026-02-18) - BBoxProxy reusable wireframe component
  - **Downstream:** T-1007-FRONT (Modal embeds ModelLoader)

### Problem Statement
When user clicks "Ver 3D", modal needs to:
1. **Fetch part data** from `GET /api/parts/{id}` (includes `low_poly_url`, `bbox`)
2. **Load GLB model** from CDN URL (presigned, TTL 5min)
3. **Render 3D model** inside PartViewerCanvas
4. **Handle fallbacks**:
   - If `low_poly_url IS NULL` → Show BBox wireframe (geometry not processed yet)
   - If GLB fetch fails (404, timeout) → Show error message + BBox
   - If WebGL unavailable → Show error message (handled by T-1006-FRONT ErrorBoundary)

**Additional requirement:** Preload adjacent parts' GLBs to enable instant navigation (←/→ arrows).

### Current State (Before Implementation)
```
PartDetailModal.tsx
  └─ PartViewerCanvas (✅ T-1004 creates this)
      └─ ❌ No children, canvas is empty
```

### Target State (After Implementation)
```
PartDetailModal.tsx (T-1007)
  └─ PartViewerCanvas (T-1004)
      └─ ModelLoader partId="550e8400-..." (T-1005)
          ├─ Fetch GET /api/parts/550e8400-...
          ├─ If low_poly_url exists:
          │   └─ useGLTF(low_poly_url) → <primitive object={scene} />
          └─ If low_poly_url IS NULL:
              └─ BBoxProxy bbox={partData.bbox} + spinner + "Geometría en procesamiento..."
```

---

## 2. Component Interface

### Props Contract

**File:** `src/frontend/src/components/ModelLoader.tsx`

```typescript
/**
 * T-1005-FRONT: Model Loader Component
 * Loads and renders 3D models (GLB) with fallback to BBox wireframe.
 * 
 * Features:
 * - Fetches part detail from GET /api/parts/{id}
 * - Loads GLB from CDN using @react-three/drei useGLTF
 * - Fallback to BBoxProxy if low_poly_url IS NULL
 * - Preloads adjacent parts for instant navigation
 * - Automatic model centering and scaling
 * - Error handling for 404, timeouts, CORS errors
 */

export interface ModelLoaderProps {
  /**
   * Part UUID to load
   */
  partId: string;
  
  /**
   * Enable preloading of adjacent parts (prev/next) for instant navigation
   * @default true
   */
  enablePreload?: boolean;
  
  /**
   * Show spinner overlay while loading
   * @default true
   */
  showLoadingSpinner?: boolean;
  
  /**
   * Callback when model loads successfully
   */
  onLoadSuccess?: (partData: PartDetail) => void;
  
  /**
   * Callback when model fails to load
   */
  onLoadError?: (error: Error) => void;
  
  /**
   * Auto-center model at origin (0,0,0)
   * @default true
   */
  autoCenter?: boolean;
  
  /**
   * Auto-scale model to fit bounding box (max dimension = targetSize)
   * @default true
   */
  autoScale?: boolean;
  
  /**
   * Target size for auto-scaling (meters)
   * @default 5
   */
  targetSize?: number;
}
```

---

## 3. Implementation

### 3.1 Component Code

**File:** `src/frontend/src/components/ModelLoader.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Box3, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { BBoxProxy } from './BBoxProxy';  // Reuse from T-0507
import { getPartDetail } from '@/services/api/upload.service';  // T-1002 endpoint
import type { PartDetail } from '@/types/parts';
import type { ModelLoaderProps } from './ModelLoader.types';
import { MODEL_LOADER_DEFAULTS } from './ModelLoader.constants';

/**
 * T-1005-FRONT: Model Loader Component
 * Loads GLB models with fallback to BBox wireframe.
 */
export const ModelLoader: React.FC<ModelLoaderProps> = ({
  partId,
  enablePreload = MODEL_LOADER_DEFAULTS.ENABLE_PRELOAD,
  showLoadingSpinner = MODEL_LOADER_DEFAULTS.SHOW_LOADING_SPINNER,
  onLoadSuccess,
  onLoadError,
  autoCenter = MODEL_LOADER_DEFAULTS.AUTO_CENTER,
  autoScale = MODEL_LOADER_DEFAULTS.AUTO_SCALE,
  targetSize = MODEL_LOADER_DEFAULTS.TARGET_SIZE,
}) => {
  const [partData, setPartData] = useState<PartDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const groupRef = useRef<Group>(null);

  /**
   * Fetch part detail from backend
   */
  useEffect(() => {
    const fetchPartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getPartDetail(partId);
        setPartData(data);
        onLoadSuccess?.(data);
        
        // Preload adjacent parts if enabled
        if (enablePreload && data.low_poly_url) {
          preloadAdjacentModels(partId);
        }
        
      } catch (err) {
        console.error('[ModelLoader] Failed to fetch part data:', err);
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onLoadError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartData();
  }, [partId, enablePreload, onLoadSuccess, onLoadError]);

  /**
   * Auto-center and auto-scale model after load
   */
  useEffect(() => {
    if (!groupRef.current || !partData?.low_poly_url) return;

    const group = groupRef.current;
    const bbox = new Box3().setFromObject(group);
    const size = new Vector3();
    bbox.getSize(size);
    const center = new Vector3();
    bbox.getCenter(center);

    // Center model at origin
    if (autoCenter) {
      group.position.sub(center);
    }

    // Scale model to target size
    if (autoScale) {
      const maxDimension = Math.max(size.x, size.y, size.z);
      if (maxDimension > 0) {
        const scale = targetSize / maxDimension;
        group.scale.setScalar(scale);
      }
    }
  }, [partData, autoCenter, autoScale, targetSize]);

  /**
   * Error state: Show BBox + error message
   */
  if (error) {
    return (
      <ErrorFallback
        error={error}
        bbox={partData?.bbox || null}
        isoCode={partData?.iso_code || partId}
      />
    );
  }

  /**
   * Loading state: Show spinner
   */
  if (loading || !partData) {
    return <LoadingSpinner message="Cargando modelo 3D..." />;
  }

  /**
   * Case 1: low_poly_url IS NULL → Show BBox wireframe (geometry not processed yet)
   */
  if (!partData.low_poly_url) {
    return (
      <ProcessingFallback
        bbox={partData.bbox}
        isoCode={partData.iso_code}
      />
    );
  }

  /**
   * Case 2: low_poly_url exists → Load GLB
   */
  return (
    <group ref={groupRef}>
      <GLBModel url={partData.low_poly_url} />
    </group>
  );
};

/**
 * GLB Model Component (uses useGLTF hook)
 */
const GLBModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  
  return <primitive object={scene} />;
};

/**
 * Processing Fallback: BBox wireframe + message
 */
const ProcessingFallback: React.FC<{
  bbox: PartDetail['bbox'];
  isoCode: string;
}> = ({ bbox, isoCode }) => {
  return (
    <group>
      {/* BBox wireframe */}
      {bbox && <BBoxProxy bbox={bbox} />}
      
      {/* Info message (HTML overlay) */}
      <Html center>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '300px',
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>
            Geometría en procesamiento
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            La pieza <strong>{isoCode}</strong> está siendo convertida a formato 3D.
            Intenta nuevamente en unos minutos.
          </p>
        </div>
      </Html>
    </group>
  );
};

/**
 * Error Fallback: BBox + error message
 */
const ErrorFallback: React.FC<{
  error: Error;
  bbox: PartDetail['bbox'] | null;
  isoCode: string;
}> = ({ error, bbox, isoCode }) => {
  return (
    <group>
      {/* BBox wireframe if available */}
      {bbox && <BBoxProxy bbox={bbox} />}
      
      {/* Error message */}
      <Html center>
        <div style={{
          background: 'rgba(255, 230, 230, 0.95)',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '300px',
          border: '1px solid rgba(220, 38, 38, 0.3)',
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#dc2626' }}>
            Error al cargar modelo
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
            No se pudo cargar la geometría de <strong>{isoCode}</strong>.
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
            {error.message}
          </p>
        </div>
      </Html>
    </group>
  );
};

/**
 * Loading Spinner
 */
const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Html center>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '1rem 2rem',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <div className="spinner" />
        <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>{message}</p>
      </div>
    </Html>
  );
};

/**
 * Preload adjacent models for instant navigation
 */
const preloadAdjacentModels = async (currentPartId: string) => {
  try {
    // TODO: Fetch adjacent IDs from T-1003-BACK endpoint
    // const adjacent = await getAdjacentParts(currentPartId);
    // if (adjacent.prev_id) {
    //   const prevPart = await getPartDetail(adjacent.prev_id);
    //   if (prevPart.low_poly_url) {
    //     useGLTF.preload(prevPart.low_poly_url);
    //   }
    // }
    // if (adjacent.next_id) {
    //   const nextPart = await getPartDetail(adjacent.next_id);
    //   if (nextPart.low_poly_url) {
    //     useGLTF.preload(nextPart.low_poly_url);
    //   }
    // }
  } catch (err) {
    console.warn('[ModelLoader] Preload failed:', err);
    // Non-critical error, don't show to user
  }
};

// Preload useGLTF hook (import from drei)
import { Html } from '@react-three/drei';

export default ModelLoader;
```

---

### 3.2 API Service Layer

**File:** `src/frontend/src/services/api/upload.service.ts` (add to existing file)

```typescript
/**
 * T-1002-BACK / T-1005-FRONT: Get Part Detail API
 */

import { PartDetail } from '@/types/parts';

/**
 * Fetch detailed part information including low_poly_url.
 * 
 * @param partId - Part UUID
 * @returns PartDetail with presigned CDN URL
 * @throws Error if part not found or access denied (403/404)
 */
export async function getPartDetail(partId: string): Promise<PartDetail> {
  const response = await fetch(`/api/parts/${partId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // X-Workshop-Id header added by middleware from JWT claims
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Pieza no encontrada (ID: ${partId})`);
    } else if (response.status === 403) {
      throw new Error('Acceso denegado: no tienes permisos para ver esta pieza');
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data as PartDetail;
}
```

---

### 3.3 Constants File

**File:** `src/frontend/src/components/ModelLoader.constants.ts`

```typescript
/**
 * T-1005-FRONT: Model Loader Constants
 */

export const MODEL_LOADER_DEFAULTS = {
  /**
   * Enable preloading of adjacent parts
   */
  ENABLE_PRELOAD: true,
  
  /**
   * Show loading spinner while fetching part data
   */
  SHOW_LOADING_SPINNER: true,
  
  /**
   * Auto-center model at origin (0,0,0)
   */
  AUTO_CENTER: true,
  
  /**
   * Auto-scale model to fit target size
   */
  AUTO_SCALE: true,
  
  /**
   * Target size for auto-scaling (meters)
   * Models will be scaled so max dimension = TARGET_SIZE
   */
  TARGET_SIZE: 5,
  
  /**
   * Fetch timeout for GET /api/parts/{id} (milliseconds)
   */
  FETCH_TIMEOUT: 10000,  // 10 seconds
  
  /**
   * GLB load timeout (milliseconds)
   */
  GLB_LOAD_TIMEOUT: 30000,  // 30 seconds
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  PART_NOT_FOUND: 'Pieza no encontrada',
  ACCESS_DENIED: 'Acceso denegado',
  FETCH_FAILED: 'Error al cargar datos de la pieza',
  GLB_LOAD_FAILED: 'Error al cargar modelo 3D',
  GEOMETRY_PROCESSING: 'Geometría en procesamiento...',
} as const;
```

---

## 4. Testing Strategy

### 4.1 Component Tests

**File:** `src/frontend/src/components/ModelLoader.test.tsx`

```tsx
/**
 * T-1005-FRONT: Model Loader Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModelLoader } from './ModelLoader';
import * as uploadService from '@/services/api/upload.service';
import '@testing-library/jest-dom';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({ scene: {} })),
  Html: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./BBoxProxy', () => ({
  BBoxProxy: () => <mesh data-testid="bbox-proxy" />,
}));

describe('ModelLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('LOADING-01: should show loading spinner while fetching part data', async () => {
    vi.spyOn(uploadService, 'getPartDetail').mockImplementation(
      () => new Promise(() => {})  // Never resolves
    );

    render(<ModelLoader partId="test-part-id" />);
    
    expect(screen.getByText('Cargando modelo 3D...')).toBeInTheDocument();
  });

  it('LOADING-02: should load GLB when low_poly_url exists', async () => {
    const mockPartData = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    render(<ModelLoader partId="test-part-id" />);

    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith('test-part-id');
    });

    // Note: useGLTF is mocked, so we can't test actual GLB rendering in jsdom
    // Manual test required with real GLB file
  });

  it('FALLBACK-01: should show BBox proxy when low_poly_url IS NULL', async () => {
    const mockPartData = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-002',
      low_poly_url: null,  // Geometry not processed yet
      bbox: { min: [-2, 0, -2], max: [2, 3, 2] },
      status: 'uploaded',
      tipologia: 'columna',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: null,
      workshop_name: null,
      validation_report: null,
      glb_size_bytes: null,
      triangle_count: null,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    render(<ModelLoader partId="test-part-id" />);

    await waitFor(() => {
      expect(screen.getByText('Geometría en procesamiento')).toBeInTheDocument();
      expect(screen.getByText(/SF-C12-D-002/)).toBeInTheDocument();
    });
  });

  it('FALLBACK-02: should show error fallback when fetch fails', async () => {
    vi.spyOn(uploadService, 'getPartDetail').mockRejectedValue(
      new Error('Pieza no encontrada')
    );

    const onLoadError = vi.fn();

    render(<ModelLoader partId="test-part-id" onLoadError={onLoadError} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar modelo')).toBeInTheDocument();
      expect(screen.getByText('Pieza no encontrada')).toBeInTheDocument();
      expect(onLoadError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('CALLBACK-01: should call onLoadSuccess when model loads', async () => {
    const mockPartData = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    const onLoadSuccess = vi.fn();

    render(<ModelLoader partId="test-part-id" onLoadSuccess={onLoadSuccess} />);

    await waitFor(() => {
      expect(onLoadSuccess).toHaveBeenCalledWith(mockPartData);
    });
  });

  it('PROPS-01: should accept all optional props', async () => {
    const mockPartData = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    expect(() => {
      render(
        <ModelLoader
          partId="test-part-id"
          enablePreload={false}
          showLoadingSpinner={false}
          onLoadSuccess={vi.fn()}
          onLoadError={vi.fn()}
          autoCenter={false}
          autoScale={false}
          targetSize={10}
        />
      );
    }).not.toThrow();
  });
});
```

---

## 5. Definition of Done

### Functional Requirements
- [ ] `ModelLoader` component fetches part data from `GET /api/parts/{id}`
- [ ] GLB model loads from CDN URL using `useGLTF` hook
- [ ] Fallback to BBoxProxy when `low_poly_url IS NULL`
- [ ] Error fallback shows BBox + error message on fetch failure
- [ ] Auto-centering and auto-scaling implemented
- [ ] Preload adjacent models functionality (hooks ready, T-1003 integration pending)

### Testing Requirements
- [ ] Component tests: 10/10 passing (`ModelLoader.test.tsx`)
- [ ] Coverage: >85% (component + service layer)
- [ ] Manual test with real GLB file (Three.js not testable in jsdom)

### Performance Requirements
- [ ] GLB fetch timeout: 30 seconds
- [ ] API fetch timeout: 10 seconds
- [ ] Preloading doesn't block main render (non-critical failures)

### Security Requirements
- [ ] no credentials passed to CDN (presigned URLs public)
- [ ] X-Workshop-Id header validated server-side (RLS enforcement)

### Documentation Requirements
- [ ] JSDoc comments on all exported types
- [ ] Constants file documents all timeouts and defaults
- [ ] Usage example added to component header

---

## 6. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Large GLB files (>10MB) timeout on slow connections** | Medium | Medium | Add progress indicator with `useProgress` hook from drei, show estimated time remaining |
| **Presigned URL expires (TTL 5min) before user loads model** | Medium | Low | Backend regenerates presigned URLs on each request, frontend can retry once if 403/expired |
| **CORS errors from CDN** | Critical | Low | T-1001-INFRA validates CORS policy, integration test in T-1009-TEST |
| **Auto-scale wrong for non-uniform models (thin columns)** | Low | Medium | Use bounding sphere instead of bounding box for scale calculation, or disable auto-scale |

---

## 7. References

- T-1002-BACK: GET /api/parts/{id} endpoint specification
- T-1004-FRONT: PartViewerCanvas component (consumer of ModelLoader)
- T-0507-FRONT: BBoxProxy wireframe component (reused for fallback)
- T-1003-BACK: GET /api/parts/{id}/adjacent (for preloading)
- React Three Fiber useGLTF: https://github.com/pmndrs/drei#usegltf
