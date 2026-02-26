import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock HTMLCanvasElement.getContext to return mock WebGL context by default
// This allows Three.js mocks to work without real WebGL in jsdom
// Individual tests can override this (e.g., ERR-INT-03 sets it to null)
// ---------------------------------------------------------------------------
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
 if (contextId === 'webgl' || contextId === 'webgl2') {
    // Return mock WebGL context
    return {} as any;
  }
  // For other contexts (2d, etc.), return mock as well
  return {} as any;
});

// ---------------------------------------------------------------------------
// @react-three/fiber — Canvas cannot use real WebGL in jsdom.
// Replace with a plain <div data-testid="three-canvas"> that can handle click events.
// Also mock three.js primitive elements (group, mesh, etc.) as simple divs.
// ---------------------------------------------------------------------------
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onPointerMissed, ...props }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': 'three-canvas',
        onClick: onPointerMissed, // Simulate onPointerMissed with click for testing
        ...props
      },
      children
    ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
}));

// Mock global intrinsic elements from three.js used by React Three Fiber
// These include: group, mesh, primitive, ambientLight, directionalLight, etc.
// @ts-ignore - Adding to global React namespace for test environment
globalThis.React = React;
const mockThreeElement = (type: string) => ({ children, ...props }: any) =>
  React.createElement('div', { ...props, 'data-three-type': type }, children);

// Register common three.js elements as React components
(global as any).group = mockThreeElement('group');
(global as any).mesh = mockThreeElement('mesh');
(global as any).primitive = mockThreeElement('primitive');
(global as any).ambientLight = mockThreeElement('ambientLight');
(global as any).directionalLight = mockThreeElement('directionalLight');

// ---------------------------------------------------------------------------
// @react-three/drei — prevent real asset fetching and WebGL calls in jsdom.
// useGLTF mock checks URL patterns to simulate 404 and parsing errors for tests.
// ---------------------------------------------------------------------------
vi.mock('@react-three/drei', () => {
  const mockComponent = () => null;
  const mockComponentWithChildren = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', null, children);
  
  return {
    useGLTF: Object.assign(
      vi.fn((url: string) => {
        // Simulate GLB 404 error from CDN (ERR-INT-04)
        if (url.includes('does-not-exist.glb') || url.includes('invalid-path')) {
          throw new Error('404 - GLB file not found');
        }
        
        // Simulate corrupted GLB parsing error (ERR-INT-05)
        if (url.includes('corrupted')) {
          throw new Error('GLTFLoader: Invalid or unsupported glTF version');
        }
        
        // Default: return mock scene for successful loads
        return {
          scene: {
            clone: vi.fn(() => ({})),
          },
          nodes: {},
          materials: {},
        };
      }),
      { preload: vi.fn() }
    ),
    // Components that accept refs - return simple mock functions
    OrbitControls: mockComponent,
    PerspectiveCamera: mockComponent,
    // Components with children - wrap in div
    Stage: mockComponentWithChildren,
    GizmoHelper: mockComponentWithChildren,
    Html: mockComponentWithChildren,
    Detailed: ({ children, distances }: { children?: React.ReactNode, distances?: number[] }) =>
      React.createElement('div', { 'data-lod-distances': distances?.join(',') }, children),
    // Simple components without children or refs
    Grid: mockComponent,
    GizmoViewcube: mockComponent,
    Stats: mockComponent,
  };
});
