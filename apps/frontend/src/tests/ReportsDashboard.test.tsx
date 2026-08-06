import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportsDashboard } from '../features/reports/components/ReportsDashboard.js';

describe('TK-007-E: ReportsDashboard Component Suite', () => {
  it('debe mostrar la pantalla de Acceso Restringido si el usuario no es ADMIN', () => {
    render(<ReportsDashboard isOpen={true} userRole="OPERATOR" onClose={() => {}} />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/requiere rol de Administrador/i)).toBeInTheDocument();
  });

  it('debe renderizar el dashboard con metricas cuando el usuario posee rol ADMIN', async () => {
    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(screen.getByText(/Dashboard de Reportes y Mermas FEFO/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Insumos Descartados/i)).toBeInTheDocument();
  });
});
