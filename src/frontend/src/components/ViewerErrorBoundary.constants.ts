/**
 * T-1006-FRONT: Viewer Error Boundary Constants
 * Centralized configuration for error boundary behavior and messages
 */

/**
 * Default configuration values for ViewerErrorBoundary component
 */
export const ERROR_BOUNDARY_DEFAULTS = {
  /**
   * Timeout for initial model load (milliseconds)
   * After this time, consider load as failed
   * @default 30000 (30 seconds)
   */
  LOAD_TIMEOUT: 30000,
  
  /**
   * Whether to log errors to console in development
   * @default true
   */
  ENABLE_LOGGING: true,
} as const;

/**
 * User-friendly error messages for different error scenarios
 * Shown in fallback UI when errors occur
 */
export const ERROR_MESSAGES = {
  /**
   * Generic error message (fallback)
   */
  DEFAULT: 'Error al cargar el visor 3D',
  
  /**
   * WebGL not available in browser
   */
  WEBGL_UNAVAILABLE: 'Tu navegador no soporta WebGL',
  
  /**
   * WebGL context lost
   */
  WEBGL_CONTEXT_LOST: 'El contexto WebGL se ha perdido',
  
  /**
   * Network error (fetch failed)
   */
  NETWORK_ERROR: 'No se pudo cargar el modelo 3D',
  
  /**
   * Timeout loading model
   */
  TIMEOUT: 'El modelo tardó demasiado en cargar',
  
  /**
   * Generic script error
   */
  SCRIPT_ERROR: 'Error al procesar el modelo 3D',
} as const;

/**
 * Technical details for developer debugging
 * Shown in collapsible <details> section in development mode
 */
export const TECHNICAL_MESSAGES = {
  WEBGL_UNAVAILABLE: 'WebGL is not supported or disabled in this browser. Please use Chrome, Firefox, or Safari.',
  WEBGL_CONTEXT_LOST: 'WebGL context was lost. This can happen due to GPU crashes or too many tabs open.',
  NETWORK_ERROR: 'Failed to fetch 3D model file. Check network connection and CORS configuration.',
  TIMEOUT: 'Model load exceeded timeout threshold. File may be too large or network too slow.',
  SCRIPT_ERROR: 'Three.js or React component threw an error during rendering.',
} as const;

/**
 * Button labels for error boundary UI
 */
export const BUTTON_LABELS = {
  RETRY: '🔄 Reintentar',
  CLOSE: 'Cerrar',
} as const;

/**
 * ARIA labels for accessibility
 */
export const ARIA_LABELS = {
  ERROR_ALERT: 'Error loading 3D viewer',
  RETRY_BUTTON: 'Retry loading 3D model',
  CLOSE_BUTTON: 'Close 3D viewer',
  ERROR_DETAILS: 'Technical error details',
} as const;
