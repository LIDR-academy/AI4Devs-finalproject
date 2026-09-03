import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CatalogManagementPanel } from '../features/catalog/components/CatalogManagementPanel.js';

describe('TK-057-FE: CatalogManagementPanel Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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

    render(<CatalogManagementPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Inventario y Catálogo de Bodega/i)).toBeInTheDocument();
      expect(screen.getByText(/Queso Mozzarella/i)).toBeInTheDocument();
    });
  });

  it('crea una receta con 2 ingredientes seleccionados del catálogo real (TK-057)', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (!init || !init.method || init.method === 'GET') {
        if (url.endsWith('/recipes')) {
          return { ok: true, status: 200, json: async () => [] };
        }
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

    render(<CatalogManagementPanel />);

    fireEvent.click(screen.getByRole('button', { name: /Recetario/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ Nueva Receta/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Receta/i }));

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

  it('crea una receta usando el insumo por defecto sin tocar el selector, incluso con la carga de insumos demorada', async () => {
    // Regresion: useState fijaba insumoId='' en el primer render (antes de que
    // resuelva GET /stock/insumos) y nunca se resincronizaba — el <select> se veia
    // con el primer insumo real "seleccionado" pero el estado real seguia vacio,
    // y el POST fallaba con 400 "El ID de insumo es obligatorio" salvo que el
    // usuario reabriera el dropdown manualmente. Solo se reproducia con un delay
    // real (red real / este mock), no con una resolucion sincronica de fetch.
    let capturedBody: unknown = null;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (!init || !init.method || init.method === 'GET') {
        if (url.endsWith('/recipes')) {
          return { ok: true, status: 200, json: async () => [] };
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 'ins-harina-1', name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: '10.000' }],
        };
      }
      capturedBody = JSON.parse(init.body as string);
      return { ok: true, status: 201, json: async () => ({ message: 'Recipe created successfully', recipeId: 'rec-2' }) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CatalogManagementPanel />);

    fireEvent.click(screen.getByRole('button', { name: /Recetario/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ Nueva Receta/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Receta/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre de la Receta/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Nombre de la Receta/i), { target: { value: 'Pan Casero' } });
    fireEvent.change(screen.getByLabelText(/Categoría/i), { target: { value: 'Panaderia' } });
    fireEvent.change(screen.getByLabelText(/Cantidad del ingrediente/i), { target: { value: '0.500' } });

    fireEvent.click(screen.getByRole('button', { name: /^Crear Receta$/i }));

    await waitFor(() => {
      expect(screen.getByText(/creada \(ID rec-2\)/i)).toBeInTheDocument();
    });

    expect(capturedBody).toMatchObject({ ingredients: [{ insumoId: 'ins-harina-1', quantity: '0.500' }] });
  });

  it('reabastece un insumo existente (US-013) sumando cantidad al stock actual', async () => {
    let insumoStock = '10.000';
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/restock')) {
        insumoStock = '25.500';
        return {
          ok: true,
          status: 200,
          json: async () => ({
            insumoId: 'ins-1',
            insumoName: 'Queso Mozzarella',
            quantityAdded: '15.500',
            newWarehouseStock: insumoStock,
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => [{ id: 'ins-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: insumoStock }],
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<CatalogManagementPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Queso Mozzarella/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Reabastecer/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Cantidad Recibida/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Cantidad Recibida/i), { target: { value: '15.5' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reabastecimiento/i }));

    await waitFor(() => {
      expect(screen.getByText(/25.500 KG/i)).toBeInTheDocument();
    });
  });

  it('muestra estado de carga si el catálogo de insumos está vacío al abrir el formulario de Nueva Receta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<CatalogManagementPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Recetario/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ Nueva Receta/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Receta/i }));

    await waitFor(() => {
      expect(screen.getByText(/primero dé de alta uno en la pestaña/i)).toBeInTheDocument();
    });
  });

  it('renderiza el Recetario con recetas existentes y filtra por nombre', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          { id: 'rec-1', name: 'Pizza Margarita', category: 'Pizzas', ingredients: [{ insumoId: 'ins-1', quantity: '0.150' }] },
          {
            id: 'rec-2',
            name: 'Lasagna Boloñesa',
            category: 'Pastas',
            ingredients: [
              { insumoId: 'ins-2', quantity: '0.200' },
              { insumoId: 'ins-3', quantity: '0.100' },
            ],
          },
        ],
      })
    );

    render(<CatalogManagementPanel />);
    fireEvent.click(screen.getByRole('button', { name: /Recetario/i }));

    await waitFor(() => {
      expect(screen.getByText('Pizza Margarita')).toBeInTheDocument();
      expect(screen.getByText('Lasagna Boloñesa')).toBeInTheDocument();
      expect(screen.getByText(/2 ingredientes/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Buscar receta por nombre/i), { target: { value: 'lasagna' } });

    await waitFor(() => {
      expect(screen.getByText('Lasagna Boloñesa')).toBeInTheDocument();
      expect(screen.queryByText('Pizza Margarita')).not.toBeInTheDocument();
    });
  });
});
