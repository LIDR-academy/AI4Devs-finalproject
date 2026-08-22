import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogManagementPanel } from '../features/catalog/components/CatalogManagementPanel.js';

describe('TK-057-FE: CatalogManagementPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar la pantalla de Acceso Restringido si el usuario no es ADMIN', () => {
    render(<CatalogManagementPanel isOpen={true} userRole="KITCHEN_STAFF" onClose={() => {}} />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/requiere rol de Administrador/i)).toBeInTheDocument();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<CatalogManagementPanel isOpen={false} userRole="ADMIN" onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza la vista de Inventario de Bodega por defecto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          { id: 'ins-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: '15.500' },
        ],
      })
    );

    render(<CatalogManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Inventario y Catálogo de Bodega/i)).toBeInTheDocument();
      expect(screen.getByText(/Queso Mozzarella/i)).toBeInTheDocument();
    });
  });

  it('crea una receta con 2 ingredientes seleccionados del catálogo real (TK-057)', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init || !init.method || init.method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 'ins-harina-1', name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: '10.000' },
            { id: 'ins-salsa-1', name: 'Salsa Pomodoro', unitOfMeasure: 'L', warehouseStock: '5.000' },
          ],
        };
      }
      return { ok: true, status: 201, json: async () => ({ message: 'Recipe created successfully', recipeId: 'rec-1' }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CatalogManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /Alta de Receta/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre de la Receta/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Nombre de la Receta/i), { target: { value: 'Pizza Margarita' } });
    fireEvent.change(screen.getByLabelText(/Categoría/i), { target: { value: 'Pizzas' } });

    const quantityInputs = screen.getAllByLabelText(/Cantidad del ingrediente/i);
    fireEvent.change(quantityInputs[0], { target: { value: '0.150' } });

    fireEvent.click(screen.getByRole('button', { name: /Agregar Ingrediente/i }));
    const updatedQuantityInputs = screen.getAllByLabelText(/Cantidad del ingrediente/i);
    fireEvent.change(updatedQuantityInputs[1], { target: { value: '0.100' } });

    fireEvent.click(screen.getByRole('button', { name: /^Crear Receta$/i }));

    await waitFor(() => {
      expect(screen.getByText(/creada \(ID rec-1\) con 2 ingrediente\(s\)/i)).toBeInTheDocument();
    });
  });

  it('muestra estado de carga si el catálogo de insumos está vacío al abrir Alta de Receta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<CatalogManagementPanel isOpen={true} userRole="ADMIN" onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Alta de Receta/i }));

    await waitFor(() => {
      expect(screen.getByText(/primero dé de alta uno en la pestaña/i)).toBeInTheDocument();
    });
  });
});
