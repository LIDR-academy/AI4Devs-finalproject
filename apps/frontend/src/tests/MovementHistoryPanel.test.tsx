import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovementHistoryPanel } from '../features/stock/components/MovementHistoryPanel.js';

describe('TK-050-FE: MovementHistoryPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });



  it('carga y muestra el historial real poblado por el backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'mv-1',
            insumoId: 'ins-1',
            insumoName: 'Queso Mozzarella',
            type: 'EXTRACTION',
            quantity: '2.0000',
            fromLoc: 'MAIN_WAREHOUSE',
            toLoc: 'KITCHEN_FRIDGE',
            createdAt: '2026-08-21T14:02:11Z',
          },
        ],
      })
    );

    render(<MovementHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('Queso Mozzarella')).toBeInTheDocument();
    });
    expect(screen.getByText('EXTRACTION')).toBeInTheDocument();
  });

  it('muestra un estado vacío explícito cuando no hay movimientos, no una tabla en blanco', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<MovementHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Sin movimientos registrados en este rango/i)).toBeInTheDocument();
    });
  });

  it('aplica el filtro de rango de fechas y lo envía como ISO 8601 al backend (TK-050-FE)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    render(<MovementHistoryPanel />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText('Fecha desde'), { target: { value: '2026-08-01' } });
    fireEvent.change(screen.getByLabelText('Fecha hasta'), { target: { value: '2026-08-21' } });
    fireEvent.click(document.getElementById('btn-search-movements')!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [url] = fetchMock.mock.calls[1];
    expect(url).toContain('startDate=2026-08-01T00%3A00%3A00.000Z');
    expect(url).toContain('endDate=2026-08-21T23%3A59%3A59.999Z');
  });

  it('muestra el error real del backend en vez de datos sintéticos cuando la consulta falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Rol insuficiente' }) })
    );

    render(<MovementHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Rol insuficiente/i);
    });
  });
});
