import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportsDashboard } from '../features/reports/components/ReportsDashboard.js';

function stubFetchWithWasteAndSettings(
  wasteItems: unknown[],
  currencySymbol: string,
  rotationMetrics?: { averageTrrHours: number | null; targetTrrHours: number; sampleSize: number }
) {
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
      if (url.includes('/reports/rotation-metrics')) {
        return {
          ok: true,
          status: 200,
          json: async () => rotationMetrics ?? { averageTrrHours: 48.3, targetTrrHours: 72, sampleSize: 12 },
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

  it('debe mostrar un estado vacio explicito cuando sampleSize es 0, nunca un valor numerico (US-020 Escenario 2)', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: null, targetTrrHours: 72, sampleSize: 0 });

    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('Sin remanentes finalizados en este periodo')).toBeInTheDocument();
    expect(screen.queryByText(/horas/)).not.toBeInTheDocument();
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('debe indicar cumplimiento (badge/texto verde) cuando el TRR real esta dentro del objetivo de 72h', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: 50.0, targetTrrHours: 72, sampleSize: 12 });

    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('50.0')).toBeInTheDocument();
    expect(await screen.findByText(/Dentro del objetivo/i)).toBeInTheDocument();
    const trrCard = screen.getByText('TRR Real (Rotación de Remanentes)').closest('.card-dashboard');
    expect(trrCard?.querySelector('.card-badge-icon--success')).not.toBeNull();
    expect(trrCard?.querySelector('.card-badge-icon--danger')).toBeNull();
  });

  it('debe indicar incumplimiento (badge/texto rojo) cuando el TRR real supera el objetivo de 72h, sin hardcodear el umbral', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: 96.5, targetTrrHours: 72, sampleSize: 5 });

    render(<ReportsDashboard isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    expect(await screen.findByText('96.5')).toBeInTheDocument();
    expect(await screen.findByText(/Fuera del objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Objetivo: 72h/i)).toBeInTheDocument();
    const trrCard = screen.getByText('TRR Real (Rotación de Remanentes)').closest('.card-dashboard');
    expect(trrCard?.querySelector('.card-badge-icon--danger')).not.toBeNull();
    expect(trrCard?.querySelector('.card-badge-icon--success')).toBeNull();
  });
});
