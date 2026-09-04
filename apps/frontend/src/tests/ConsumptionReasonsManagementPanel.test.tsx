import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsumptionReasonsManagementPanel } from '../features/kitchen/components/ConsumptionReasonsManagementPanel.js';

describe('TK-107-FE: ConsumptionReasonsManagementPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista los motivos reales del backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: 'r-1', label: 'Preparación de plato', isActive: true }],
      })
    );

    render(<ConsumptionReasonsManagementPanel />);

    await waitFor(() => {
      expect(screen.getByText('Preparación de plato')).toBeInTheDocument();
    });
  });

  it('crea un motivo y lo agrega a la lista (US-030 Escenario 2)', async () => {
    let created = false;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        created = true;
        return { ok: true, status: 201, json: async () => ({ id: 'r-new', label: 'Ajuste de porción', isActive: true }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => (created ? [{ id: 'r-new', label: 'Ajuste de porción', isActive: true }] : []),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsumptionReasonsManagementPanel />);
    await waitFor(() => expect(screen.getByText(/Motivos Registrados \(0\)/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Nuevo Motivo/i), { target: { value: 'Ajuste de porción' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear/i }));

    await waitFor(() => {
      expect(screen.getByText('Ajuste de porción')).toBeInTheDocument();
    });
  });

  it('desactivar un motivo lo marca visualmente inactivo, sin quitarlo de la lista (desactivar, nunca borrar)', async () => {
    let isActive = true;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        isActive = false;
        return { ok: true, status: 200, json: async () => ({ id: 'r-1', label: 'Cortesía a cliente', isActive: false }) };
      }
      return { ok: true, status: 200, json: async () => [{ id: 'r-1', label: 'Cortesía a cliente', isActive }] };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsumptionReasonsManagementPanel />);
    await waitFor(() => expect(screen.getByText('Cortesía a cliente')).toBeInTheDocument());
    expect(screen.queryByText(/\(Inactivo\)/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Desactivar Motivo/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cortesía a cliente \(Inactivo\)/i)).toBeInTheDocument();
    });
    // No hay botón de borrado — el catálogo nunca borra, solo desactiva (ADR-004 §3.1).
    expect(screen.queryByRole('button', { name: /Eliminar/i })).not.toBeInTheDocument();
  });

  it('renombra un motivo desde el formulario inline de edición', async () => {
    let label = 'Error de manipulación';
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        label = JSON.parse(init.body as string).label;
        return { ok: true, status: 200, json: async () => ({ id: 'r-1', label, isActive: true }) };
      }
      return { ok: true, status: 200, json: async () => [{ id: 'r-1', label, isActive: true }] };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ConsumptionReasonsManagementPanel />);
    await waitFor(() => expect(screen.getByText('Error de manipulación')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Editar Motivo/i }));
    const input = screen.getByLabelText(/Editar etiqueta/i);
    fireEvent.change(input, { target: { value: 'Rotura accidental' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => {
      expect(screen.getByText('Rotura accidental')).toBeInTheDocument();
    });
  });
});
