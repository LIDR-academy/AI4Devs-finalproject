/**
 * T-1004-FRONT: Part Viewer Canvas Types
 * Type definitions for the dedicated 3D part viewer component.
 */

import { ReactNode } from 'react';

/**
 * Props for the PartViewerCanvas component
 * Optimized for single-part close-up viewing with 3-point lighting
 */
export interface PartViewerCanvasProps {
  /**
   * Child components to render inside Canvas (typically ModelLoader from T-1005)
   * @required
   */
  children: ReactNode;

  /**
   * Enable auto-rotation of camera (showcase mode)
   * @default false
   */
  autoRotate?: boolean;

  /**
   * Auto-rotation speed in degrees per second
   * Only used when autoRotate is true
   * @default 1.5
   */
  autoRotateSpeed?: number;

  /**
   * Camera field of view in degrees
   * Narrower than dashboard Canvas3D (45° vs 50°) for closer inspection
   * @default 45
   */
  fov?: number;

  /**
   * Initial camera position [x, y, z]
   * Closer than dashboard [50,50,50] for focused single-part viewing
   * @default [3, 3, 3]
   */
  cameraPosition?: [number, number, number];

  /**
   * Enable soft shadows on stage
   * Uses contact shadows for realistic lighting
   * @default true
   */
  shadows?: boolean;

  /**
   * Show loading overlay while children load
   * Displays spinner + message during async model loading
   * @default false
   */
  showLoading?: boolean;

  /**
   * Loading message text
   * Displayed in loading overlay when showLoading=true
   * @default "Cargando modelo 3D..."
   */
  loadingMessage?: string;

  /**
   * Enable touch gestures (pinch zoom, two-finger pan)
   * Support for mobile/tablet interaction
   * @default true
   */
  enableTouchGestures?: boolean;

  /**
   * Custom className for styling container div
   * Added to the root container alongside 'part-viewer-canvas'
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * descriptive text for screen readers
   * @default "Visor 3D de pieza arquitectónica"
   */
  ariaLabel?: string;
}
