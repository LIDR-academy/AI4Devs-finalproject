import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DicomViewer3D from './DicomViewer3D';

vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="canvas-mock" />,
}));

describe('DicomViewer3D', () => {
  it('renderiza el canvas mockeado y la UI de controles', () => {
    render(<DicomViewer3D darkMode />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
    expect(screen.getByText('Controles')).toBeInTheDocument();
    expect(screen.getByText(/Click: Seleccionar 1.º y 2.º punto/)).toBeInTheDocument();
  });

  it('acepta prop onClearMeasurement sin romper', () => {
    render(<DicomViewer3D onClearMeasurement={() => {}} darkMode />);
    expect(screen.getByTestId('canvas-mock')).toBeInTheDocument();
  });

  it('muestra controles en modo claro cuando darkMode es false', () => {
    render(<DicomViewer3D darkMode={false} />);
    expect(screen.getByText('Controles')).toBeInTheDocument();
  });
});
