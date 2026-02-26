/**
 * T-1004-FRONT: Part Viewer Canvas Component
 * Dedicated 3D canvas for viewing single parts in modal (US-010).
 *
 * Feature-complete implementation with:
 * - Optimized camera/lighting for close-up part inspection
 * - 3-point lighting setup (key, fill, rim)
 * - OrbitControls with optional auto-rotation
 * - White stage background with soft shadows
 * - Touch gesture support for mobile
 * - Suspense fallback + loading overlay
 */

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import type { PartViewerCanvasProps } from './PartViewerCanvas.types';
import {
  VIEWER_DEFAULTS,
  CAMERA_CONSTRAINTS,
  LIGHTING_CONFIG,
} from './PartViewerCanvas.constants';

/**
 * Loading Fallback Component
 * Rendered inside Suspense while children load
 * Shows spinner and message to user
 */
const LoadingFallback: React.FC<{ message: string }> = ({ message }) => (
  <Html center>
    <div
      style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '1rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}
    >
      <div className="spinner" />
      <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>{message}</p>
    </div>
  </Html>
);

/**
 * Loading Overlay Component
 * Rendered outside Canvas, covers entire viewport
 * Used when showLoading prop is true
 */
const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255,255,255,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem', color: '#333' }}>{message}</p>
    </div>
  </div>
);

/**
 * T-1004-FRONT: Dedicated 3D canvas for single-part viewing in modal.
 * Optimized for close-up part inspection with 3-point lighting.
 *
 * Usage:
 * ```tsx
 * <PartViewerCanvas autoRotate showLoading>
 *   <ModelLoader partId={partId} />
 * </PartViewerCanvas>
 * ```
 */
export const PartViewerCanvas: React.FC<PartViewerCanvasProps> = ({
  children,
  autoRotate = VIEWER_DEFAULTS.AUTO_ROTATE,
  autoRotateSpeed = VIEWER_DEFAULTS.AUTO_ROTATE_SPEED,
  fov = VIEWER_DEFAULTS.FOV,
  cameraPosition = VIEWER_DEFAULTS.CAMERA_POSITION,
  shadows = VIEWER_DEFAULTS.SHADOWS,
  showLoading = false,
  loadingMessage = VIEWER_DEFAULTS.LOADING_MESSAGE,
  enableTouchGestures = VIEWER_DEFAULTS.ENABLE_TOUCH_GESTURES,
  className = '',
  ariaLabel = VIEWER_DEFAULTS.ARIA_LABEL,
}) => {
  const controlsRef = useRef<any>(null);

  // Check WebGL availability before rendering (T-1009-TEST-FRONT: ERR-INT-03)
  // This must run during render (not in useEffect) to be caught by error boundary
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL is not available in this browser');
  }

  return (
    <div
      data-testid="part-viewer-canvas"
      className={`part-viewer-canvas ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        shadows={shadows}
        dpr={[1, 2]} // Adaptive pixel ratio (1x for low-end, 2x for high-DPI)
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        {/* Camera Configuration */}
        <PerspectiveCamera
          makeDefault
          fov={fov}
          position={new Vector3(...cameraPosition)}
          near={0.1}
          far={1000}
        />

        {/* Lighting Setup: 3-Point Lighting */}
        {/* Key Light (main) - 45° angle, white, brightest */}
        <directionalLight
          position={LIGHTING_CONFIG.KEY_LIGHT.position}
          intensity={LIGHTING_CONFIG.KEY_LIGHT.intensity}
          color={LIGHTING_CONFIG.KEY_LIGHT.color}
          castShadow={shadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Fill Light - opposite side, softer, reduces harsh shadows */}
        <directionalLight
          position={LIGHTING_CONFIG.FILL_LIGHT.position}
          intensity={LIGHTING_CONFIG.FILL_LIGHT.intensity}
          color={LIGHTING_CONFIG.FILL_LIGHT.color}
        />

        {/* Rim Light - from behind, highlights edges */}
        <directionalLight
          position={LIGHTING_CONFIG.RIM_LIGHT.position}
          intensity={LIGHTING_CONFIG.RIM_LIGHT.intensity}
          color={LIGHTING_CONFIG.RIM_LIGHT.color}
        />

        {/* Ambient Light - base illumination */}
        <ambientLight intensity={LIGHTING_CONFIG.AMBIENT.intensity} />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom
          enablePan
          minDistance={CAMERA_CONSTRAINTS.MIN_DISTANCE}
          maxDistance={CAMERA_CONSTRAINTS.MAX_DISTANCE}
          maxPolarAngle={CAMERA_CONSTRAINTS.MAX_POLAR_ANGLE}
          // Touch gestures
          touches={{
            ONE: enableTouchGestures ? 2 : 0, // One-finger rotate
            TWO: enableTouchGestures ? 1 : 0, // Two-finger pan
          }}
        />

        {/* Stage: White background with soft shadows */}
        <Stage
          environment="city" // HDRI environment map (realistic reflections)
          intensity={0.5}
          shadows={shadows ? 'contact' : false} // Soft contact shadows
          adjustCamera={false} // Don't auto-adjust camera (we control it)
        >
          <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
            {children}
          </Suspense>
        </Stage>
      </Canvas>

      {/* Loading Overlay (shown during initial load) */}
      {showLoading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
};

export default PartViewerCanvas;
