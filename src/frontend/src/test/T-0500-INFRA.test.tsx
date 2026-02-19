/**
 * T-0500-INFRA: React Three Fiber Stack Setup
 *
 * ESTADO: ✅ DONE — 10/10 tests passing (2026-02-19)
 *
 * Cobertura:
 *   - T2 (×3): @react-three/fiber + @react-three/drei exports accesibles
 *   - T13 (×2): Canvas mock (jsdom-safe <div>) + useGLTF mock estructura
 *   - T4 (×5): Stubs importables (parts.store, types/parts, constants, hook, Dashboard)
 *
 * Mocks registrados en src/test/setup.ts — vi.mock() aplicado globalmente.
 */

import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// T2: Los paquetes de @react-three están instalados y sus exports son accesibles
// ---------------------------------------------------------------------------
describe('T2: Package imports (@react-three/fiber, @react-three/drei)', () => {
  it('Canvas is exported from @react-three/fiber', () => {
    expect(Canvas).toBeDefined();
  });

  it('useGLTF is exported from @react-three/drei', () => {
    expect(useGLTF).toBeDefined();
  });

  it('OrbitControls is exported from @react-three/drei', () => {
    expect(OrbitControls).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// T13: Canvas mock de setup.ts sustituye el WebGL por un <div> testeable en jsdom
// ---------------------------------------------------------------------------
describe('T13: Canvas mock renders as testable div in jsdom', () => {
  it('Canvas renders as <div data-testid="three-canvas"> (mock registrado en setup.ts)', () => {
    render(
      <Canvas>
        <mesh />
      </Canvas>
    );
    const canvasDiv = screen.getByTestId('three-canvas');
    expect(canvasDiv).toBeInTheDocument();
    expect(canvasDiv.tagName).toBe('DIV');
  });

  it('useGLTF mock devuelve estructura { scene, nodes, materials }', () => {
    const result = useGLTF('/test.glb');
    expect(result).toHaveProperty('scene');
    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('materials');
  });
});

// ---------------------------------------------------------------------------
// T4: Los archivos stub existen y son importables con rutas relativas
// Stubs con export {} — implementación completa en T-0504-FRONT
// ---------------------------------------------------------------------------
describe('T4: Stub files exist and are importable', () => {
  it('parts.store stub exists (src/stores/parts.store.ts)', async () => {
    const mod = await import('../stores/parts.store');
    expect(mod).toBeDefined();
  });

  it('parts.ts types stub exists (src/types/parts.ts)', async () => {
    const mod = await import('../types/parts');
    expect(mod).toBeDefined();
  });

  it('dashboard3d.constants stub exists (src/constants/dashboard3d.constants.ts)', async () => {
    const mod = await import('../constants/dashboard3d.constants');
    expect(mod).toBeDefined();
  });

  it('usePartsSpatialLayout hook stub exists (src/hooks/usePartsSpatialLayout.ts)', async () => {
    const mod = await import('../hooks/usePartsSpatialLayout');
    expect(mod).toBeDefined();
  });

  it('Dashboard directory marker exists (src/components/Dashboard/index.ts)', async () => {
    const dashboardExists = await import('../components/Dashboard/index').catch(() => null);
    expect(dashboardExists).not.toBeNull();
  });
});
