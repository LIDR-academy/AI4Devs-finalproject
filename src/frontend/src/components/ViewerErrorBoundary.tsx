/**
 * ViewerErrorBoundary Component
 * 
 * React Error Boundary for catching and handling WebGL, Three.js, and useGLTF errors
 * in 3D viewer components. Provides graceful degradation with user-friendly fallback UI.
 * 
 * @component
 * @example
 * ```tsx
 * <ViewerErrorBoundary onError={(error) => console.log(error)}>
 *   <ModelLoader partId="123" />
 * </ViewerErrorBoundary>
 * ```
 * 
 * Features:
 * - WebGL availability detection on mount
 * - Error catching via componentDidCatch lifecycle
 * - User-friendly fallback UI with retry functionality
 * - Custom fallback UI support via render prop
 * - Keyboard accessible (ARIA attributes)
 * - Production-safe error logging
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 * @see docs/US-010/T-1006-FRONT-TechnicalSpec.md
 */

import { Component, ErrorInfo } from 'react';
import type { ViewerErrorBoundaryProps, ViewerErrorBoundaryState } from './ViewerErrorBoundary.types';
import { 
  ERROR_BOUNDARY_DEFAULTS,
  ERROR_MESSAGES,
  BUTTON_LABELS,
  ARIA_LABELS,
} from './ViewerErrorBoundary.constants';

/**
 * Error Boundary class component for 3D viewer error handling.
 * 
 * This component wraps 3D viewer components and catches rendering errors,
 * preventing the entire React tree from crashing. It displays a fallback UI
 * when errors occur and provides retry/close functionality.
 * 
 * @class ViewerErrorBoundary
 * @extends {Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState>}
 */
export class ViewerErrorBoundary extends Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  private loadTimeoutId: NodeJS.Timeout | null = null;

  /**
   * Constructor - Initializes error boundary state
   * Checks WebGL availability on instantiation
   * 
   * @param {ViewerErrorBoundaryProps} props - Component props
   */
  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      webglAvailable: this.checkWebGLAvailability(),
    };
  }

  /**
   * Component lifecycle - setup timeout for load timeout detection
   * Note: Timeout is set but not actively used in current implementation.
   * Reserved for future enhancement to detect stuck model loads.
   */
  componentDidMount() {
    const timeout = this.props.loadTimeout || ERROR_BOUNDARY_DEFAULTS.LOAD_TIMEOUT;
    this.loadTimeoutId = setTimeout(() => {
      // Reserved for future load timeout handling
    }, timeout);
  }

  /**
   * Component cleanup - clear timeout to prevent memory leaks
   */
  componentWillUnmount() {
    if (this.loadTimeoutId) {
      clearTimeout(this.loadTimeoutId);
    }
  }

  /**
   * Static lifecycle method - derives new state from error
   * Called when an error is thrown during rendering
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Partial<ViewerErrorBoundaryState>} New state with error flag set
   */
  static getDerivedStateFromError(error: Error): Partial<ViewerErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Component lifecycle - handles caught errors
   * Logs error to console (development only) and calls parent error handler
   * 
   * @param {Error} error - The error that was caught
   * @param {ErrorInfo} errorInfo - React error info with component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('[ViewerErrorBoundary] Caught error:', error);
    }
    
    // Call parent error handler if provided
    this.props.onError?.(error, errorInfo);
    
    this.setState({ errorInfo });
  }

  /**
   * Check if WebGL is available in the current browser
   * Creates a temporary canvas and attempts to get WebGL context
   * 
   * @returns {boolean} true if WebGL is supported, false otherwise
   */
  checkWebGLAvailability(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ViewerErrorBoundary] WebGL check failed:', e);
      }
      return false;
    }
  }

  /**
   * Reset error boundary state and retry rendering
   * Clears error state to trigger re-render of children
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Close the error UI
   * Calls parent onClose callback if provided
   */
  handleClose = () => {
    this.props.onClose?.();
  };

  /**
   * Render method - displays children, error UI, or WebGL unavailable message
   * 
   * Three rendering branches:
   * 1. WebGL unavailable: Shows WebGL not supported message
   * 2. Error state: Shows fallback UI (custom or default)
   * 3. Happy path: Renders children normally
   * 
   * @returns {React.ReactNode} Rendered component
   */
  render() {
    const { hasError, error, errorInfo, webglAvailable } = this.state;
    const { fallback, children } = this.props;

    // Branch 1: WebGL is not available
    if (!webglAvailable) {
      return (
        <div role="alert" aria-label={ARIA_LABELS.ERROR_ALERT} aria-live="assertive">
          <p>{ERROR_MESSAGES.WEBGL_UNAVAILABLE}</p>
          <p>WebGL no disponible</p>
        </div>
      );
    }

    // Branch 2: Error occurred, show fallback UI
    if (hasError && error) {
      // Use custom fallback if provided via props
      if (fallback) {
        return fallback(error, this.handleRetry, this.handleClose);
      }

      // Default fallback UI with retry/close buttons and technical details
      return (
        <div role="alert" aria-label={ARIA_LABELS.ERROR_ALERT} aria-live="assertive">
          <p>{ERROR_MESSAGES.DEFAULT}</p>
          
          <button
            onClick={this.handleRetry}
            aria-label={ARIA_LABELS.RETRY_BUTTON}
          >
            {BUTTON_LABELS.RETRY}
          </button>
          
          <button
            onClick={this.handleClose}
            aria-label={ARIA_LABELS.CLOSE_BUTTON}
          >
            {BUTTON_LABELS.CLOSE}
          </button>

          <details>
            <summary>Detalles técnicos</summary>
            <pre>{error.message}</pre>
            {errorInfo && <pre>{errorInfo.componentStack}</pre>}
          </details>
        </div>
      );
    }

    // Branch 3: Happy path - no error, render children
    return children;
  }
}

export default ViewerErrorBoundary;
