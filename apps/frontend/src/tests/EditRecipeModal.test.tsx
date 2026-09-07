import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditRecipeModal } from '../features/recipes/components/EditRecipeModal.js';
import { RecipeListItem } from '../features/recipes/services/recipes.service.js';

/** Espera a que el catálogo de insumos (fetch async) termine de cargar en el `<select>`. */
async function waitForCatalog() {
  await screen.findAllByRole('option', { name: 'Tomate (KG)' });
}

const recipe: RecipeListItem = {
  id: 'rec-1',
  name: 'Salsa Base',
  category: 'SALSAS',
  description: 'Original',
  ingredients: [
    { insumoId: 'ins-1', quantity: '1.000' },
    { insumoId: 'ins-2', quantity: '0.500' },
  ],
};

const insumosCatalog = [
  { id: 'ins-1', name: 'Tomate', unitOfMeasure: 'KG', warehouseStock: '5.000', unitCost: null, barcode: null },
  { id: 'ins-2', name: 'Cebolla', unitOfMeasure: 'KG', warehouseStock: '5.000', unitCost: null, barcode: null },
];

/** fetch stub: GET /stock/insumos -> catálogo; el resto -> `body`. */
function stubFetch(body: unknown, ok = true, status = 200) {
  const mock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/stock/insumos')) {
      return { ok: true, status: 200, json: async () => insumosCatalog };
    }
    return { ok, status, json: async () => body };
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

describe('TK-131-FE: EditRecipeModal (US-037)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no renderiza nada cuando isOpen es false o no hay receta', () => {
    const { container } = render(
      <EditRecipeModal isOpen={false} recipe={recipe} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('precarga nombre, categoría, descripción e ingredientes', () => {
    stubFetch({ message: 'ok', recipeId: 'rec-1' });
    render(<EditRecipeModal isOpen={true} recipe={recipe} onClose={() => {}} onSuccess={() => {}} />);
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Salsa Base');
    expect((screen.getByLabelText('Categoría') as HTMLInputElement).value).toBe('SALSAS');
    expect((screen.getByLabelText(/Descripción/i) as HTMLInputElement).value).toBe('Original');
    expect(screen.getAllByLabelText('Cantidad del ingrediente')).toHaveLength(2);
  });

  it('envía solo los campos que cambiaron (PUT con name)', async () => {
    const mock = stubFetch({ message: 'ok', recipeId: 'rec-1' });
    const onSuccess = vi.fn();
    render(<EditRecipeModal isOpen={true} recipe={recipe} onClose={() => {}} onSuccess={onSuccess} />);
    await waitForCatalog();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Salsa Pomodoro' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const putCall = mock.mock.calls.find((c) => (c[1] as RequestInit | undefined)?.method === 'PUT');
    expect(putCall).toBeDefined();
    const [url, init] = putCall as [string, RequestInit];
    expect(url).toContain('/recipes/rec-1');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Salsa Pomodoro' });
  });

  it('vaciar la descripción la envía como null', async () => {
    const mock = stubFetch({ message: 'ok', recipeId: 'rec-1' });
    render(<EditRecipeModal isOpen={true} recipe={recipe} onClose={() => {}} onSuccess={() => {}} />);
    await waitForCatalog();

    fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      const putCall = mock.mock.calls.find((c) => (c[1] as RequestInit | undefined)?.method === 'PUT');
      expect(putCall).toBeDefined();
    });
    const putCall = mock.mock.calls.find((c) => (c[1] as RequestInit | undefined)?.method === 'PUT');
    const [, init] = putCall as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ description: null });
  });

  it('sin cambios reales cierra sin llamar al PUT', async () => {
    const mock = stubFetch({ message: 'ok', recipeId: 'rec-1' });
    const onClose = vi.fn();
    render(<EditRecipeModal isOpen={true} recipe={recipe} onClose={onClose} onSuccess={() => {}} />);
    await waitForCatalog();

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mock.mock.calls.some((c) => (c[1] as RequestInit | undefined)?.method === 'PUT')).toBe(false);
  });

  it('muestra el error del backend (409 composición congelada) en un banner', async () => {
    stubFetch({ detail: 'La composición de la receta rec-1 está congelada: tiene preparaciones cerradas.' }, false, 409);
    render(<EditRecipeModal isOpen={true} recipe={recipe} onClose={() => {}} onSuccess={() => {}} />);
    await waitForCatalog();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Otro Nombre' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText(/congelada/i)).toBeInTheDocument();
  });
});
