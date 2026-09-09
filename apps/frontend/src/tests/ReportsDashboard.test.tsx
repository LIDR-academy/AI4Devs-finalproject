import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportsDashboard } from '../features/reports/components/ReportsDashboard.js';
import { seedSession, clearSession, ALL_PERMISSIONS } from './helpers/session.js';

const EMPTY_PREPARATION_WASTE_REPORT = { wasteByReason: [], consumptionVsTheoretical: [], wasteAlertThresholdPercent: 5 };

function stubFetchWithWasteAndSettings(
  wasteItems: unknown[],
  currencySymbol: string,
  rotationMetrics?: { averageTrrHours: number | null; targetTrrHours: number; sampleSize: number },
  preparationWasteReport?: unknown
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
      if (url.includes('/reports/preparation-waste')) {
        return { ok: true, status: 200, json: async () => preparationWasteReport ?? EMPTY_PREPARATION_WASTE_REPORT };
      }
      return { ok: true, status: 200, json: async () => wasteItems };
    })
  );
}

describe('TK-007-E: ReportsDashboard Component Suite', () => {
  // TK-121-FE: el dashboard ya no recibe el rol por prop — consulta `reports:view`
  // desde el token de sesión, así que los tests siembran una sesión real.
  beforeEach(() => {
    seedSession({ role: 'ADMIN', permissions: ALL_PERMISSIONS });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearSession();
  });

  it('se renderiza inline (US-024): sin overlay de modal ni botón de cerrar', () => {
    const { container } = render(<ReportsDashboard />);

    // El gating ADMIN vive ahora en <ProtectedRoute>; ReportsDashboard ya no envuelve
    // en <Modal> ni expone una "X" de cerrar (una ruta no se cierra, se navega).
    expect(container.querySelector('[class*="modal-overlay"]')).toBeNull();
    expect(container.querySelector('#btn-close-reports')).toBeNull();
    expect(screen.getByText(/Dashboard de Reportes y Mermas FEFO/i)).toBeInTheDocument();
  });

  it('debe renderizar el dashboard con metricas cuando el usuario posee rol ADMIN', async () => {
    render(<ReportsDashboard />);

    expect(screen.getByText(/Dashboard de Reportes y Mermas FEFO/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Insumos Descartados/i)).toBeInTheDocument();
  });

  it('debe mostrar el valor monetario de la merma cuando el insumo tiene costo registrado (US-019 Escenario 1)', async () => {
    render(<ReportsDashboard />);

    expect(await screen.findByText('$6300.00')).toBeInTheDocument();
  });

  it('debe mostrar "Sin costo registrado" cuando el insumo no tiene costo, nunca "$0.00" (US-019 Escenario 2)', async () => {
    render(<ReportsDashboard />);

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

    render(<ReportsDashboard />);

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

    render(<ReportsDashboard />);

    expect(await screen.findByText('€6300.00')).toBeInTheDocument();
    expect(screen.queryByText('$6300.00')).not.toBeInTheDocument();
  });

  it('debe mostrar un estado vacio explicito cuando sampleSize es 0, nunca un valor numerico (US-020 Escenario 2)', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: null, targetTrrHours: 72, sampleSize: 0 });

    render(<ReportsDashboard />);

    expect(await screen.findByText('Sin remanentes finalizados en este periodo')).toBeInTheDocument();
    expect(screen.queryByText(/horas/)).not.toBeInTheDocument();
    expect(screen.queryByText('0.0')).not.toBeInTheDocument();
  });

  it('debe indicar cumplimiento (badge/texto verde) cuando el TRR real esta dentro del objetivo de 72h', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: 50.0, targetTrrHours: 72, sampleSize: 12 });

    render(<ReportsDashboard />);

    expect(await screen.findByText('50.0')).toBeInTheDocument();
    expect(await screen.findByText(/Dentro del objetivo/i)).toBeInTheDocument();
    const trrCard = screen.getByText('TRR Real (Rotación de Remanentes)').closest('.card-dashboard');
    expect(trrCard?.querySelector('.card-badge-icon--success')).not.toBeNull();
    expect(trrCard?.querySelector('.card-badge-icon--danger')).toBeNull();
  });

  it('debe indicar incumplimiento (badge/texto rojo) cuando el TRR real supera el objetivo de 72h, sin hardcodear el umbral', async () => {
    stubFetchWithWasteAndSettings([], '$', { averageTrrHours: 96.5, targetTrrHours: 72, sampleSize: 5 });

    render(<ReportsDashboard />);

    expect(await screen.findByText('96.5')).toBeInTheDocument();
    expect(await screen.findByText(/Fuera del objetivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Objetivo: 72h/i)).toBeInTheDocument();
    const trrCard = screen.getByText('TRR Real (Rotación de Remanentes)').closest('.card-dashboard');
    expect(trrCard?.querySelector('.card-badge-icon--danger')).not.toBeNull();
    expect(trrCard?.querySelector('.card-badge-icon--success')).toBeNull();
  });

  describe('TK-105-FE (US-029): sección "Mermas de Preparación de Recetas"', () => {
    it('agrupa la merma por receta y muestra cantidad, % y valorización', async () => {
      stubFetchWithWasteAndSettings([], '$', undefined, {
        wasteByReason: [
          {
            recipeId: 'rec-pizza',
            recipeName: 'Pizza Margarita',
            insumoId: 'ins-queso',
            insumoName: 'Queso Mozzarella',
            unitOfMeasure: 'KG',
            wasteReason: 'recorte no aprovechable',
            totalWastedQty: '0.100',
            totalExtractedQty: '2.000',
            wastePercent: '5.00',
            wastedCost: '0.40',
            overThreshold: false,
          },
        ],
        consumptionVsTheoretical: [],
        wasteAlertThresholdPercent: 5,
      });

      render(<ReportsDashboard />);

      expect(await screen.findByText(/Pizza Margarita/)).toBeInTheDocument();
      expect(screen.getByText('Queso Mozzarella')).toBeInTheDocument();
      expect(screen.getByText(/recorte no aprovechable/)).toBeInTheDocument();
      expect(screen.getByText(/5\.00%/)).toBeInTheDocument();
      expect(screen.getByText('$0.40')).toBeInTheDocument();
    });

    it('una línea sobre el umbral se marca visualmente, sin disparar ningún toast/notificación', async () => {
      stubFetchWithWasteAndSettings([], '$', undefined, {
        wasteByReason: [
          {
            recipeId: 'rec-pizza',
            recipeName: 'Pizza Margarita',
            insumoId: 'ins-queso',
            insumoName: 'Queso Mozzarella',
            unitOfMeasure: 'KG',
            wasteReason: 'caído al piso',
            totalWastedQty: '0.120',
            totalExtractedQty: '1.000',
            wastePercent: '12.00',
            wastedCost: null,
            overThreshold: true,
          },
        ],
        consumptionVsTheoretical: [],
        wasteAlertThresholdPercent: 5,
      });

      render(<ReportsDashboard />);

      const percentEl = await screen.findByText(/12\.00%/);
      expect(percentEl.closest('span')).toHaveClass('text-danger-color');
      // Sin notificación (#12 diferido): ningún role="alert"/"status" además del propio contenido.
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
      expect(screen.queryAllByRole('status')).toHaveLength(0);
    });

    it('muestra consumo real vs. teórico por receta con la diferencia', async () => {
      stubFetchWithWasteAndSettings([], '$', undefined, {
        wasteByReason: [],
        consumptionVsTheoretical: [
          {
            recipeId: 'rec-pizza',
            recipeName: 'Pizza Margarita',
            insumoId: 'ins-queso',
            insumoName: 'Queso Mozzarella',
            unitOfMeasure: 'KG',
            theoreticalQty: '2.100',
            actualQty: '2.300',
            differenceQty: '0.200',
          },
        ],
        wasteAlertThresholdPercent: 5,
      });

      render(<ReportsDashboard />);

      expect(await screen.findByText(/Pizza Margarita — consumo real vs\. teórico/i)).toBeInTheDocument();
      expect(screen.getByText(/Teórico: 2\.100 KG/)).toBeInTheDocument();
      expect(screen.getByText(/Real: 2\.300 KG/)).toBeInTheDocument();
      expect(screen.getByText(/Diferencia: \+0\.200 KG/)).toBeInTheDocument();
    });

    it('sin mermas ni preparaciones en el período, muestra estados vacíos explícitos', async () => {
      stubFetchWithWasteAndSettings([], '$');
      render(<ReportsDashboard />);

      expect(await screen.findByText(/Sin mermas de preparación registradas/i)).toBeInTheDocument();
      expect(screen.getByText(/Sin preparaciones cerradas/i)).toBeInTheDocument();
    });
  });
});
