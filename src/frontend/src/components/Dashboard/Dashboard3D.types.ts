/**
 * TypeScript type definitions for Dashboard 3D components
 * T-0504-FRONT: Dashboard 3D Canvas Layout with Dockable Sidebar
 * 
 * @see docs/US-005/T-0504-FRONT-TechnicalSpec-ENRICHED.md
 */

/**
 * Dock position for the sidebar
 * - 'left': Sidebar docked to left edge
 * - 'right': Sidebar docked to right edge
 * - 'floating': Sidebar in free-floating mode (draggable)
 */
export type DockPosition = 'left' | 'right' | 'floating';

/**
 * Props for Dashboard3D main component
 */
export interface Dashboard3DProps {
  /** Initial camera position (optional override) */
  initialCameraPosition?: [number, number, number];
  
  /** Show Stats panel (default: import.meta.env.DEV) */
  showStats?: boolean;
  
  /** Custom empty state message */
  emptyMessage?: string;
  
  /** Initial sidebar dock position (default: 'right') */
  initialSidebarDock?: DockPosition;
}

/**
 * Props for Canvas3D component (Three.js wrapper)
 */
export interface Canvas3DProps {
  /** Show Stats panel for performance monitoring */
  showStats?: boolean;
  
  /** Camera initial configuration */
  cameraConfig?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
  };
}

/**
 * Props for DraggableFiltersSidebar component
 */
export interface DraggableSidebarProps {
  /** Current dock position */
  dockPosition: DockPosition;
  
  /** Callback when dock position changes */
  onDockChange: (position: DockPosition) => void;
  
  /** Floating position (x, y) when dockPosition === 'floating' */
  floatingPosition?: { x: number; y: number };
  
  /** Callback when floating position changes */
  onPositionChange?: (position: { x: number; y: number }) => void;
  
  /** Children content (FiltersSidebar) */
  children: React.ReactNode;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Custom message (default: "No hay piezas cargadas") */
  message?: string;
  
  /** Optional action button text */
  actionLabel?: string;
  
  /** Optional action callback */
  onAction?: () => void;
}

/**
 * Props for LoadingOverlay component
 */
export interface LoadingOverlayProps {
  /** Loading message (default: "Cargando piezas...") */
  message?: string;
}

/**
 * 2D position for floating sidebar
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * Bounds for draggable elements
 */
export interface DragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
