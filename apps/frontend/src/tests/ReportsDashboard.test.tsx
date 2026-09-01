import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportsDashboard } from '../features/reports/components/ReportsDashboard.js';

function stubFetchWithWasteAndSettings(wasteItems: unknown[], currencySymbol: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/settings')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'settings-1',
            restaurantName: 'Test',
            currencySymbol,
            criticalAlertHours: 24,
            defaultRemanenteHours: 72,
            varianceTolerancePercent: 5,
          }),
        };
      }
      return { ok: true, status: 200, json: async () => wasteItems };
    })
  );
}

describe('TK-007-E: ReportsDashboard Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('debe mostrar el valor monetario de la merma cuando el insumo tiene costo registrado (US-019 Escenario 1)', async () => {
    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('$6300.00')).toBeInTheDocument();
  });

  it('debe mostrar "Sin costo registrado" cuando el insumo no tiene costo, nunca "$0.00" (US-019 Escenario 2)', async () => {
    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('Sin costo registrado')).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it('debe distinguir un costo genuinamente cero ("0.00") de un costo no registrado (null) — no debe colapsar ambos en "Sin costo registrado"', async () => {
    stubFetchWithWasteAndSettings(
      [
        {
          insumoId: 'ins-gratis-1',
          insumoName: 'Insumo Donado',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '2.000',
          reason: 'EXPIRATION',
          totalDiscardedCost: '0.00',
        },
      ],
      '$'
    );

    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('$0.00')).toBeInTheDocument();
    expect(screen.queryByText('Sin costo registrado')).not.toBeInTheDocument();
  });

  it('debe usar el simbolo de moneda real de SystemSettings, nunca un "$" hardcodeado', async () => {
    stubFetchWithWasteAndSettings(
      [
        {
          insumoId: 'ins-queso-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '3.500',
          reason: 'EXPIRATION',
          totalDiscardedCost: '6300.00',
        },
      ],
      '€'
    );

    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('€6300.00')).toBeInTheDocument();
    expect(screen.queryByText('$6300.00')).not.toBeInTheDocument();
  });
});
