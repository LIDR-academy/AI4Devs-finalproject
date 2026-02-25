/**
 * T-1005-FRONT: Model Loader Component Types
 * Type definitions for the GLB model loader with fallback support.
 */

import type { PartDetail } from '@/types/parts';

/**
 * Props for the ModelLoader component
 * 
 * Loads 3D models (GLB) from CDN with fallback to BBox wireframe.
 * Fetches part detail from GET /api/parts/{id} and renders using useGLTF.
 * 
 * @example
 * ```tsx
 * <ModelLoader 
 *   partId="550e8400-e29b-41d4-a716-446655440000"
 *   enablePreload={true}
 *   onLoadSuccess={(data) => console.log('Loaded:', data.iso_code)}
 * />
 * ```
 */
export interface ModelLoaderProps {
  /**
   * Part UUID to load
   * Must be a valid UUID format matching a part in the database
   */
  partId: string;
  
  /**
   * Enable preloading of adjacent parts (prev/next) for instant navigation
   * Uses T-1003-BACK endpoint to fetch adjacent IDs and preloads their GLBs
   * @default true
   */
  enablePreload?: boolean;
  
  /**
   * Show spinner overlay while loading part data
   * @default true
   */
  showLoadingSpinner?: boolean;
  
  /**
   * Callback when model and part data load successfully
   * Receives full PartDetail with metadata
   */
  onLoadSuccess?: (partData: PartDetail) => void;
  
  /**
   * Callback when model or data fetch fails
   * Receives Error object with message
   */
  onLoadError?: (error: Error) => void;
  
  /**
   * Auto-center model at origin (0,0,0)
   * Useful for consistent camera positioning
   * @default true
   */
  autoCenter?: boolean;
  
  /**
   * Auto-scale model to fit target size
   * Scales model so max dimension = targetSize meters
   * @default true
   */
  autoScale?: boolean;
  
  /**
   * Target size for auto-scaling (meters)
   * Models will be scaled so max dimension equals this value
   * @default 5
   */
  targetSize?: number;
}
