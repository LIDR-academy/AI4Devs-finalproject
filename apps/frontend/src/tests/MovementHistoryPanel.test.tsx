import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MovementHistoryPanel } from '../features/stock/components/MovementHistoryPanel.js';

describe('TK-050-FE: MovementHistoryPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar la pantalla de Acceso Restringido si el usuario no es ADMIN', () => {
    render(<MovementHistoryPanel isOpen={true} userRole="KITCHEN_STAFF" onClose={() => {}} />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/requiere rol de Administrador/i)).toBeInTheDocument();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<MovementHistoryPanel isOpen={false} userRole="ADMIN" onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
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

    render(<MovementHistoryPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Queso Mozzarella')).toBeInTheDocument();
    });
    expect(screen.getByText('EXTRACTION')).toBeInTheDocument();
  });

  it('muestra un estado vacío explícito cuando no hay movimientos, no una tabla en blanco', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<MovementHistoryPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Sin movimientos registrados en este rango/i)).toBeInTheDocument();
    });
  });

  it('muestra el error real del backend en vez de datos sintéticos cuando la consulta falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Rol insuficiente' }) })
    );

    render(<MovementHistoryPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Rol insuficiente/i);
    });
  });
});
