import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App.js';
import { AuthService } from '../features/auth/services/auth.service.js';

describe('Frontend MVP: Tactile FEFO Dashboard & Stock Extraction Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    // Simular sesion activa
    AuthService.saveSession('test-token-jwt-12345', {
      id: 'usr-1',
      name: 'Chef Operario',
      role: 'KITCHEN_STAFF',
    });
    // AUDIT-DEV-006 F-5: sin fallback demo, el modal necesita que /stock/insumos y
    // /locations respondan para renderizar el formulario.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/stock/insumos')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              { id: 'ins-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: '10.000' },
            ],
          };
        }
        if (url.includes('/locations')) {
          return {
            ok: true,
            status: 200,
            json: async () => [{ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true }],
          };
        }
        return { ok: true, status: 200, json: async () => [] };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe renderizar el Dashboard FEFO con las tarjetas de resumen y lista de remanentes', async () => {
    render(<App />);

    expect(screen.getByText(/Tablero FEFO de Cocina/i)).toBeInTheDocument();
    expect(screen.getByText(/Chef Operario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Extraer de Bodega/i })).toBeInTheDocument();
  });

  it('debe abrir el modal de extraccion de bodega al presionar el boton de extraccion', async () => {
    render(<App />);

    const openBtn = screen.getByRole('button', { name: /Extraer de Bodega/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Extracción de Bodega \(Alta TRR\)/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Confirmar Extracción/i })).toBeInTheDocument();
  });
});
