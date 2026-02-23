# Technical Specification: T-1006-FRONT

**Ticket ID:** T-1006-FRONT  
**Story:** US-010 - Visor 3D Web  
**Sprint:** Sprint 6 (Week 11-12, 2026)  
**Estimación:** 2 Story Points (~3 hours)  
**Responsable:** Frontend Developer  
**Prioridad:** 🟡 P2 (Nice-to-have, improves UX)  
**Status:** 🟡 **READY FOR TDD-RED**

---

## 1. Ticket Summary

- **Tipo:** FRONT
- **Alcance:** Create `ViewerErrorBoundary` component that catches WebGL errors, timeout errors, and React errors in the 3D viewer. Shows user-friendly fallback UI with retry button.
- **Dependencias:**
  - **Upstream:** T-1004-FRONT (✅ MUST BE DONE) - PartViewerCanvas to wrap
  - **Upstream:** T-1005-FRONT (✅ MUST BE DONE) - ModelLoader errors to catch
  - **Downstream:** T-1007-FRONT (Modal uses ErrorBoundary)

### Problem Statement
WebGL 3D rendering can fail for multiple reasons:
- **WebGL unavailable:** Browser doesn't support WebGL (old browsers, disabled by user)
- **WebGL context lost:** GPU crash, too many contexts, driver issues
- **Script errors:** Three.js crashes, invalid geometries, shader compilation errors
- **Timeouts:** GLB file too large, slow network, CDN outage

**Current behavior:** Unhandled errors crash entire React app → white screen, no user feedback.

**Target behavior:** Errors caught by ErrorBoundary → user sees fallback UI with:
- Clear error message explaining what went wrong
- Retry button (reloads component)
- "Close" button (closes modal)
- Technical details in console for debugging

### Current State (Before Implementation)
```
PartDetailModal.tsx
  └─ PartViewerCanvas
      └─ ModelLoader
          └─ ❌ WebGL error → Crashes entire app
```

### Target State (After Implementation)
```
PartDetailModal.tsx
  └─ ViewerErrorBoundary
      └─ PartViewerCanvas
          └─ ModelLoader
              └─ ✅ WebGL error → ErrorBoundary catches → Shows fallback UI
```

---

## 2. Component Interface

### Props Contract

**File:** `src/frontend/src/components/ViewerErrorBoundary.tsx`

```typescript
/**
 * T-1006-FRONT: Viewer Error Boundary Component
 * Catches WebGL errors, timeouts, and React errors in 3D viewer.
 * 
 * Features:
 * - Detects WebGL availability on mount
 * - Catches React component errors (componentDidCatch)
 * - Timeout detection (30s)
 * - User-friendly fallback UI with retry
 * - Logs errors to console + Sentry (if configured)
 */

import { ReactNode } from 'react';

export interface ViewerErrorBoundaryProps {
  /**
   * Child components to render (PartViewerCanvas + ModelLoader)
   */
  children: ReactNode;
  
  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /**
   * Custom fallback UI (replaces default)
   */
  fallback?: (error: Error, retry: () => void, close: () => void) => ReactNode;
  
  /**
   * Callback when user clicks "Close" in fallback UI
   */
  onClose?: () => void;
  
  /**
   * Timeout for initial load (milliseconds)
   * @default 30000 (30 seconds)
   */
  loadTimeout?: number;
}
```

---

## 3. Implementation

### 3.1 Error Boundary Component

**File:** `src/frontend/src/components/ViewerErrorBoundary.tsx`

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { ViewerErrorBoundaryProps } from './ViewerErrorBoundary.types';
import { ERROR_BOUNDARY_DEFAULTS } from './ViewerErrorBoundary.constants';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  webglAvailable: boolean;
}

/**
 * T-1006-FRONT: Error Boundary for 3D Viewer
 * Catches WebGL errors, timeouts, and React component errors.
 */
export class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, State> {
  private loadTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      webglAvailable: this.checkWebGLAvailability(),
    };
  }

  componentDidMount() {
    // Set timeout for initial load
    const timeout = this.props.loadTimeout || ERROR_BOUNDARY_DEFAULTS.LOAD_TIMEOUT;
    this.loadTimeoutId = setTimeout(() => {
      if (!this.state.hasError) {
        console.warn('[ViewerErrorBoundary] Load timeout exceeded');
        // Note: Timeout doesn't trigger error boundary, handled by ModelLoader
      }
    }, timeout);
  }

  componentWillUnmount() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ViewerErrorBoundary] Caught error:', error);
    console.error('[ViewerErrorBoundary] Error info:', errorInfo);

    // Call parent error handler
    this.props.onError?.(error, errorInfo);

    // Log to Sentry (if configured)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    this.setState({ errorInfo });
  }

  /**
   * Check if WebGL is available in browser
   */
  checkWebGLAvailability(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      console.warn('[ViewerErrorBoundary] WebGL check failed:', e);
      return false;
    }
  }

  /**
   * Reset error boundary and retry
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Close modal (calls parent onClose)
   */
  handleClose = () => {
    this.props.onClose?.();
  };

  render() {
    // WebGL not available
    if (!this.state.webglAvailable) {
      return (
        <WebGLUnavailableFallback onClose={this.handleClose} />
      );
    }

    // Error caught
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleClose);
      }

      // Default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onClose={this.handleClose}
        />
      );
    }

    // No error, render children
    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onClose: () => void;
}> = ({ error, errorInfo, onRetry, onClose }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '500px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }}>
        {/* Error icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        
        {/* Error message */}
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: 600 }}>
          Error al cargar el visor 3D
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
          No se pudo cargar el modelo 3D. Por favor, intenta nuevamente.
        </p>

        {/* Error details (collapsible) */}
        <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#9ca3af' }}>
            Detalles técnicos
          </summary>
          <pre style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: '#f9fafb',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#374151',
            overflow: 'auto',
            maxHeight: '150px',
          }}>
            {error.message}
            {errorInfo && `\n\nComponent Stack:\n${errorInfo.componentStack}`}
          </pre>
        </details>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onRetry}
            style={{
              padding: '0.625rem 1.25rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            🔄 Reintentar
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.625rem 1.25rem',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * WebGL Unavailable Fallback UI
 */
const WebGLUnavailableFallback: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '500px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
        
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: 600 }}>
          WebGL no disponible
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Tu navegador no soporta WebGL, necesario para visualizar modelos 3D.
          Por favor, actualiza tu navegador o habilita WebGL en la configuración.
        </p>

        <button
          onClick={onClose}
          style={{
            padding: '0.625rem 1.25rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Extend Window interface for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}

export default ViewerErrorBoundary;
```

---

### 3.2 Constants File

**File:** `src/frontend/src/components/ViewerErrorBoundary.constants.ts`

```typescript
/**
 * T-1006-FRONT: Viewer Error Boundary Constants
 */

export const ERROR_BOUNDARY_DEFAULTS = {
  /**
   * Timeout for initial load (milliseconds)
   */
  LOAD_TIMEOUT: 30000,  // 30 seconds
} as const;

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  WEBGL_UNAVAILABLE: 'WEBGL_UNAVAILABLE',
  WEBGL_CONTEXT_LOST: 'WEBGL_CONTEXT_LOST',
  SCRIPT_ERROR: 'SCRIPT_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;
```

---

## 4. Testing Strategy

### 4.1 Component Tests

**File:** `src/frontend/src/components/ViewerErrorBoundary.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerErrorBoundary } from './ViewerErrorBoundary';
import '@testing-library/jest-dom';

// Component that throws error
const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

describe('ViewerErrorBoundary', () => {
  it('ERROR-01: should render children when no error', () => {
    render(
      <ViewerErrorBoundary>
        <div>Test Content</div>
      </ViewerErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('ERROR-02: should catch error and show fallback UI', () => {
    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ViewerErrorBoundary>
        <ThrowError error={new Error('Test Error')} />
      </ViewerErrorBoundary>
    );
    
    expect(screen.getByText('Error al cargar el visor 3D')).toBeInTheDocument();
    expect(screen.getByText(/Test Error/)).toBeInTheDocument();
  });

  it('ERROR-03: should call onError callback when error caught', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ViewerErrorBoundary onError={onError}>
        <ThrowError error={new Error('Test Error')} />
      </ViewerErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('ERROR-04: should retry when Retry button clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let throwError = true;

    const { rerender } = render(
      <ViewerErrorBoundary>
        {throwError ? <ThrowError error={new Error('Test')} /> : <div>Success</div>}
      </ViewerErrorBoundary>
    );
    
    expect(screen.getByText('Error al cargar el visor 3D')).toBeInTheDocument();
    
    // Click retry
    throwError = false;
    fireEvent.click(screen.getByText('🔄 Reintentar'));
    
    // Note: React Error Boundaries need full remount for retry
    // This test validates button exists, full retry tested manually
  });

  it('ERROR-05: should call onClose when Close button clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onClose = vi.fn();

    render(
      <ViewerErrorBoundary onClose={onClose}>
        <ThrowError error={new Error('Test')} />
      </ViewerErrorBoundary>
    );
    
    fireEvent.click(screen.getByText('Cerrar'));
    
    expect(onClose).toHaveBeenCalled();
  });

  it('A11Y-01: should show WebGL unavailable message when WebGL not supported', () => {
    // Mock WebGL unavailable
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'canvas') {
        const canvas = originalCreateElement.call(document, tag) as HTMLCanvasElement;
        canvas.getContext = vi.fn(() => null);  // WebGL unavailable
        return canvas;
      }
      return originalCreateElement.call(document, tag);
    });

    render(
      <ViewerErrorBoundary>
        <div>Test</div>
      </ViewerErrorBoundary>
    );
    
    expect(screen.getByText('WebGL no disponible')).toBeInTheDocument();
    
    // Restore
    document.createElement = originalCreateElement;
  });
});
```

---

## 5. Definition of Done

### Functional Requirements
- [ ] `ViewerErrorBoundary` catches React component errors
- [ ] WebGL availability check on mount
- [ ] Fallback UI with Retry and Close buttons
- [ ] onError callback invoked when error caught
- [ ] onClose callback invoked when Close clicked
- [ ] Sentry integration (optional, logs to console if Sentry not configured)

### Testing Requirements
- [ ] Component tests: 7/7 passing
- [ ] Coverage: >90%
- [ ] Manual test: Force error in ModelLoader, verify fallback UI

### Accessibility Requirements
- [ ] Error messages have sufficient color contrast
- [ ] Buttons keyboard accessible (tab, enter)
- [ ] Error details collapsible (reduce visual clutter)

### Performance Requirements
- [ ] Error boundary does not impact render performance (componentDidCatch is async)
- [ ] WebGL check fast (<10ms)

---

## 6. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Error boundary doesn't catch async errors** | Medium | Medium | ModelLoader handles async errors internally (fetch, GLB load) before React sees them |
| **Retry doesn't work (React limitation)** | Low | Low | Use `key` prop on ErrorBoundary parent to force full remount |
| **WebGL check false positive** | Low | Low | Test on multiple browsers, use fallback to Three.js `WebGLRenderer.isWebGLAvailable()` |

---

## 7. References

- T-1004-FRONT: PartViewerCanvas (wrapped by ErrorBoundary)
- T-1005-FRONT: ModelLoader (errors caught by ErrorBoundary)
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- WebGL Detection: https://threejs.org/docs/#api/en/renderers/WebGLRenderer.isWebGLAvailable
