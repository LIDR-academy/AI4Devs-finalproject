import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateInsumoModal } from '../features/stock/components/CreateInsumoModal.js';

describe('TK-078-FE: CreateInsumoModal — Costo Unitario Opcional (US-019)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar el campo de costo con la unidad de medida por defecto (KG) como sufijo', () => {
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    expect(screen.getByLabelText(/Costo por KG \(Opcional\)/i)).toBeInTheDocument();
  });

  it('el campo de costo debe estar vacio por defecto (a diferencia del stock inicial, que default a 0)', () => {
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    const costInput = screen.getByLabelText(/Costo por KG \(Opcional\)/i) as HTMLInputElement;
    expect(costInput.value).toBe('');
  });

  it('envia unitCost en el body del POST cuando el usuario lo completa', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'ins-new-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: '0.000', unitCost: '1800.00' }),
        };
      })
    );

    const onSuccess = vi.fn();
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Nombre del Insumo/i), { target: { value: 'Queso Mozzarella' } });
    fireEvent.change(screen.getByLabelText(/Costo por KG \(Opcional\)/i), { target: { value: '1800.00' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Insumo/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(capturedBody).toMatchObject({ unitCost: '1800.00' });
  });

  it('no incluye unitCost en el body del POST cuando el usuario deja el campo vacio', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'ins-new-2', name: 'Salsa de Tomate', unitOfMeasure: 'KG', warehouseStock: '0.000' }),
        };
      })
    );

    const onSuccess = vi.fn();
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/Nombre del Insumo/i), { target: { value: 'Salsa de Tomate' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Insumo/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(capturedBody).not.toHaveProperty('unitCost');
  });
});
