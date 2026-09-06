import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemperatureLogReportPanel } from '../features/reports/components/TemperatureLogReportPanel.js';

const LOGS = [
  {
    id: 'templog-1',
    storageLocationId: 'loc-seed-fridge',
    unitType: 'REFRIGERATOR',
    temperatureCelsius: '3.50',
    isWithinSafeRange: true,
    recordedByUserId: 'usr-1',
    recordedAt: '2026-09-06T08:00:00.000Z',
  },
  {
    id: 'templog-2',
    storageLocationId: 'loc-desactivado',
    unitType: 'FREEZER',
    temperatureCelsius: '-12.00',
    isWithinSafeRange: false,
    recordedByUserId: 'usr-1',
    recordedAt: '2026-09-06T09:00:00.000Z',
  },
];

function stubFetch(logs: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/kitchen/temperature-logs')) {
        return { ok: true, status: 200, json: async () => logs };
      }
      if (url.includes('/locations')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 'loc-seed-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', isActive: true },
            // sub-sector desactivado: debe seguir siendo nombrable en el histórico
            { id: 'loc-desactivado', name: 'Cámara Vieja', type: 'WAREHOUSE', isActive: false },
          ],
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    })
  );
}

describe('TK-120-FE: TemperatureLogReportPanel (US-033)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista las lecturas y marca las fuera de rango con texto, no solo color (WCAG 1.4.1)', async () => {
    stubFetch(LOGS);
    render(<TemperatureLogReportPanel startDate="2026-09-01" endDate="2026-09-07" />);

    expect(await screen.findByText(/Heladera de Carnes/)).toBeInTheDocument();
    expect(screen.getByText(/Dentro de rango/)).toBeInTheDocument();
    expect(screen.getByText(/Fuera de rango/)).toBeInTheDocument();
    expect(screen.getByText(/1 lectura\(s\) fuera de rango/)).toBeInTheDocument();
  });

  it('nombra el sub-sector aunque haya sido desactivado después de la lectura', async () => {
    stubFetch(LOGS);
    render(<TemperatureLogReportPanel startDate="2026-09-01" endDate="2026-09-07" />);

    expect(await screen.findByText(/Cámara Vieja/)).toBeInTheDocument();
  });

  it('estado vacío explícito cuando no hay lecturas en el período', async () => {
    stubFetch([]);
    render(<TemperatureLogReportPanel startDate="2026-09-01" endDate="2026-09-07" />);

    expect(await screen.findByText(/Sin lecturas registradas en este período/i)).toBeInTheDocument();
  });

  it('un 403 del backend (rol sin permiso) se muestra como error, sin romper el dashboard', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/kitchen/temperature-logs')) {
          return { ok: false, status: 403, json: async () => ({ title: 'Forbidden', status: 403, detail: 'Acceso denegado' }) };
        }
        return { ok: true, status: 200, json: async () => [] };
      })
    );

    render(<TemperatureLogReportPanel startDate="2026-09-01" endDate="2026-09-07" />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
