import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemperatureLogModal } from '../features/kitchen/components/TemperatureLogModal.js';

const WAREHOUSE_SECTORS = [
  { id: 'loc-seed-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', isActive: true },
];

function stubFetch(onPost: (body: Record<string, unknown>) => unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/locations')) {
        return { ok: true, status: 200, json: async () => WAREHOUSE_SECTORS };
      }
      if (url.includes('/kitchen/temperature-logs')) {
        const body = JSON.parse(init?.body as string) as Record<string, unknown>;
        return { ok: true, status: 201, json: async () => onPost(body) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    })
  );
}

function buildLog(overrides: Record<string, unknown> = {}) {
  return {
    id: 'templog-1',
    storageLocationId: 'loc-seed-fridge',
    unitType: 'REFRIGERATOR',
    temperatureCelsius: '3.50',
    isWithinSafeRange: true,
    recordedByUserId: 'usr-1',
    recordedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('TK-120-FE: TemperatureLogModal (US-033)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('registra una lectura dentro de rango y confirma con acento de éxito', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    stubFetch((body) => {
      capturedBody = body;
      return buildLog();
    });

    render(<TemperatureLogModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector Refrigerado/i) as HTMLSelectElement).value).toBe('loc-seed-fridge');
    });
    fireEvent.change(screen.getByLabelText(/Temperatura leída/i), { target: { value: '3.50' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar Lectura/i }));

    expect(await screen.findByText(/dentro del rango seguro/i)).toBeInTheDocument();
    expect(capturedBody).toMatchObject({
      storageLocationId: 'loc-seed-fridge',
      unitType: 'REFRIGERATOR',
      temperatureCelsius: '3.50',
    });
  });

  it('una lectura FUERA de rango se confirma como advertencia, nunca como error (201, no bloquea)', async () => {
    stubFetch(() => buildLog({ temperatureCelsius: '7.20', isWithinSafeRange: false }));

    render(<TemperatureLogModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector Refrigerado/i) as HTMLSelectElement).value).toBe('loc-seed-fridge');
    });
    fireEvent.change(screen.getByLabelText(/Temperatura leída/i), { target: { value: '7.20' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar Lectura/i }));

    const feedback = await screen.findByText(/FUERA del rango seguro/i);
    expect(feedback).toBeInTheDocument();
    // role="status" (no "alert"): la operación fue exitosa, el dato es lo que amerita atención
    expect(screen.getByRole('status')).toHaveTextContent(/FUERA del rango seguro/i);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('valida en cliente un valor que desborda Decimal(5,2), sin llamar a la red', async () => {
    let posted = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/locations')) return { ok: true, status: 200, json: async () => WAREHOUSE_SECTORS };
        posted = true;
        return { ok: true, status: 201, json: async () => buildLog() };
      })
    );

    render(<TemperatureLogModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector Refrigerado/i) as HTMLSelectElement).value).toBe('loc-seed-fridge');
    });
    fireEvent.change(screen.getByLabelText(/Temperatura leída/i), { target: { value: '12345.67' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar Lectura/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/3 dígitos enteros/i);
    expect(posted).toBe(false);
  });

  it('no renderiza nada cuando isOpen es false (nunca se auto-abre ni bloquea el tablero)', () => {
    stubFetch(() => buildLog());
    const { container } = render(<TemperatureLogModal isOpen={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
