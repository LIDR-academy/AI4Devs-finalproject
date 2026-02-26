/**
 * T-1004-FRONT: Part Viewer Canvas Constants
 * Extracted constants following project pattern (avoid magic numbers).
 * Documented in systemPatterns.md as precedent: T-0507-FRONT lod.constants.ts
 */

/**
 * Default property values for PartViewerCanvas component
 * Used when props are undefined, following DRY principle
 * Referenced in component prop defaults
 */
export const VIEWER_DEFAULTS = {
  /**
   * Camera field of view in degrees (narrower than dashboard's 50°)
   * Provides closer focus on single part vs multi-object scene
   */
  FOV: 45,

  /**
   * Initial camera position [x, y, z]
   * Much closer than dashboard's [50,50,50] for detailed part inspection
   * Distance ~5.2 units from origin (sqrt(3^2 + 3^2 + 3^2))
   */
  CAMERA_POSITION: [3, 3, 3] as const,

  /**
   * Enable auto-rotation by default
   * Disabled by default to prevent disorienting users on initial load
   */
  AUTO_ROTATE: false,

  /**
   * Auto-rotation speed in degrees per second
   * Subtle rotation for product showcase without motion sickness
   */
  AUTO_ROTATE_SPEED: 1.5,

  /**
   * Enable soft shadows on stage
   * Contact shadows provide realism without performance overhead
   */
  SHADOWS: true,

  /**
   * Enable touch gestures (pinch zoom, two-finger pan)
   * Support for mobile/tablet users
   */
  ENABLE_TOUCH_GESTURES: true,

  /**
   * Loading message text
   * Displayed to user during Suspense fallback / async loading
   * Localized as Spanish (project default)
   */
  LOADING_MESSAGE: 'Cargando modelo 3D...',

  /**
   * ARIA label for accessibility
   * Provides context for screen readers
   * Descriptive: "3D architectural part viewer"
   */
  ARIA_LABEL: 'Visor 3D de pieza arquitectónica',
} as const;

/**
 * Camera distance and angle constraints
 * Prevents camera from going below ground or too far away
 */
export const CAMERA_CONSTRAINTS = {
  /**
   * Minimum zoom distance from model (units)
   * Prevents camera clipping through geometry
   */
  MIN_DISTANCE: 1,

  /**
   * Maximum zoom distance from model (units)
   * Prevents camera from getting too far (loses detail)
   */
  MAX_DISTANCE: 20,

  /**
   * Maximum polar angle in radians
   * ~120 degrees (prevents camera going below or above horizon plane)
   * Math.PI / 1.5 = ~2.094 rad = ~120°
   */
  MAX_POLAR_ANGLE: Math.PI / 1.5,
} as const;

/**
 * Lighting configuration (3-point lighting setup)
 * Provides professional studio-like illumination for part details
 * Positions: Key [5,5,5], Fill [-3,2,-3], Rim [0,3,-5]
 */
export const LIGHTING_CONFIG = {
  /**
   * Key Light: Main illumination, 45° angle
   * Brightest light source, casts shadows
   * Position: [5, 5, 5] (northwest, above)
   */
  KEY_LIGHT: {
    position: [5, 5, 5] as const,
    intensity: 1.2,
    color: '#ffffff',
  },

  /**
   * Fill Light: Reduces harsh shadows on opposite side
   * Softer, warmer tone complements key light
   * Position: [-3, 2, -3] (southeast, above)
   */
  FILL_LIGHT: {
    position: [-3, 2, -3] as const,
    intensity: 0.5,
    color: '#f0f0f0',
  },

  /**
   * Rim Light: Highlights edges and contours
   * Creates separation between part and background
   * Position: [0, 3, -5] (south, above, behind)
   */
  RIM_LIGHT: {
    position: [0, 3, -5] as const,
    intensity: 0.3,
    color: '#ffffff',
  },

  /**
   * Ambient Light: Base illumination
   * Fills shadows with subtle light (no harsh black areas)
   */
  AMBIENT: {
    intensity: 0.4,
  },
} as const;

/**
 * CSS class names for internal styling
 * Following BEM convention for component encapsulation
 */
export const CSS_CLASSES = {
  /**
   * Root container class
   * Applied to the outermost div wrapper
   */
  CONTAINER: 'part-viewer-canvas',

  /**
   * Loading overlay class
   * Full-screen overlay shown during async loading
   */
  LOADING_OVERLAY: 'part-viewer-loading-overlay',

  /**
   * Loading spinner class
   * Animated spinner inside loading overlay
   */
  SPINNER: 'part-viewer-spinner',
} as const;
