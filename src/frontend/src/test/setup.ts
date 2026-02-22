import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// ---------------------------------------------------------------------------
// @react-three/fiber — Canvas cannot use real WebGL in jsdom.
// Replace with a plain <div data-testid="three-canvas"> so tests can query it.
// ---------------------------------------------------------------------------
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'three-canvas' }, children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
}));

// ---------------------------------------------------------------------------
// @react-three/drei — prevent real asset fetching and WebGL calls in jsdom.
// ---------------------------------------------------------------------------
vi.mock('@react-three/drei', () => ({
  useGLTF: Object.assign(
    vi.fn(() => ({
      scene: {
        clone: vi.fn(() => ({})),
      },
      nodes: {},
      materials: {},
    })),
    { preload: vi.fn() }
  ),
  OrbitControls: vi.fn(() => null),
  Grid: vi.fn(() => null),
  GizmoHelper: vi.fn(({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children)
  ),
  GizmoViewcube: vi.fn(() => null),
  Stats: vi.fn(() => null),
  Html: vi.fn(({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children)
  ),
  Lod: vi.fn(({ children, distances }: { children: React.ReactNode, distances?: number[] }) =>
    React.createElement('div', { 'data-lod-distances': distances?.join(',') }, children)
  ),
}));
