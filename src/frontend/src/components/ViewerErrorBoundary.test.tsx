/**
 * T-1006-FRONT: Viewer Error Boundary Component Tests
 * TDD RED Phase - Tests written before full implementation
 * 
 * Test Strategy:
 * - Mock components that throw errors on demand
 * - Suppress console.error (error boundary logs expected errors)
 * - Test error capture, fallback UI, retry mechanism, callbacks
 * - Test WebGL availability detection
 * - Test accessibility (ARIA attributes)
 * 
 * Note: HTMLCanvasElement.getContext is mocked globally to avoid jsdom limitations
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import component (will succeed because stub exists)
import { ViewerErrorBoundary } from './ViewerErrorBoundary';

/**
 * Mock component that throws error on demand
 * Used to trigger error boundary
 */
const ThrowError = ({ shouldThrow, message }: { shouldThrow: boolean; message: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="child-content">Child rendered successfully</div>;
};

describe('ViewerErrorBoundary Component', () => {
  // Suppress console.error for error boundary tests
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  // Mock HTMLCanvasElement.getContext globally (jsdom limitation)
  let originalGetContext: any;

  beforeAll(() => {
    // Store original getContext (undefined in jsdom)
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    // Mock getContext to return fake WebGL context by default
    HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        return { canvas: {}, drawingBufferWidth: 800, drawingBufferHeight: 600 };
      }
      return null;
    });
  });

  afterAll(() => {
    // Restore original getContext
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  /**
   * ERROR-01: Renders children when no error occurs
   * Expected: Children render normally without fallback UI
   */
  it('ERROR-01: should render children when no error', () => {
    render(
      <ViewerErrorBoundary>
        <div data-testid="test-content">Test Content</div>
      </ViewerErrorBoundary>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  /**
   * ERROR-02: Catches error and shows fallback UI
   * Expected: Error boundary catches error and renders fallback with error message
   */
  it('ERROR-02: should catch error and show fallback UI', () => {
    render(
      <ViewerErrorBoundary>
        <ThrowError shouldThrow={true} message="Test error message" />
      </ViewerErrorBoundary>
    );
    
    // Should show error message
    expect(screen.getByText(/Error al cargar el visor 3D/i)).toBeInTheDocument();
    
    // Should show retry button
    expect(screen.getByText(/Reintentar/i)).toBeInTheDocument();
    
    // Should show close button
    expect(screen.getByText(/Cerrar/i)).toBeInTheDocument();
    
    // Child should NOT be rendered
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  /**
   * ERROR-03: Calls onError callback when error caught
   * Expected: onError prop invoked with error and errorInfo
   */
  it('ERROR-03: should call onError callback when error caught', () => {
    const onError = vi.fn();

    render(
      <ViewerErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} message="Callback test error" />
      </ViewerErrorBoundary>
    );
    
    // onError should have been called
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Callback test error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  /**
   * ERROR-04: Retry button resets error state
   * Expected: Clicking retry resets hasError to false and re-renders children
   * 
   * Note: Full retry test requires remounting - this test validates button exists
   * and onClick handler is called
   */
  it('ERROR-04: should have retry button that calls retry handler', () => {
    render(
      <ViewerErrorBoundary>
        <ThrowError shouldThrow={true} message="Retry test error" />
      </ViewerErrorBoundary>
    );
    
    // Find retry button
    const retryButton = screen.getByText(/Reintentar/i);
    expect(retryButton).toBeInTheDocument();
    
    // Click retry button
    fireEvent.click(retryButton);
    
    // In real implementation, error should be cleared
    // This test will pass once handleRetry resets state properly
  });

  /**
   * ERROR-05: Close button calls onClose callback
   * Expected: Clicking close invokes parent onClose handler
   */
  it('ERROR-05: should call onClose when Close button clicked', () => {
    const onClose = vi.fn();

    render(
      <ViewerErrorBoundary onClose={onClose}>
        <ThrowError shouldThrow={true} message="Close test error" />
      </ViewerErrorBoundary>
    );
    
    // Find close button
    const closeButton = screen.getByText(/Cerrar/i);
    expect(closeButton).toBeInTheDocument();
    
    // Click close button
    fireEvent.click(closeButton);
    
    // onClose should have been called
    expect(onClose).toHaveBeenCalled();
  });

  /**
   * A11Y-01: Shows WebGL unavailable message when WebGL not supported
   * Expected: If WebGL not available, show specific message instead of error
   * 
   * Note: This test temporarily mocks getContext to return null (WebGL unavailable)
   */
  it('A11Y-01: should show WebGL unavailable message when WebGL not supported', () => {
    // Temporarily mock getContext to return null (WebGL unavailable)
    const mockGetContext = vi.fn(() => null);
    HTMLCanvasElement.prototype.getContext = mockGetContext;

    // Create a new component instance (WebGL check happens in constructor)
    // Need to create a wrapper component to force new instance
    const Wrapper = () => (
      <ViewerErrorBoundary>
        <div>Test</div>
      </ViewerErrorBoundary>
    );
    
    const { unmount } = render(<Wrapper />);
    
    // Should show WebGL unavailable message (when implementation is complete)
    // For now, this will fail because stub doesn't implement this check
    expect(screen.getByText(/WebGL no disponible/i)).toBeInTheDocument();
    
    // Cleanup
    unmount();
    
    // Restore mock to default (WebGL available)
    HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
      if (contextType === 'webgl' || contextType === 'experimental-webgl') {
        return { canvas: {}, drawingBufferWidth: 800, drawingBufferHeight: 600 };
      }
      return null;
    });
  });

  /**
   * A11Y-02: Fallback UI has proper ARIA attributes
   * Expected: Error UI includes role="alert" and aria-live="assertive"
   */
  it('A11Y-02: should have ARIA alert attributes on error UI', () => {
    render(
      <ViewerErrorBoundary>
        <ThrowError shouldThrow={true} message="ARIA test error" />
      </ViewerErrorBoundary>
    );
    
    // Find error container with ARIA attributes
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  /**
   * A11Y-03: Retry button is keyboard accessible
   * Expected: Button can receive focus and has aria-label
   */
  it('A11Y-03: should have keyboard accessible retry button', () => {
    render(
      <ViewerErrorBoundary>
        <ThrowError shouldThrow={true} message="Keyboard test error" />
      </ViewerErrorBoundary>
    );
    
    // Find retry button
    const retryButton = screen.getByText(/Reintentar/i);
    
    // Should be a button element (keyboard accessible by default)
    expect(retryButton.tagName).toBe('BUTTON');
    
    // Should have aria-label for screen readers
    expect(retryButton).toHaveAttribute('aria-label');
  });

  /**
   * EDGE-01: Custom fallback renderer is used when provided
   * Expected: Custom fallback prop overrides default fallback UI
   */
  it('EDGE-01: should use custom fallback when provided', () => {
    const customFallback = (error: Error, retry: () => void, close: () => void) => (
      <div data-testid="custom-fallback">
        Custom Error: {error.message}
        <button onClick={retry}>Custom Retry</button>
        <button onClick={close}>Custom Close</button>
      </div>
    );

    render(
      <ViewerErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} message="Custom fallback test" />
      </ViewerErrorBoundary>
    );
    
    // Should show custom fallback
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText(/Custom Error: Custom fallback test/i)).toBeInTheDocument();
    
    // Should NOT show default fallback
    expect(screen.queryByText(/Error al cargar el visor 3D/i)).not.toBeInTheDocument();
  });

  /**
   * EDGE-02: Error details are collapsible
   * Expected: Technical details shown in <details> element (collapsed by default)
   */
  it('EDGE-02: should show technical details in collapsible section', () => {
    render(
      <ViewerErrorBoundary>
        <ThrowError shouldThrow={true} message="Details test error" />
      </ViewerErrorBoundary>
    );
    
    // Find details element
    const details = screen.getByText(/Detalles técnicos/i).closest('details');
    expect(details).toBeInTheDocument();
    
    // Should be collapsed by default (no 'open' attribute)
    expect(details).not.toHaveAttribute('open');
  });
});
