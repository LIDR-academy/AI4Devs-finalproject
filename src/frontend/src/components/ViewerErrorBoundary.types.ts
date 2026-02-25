/**
 * T-1006-FRONT: Viewer Error Boundary Component Types
 * Type definitions for React Error Boundary wrapping 3D viewer components
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import { ReactNode } from 'react';

/**
 * Props for ViewerErrorBoundary component
 * 
 * Error boundary that wraps 3D viewer components (ModelLoader, PartViewerCanvas)
 * to catch and handle WebGL, Three.js, and useGLTF runtime errors.
 * 
 * @example
 * ```tsx
 * <ViewerErrorBoundary
 *   onError={(error, errorInfo) => console.error(error)}
 *   onClose={() => setModalOpen(false)}
 * >
 *   <ModelLoader partId={partId} />
 * </ViewerErrorBoundary>
 * ```
 */
export interface ViewerErrorBoundaryProps {
  /**
   * Child components to protect (typically ModelLoader or PartViewerCanvas)
   */
  children: ReactNode;
  
  /**
   * Callback fired when error is caught
   * Receives error object and React error info (component stack)
   * @param error - The error that was thrown
   * @param errorInfo - React component stack trace
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  /**
   * Custom fallback UI to render on error
   * If provided, overrides default fallback UI
   * @param error - The error that was thrown
   * @param retry - Function to reset error boundary and retry render
   * @param close - Function to close the modal/viewer
   */
  fallback?: (error: Error, retry: () => void, close: () => void) => ReactNode;
  
  /**
   * Callback when user clicks "Close" in fallback UI
   * Typically closes the parent modal
   */
  onClose?: () => void;
  
  /**
   * Timeout for initial load (milliseconds)
   * Used to detect if loading takes too long
   * @default 30000 (30 seconds)
   */
  loadTimeout?: number;
}

/**
 * State for ViewerErrorBoundary class component
 * Tracks error state and WebGL availability
 */
export interface ViewerErrorBoundaryState {
  /**
   * Whether an error has been caught
   */
  hasError: boolean;
  
  /**
   * The error object if caught, null otherwise
   */
  error: Error | null;
  
  /**
   * React component stack trace
   * Used for debugging and logging
   */
  errorInfo: React.ErrorInfo | null;
  
  /**
   * Whether WebGL is available in the browser
   * Checked on component mount
   */
  webglAvailable: boolean;
}

/**
 * Error types for categorization and user messaging
 */
export const ERROR_TYPES = {
  /**
   * WebGL not supported or disabled in browser
   */
  WEBGL_UNAVAILABLE: 'WEBGL_UNAVAILABLE',
  
  /**
   * WebGL context lost (GPU crash, too many contexts)
   */
  WEBGL_CONTEXT_LOST: 'WEBGL_CONTEXT_LOST',
  
  /**
   * React/JavaScript error (Three.js crash, invalid geometry)
   */
  SCRIPT_ERROR: 'SCRIPT_ERROR',
  
  /**
   * Timeout loading model (30s exceeded)
   */
  TIMEOUT: 'TIMEOUT',
  
  /**
   * Network error (fetch failed, CORS, 404)
   */
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Type for error category keys
 */
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
