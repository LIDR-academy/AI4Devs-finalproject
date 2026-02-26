/**
 * T-1005-FRONT: Model Loader Constants
 * Centralized configuration for timeouts, defaults, and messages.
 */

/**
 * Default configuration values for ModelLoader component
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
 * Error messages for ModelLoader component
 */
export const ERROR_MESSAGES = {
  PART_NOT_FOUND: 'Pieza no encontrada',
  ACCESS_DENIED: 'Acceso denegado',
  FETCH_FAILED: 'Error al cargar datos de la pieza',
  GLB_LOAD_FAILED: 'Error al cargar modelo 3D',
  GEOMETRY_PROCESSING: 'Geometría en procesamiento...',
} as const;

/**
 * Loading messages for ModelLoader component
 */
export const LOADING_MESSAGES = {
  FETCHING_DATA: 'Cargando modelo 3D...',
  PROCESSING_GEOMETRY: 'Geometría en procesamiento',
  LOADING_MODEL: 'Cargando geometría...',
} as const;
