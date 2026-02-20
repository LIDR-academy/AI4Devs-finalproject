/**
 * Constants for Dashboard 3D components
 * T-0504-FRONT: Dashboard 3D Canvas Layout
 * 
 * Following constants extraction pattern from US-001 (FileUploader)
 */

import type { DockPosition } from './Dashboard3D.types';

/**
 * Camera configuration defaults
 */
export const CAMERA_CONFIG = {
  FOV: 50,
  POSITION: [50, 50, 50] as [number, number, number],
  NEAR: 0.1,
  FAR: 10000,
} as const;

/**
 * Grid configuration for Three.js scene
 */
export const GRID_CONFIG = {
  SIZE: [200, 200] as [number, number],
  CELL_SIZE: 5,
  SECTION_SIZE: 25,
  CELL_THICKNESS: 0.5,
  SECTION_THICKNESS: 1,
  CELL_COLOR: '#6e6e6e',
  SECTION_COLOR: '#9d4b4b',
  FADE_DISTANCE: 400,
  FADE_STRENGTH: 1,
} as const;

/**
 * Responsive breakpoints (px)
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
} as const;

/**
 * Dock position constants
 */
export const DOCK_POSITIONS: Record<string, DockPosition> = {
  LEFT: 'left',
  RIGHT: 'right',
  FLOATING: 'floating',
} as const;

/**
 * Sidebar dimensions and behavior
 */
export const SIDEBAR_CONFIG = {
  WIDTH: 300, // px
  DRAG_HANDLE_HEIGHT: 40, // px
  SNAP_THRESHOLD: 50, // px from edge to trigger snap
  MIN_FLOATING_WIDTH: 280, // px
  MAX_FLOATING_WIDTH: 400, // px
  TRANSITION_DURATION: 300, // ms
} as const;

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  SIDEBAR_DOCK: 'dashboard-sidebar-dock',
  SIDEBAR_POSITION: 'dashboard-sidebar-position',
} as const;

/**
 * Default messages
 */
export const MESSAGES = {
  EMPTY_STATE: 'No hay piezas cargadas',
  EMPTY_STATE_SUBTITLE: 'Las piezas validadas aparecerán aquí automáticamente',
  LOADING: 'Cargando piezas...',
  FILTERS_TITLE: 'Filtros',
  FILTERS_COMING_SOON: 'Próximamente...',
} as const;

/**
 * ARIA labels for accessibility
 */
export const ARIA_LABELS = {
  CANVAS: 'Vista 3D del dashboard de piezas',
  SIDEBAR: 'Panel de filtros lateral',
  DRAG_HANDLE: 'Arrastrar panel de filtros',
  DOCK_LEFT: 'Anclar panel a la izquierda',
  DOCK_RIGHT: 'Anclar panel a la derecha',
  FLOAT: 'Dejar panel flotante',
  TOGGLE_SIDEBAR: 'Mostrar/ocultar filtros',
} as const;

/**
 * Lighting configuration for Three.js scene
 */
export const LIGHTING_CONFIG = {
  AMBIENT_INTENSITY: 0.4,
  DIRECTIONAL_INTENSITY: 1,
  DIRECTIONAL_POSITION: [50, 100, 50] as [number, number, number],
  SHADOW_MAP_SIZE: [2048, 2048] as [number, number],
} as const;

/**
 * OrbitControls configuration
 */
export const CONTROLS_CONFIG = {
  ENABLE_DAMPING: true,
  DAMPING_FACTOR: 0.05,
  MIN_DISTANCE: 10,
  MAX_DISTANCE: 500,
  MAX_POLAR_ANGLE: Math.PI / 2, // Don't allow rotation below ground
} as const;
